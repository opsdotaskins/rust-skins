/**
 * Map a Rust skin's market name to a storefront category and rarity tier.
 * Shared by the import script and the catalogue import endpoint; no
 * server-only imports so it also runs under plain `tsx`.
 */

const RULES: [category: string, re: RegExp][] = [
  // Bags/beds before apparel; deployable containers before base parts.
  ["deployables", /\b(sleeping bag|bed|rug|fridge|furnace|box|storage|bbq|barbeque|vending machine|chair|table|bench|lantern|candle|planter|auto ?turret|turret|sign|water purifier|composter|stocking|trophy|totem|speaker|kayak|boat|mixing table|research table|repair bench|workbench|tool cupboard|cupboard|coffin|shelves|locker|hobo barrel|barrel|fireplace|campfire|grill|oven|tank|jukebox|guitar|drum|piano|xylophone)\b/i],
  ["base", /\b(door|doors|garage|gate|window|shutters?|wall|barricade|embrasure|ladder|hatch|bars|fence|floor grill|netting)\b/i],
  ["tools", /\b(hatchet|pick ?axe|pickaxe|ice ?pick|hammer|rock|torch|chainsaw|jackhammer|fishing rod|flashlight|stone hatchet|salvaged axe|axe|binoculars|chisel|wrench)\b/i],
  ["weapons", /(\bak\b|\bak-?47\b|\bar\b|assault rifle|\blr-?300\b|\bmp5|thompson|\bsmg\b|\bsar\b|semi-?auto|python|revolver|pistol|\bm249\b|\bm39\b|\bl96\b|bolt ?(action|rifle)|shotgun|waterpipe|double barrel|crossbow|\bbow\b|rocket launcher|\beoka\b|nailgun|\bm92\b|\bspas|knife|machete|sword|spear|\bmace\b|cleaver|club|\bsks\b|\bhmlmg\b|grenade|beancan|katana|bat\b|minigun|flame ?thrower|\bm4\b|\bdbs\b|\bsap\b|\blr\b|\bhv\b)/i],
  ["apparel", /\b(jacket|hoodie|pants|trousers|shirt|t-shirt|tank ?top|longsleeve|boots|shoes|gloves|gauntlets|helmet|mask|facemask|vest|chest ?plate|kilt|hat|cap|bandana|shorts|poncho|skirt|backpack|jumpsuit|coffee can|bucket|balaclava|sunglasses|glasses|burlap|hide|roadsign|armou?r|coat|suit|scarf|beanie|headwear|headwrap|hood|leggings|sweater|dress|outfit|skin|haidate|crop top|costume|beenie|mitts|kabuto|sandals|socks|wraps|bra|top)\b/i],
];

export function classifyCategory(name: string): string {
  for (const [cat, re] of RULES) if (re.test(name)) return cat;
  return "deployables";
}

/** Rarity tier from retail price (USD cents) — drives the colour scale. */
export function rarityForPrice(cents: number): string {
  const usd = cents / 100;
  if (usd < 2) return "common";
  if (usd < 8) return "uncommon";
  if (usd < 30) return "rare";
  if (usd < 100) return "mythical";
  if (usd < 300) return "legendary";
  if (usd < 1000) return "immortal";
  return "ancient";
}

export function slugify(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "skin"
  );
}
