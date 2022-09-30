import "dotenv/config";
import * as back4app from "../config/back4app";
import axios from "axios";
import { ToyoRepository } from "../repositories/toyo.repository";
import { ToyoMetadata } from "../models/toyo/metadata";
import { tokenIdValue, generateFiles } from "../utils/index";
import { OnchainRepository } from "../repositories/onchain";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import Box from "../models/box/box";
import { Toyo } from "../models/toyo";
import { ValidationMetadata } from "./";

back4app.config();

const toyoRepository = new ToyoRepository();
const onchainRepository = new OnchainRepository();
const validationMetadata = new ValidationMetadata();

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
            const metadata: ToyoMetadata = result.data;
            msgList.push(
              await validationMetadata.verifyMetdata(metadata, toyo, item)
            );
            msgList.push(await validationMetadata.verifyToyoMetadata(toyo, metadata, item));
            msgList.push(await validationMetadata.verifyOnchain(
              onChain[0],
              metadata,
              toyo,
              item
            ));
          } else {
            msgList.push("TokenId: " + tokenId + " metadata undefined");
          }
        })
        .catch(async (err) => {
          msgList.push(await validationMetadata.verifyToyo(toyo, err.code, item));

          if (onChain.length > 0) {
            msgList.push(
              "TokenId: " +
                tokenId +
                " " +
                err.code +
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
}
