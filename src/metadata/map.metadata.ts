import "dotenv/config";
import * as back4app from "../config/back4app";
import { ToyoRepository, OnchainRepository } from "../repositories/";
import { tokenIdValue, generateFiles } from "../utils/index";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import Box from "../models/box/box";
import { Toyo } from "../models/toyo";
import { Request } from "./";

back4app.config();

const onchainRepository = new OnchainRepository();
const toyoRepository = new ToyoRepository();
const request = new Request();

export class MapMetadata {
  async mapMetadata(boxes: Box[]) {
    const msgList: string[] = [];
    for (const item of boxes) {
      let tokenId: string = item.toyo
        ? item.toyo.tokenId
        : tokenIdValue(item.observation);
      const toyo: Toyo = await toyoRepository.findByTokenId(tokenId);
      console.log(tokenId);
      const onChain: TokenOwnerEntities[] =
        await onchainRepository.getTokenOwnerEntityByTokenId(tokenId);
      await request.getMetadata(tokenId, toyo, item, msgList, onChain[0]);
    }
    generateFiles(msgList);
  }
}
