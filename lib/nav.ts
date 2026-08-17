/** Rust-native navigation. Every href resolves to a real page (no 404s). */
export interface MegaLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  href: string;
  featured?: { name: string; href: string; image: string };
  links: MegaLink[];
  rarityQuickFilters?: boolean;
}

const catalog = (params: Record<string, string>) =>
  `/catalog?${new URLSearchParams(params).toString()}`;

export const NAV: NavGroup[] = [
  {
    label: "Weapons",
    href: catalog({ category: "weapons" }),
    rarityQuickFilters: true,
    links: [
      { label: "All weapon skins", href: catalog({ category: "weapons" }) },
      { label: "Most valuable", href: catalog({ category: "weapons", sort: "price-desc" }) },
      { label: "Best value", href: catalog({ category: "weapons", sort: "price-asc" }) },
    ],
    featured: {
      name: "Heat Seeker Thompson",
      href: "/item/heat-seeker-thompson",
      image:
        "https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Vd7WLEfCk4nReh8DEiv5dbOK8-r7A1Qvy6FSjwohI",
    },
  },
  {
    label: "Apparel",
    href: catalog({ category: "apparel" }),
    rarityQuickFilters: true,
    links: [
      { label: "All apparel", href: catalog({ category: "apparel" }) },
      { label: "Jackets & hoodies", href: catalog({ category: "apparel", sort: "price-desc" }) },
      { label: "New arrivals", href: catalog({ category: "apparel", sort: "newest" }) },
    ],
    featured: {
      name: "No Mercy Jacket",
      href: "/item/no-mercy-jacket",
      image:
        "https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835de4GLDfCk4nReh8DEiv5deOag3rrc2QP316OPCDA",
    },
  },
  {
    label: "Base & Building",
    href: catalog({ category: "base" }),
    links: [
      { label: "All base skins", href: catalog({ category: "base" }) },
      { label: "Doors", href: catalog({ category: "base", q: "door" }) },
      { label: "Most valuable", href: catalog({ category: "base", sort: "price-desc" }) },
    ],
    featured: {
      name: "Aztec Gold Door",
      href: "/item/aztec-gold-door",
      image:
        "https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835FY4WLCfCk4nReh8DEiv5daMa87pLIzRP66b6-FeYA",
    },
  },
  {
    label: "Deployables",
    href: catalog({ category: "deployables" }),
    links: [
      { label: "All deployables", href: catalog({ category: "deployables" }) },
      { label: "Storage & boxes", href: catalog({ category: "deployables", q: "box" }) },
      { label: "New arrivals", href: catalog({ category: "deployables", sort: "newest" }) },
    ],
    featured: {
      name: "High Quality Bag",
      href: "/item/high-quality-bag",
      image:
        "https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrAfCk4nReh8DEiv5ddOas5pLYwSPi8vYJTENQ",
    },
  },
  {
    label: "Tools",
    href: catalog({ category: "tools" }),
    links: [
      { label: "All tools", href: catalog({ category: "tools" }) },
    ],
    featured: {
      name: "Jack O Lantern Happy",
      href: "/item/jack-o-lantern-happy",
      image:
        "https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5WbAfCk4nReh8DEiv5dbP6E9qL0-SGBFhVhs",
    },
  },
  {
    label: "Deals",
    href: "/deals",
    links: [
      { label: "All deals", href: "/deals" },
      { label: "Cheapest first", href: catalog({ sort: "price-asc" }) },
    ],
  },
  {
    label: "New arrivals",
    href: catalog({ sort: "newest" }),
    links: [
      { label: "Just added", href: catalog({ sort: "newest" }) },
      { label: "New weapons", href: catalog({ category: "weapons", sort: "newest" }) },
    ],
  },
];
