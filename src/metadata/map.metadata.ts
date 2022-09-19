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

back4app.config();

const toyoRepository = new ToyoRepository();
const onchainRepository = new OnchainRepository();
const metadataRepository = new MetadataRepository();

export class MapMetadata {
  async mapMetadata(boxes: Box[]) {
    const msgList: string[] = [];
    for (const item of boxes) {
      let tokenId: string = item.observation
        ? tokenIdValue(item.observation)
        : item.toyo.tokenId;
      const toyo: Toyo = item.toyo
        ? item.toyo
        : await toyoRepository.findByTokenId(tokenId);
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
            if (toyo && toyo.name !== metadata.name) {
              toyoRepository.updateToyo(toyo, metadata); //TO DO
            } else if (!toyo && onChain.length > 0) {
                await toyoRepository.save(metadata, onChain[0]);
              msgList.push(
                "TokenId: " + tokenId + " metadata ok, but toyo not found. Toyo was created" 
              );
            }
            console.log(result.statusText);
            console.log(metadata.name);
          } else if (toyo) {
            //TO DO
            //toyo.toyoMetadata = this.generateMetadata(toyo.toyoPersonaOrigin, toyo.parts, toyo.level);
            //metadataRepository.save(tokenId,toyo.toyoMetadata);
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
            console.log(err.response.status);
            console.log(err.response.statusText);
            //TO DO
            /*toyo.toyoMetadata = this.generateMetadata(toyo.toyoPersonaOrigin, allPartsStats, toyo.level);
            metadataRepository.save(tokenId,toyo.toyoMetadata);*/
            msgList.push(
              "TokenId: " + tokenId + " Not found metadata, but found in the db"
            );
          } else if (onChain.length > 0) {
            msgList.push(
              "TokenId: " +
                tokenId +
                " Not found metadata, but found in the onChain, typeId: " +
                onChainBox[0].typeId
            );
          } else {
            msgList.push("TokenId: " + tokenId + " Not found metadata");
          }
        });
    }
    generateFiles(msgList);
  }
  private generateMetadata(
    toyoPersona: ToyoPersona,
    toyoStats: Record<string, number>,
    toyoLevel: number
  ) {
    return {
      name: toyoPersona.name,
      description: toyoPersona.description,
      image: toyoPersona.thumbnail,
      animation_url: toyoPersona.video,
      attributes: [
        {
          trait_type: "Type",
          value: toyoLevel,
        },
        {
          trait_type: "Toyo",
          value: toyoPersona.name,
        },
        {
          trait_type: "Region",
          value: toyoPersona.region,
        },
        {
          trait_type: "Rarity",
          value: toyoPersona.rarity,
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
  private justTheStats(parts: ToyoPart[]) {
    let allPartsStats: Record<string, number> = {
      vitality: 0,
      resistance: 0,
      resilience: 0,
      physicalStrength: 0,
      cyberForce: 0,
      technique: 0,
      analysis: 0,
      agility: 0,
      speed: 0,
      precision: 0,
      stamina: 0,
      luck: 0,
    };
    let justStats = [
      { stat: "vitality", value: 1 },
      { stat: "resistance", value: 1 },
      { stat: "resilience", value: 1 },
      { stat: "physicalStrength", value: 1 },
      { stat: "cyberForce", value: 1 },
      { stat: "technique", value: 1 },
      { stat: "analysis", value: 1 },
      { stat: "agility", value: 1 },
      { stat: "speed", value: 1 },
      { stat: "precision", value: 1 },
      { stat: "stamina", value: 1 },
      { stat: "luck", value: 1 },
    ];
    for (const item of justStats) {
    }
  }
  /*private findTokenId(box: Box): string{
    let tokenId:string;
    if (box.observation){
        tokenId = tokenIdValue(box.observation);
    } else{
        tokenId = box.toyo.tokenId;
    }
    return tokenId;
  }*/
}
