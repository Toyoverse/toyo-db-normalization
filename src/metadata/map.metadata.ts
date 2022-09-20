import "dotenv/config";
import * as back4app from "../config/back4app";
import axios from "axios";
import { ToyoRepository } from "../repositories/toyo.repository";
import { Metadata } from "../models/toyo/metadata";
import { tokenIdValue, generateFiles } from "../utils/index";
import { OnchainRepository } from "../repositories/onchain";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import Box from "../models/box/box";
import { Toyo, ToyoPersona } from "../models/toyo";
import { MetadataRepository } from "../repositories/metadata.repository";
import { ToyoPart } from "../models/toyo/part";
import { BuildParts } from "./build.parts"

back4app.config();

const toyoRepository = new ToyoRepository();
const onchainRepository = new OnchainRepository();
const metadataRepository = new MetadataRepository();
const buildParts = new BuildParts();

export class MapMetadata {
  async mapMetadata(boxes: Box[]) {
    const msgList: string[] = [];
    for (const item of boxes) {
      let tokenId: string = item.observation
        ? tokenIdValue(item.observation)
        : item.toyo.tokenId;
      const toyo: Toyo = await toyoRepository.findByTokenId(tokenId);
      console.log(tokenId);
      const onChain: TokenOwnerEntities[] =
        await onchainRepository.getTokenOwnerEntityByTokenId(tokenId);
      const onChainBox: TokenOwnerEntities[] =
        await onchainRepository.getTokenOwnerEntityByTokenId(item.tokenId);
      const urlData =
        "https://toyoverse.com/nft_metadata/toyos/" + tokenId + ".json";
      const result = await axios
        .get(urlData)
        .then(async (result) => {
          if (result.data) {
            const metadata: Metadata = result.data;
            //TO DO
            //um metodo para verificar se o metadata igual ao toyo, se não tiver atualizar o metadata
            if (toyo && toyo.name !== metadata.name) {
              toyoRepository.updateToyo(toyo, metadata);
            } else if (!toyo && onChain.length > 0) {
              await toyoRepository.save(metadata, onChain[0]);
              msgList.push(
                "TokenId: " +
                  tokenId +
                  " metadata ok, but toyo not found. Toyo was created"
              );
            }
            console.log(result.statusText);
            console.log(metadata.name);
          } else if (toyo) {
            toyo.toyoMetadata = this.generateMetadata(toyo.toyoPersonaOrigin, toyo.parts, toyo.level);
            metadataRepository.save(tokenId,toyo.toyoMetadata);
            msgList.push(
              "TokenId: " + tokenId + " metadata undefined, but found in the db"
            );
          } else if (onChain.length > 0) {
            msgList.push(
              "TokenId: " +
                tokenId +
                " metadata undefined, but found in the onChain, typeId: " +
                onChainBox[0].typeId
            );
          } else {
            msgList.push("TokenId: " + tokenId + " metadata undefined");
          }
        })
        .catch(async (err) => {
          if (toyo) {
            console.log(err.code);
            
            toyo.toyoMetadata = this.generateMetadata(toyo.toyoPersonaOrigin, toyo.parts, toyo.level);
            metadataRepository.save(tokenId,toyo.toyoMetadata);
            msgList.push(
              "TokenId: " + tokenId + " " + err.code + ", but found in the db"
            );
          } else if (onChain.length > 0) {
            msgList.push(
              "TokenId: " + tokenId + " " + err.code +
                " , but found in the onChain, typeId: " +
                onChainBox[0].typeId
            );
          } else {
            msgList.push("TokenId: " + tokenId + " " + err.code);
          }
        });
    }
    generateFiles(msgList);
  }
  private generateMetadata(
    toyoPersona: Parse.Object<Parse.Attributes>,
    toyoParts: ToyoPart[],
    toyoLevel: number
  ) {
    const toyoStats: Record<string, number> = buildParts.returnSumParts(toyoParts);
    return {
      name: toyoPersona.get("name"),
      description: toyoPersona.get("description"),
      image: toyoPersona.get("thumbnail"),
      animation_url: toyoPersona.get("video"),
      attributes: [
        {
          trait_type: "Type",
          value: 9,
        },
        {
          trait_type: "Toyo",
          value: toyoPersona.get("name"),
        },
        {
          trait_type: "Region",
          value: toyoPersona.get("region"),
        },
        {
          trait_type: "Rarity",
          value: toyoPersona.get("rarity"),
        },
        {
          display_type: "number",
          trait_type: "Vitality",
          value: toyoStats.vitality,
        },
        {
          display_type: "number",
          trait_type: "Strength",
          value: toyoStats.physicalStrength,
        },
        {
          display_type: "number",
          trait_type: "Resistance",
          value: toyoStats.resistance,
        },
        {
          display_type: "number",
          trait_type: "CyberForce",
          value: toyoStats.cyberForce,
        },
        {
          display_type: "number",
          trait_type: "Resilience",
          value: toyoStats.resilience,
        },
        {
          display_type: "number",
          trait_type: "Precision",
          value: toyoStats.precision,
        },
        {
          display_type: "number",
          trait_type: "Technique",
          value: toyoStats.technique,
        },
        {
          display_type: "number",
          trait_type: "Analysis",
          value: toyoStats.analysis,
        },
        {
          display_type: "number",
          trait_type: "Speed",
          value: toyoStats.speed,
        },
        {
          display_type: "number",
          trait_type: "Agility",
          value: toyoStats.agility,
        },
        {
          display_type: "number",
          trait_type: "Stamina",
          value: toyoStats.stamina,
        },
        {
          display_type: "number",
          trait_type: "Luck",
          value: toyoStats.luck,
        },
      ],
    };
  }
}

