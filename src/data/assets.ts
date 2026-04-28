import sword from "@/assets/asset-sword.jpg";
import spaceship from "@/assets/asset-spaceship.jpg";
import pixel from "@/assets/asset-pixel.jpg";
import stone from "@/assets/asset-stone.jpg";
import dragon from "@/assets/asset-dragon.jpg";
import laser from "@/assets/asset-laser.jpg";
import tileset from "@/assets/asset-tileset.jpg";
import armor from "@/assets/asset-armor.jpg";
import potion from "@/assets/asset-potion.jpg";

export type Category = "3D" | "2D" | "Textures";
export type Style = "Fantasy" | "Sci-Fi" | "Pixel" | "Realistic";

export interface Asset {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  style: Style;
  designer: string;
  designerId: string;
}

export const assets: Asset[] = [
  { id: "1", title: "Runeblade of Eternity", description: "A glowing fantasy sword with ancient runes. Game-ready PBR model with 4K textures.", price: 24, image: sword, category: "3D", style: "Fantasy", designer: "Aeris Vale", designerId: "d1" },
  { id: "2", title: "Nebula Cruiser X-7", description: "Sleek sci-fi spacecraft with modular cockpit and animated thrusters.", price: 49, image: spaceship, category: "3D", style: "Sci-Fi", designer: "Orion Park", designerId: "d2" },
  { id: "3", title: "Pixel Knight Sprite", description: "Animated 16-bit knight with 6 directional walk cycles and combat frames.", price: 12, image: pixel, category: "2D", style: "Pixel", designer: "Mika Tanaka", designerId: "d3" },
  { id: "4", title: "Mossy Stone Pack", description: "Seamless 4K stone textures with normal, roughness, and AO maps.", price: 18, image: stone, category: "Textures", style: "Realistic", designer: "Aeris Vale", designerId: "d1" },
  { id: "5", title: "Violet Wyrm Dragon", description: "Stylized dragon model with rigged wings and breath VFX particles.", price: 89, image: dragon, category: "3D", style: "Fantasy", designer: "Aeris Vale", designerId: "d1" },
  { id: "6", title: "Plasma Sidearm Mk-II", description: "Sci-fi pistol with emissive maps and animated charge sequence.", price: 32, image: laser, category: "3D", style: "Sci-Fi", designer: "Orion Park", designerId: "d2" },
  { id: "7", title: "Enchanted Forest Tileset", description: "Lush pixel-art forest tileset with parallax layers and props.", price: 22, image: tileset, category: "2D", style: "Pixel", designer: "Mika Tanaka", designerId: "d3" },
  { id: "8", title: "Obsidian Knight Armor", description: "Photorealistic medieval armor with cloth physics-ready bones.", price: 65, image: armor, category: "3D", style: "Realistic", designer: "Lyra Quinn", designerId: "d4" },
  { id: "9", title: "Aurora Mana Potion", description: "Stylized 2D potion icon set with 12 color variants.", price: 8, image: potion, category: "2D", style: "Fantasy", designer: "Mika Tanaka", designerId: "d3" },
];

export const designers = [
  { id: "d1", name: "Aeris Vale", style: "Dark Fantasy specialist", bio: "Crafting otherworldly weapons and creatures since 2021." },
  { id: "d2", name: "Orion Park", style: "Sci-Fi & Hard Surface", bio: "Designing the future, one polygon at a time." },
  { id: "d3", name: "Mika Tanaka", style: "Pixel art & 2D", bio: "Retro vibes with modern polish." },
  { id: "d4", name: "Lyra Quinn", style: "Photoreal characters", bio: "Cinematic-grade game-ready assets." },
];
