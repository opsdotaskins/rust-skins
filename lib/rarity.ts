export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "mythical"
  | "legendary"
  | "immortal"
  | "arcana"
  | "ancient";

export const RARITY_META: Record<Rarity, { label: string; color: string }> = {
  common: { label: "Common", color: "#B0C3D9" },
  uncommon: { label: "Uncommon", color: "#5E98D9" },
  rare: { label: "Rare", color: "#4B69FF" },
  mythical: { label: "Mythical", color: "#8847FF" },
  legendary: { label: "Legendary", color: "#D32CE6" },
  immortal: { label: "Immortal", color: "#E4AE39" },
  arcana: { label: "Arcana", color: "#ADE55C" },
  ancient: { label: "Ancient", color: "#EB4B4B" },
};

export const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "mythical",
  "legendary",
  "immortal",
  "arcana",
  "ancient",
];

export const QUALITIES = [
  "standard",
  "inscribed",
  "autographed",
  "genuine",
  "unusual",
  "corrupted",
  "exalted",
  "frozen",
  "golden",
] as const;

export function qualityLabel(q: string) {
  if (q === "standard") return "";
  return q.charAt(0).toUpperCase() + q.slice(1);
}

/** Arcana + Immortal get the intensified enchanted treatment. */
export function isEnchanted(rarity: Rarity) {
  return rarity === "arcana" || rarity === "immortal";
}
