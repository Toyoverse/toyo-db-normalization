import { Toyo } from "../models/toyo";
import {
  ToyoRepository,
  MetadataRepository,
  BoxRepository,
} from "../repositories";
import { ToyoMetadata } from "../models/toyo/metadata";
import { BuildParts, Metadata } from ".";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import Box from "../models/box/box";

const toyoRepository = new ToyoRepository();
const metadataRepository = new MetadataRepository();
const boxRepository = new BoxRepository();
const buildParts = new BuildParts();
const metadataClass = new Metadata();

export class ValidationRequest {
  async verifyMetadata(
    metadata: ToyoMetadata,
    toyo: Toyo,
    box: Box
  ): Promise<string> {
    let msg: string;
    let toyoStats: Record<string, number>;
    if (toyo) toyoStats = buildParts.returnSumParts(toyo.parts);
    if (toyoStats && !metadataClass.isCorrectMetadata(metadata, toyoStats)) {
      console.log("criando um novo metadata... " + toyo.tokenId);
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      toyo.oldToyoMetadata = metadata;
      msg =
        " TokenId: " + toyo.tokenId + " metadata wrong, metadata was updated";
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      await toyoRepository.saveToyoMetadata(toyo, metadata, toyo.toyoMetadata);
      await boxRepository.updateMetadataBox(box, msg, true);
    }
    return msg;
  }

  async verifyOnchainWithMetadata(
    onChain: TokenOwnerEntities,
    metadata: ToyoMetadata,
    toyo: Toyo,
    box: Box
  ): Promise<string> {
    let msg: string;
    if (!toyo && onChain && metadata) {
      msg =
        " TokenId: " +
        onChain.tokenId +
        " metadata ok, but toyo not found. Toyo was created";
      const toyo = await toyoRepository.save(metadata, onChain);
      await boxRepository.updateMetadataBox(box, msg, true, toyo);
    }
    return msg;
  }

  async verifyOnchainWithOutMetadata(
    onChain: TokenOwnerEntities,
    metadata: ToyoMetadata,
    toyo: Toyo,
    box: Box
  ): Promise<string> {
    let msg: string;
    if (onChain && !metadata && !toyo) {
      msg =
        " TokenId: " +
        onChain.tokenId +
        " metadata undefined, but found in the onChain, typeId: " +
        box.typeId;
      await boxRepository.updateMetadataBox(box, msg, false);
    } else if (toyo && !metadata) {
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      console.log("Criando metadata para o toyo... " + toyo.tokenId);
      msg =
        " TokenId: " +
        toyo.tokenId +
        " metadata undefined, but found in the db";
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      await toyoRepository.saveToyoMetadata(toyo, undefined, toyo.toyoMetadata);
      await boxRepository.updateMetadataBox(box, msg, true);
    }
    return msg;
  }

  async verifyToyo(
    toyo: Toyo,
    metadata: ToyoMetadata,
    box: Box,
    err?: any
  ): Promise<string> {
    let msg: string;
    if (toyo && metadata && toyo.name !== metadata.name) {
      msg =
        " TokenId: " +
        toyo.tokenId +
        " metadata different from toyo. toyo has been updated according to the metadata";
      await toyoRepository.updateToyo(toyo, metadata);
      await boxRepository.updateMetadataBox(box, msg, true);
    } else if (toyo && !metadata) {
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      msg = " TokenId: " + toyo.tokenId + " " + err + ", but found in the db";
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      await boxRepository.updateMetadataBox(box, msg, true);
    }
    return msg;
  }
}
