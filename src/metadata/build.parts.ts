import { ToyoPart } from "../models/toyo/part";
import { ToyoEdition } from "../models/toyo";

export class BuildParts {
  buildParts(toyoPersona: Parse.Object<Parse.Attributes>): {
    parts: ToyoPart[];
    toyoLevel: number;
  } {
    const parts: ToyoPart[] = [];
    const partsName = [
      "HEAD",
      "CHEST",
      "R_ARM",
      "L_ARM",
      "R_HAND",
      "L_HAND",
      "R_LEG",
      "L_LEG",
      "R_FOOT",
      "L_FOOT",
    ];
    const rarity: number = toyoPersona.get("rarityId");

    const allPartsStats: Record<string, number> = {
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
    for (let index = 0; index < partsName.length; index++) {
      const level = _mapLevel(rarity);
      let sumStats = _mapSumStats(level) - 12;

      const part: any = {
        toyoPiece: partsName[index],
        toyoTechnoalloy: "SIDERITE",
        toyoPersona,
        isNFT: false,
        bonusStats: {},
        justTheStats: [
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
        ],
        rarityId: rarity.toString(),
        rarity: ToyoEdition[rarity],
        stats: {},
        level,
      };

      while (sumStats > 0) {
        const randomStat = Math.floor(Math.random() * part.justTheStats.length);
        part.justTheStats[randomStat].value++;
        sumStats--;
      }

      for (const justTheStat of part.justTheStats) {
        allPartsStats[justTheStat.stat] += justTheStat.value;
        part.stats[justTheStat.stat] = justTheStat.value;
      }

      delete part.justTheStats;
      part.stats["heartbond"] = 20;

      parts.push(part);
    }

    const levels: any = parts.map((part) => part.level);
    const maxLevel: number | undefined = Math.max(...levels);
    return { parts, toyoLevel: maxLevel };
  }
  returnSumParts(parts: ToyoPart[]): Record<string, number> {
    const allPartsStats: Record<string, number> = {
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
    for (const item of parts) {
      for (const key of Object.keys(item.stats)) {
        if (key !== "heartbond") {
          allPartsStats[key] += item.stats[key];
        }
      }
    }
    return allPartsStats;
  }
}

function _mapLevel(rarity: number): number {
  let levels = [];
  let index: number;
  switch (rarity) {
    case 1:
      levels = [7, 8, 9];
      index = Math.floor(Math.random() * levels.length);
      return levels[index];
    case 2:
      levels = [8, 9, 10];
      index = Math.floor(Math.random() * levels.length);
      return levels[index];
    case 3:
      levels = [8, 9, 10, 11];
      index = Math.floor(Math.random() * levels.length);
      return levels[index];
    case 4:
      levels = [9, 10, 11];
      index = Math.floor(Math.random() * levels.length);
      return levels[index];
    case 5:
      levels = [10, 11];
      index = Math.floor(Math.random() * levels.length);
      return levels[index];
    case 6:
      levels = [11, 12];
      index = Math.floor(Math.random() * levels.length);
      return levels[index];
    default:
      console.log("Rarity not handled: " + rarity);
      throw new Error("Invalid rarity");
  }
}
function _mapSumStats(level: number): number {
  let minSum = 0;
  let maxSum = 0;

  switch (level) {
    case 7:
      minSum = 59;
      maxSum = 68;
      break;
    case 8:
      minSum = 68;
      maxSum = 77;
      break;
    case 9:
      minSum = 77;
      maxSum = 86;
      break;
    case 10:
      minSum = 86;
      maxSum = 95;
      break;
    case 11:
      minSum = 95;
      maxSum = 103;
      break;
    case 12:
      minSum = 103;
      maxSum = 111;
      break;
    default:
      throw new Error("Invalid level");
  }

  return _mapRandomStat(minSum, maxSum);
}
const _mapRandomStat = (minSum: number, maxSum: number) =>
  Math.floor(Math.random() * (maxSum - minSum + 1) + minSum);
