import { Toyo } from "../models/toyo";
import {
  ToyoRepository,
  MetadataRepository,
  BoxRepository,
} from "../repositories/";
import { ToyoMetadata } from "../models/toyo/metadata";
import { BuildParts, Metadata } from "./";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import Box from "../models/box/box";

const toyoRepository = new ToyoRepository();
const metadataRepository = new MetadataRepository();
const boxRepository = new BoxRepository();
const buildParts = new BuildParts();
const metadataClass = new Metadata();

export class ValidationMetadata {
  async verifyMetdata(
    metadata: ToyoMetadata,
    toyo: Toyo,
    box: Box
  ): Promise<string> {
    let msg: string;
    const toyoStats: Record<string, number> = buildParts.returnSumParts(
      toyo.parts
    );
    if (!metadataClass.isCorrectMetadata(metadata, toyoStats)) {
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      toyo.oldToyoMetadata = metadata;
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      await toyoRepository.saveToyoMetadata(toyo, metadata, toyo.toyoMetadata);
      await boxRepository.updateMetadataBox(box);
      msg =
        "TokenId: " + toyo.tokenId + " metadata wrong, metadata was updated";
    }
    return msg;
  }
  async verifyToyoMetadata(
    toyo: Toyo,
    metadata: ToyoMetadata,
    box: Box
  ): Promise<string> {
    let msg: string;
    if (toyo && toyo.name !== metadata.name) {
      await toyoRepository.updateToyo(toyo, metadata, box);
    } else if (toyo && !metadata) {
      /*console.log(result.statusText);
      console.log(metadata.name);*/
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      await boxRepository.updateMetadataBox(box);
      msg =
        "TokenId: " + toyo.tokenId + " metadata undefined, but found in the db";
    }
    return msg;
  }
  async verifyOnchain(
    onChain: TokenOwnerEntities,
    metadata: ToyoMetadata,
    toyo: Toyo,
    box: Box
  ): Promise<string> {
    let msg: string;
    if (!toyo && onChain) {
      await toyoRepository.save(metadata, onChain, box);
      msg =
        "TokenId: " +
        onChain.tokenId +
        " metadata ok, but toyo not found. Toyo was created";
    } else if (onChain) {
      msg =
        "TokenId: " +
        toyo.tokenId +
        " metadata undefined, but found in the onChain, typeId: " +
        box.typeId;
    }
    return msg;
  }
  async verifyToyo(toyo: Toyo, err: any, box: Box): Promise<string> {
    let msg: string;
    if (toyo) {
      //console.log(err.code);
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      await boxRepository.updateMetadataBox(box);
      msg = "TokenId: " + toyo.tokenId + " " + err + ", but found in the db";
    }
    return msg;
  }
}
