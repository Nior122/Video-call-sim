export interface AvatarPreset {
  id: string;
  name: string;
  category: "illustrated" | "aesthetic" | "3d" | "minimal";
  url: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "avatar-1",
    name: "Cyber Pink",
    category: "illustrated",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-2",
    name: "Golden Hour",
    category: "aesthetic",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-3",
    name: "Neon Glow",
    category: "illustrated",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-4",
    name: "Ocean Breeze",
    category: "aesthetic",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-5",
    name: "Sakura Blossom",
    category: "aesthetic",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-6",
    name: "Midnight Chic",
    category: "aesthetic",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-7",
    name: "Sunset Dreamer",
    category: "illustrated",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-8",
    name: "Velvet Rose",
    category: "aesthetic",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-9",
    name: "Retro Synth",
    category: "minimal",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-10",
    name: "Violet Aura",
    category: "illustrated",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-11",
    name: "Crystal Muse",
    category: "aesthetic",
    url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "avatar-12",
    name: "Star Sapphire",
    category: "minimal",
    url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
  },
];
