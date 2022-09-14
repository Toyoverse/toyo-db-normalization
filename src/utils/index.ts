import * as fs from 'fs';

export function tokenIdWithObservation(observation:string):string{
    let tokenId = observation.substring(18,23);
    if (tokenId.charAt(4) === " ") tokenId = tokenId.substring(0,4);
    return tokenId;
}
export function generateFiles(msgList:string[]){
    const filePath:string = "./files";
    const objString = JSON.stringify(msgList, null, 2);
    
    fs.writeFileSync(filePath, objString, 'utf-8');
    
}

