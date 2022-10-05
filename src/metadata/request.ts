import axios from "axios";
import { ValidationRequest } from "./validationRequest";
import { ToyoMetadata } from "../models/toyo/metadata";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import { pushMsgList } from "../utils/index";
import Box from "../models/box/box";
import { Toyo } from "../models/toyo";

const validationRequest = new ValidationRequest();

export class Request {
  async getMetadata(
    tokenId: string,
    toyo: Toyo,
    box: Box,
    msgList: string[],
    onChain: TokenOwnerEntities
  ) {
    const urlData =
      "https://toyoverse.com/nft_metadata/toyos/" + tokenId + ".json";
    const result = await axios
      .get(urlData)
      .then(async (result) => {
        if (result.data) {
          const metadata: ToyoMetadata = result.data;
          pushMsgList(
            await validationRequest.verifyMetadata(metadata, toyo, box),
            msgList
          );
          pushMsgList(
            await validationRequest.verifyToyo(toyo, metadata, box),
            msgList
          );
          pushMsgList(
            await validationRequest.verifyOnchainWithMetadata(
              onChain,
              metadata,
              toyo,
              box
            ),
            msgList
          );
        } else {
          pushMsgList(
            await validationRequest.verifyOnchainWithOutMetadata(
              onChain,
              undefined,
              toyo,
              box
            ),
            msgList
          );
        }
      })
      .catch(async (err) => {
        pushMsgList(
          await validationRequest.verifyToyo(toyo, undefined, box, err.code),
          msgList
        );
        pushMsgList(
          await validationRequest.verifyOnchainWithOutMetadata(
            onChain,
            undefined,
            toyo,
            box
          ),
          msgList
        );
      });
  }
}
