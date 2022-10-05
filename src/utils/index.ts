import * as path from "path";
import * as fs from "fs";

const folder = process.env.LOCAL_FILES_FOLDER;

export function tokenIdValue(observation: string): string {
  let tokenId: string;
  if (observation) tokenId = observation.substring(18, 23);
  if (tokenId && tokenId.charAt(4) === " ") tokenId = tokenId.substring(0, 4);
  return tokenId;
}
export function generateFiles(msgList: string[]) {
  const filePath = path.join(folder, "logs" + ".json");
  const objString = JSON.stringify(msgList, null, 2);

  fs.writeFileSync(filePath, objString, "utf-8");
}
export function pushMsgList(msg: string, msgList: string[]) {
  if (msg !== null && msg !== undefined) msgList.push(msg);
}
