import { ToyoMetadata } from "../models/toyo/metadata";
import { BuildParts } from "./build.parts";
import { ToyoPart } from "../models/toyo/part";

const buildParts = new BuildParts();

export class Metadata {
  generateMetadata(
    toyoPersona: Parse.Object<Parse.Attributes>,
    toyoParts: ToyoPart[],
    toyoLevel: number
  ) {
    const toyoStats: Record<string, number> =
      buildParts.returnSumParts(toyoParts);
    return {
      name: toyoPersona.get("name"),
      description: toyoPersona.get("description"),
      image: toyoPersona.get("thumbnail"),
      animation_url: toyoPersona.get("video"),
      attributes: [
        {
          trait_type: "Type",
          value: toyoLevel,
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
  isCorrectMetadata(
    metadata: ToyoMetadata,
    toyoStats: Record<string, number>
  ): boolean {
    for (let i = 4; i <= 15; i++) {
      const stats: string = metadata.attributes[i]["trait_type"];
      let statsConvert = stats[0].toLowerCase() + stats.substring(1);
      if (statsConvert === "strength") statsConvert = "physicalStrength";
      if (toyoStats[statsConvert] != metadata.attributes[i]["value"])
        return false;
    }
    return true;
  }
}
