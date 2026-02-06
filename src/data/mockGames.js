export const GAMES = [
  {
    id: 1,
    title: "Elden Ring",
    platforms: ["PC", "PS"],
    basePrice: 59.99,
    discount: 0.30, // 30% off
    rating: 9.6,
    dau: 800000,
    tags: ["Hardcore", "RPG", "Open World", "Action"],
    cover: "https://placehold.co/300x400/222/FFF?text=Elden+Ring"
  },
  {
    id: 2,
    title: "Stardew Valley",
    platforms: ["PC", "NS", "PS"],
    basePrice: 14.99,
    discount: 0,
    rating: 9.8,
    dau: 120000,
    tags: ["Casual", "Simulation", "Farming", "Co-op"],
    cover: "https://placehold.co/300x400/6fa/000?text=Stardew"
  },
  {
    id: 3,
    title: "Cyberpunk 2077",
    platforms: ["PC", "PS"],
    basePrice: 59.99,
    discount: 0.50, // 50% off
    rating: 9.0,
    dau: 45000,
    tags: ["RPG", "Sci-Fi", "Open World", "Story Rich"],
    cover: "https://placehold.co/300x400/ee0/000?text=Cyberpunk"
  },
  {
    id: 4,
    title: "Animal Crossing: New Horizons",
    platforms: ["NS"],
    basePrice: 59.99,
    discount: 0,
    rating: 9.2,
    dau: 300000,
    tags: ["Casual", "Simulation", "Cute"],
    cover: "https://placehold.co/300x400/8ef/000?text=Animal+Crossing"
  },
  {
    id: 5,
    title: "Hades",
    platforms: ["PC", "NS", "PS"],
    basePrice: 24.99,
    discount: 0.40,
    rating: 9.7,
    dau: 60000,
    tags: ["Action", "Roguelike", "Indie", "Story Rich"],
    cover: "https://placehold.co/300x400/f44/FFF?text=Hades"
  },
  {
    id: 6,
    title: "Baldur's Gate 3",
    platforms: ["PC", "PS"],
    basePrice: 59.99,
    discount: 0.10,
    rating: 9.9,
    dau: 650000,
    tags: ["RPG", "Story Rich", "Strategy", "Hardcore"],
    cover: "https://placehold.co/300x400/511/FFF?text=BG3"
  },
  {
    id: 7,
    title: "Vampire Survivors",
    platforms: ["PC", "NS"],
    basePrice: 4.99,
    discount: 0,
    rating: 9.5,
    dau: 200000,
    tags: ["Casual", "Action", "Roguelike"],
    cover: "https://placehold.co/300x400/300/FFF?text=Vampire"
  },
  {
    id: 8,
    title: "Final Fantasy VII Rebirth",
    platforms: ["PS"],
    basePrice: 69.99,
    discount: 0,
    rating: 9.4,
    dau: 150000,
    tags: ["RPG", "Story Rich", "Action"],
    cover: "https://placehold.co/300x400/044/FFF?text=FF7R"
  },
  {
    id: 9,
    title: "Hollow Knight",
    platforms: ["PC", "NS", "PS"],
    basePrice: 14.99,
    discount: 0.50,
    rating: 9.6,
    dau: 40000,
    tags: ["Metroidvania", "Hardcore", "Indie"],
    cover: "https://placehold.co/300x400/112/FFF?text=Hollow+Knight"
  },
  {
    id: 10,
    title: "Mario Kart 8 Deluxe",
    platforms: ["NS"],
    basePrice: 59.99,
    discount: 0,
    rating: 9.3,
    dau: 250000,
    tags: ["Racing", "Casual", "Multiplayer"],
    cover: "https://placehold.co/300x400/f00/FFF?text=Mario+Kart"
  }
];

export const PLATFORMS = [
  { id: 'PC', label: 'PC (Steam/Epic)', icon: '💻' },
  { id: 'NS', label: 'Nintendo Switch', icon: '🎮' },
  { id: 'PS', label: 'PlayStation', icon: '🕹️' }
];
