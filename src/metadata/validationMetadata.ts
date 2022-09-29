import { Toyo } from "../models/toyo";
import { ToyoRepository } from "../repositories/toyo.repository";
import { ToyoMetadata } from "../models/toyo/metadata";
import { BuildParts, Metadata } from "./";
import { MetadataRepository } from "../repositories/metadata.repository";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";

const toyoRepository = new ToyoRepository();
const metadataRepository = new MetadataRepository();
const buildParts = new BuildParts();
const metadataClass = new Metadata();

export class ValidationMetadata {
  async verifyMetdata(metadata: ToyoMetadata, toyo: Toyo): Promise<string> {
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
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      msg =
        "TokenId: " + toyo.tokenId + " metadata wrong, metadata was updated";
    }
    return msg;
  }
  async verifyToyoMetadata(
    toyo: Toyo,
    metadata: ToyoMetadata
  ): Promise<string> {
    let msg: string;
    if (toyo && toyo.name !== metadata.name) {
      await toyoRepository.updateToyo(toyo, metadata);
    }
    else if (toyo && !metadata) {
      /*console.log(result.statusText);
      console.log(metadata.name);*/
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      msg =
        "TokenId: " + toyo.tokenId + " metadata undefined, but found in the db";
    }
    return msg;
  }
  async verifyOnchain(
    onChain: TokenOwnerEntities,
    metadata: ToyoMetadata,
    toyo: Toyo,
    typeId: string
  ): Promise<string> {
    let msg: string;
    if (!toyo && onChain) {
      await toyoRepository.save(metadata, onChain);
      msg =
        "TokenId: " +
        onChain.tokenId +
        " metadata ok, but toyo not found. Toyo was created";
    } else if (onChain) {
      msg =
        "TokenId: " +
        toyo.tokenId +
        " metadata undefined, but found in the onChain, typeId: " +
        typeId;
    }
    return msg;
  }
  async verifyToyo(toyo: Toyo, err: any): Promise<string> {
    let msg: string;
    if (toyo) {
      //console.log(err.code);
      toyo.toyoMetadata = metadataClass.generateMetadata(
        toyo.toyoPersonaOrigin,
        toyo.parts,
        toyo.level
      );
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
      msg = "TokenId: " + toyo.tokenId + " " + err + ", but found in the db";
    }
    return msg;
  }
}
