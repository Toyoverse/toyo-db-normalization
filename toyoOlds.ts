import "dotenv/config";
import { BoxRepository } from "./src/repositories/box.repository";
import * as back4app from "./src/config/back4app";
import { MapMetadata } from "./src/metadata/map.metadata";
import Box from "./src/models/box/box";

back4app.config();

const boxRepository = new BoxRepository();
const mapMetadata = new MapMetadata();

const main = async ()=>{
    console.log('start');
    const boxes:Box[] = await boxRepository.findBoxesWithOldToyo();
    await mapMetadata.mapMetadata(boxes);
}

main();