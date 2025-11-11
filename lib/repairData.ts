export interface Brand {
  id: string;
  name: string;
  logo: string;
  deviceTypes: ("smartphone" | "tablet" | "laptop")[]; // Brand supports these device types
}

export interface DeviceModel {
  id: string;
  name: string;
  image: string;
  variants: string[];
  brandId: string;
  deviceType: "smartphone" | "tablet" | "laptop";
  colors: { id: string; name: string; hex: string }[];
}

export interface RepairItem {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  badge?: string;
  icon: string;
  deviceTypes: string[]; // smartphone, tablet, laptop
}

export const BRANDS: Brand[] = [
  // Smartphone, Tablet, and Laptop Brands
  { id: "apple", name: "Apple", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apple.svg", deviceTypes: ["smartphone", "tablet", "laptop"] },
  { id: "samsung", name: "Samsung", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/samsung.svg", deviceTypes: ["smartphone", "tablet"] },
  { id: "google", name: "Google", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg", deviceTypes: ["smartphone"] },
  { id: "oneplus", name: "OnePlus", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/oneplus.svg", deviceTypes: ["smartphone"] },
  { id: "xiaomi", name: "Xiaomi", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xiaomi.svg", deviceTypes: ["smartphone"] },
  { id: "oppo", name: "Oppo", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/oppo.svg", deviceTypes: ["smartphone"] },
  { id: "realme", name: "Realme", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Realme_logo.svg/1200px-Realme_logo.svg.png", deviceTypes: ["smartphone"] },
  { id: "nokia", name: "Nokia", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nokia.svg", deviceTypes: ["smartphone"] },
  { id: "motorola", name: "Motorola", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/motorola.svg", deviceTypes: ["smartphone"] },
  { id: "sony", name: "Sony", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/sony.svg", deviceTypes: ["smartphone"] },
  { id: "lg", name: "LG", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/lg.svg", deviceTypes: ["smartphone"] },
  { id: "huawei", name: "Huawei", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/huawei.svg", deviceTypes: ["smartphone"] },
  { id: "microsoft", name: "Microsoft", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg", deviceTypes: ["tablet", "laptop"] },
  { id: "lenovo", name: "Lenovo", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/lenovo.svg", deviceTypes: ["tablet", "laptop"] },
  { id: "dell", name: "Dell", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dell.svg", deviceTypes: ["laptop"] },
  { id: "hp", name: "HP", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hp.svg", deviceTypes: ["laptop"] },
  { id: "asus", name: "Asus", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/asus.svg", deviceTypes: ["laptop"] },
  { id: "acer", name: "Acer", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/acer.svg", deviceTypes: ["laptop"] },
];

export const DEVICE_MODELS: DeviceModel[] = [
  // Apple Smartphones
  { 
    id: "iphone-16-pro-max", 
    name: "iPhone 16 Pro Max", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_16_Pro_Max.png/220px-IPhone_16_Pro_Max.png", 
    variants: ["A3294", "A3365"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "black-titanium", name: "Black Titanium", hex: "#1C1C1E" },
      { id: "white-titanium", name: "White Titanium", hex: "#F5F5F7" },
      { id: "natural-titanium", name: "Natural Titanium", hex: "#C7C7CC" },
      { id: "desert-titanium", name: "Desert Titanium", hex: "#C4A57B" }
    ]
  },
  { 
    id: "iphone-16-pro", 
    name: "iPhone 16 Pro", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_16_Pro.png/220px-IPhone_16_Pro.png", 
    variants: ["A3288", "A3359"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "black-titanium", name: "Black Titanium", hex: "#1C1C1E" },
      { id: "white-titanium", name: "White Titanium", hex: "#F5F5F7" },
      { id: "natural-titanium", name: "Natural Titanium", hex: "#C7C7CC" },
      { id: "desert-titanium", name: "Desert Titanium", hex: "#C4A57B" }
    ]
  },
  { 
    id: "iphone-16-plus", 
    name: "iPhone 16 Plus", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_16_Plus.png/220px-IPhone_16_Plus.png", 
    variants: ["A3094", "A2847"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "black", name: "Black", hex: "#000000" },
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "pink", name: "Pink", hex: "#FF69B4" },
      { id: "teal", name: "Teal", hex: "#0891B2" },
      { id: "ultramarine", name: "Ultramarine", hex: "#3730A3" }
    ]
  },
  { 
    id: "iphone-16", 
    name: "iPhone 16", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_16.png/220px-IPhone_16.png", 
    variants: ["A3287", "A3081"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "black", name: "Black", hex: "#000000" },
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "pink", name: "Pink", hex: "#FF69B4" },
      { id: "teal", name: "Teal", hex: "#0891B2" },
      { id: "ultramarine", name: "Ultramarine", hex: "#3730A3" }
    ]
  },
  { 
    id: "iphone-15-pro-max", 
    name: "iPhone 15 Pro Max", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_15_Pro_Max.png/220px-IPhone_15_Pro_Max.png", 
    variants: ["A2848", "A3105"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "natural-titanium", name: "Natural Titanium", hex: "#C7C7CC" },
      { id: "blue-titanium", name: "Blue Titanium", hex: "#0066CC" },
      { id: "white-titanium", name: "White Titanium", hex: "#F5F5F7" },
      { id: "black-titanium", name: "Black Titanium", hex: "#1C1C1E" }
    ]
  },
  { 
    id: "iphone-15-pro", 
    name: "iPhone 15 Pro", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_15_Pro.png/220px-IPhone_15_Pro.png", 
    variants: ["A2849", "A3106"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "natural-titanium", name: "Natural Titanium", hex: "#C7C7CC" },
      { id: "blue-titanium", name: "Blue Titanium", hex: "#0066CC" },
      { id: "white-titanium", name: "White Titanium", hex: "#F5F5F7" },
      { id: "black-titanium", name: "Black Titanium", hex: "#1C1C1E" }
    ]
  },
  { 
    id: "iphone-15-plus", 
    name: "iPhone 15 Plus", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_15_Plus.png/220px-IPhone_15_Plus.png", 
    variants: ["A2846", "A3089"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "black", name: "Black", hex: "#000000" },
      { id: "blue", name: "Blue", hex: "#0066CC" },
      { id: "green", name: "Green", hex: "#10B981" },
      { id: "yellow", name: "Yellow", hex: "#FBBF24" },
      { id: "pink", name: "Pink", hex: "#FF69B4" }
    ]
  },
  { 
    id: "iphone-15", 
    name: "iPhone 15", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/IPhone_15.png/220px-IPhone_15.png", 
    variants: ["A2847", "A3090"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "black", name: "Black", hex: "#000000" },
      { id: "blue", name: "Blue", hex: "#0066CC" },
      { id: "green", name: "Green", hex: "#10B981" },
      { id: "yellow", name: "Yellow", hex: "#FBBF24" },
      { id: "pink", name: "Pink", hex: "#FF69B4" }
    ]
  },
  { 
    id: "iphone-14-pro-max", 
    name: "iPhone 14 Pro Max", 
    image: "/devices/iphone-14-pro-max.png", 
    variants: ["A2894", "A2895"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "space-black", name: "Space Black", hex: "#1C1C1E" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "gold", name: "Gold", hex: "#F59E0B" },
      { id: "deep-purple", name: "Deep Purple", hex: "#9333EA" }
    ]
  },
  { 
    id: "iphone-14-pro", 
    name: "iPhone 14 Pro", 
    image: "/devices/iphone-14-pro.png", 
    variants: ["A2890", "A2891"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "space-black", name: "Space Black", hex: "#1C1C1E" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "gold", name: "Gold", hex: "#F59E0B" },
      { id: "deep-purple", name: "Deep Purple", hex: "#9333EA" }
    ]
  },
  { 
    id: "iphone-14-plus", 
    name: "iPhone 14 Plus", 
    image: "/devices/iphone-14-plus.png", 
    variants: ["A2886", "A2887"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#1C1C1E" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "blue", name: "Blue", hex: "#0066CC" },
      { id: "purple", name: "Purple", hex: "#9333EA" },
      { id: "red", name: "Product RED", hex: "#DC2626" }
    ]
  },
  { 
    id: "iphone-14", 
    name: "iPhone 14", 
    image: "/devices/iphone-14.png", 
    variants: ["A2882", "A2883"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#1C1C1E" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "blue", name: "Blue", hex: "#0066CC" },
      { id: "purple", name: "Purple", hex: "#9333EA" },
      { id: "red", name: "Product RED", hex: "#DC2626" }
    ]
  },
  { 
    id: "iphone-13-pro-max", 
    name: "iPhone 13 Pro Max", 
    image: "/devices/iphone-13-pro-max.png", 
    variants: ["A2484", "A2485"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "gold", name: "Gold", hex: "#F59E0B" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "sierra-blue", name: "Sierra Blue", hex: "#60A5FA" }
    ]
  },
  { 
    id: "iphone-13-pro", 
    name: "iPhone 13 Pro", 
    image: "/devices/iphone-13-pro.png", 
    variants: ["A2483", "A2484"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "gold", name: "Gold", hex: "#F59E0B" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "sierra-blue", name: "Sierra Blue", hex: "#60A5FA" }
    ]
  },
  { 
    id: "iphone-13", 
    name: "iPhone 13", 
    image: "/devices/iphone-13.png", 
    variants: ["A2482", "A2483"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#1C1C1E" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "blue", name: "Blue", hex: "#0066CC" },
      { id: "pink", name: "Pink", hex: "#FF69B4" },
      { id: "red", name: "Product RED", hex: "#DC2626" }
    ]
  },
  { 
    id: "iphone-13-mini", 
    name: "iPhone 13 mini", 
    image: "/devices/iphone-13-mini.png", 
    variants: ["A2481", "A2482"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#1C1C1E" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "blue", name: "Blue", hex: "#0066CC" },
      { id: "pink", name: "Pink", hex: "#FF69B4" },
      { id: "red", name: "Product RED", hex: "#DC2626" }
    ]
  },
  { 
    id: "iphone-12-pro-max", 
    name: "iPhone 12 Pro Max", 
    image: "/devices/iphone-12-pro-max.png", 
    variants: ["A2342", "A2410"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "gold", name: "Gold", hex: "#F59E0B" },
      { id: "pacific-blue", name: "Pacific Blue", hex: "#0066CC" }
    ]
  },
  { 
    id: "iphone-12-pro", 
    name: "iPhone 12 Pro", 
    image: "/devices/iphone-12-pro.png", 
    variants: ["A2341", "A2406"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "gold", name: "Gold", hex: "#F59E0B" },
      { id: "pacific-blue", name: "Pacific Blue", hex: "#0066CC" }
    ]
  },
  { 
    id: "iphone-se-2022", 
    name: "iPhone SE (2022)", 
    image: "/devices/iphone-se-2022.png", 
    variants: ["A2783", "A2784"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#1C1C1E" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "red", name: "Product RED", hex: "#DC2626" }
    ]
  },
  { 
    id: "iphone-12-mini", 
    name: "iPhone 12 mini", 
    image: "/devices/iphone-12-mini.png", 
    variants: ["A2399", "A2400"], 
    brandId: "apple",
    deviceType: "smartphone",
    colors: [
      { id: "black", name: "Black", hex: "#000000" },
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "blue", name: "Blue", hex: "#0066CC" },
      { id: "green", name: "Green", hex: "#10B981" },
      { id: "red", name: "Product RED", hex: "#DC2626" }
    ]
  },

  // Samsung Smartphones
  { 
    id: "galaxy-s24-ultra", 
    name: "Galaxy S24 Ultra", 
    image: "/devices/galaxy-s24-ultra.png", 
    variants: ["SM-S928"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "titanium-black", name: "Titanium Black", hex: "#1C1C1E" },
      { id: "titanium-gray", name: "Titanium Gray", hex: "#6B7280" },
      { id: "titanium-violet", name: "Titanium Violet", hex: "#9333EA" },
      { id: "titanium-yellow", name: "Titanium Yellow", hex: "#FBBF24" }
    ]
  },
  { 
    id: "galaxy-s24-plus", 
    name: "Galaxy S24+", 
    image: "/devices/galaxy-s24-plus.png", 
    variants: ["SM-S926"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "onyx-black", name: "Onyx Black", hex: "#000000" },
      { id: "marble-gray", name: "Marble Gray", hex: "#9CA3AF" },
      { id: "cobalt-violet", name: "Cobalt Violet", hex: "#9333EA" },
      { id: "amber-yellow", name: "Amber Yellow", hex: "#FBBF24" }
    ]
  },
  { 
    id: "galaxy-s24", 
    name: "Galaxy S24", 
    image: "/devices/galaxy-s24.png", 
    variants: ["SM-S921"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "onyx-black", name: "Onyx Black", hex: "#000000" },
      { id: "marble-gray", name: "Marble Gray", hex: "#9CA3AF" },
      { id: "cobalt-violet", name: "Cobalt Violet", hex: "#9333EA" },
      { id: "amber-yellow", name: "Amber Yellow", hex: "#FBBF24" }
    ]
  },
  { 
    id: "galaxy-s23-ultra", 
    name: "Galaxy S23 Ultra", 
    image: "/devices/galaxy-s23-ultra.png", 
    variants: ["SM-S918"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "phantom-black", name: "Phantom Black", hex: "#000000" },
      { id: "cream", name: "Cream", hex: "#F5F5DC" },
      { id: "green", name: "Green", hex: "#10B981" },
      { id: "lavender", name: "Lavender", hex: "#C084FC" }
    ]
  },
  { 
    id: "galaxy-s23-plus", 
    name: "Galaxy S23+", 
    image: "/devices/galaxy-s23-plus.png", 
    variants: ["SM-S916"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "phantom-black", name: "Phantom Black", hex: "#000000" },
      { id: "cream", name: "Cream", hex: "#F5F5DC" },
      { id: "green", name: "Green", hex: "#10B981" },
      { id: "lavender", name: "Lavender", hex: "#C084FC" }
    ]
  },
  { 
    id: "galaxy-s23", 
    name: "Galaxy S23", 
    image: "/devices/galaxy-s23.png", 
    variants: ["SM-S911"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "phantom-black", name: "Phantom Black", hex: "#000000" },
      { id: "cream", name: "Cream", hex: "#F5F5DC" },
      { id: "green", name: "Green", hex: "#10B981" },
      { id: "lavender", name: "Lavender", hex: "#C084FC" }
    ]
  },
  { 
    id: "galaxy-z-fold-5", 
    name: "Galaxy Z Fold 5", 
    image: "/devices/galaxy-z-fold-5.png", 
    variants: ["SM-F946"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "phantom-black", name: "Phantom Black", hex: "#000000" },
      { id: "cream", name: "Cream", hex: "#F5F5DC" },
      { id: "icy-blue", name: "Icy Blue", hex: "#93C5FD" }
    ]
  },
  { 
    id: "galaxy-z-flip-5", 
    name: "Galaxy Z Flip 5", 
    image: "/devices/galaxy-z-flip-5.png", 
    variants: ["SM-F731"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "cream", name: "Cream", hex: "#F5F5DC" },
      { id: "lavender", name: "Lavender", hex: "#C084FC" },
      { id: "mint", name: "Mint", hex: "#6EE7B7" }
    ]
  },
  { 
    id: "galaxy-a54", 
    name: "Galaxy A54 5G", 
    image: "/devices/galaxy-a54.png", 
    variants: ["SM-A546"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "awesome-black", name: "Awesome Black", hex: "#000000" },
      { id: "awesome-white", name: "Awesome White", hex: "#FFFFFF" },
      { id: "awesome-lime", name: "Awesome Lime", hex: "#84CC16" },
      { id: "awesome-violet", name: "Awesome Violet", hex: "#9333EA" }
    ]
  },
  { 
    id: "galaxy-a34", 
    name: "Galaxy A34 5G", 
    image: "/devices/galaxy-a34.png", 
    variants: ["SM-A346"], 
    brandId: "samsung",
    deviceType: "smartphone",
    colors: [
      { id: "awesome-black", name: "Awesome Black", hex: "#000000" },
      { id: "awesome-silver", name: "Awesome Silver", hex: "#D1D5DB" },
      { id: "awesome-lime", name: "Awesome Lime", hex: "#84CC16" },
      { id: "awesome-violet", name: "Awesome Violet", hex: "#9333EA" }
    ]
  },

  // Google Smartphones
  { 
    id: "pixel-9-pro-xl", 
    name: "Pixel 9 Pro XL", 
    image: "/devices/pixel-9-pro-xl.png", 
    variants: ["G9JZY"], 
    brandId: "google",
    deviceType: "smartphone",
    colors: [
      { id: "obsidian", name: "Obsidian", hex: "#000000" },
      { id: "porcelain", name: "Porcelain", hex: "#F5F5F7" },
      { id: "hazel", name: "Hazel", hex: "#A8A29E" },
      { id: "rose", name: "Rose", hex: "#FCA5A5" }
    ]
  },
  { 
    id: "pixel-9-pro", 
    name: "Pixel 9 Pro", 
    image: "/devices/pixel-9-pro.png", 
    variants: ["G9JXY"], 
    brandId: "google",
    deviceType: "smartphone",
    colors: [
      { id: "obsidian", name: "Obsidian", hex: "#000000" },
      { id: "porcelain", name: "Porcelain", hex: "#F5F5F7" },
      { id: "hazel", name: "Hazel", hex: "#A8A29E" },
      { id: "rose", name: "Rose", hex: "#FCA5A5" }
    ]
  },
  { 
    id: "pixel-9", 
    name: "Pixel 9", 
    image: "/devices/pixel-9.png", 
    variants: ["G9JWY"], 
    brandId: "google",
    deviceType: "smartphone",
    colors: [
      { id: "obsidian", name: "Obsidian", hex: "#000000" },
      { id: "porcelain", name: "Porcelain", hex: "#F5F5F7" },
      { id: "peony", name: "Peony", hex: "#FCA5A5" },
      { id: "wintergreen", name: "Wintergreen", hex: "#6EE7B7" }
    ]
  },
  { 
    id: "pixel-8-pro", 
    name: "Pixel 8 Pro", 
    image: "/devices/pixel-8-pro.png", 
    variants: ["G9HXY"], 
    brandId: "google",
    deviceType: "smartphone",
    colors: [
      { id: "obsidian", name: "Obsidian", hex: "#000000" },
      { id: "porcelain", name: "Porcelain", hex: "#F5F5F7" },
      { id: "bay", name: "Bay", hex: "#60A5FA" }
    ]
  },
  { 
    id: "pixel-8", 
    name: "Pixel 8", 
    image: "/devices/pixel-8.png", 
    variants: ["G9GWY"], 
    brandId: "google",
    deviceType: "smartphone",
    colors: [
      { id: "obsidian", name: "Obsidian", hex: "#000000" },
      { id: "hazel", name: "Hazel", hex: "#A8A29E" },
      { id: "rose", name: "Rose", hex: "#FCA5A5" }
    ]
  },
  { 
    id: "pixel-7-pro", 
    name: "Pixel 7 Pro", 
    image: "/devices/pixel-7-pro.png", 
    variants: ["G7PXY"], 
    brandId: "google",
    deviceType: "smartphone",
    colors: [
      { id: "obsidian", name: "Obsidian", hex: "#000000" },
      { id: "snow", name: "Snow", hex: "#FFFFFF" },
      { id: "hazel", name: "Hazel", hex: "#A8A29E" }
    ]
  },
  { 
    id: "pixel-7", 
    name: "Pixel 7", 
    image: "/devices/pixel-7.png", 
    variants: ["G7PWY"], 
    brandId: "google",
    deviceType: "smartphone",
    colors: [
      { id: "obsidian", name: "Obsidian", hex: "#000000" },
      { id: "snow", name: "Snow", hex: "#FFFFFF" },
      { id: "lemongrass", name: "Lemongrass", hex: "#BEF264" }
    ]
  },

  // Apple Tablets
  { 
    id: "ipad-pro-12-9-2024", 
    name: "iPad Pro 12.9\" (2024)", 
    image: "/devices/ipad-pro-12-9.png", 
    variants: ["A2764"], 
    brandId: "apple",
    deviceType: "tablet",
    colors: [
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "space-gray", name: "Space Gray", hex: "#52525B" }
    ]
  },
  { 
    id: "ipad-pro-11-2024", 
    name: "iPad Pro 11\" (2024)", 
    image: "/devices/ipad-pro-11.png", 
    variants: ["A2759"], 
    brandId: "apple",
    deviceType: "tablet",
    colors: [
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "space-gray", name: "Space Gray", hex: "#52525B" }
    ]
  },
  { 
    id: "ipad-air-2024", 
    name: "iPad Air (2024)", 
    image: "/devices/ipad-air-2024.png", 
    variants: ["A2836"], 
    brandId: "apple",
    deviceType: "tablet",
    colors: [
      { id: "space-gray", name: "Space Gray", hex: "#52525B" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "pink", name: "Pink", hex: "#FF69B4" },
      { id: "purple", name: "Purple", hex: "#9333EA" },
      { id: "blue", name: "Blue", hex: "#60A5FA" }
    ]
  },
  { 
    id: "ipad-2024", 
    name: "iPad (2024)", 
    image: "/devices/ipad-2024.png", 
    variants: ["A2696"], 
    brandId: "apple",
    deviceType: "tablet",
    colors: [
      { id: "silver", name: "Silver", hex: "#E5E5EA" },
      { id: "space-gray", name: "Space Gray", hex: "#52525B" },
      { id: "blue", name: "Blue", hex: "#60A5FA" },
      { id: "pink", name: "Pink", hex: "#FF69B4" }
    ]
  },

  // Samsung Tablets
  { 
    id: "galaxy-tab-s9-ultra", 
    name: "Galaxy Tab S9 Ultra", 
    image: "/devices/tab-s9-ultra.png", 
    variants: ["SM-X916"], 
    brandId: "samsung",
    deviceType: "tablet",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "beige", name: "Beige", hex: "#F5F5DC" }
    ]
  },
  { 
    id: "galaxy-tab-s9-plus", 
    name: "Galaxy Tab S9+", 
    image: "/devices/tab-s9-plus.png", 
    variants: ["SM-X816"], 
    brandId: "samsung",
    deviceType: "tablet",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "beige", name: "Beige", hex: "#F5F5DC" }
    ]
  },
  { 
    id: "galaxy-tab-s9", 
    name: "Galaxy Tab S9", 
    image: "/devices/tab-s9.png", 
    variants: ["SM-X716"], 
    brandId: "samsung",
    deviceType: "tablet",
    colors: [
      { id: "graphite", name: "Graphite", hex: "#52525B" },
      { id: "beige", name: "Beige", hex: "#F5F5DC" }
    ]
  },

  // Apple Laptops
  { 
    id: "macbook-pro-16-2024", 
    name: "MacBook Pro 16\" M4", 
    image: "/devices/macbook-pro-16.png", 
    variants: ["A2991"], 
    brandId: "apple",
    deviceType: "laptop",
    colors: [
      { id: "space-black", name: "Space Black", hex: "#1C1C1E" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" }
    ]
  },
  { 
    id: "macbook-pro-14-2024", 
    name: "MacBook Pro 14\" M4", 
    image: "/devices/macbook-pro-14.png", 
    variants: ["A2992"], 
    brandId: "apple",
    deviceType: "laptop",
    colors: [
      { id: "space-black", name: "Space Black", hex: "#1C1C1E" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" }
    ]
  },
  { 
    id: "macbook-air-15-2024", 
    name: "MacBook Air 15\" M3", 
    image: "/devices/macbook-air-15.png", 
    variants: ["A2941"], 
    brandId: "apple",
    deviceType: "laptop",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#1C1C1E" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "space-gray", name: "Space Gray", hex: "#52525B" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" }
    ]
  },
  { 
    id: "macbook-air-13-2024", 
    name: "MacBook Air 13\" M3", 
    image: "/devices/macbook-air-13.png", 
    variants: ["A2942"], 
    brandId: "apple",
    deviceType: "laptop",
    colors: [
      { id: "midnight", name: "Midnight", hex: "#1C1C1E" },
      { id: "starlight", name: "Starlight", hex: "#F5F5F7" },
      { id: "space-gray", name: "Space Gray", hex: "#52525B" },
      { id: "silver", name: "Silver", hex: "#E5E5EA" }
    ]
  },

  // Dell Laptops
  { 
    id: "dell-xps-15", 
    name: "Dell XPS 15", 
    image: "/devices/dell-xps-15.png", 
    variants: ["9530"], 
    brandId: "dell",
    deviceType: "laptop",
    colors: [
      { id: "platinum-silver", name: "Platinum Silver", hex: "#D1D5DB" },
      { id: "graphite", name: "Graphite", hex: "#374151" }
    ]
  },
  { 
    id: "dell-xps-13", 
    name: "Dell XPS 13", 
    image: "/devices/dell-xps-13.png", 
    variants: ["9340"], 
    brandId: "dell",
    deviceType: "laptop",
    colors: [
      { id: "platinum-silver", name: "Platinum Silver", hex: "#D1D5DB" },
      { id: "graphite", name: "Graphite", hex: "#374151" }
    ]
  },

  // HP Laptops
  { 
    id: "hp-spectre-x360", 
    name: "HP Spectre x360", 
    image: "/devices/hp-spectre-x360.png", 
    variants: ["14-ef2000"], 
    brandId: "hp",
    deviceType: "laptop",
    colors: [
      { id: "nightfall-black", name: "Nightfall Black", hex: "#1C1C1E" },
      { id: "nocturne-blue", name: "Nocturne Blue", hex: "#1E3A8A" }
    ]
  },
  { 
    id: "hp-envy-15", 
    name: "HP Envy 15", 
    image: "/devices/hp-envy-15.png", 
    variants: ["15-fh0000"], 
    brandId: "hp",
    deviceType: "laptop",
    colors: [
      { id: "natural-silver", name: "Natural Silver", hex: "#D1D5DB" },
      { id: "space-gray", name: "Space Gray", hex: "#52525B" }
    ]
  },
];

export const REPAIR_ITEMS: RepairItem[] = [
  {
    id: "screen",
    name: "Screen",
    price: 135,
    duration: "30 minutes",
    description: "Your screen is cracked, doesn't respond properly, or displays horizontal/vertical lines and/or unusual colors.",
    badge: "REPAIR IT",
    icon: "📱",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "battery",
    name: "Battery",
    price: 100,
    duration: "15 minutes",
    description: "The battery life of your device is very short, or your device keeps turning off.",
    badge: "REPAIR IT",
    icon: "🔋",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "charging-port",
    name: "Charging Port",
    price: 160,
    duration: "30 minutes",
    description: "This price covers port issues. If your existing port is okay it will only be $40.",
    badge: "REPAIR IT",
    icon: "🔌",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "back-glass",
    name: "Back Glass",
    price: 150,
    duration: "30 minutes",
    description: "If the midframe is bent, curved, or cracked, price may increase by $15-20.",
    icon: "📲",
    deviceTypes: ["smartphone", "tablet"]
  },
  {
    id: "camera",
    name: "Camera",
    price: 120,
    duration: "20 minutes",
    description: "Camera is not working properly, blurry images, or won't focus.",
    icon: "📷",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "speaker",
    name: "Speaker",
    price: 90,
    duration: "25 minutes",
    description: "Speaker producing distorted sound or no sound at all.",
    icon: "🔊",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "microphone",
    name: "Microphone",
    price: 85,
    duration: "20 minutes",
    description: "Microphone not picking up sound during calls or recordings.",
    icon: "🎤",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "ear-speaker",
    name: "Ear Speaker",
    price: 80,
    duration: "20 minutes",
    description: "Cannot hear during calls or ear speaker is not working.",
    icon: "👂",
    deviceTypes: ["smartphone"]
  },
  {
    id: "vibrator",
    name: "Vibrator",
    price: 70,
    duration: "15 minutes",
    description: "Vibration not working or producing unusual noise.",
    icon: "📳",
    deviceTypes: ["smartphone"]
  },
  {
    id: "home-button",
    name: "Home Button",
    price: 95,
    duration: "20 minutes",
    description: "Home button not responding or stuck.",
    icon: "⚪",
    deviceTypes: ["smartphone", "tablet"]
  },
  {
    id: "power-button",
    name: "Power Button",
    price: 95,
    duration: "20 minutes",
    description: "Power button not working or stuck.",
    icon: "⏻",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "volume-button",
    name: "Volume Button",
    price: 90,
    duration: "20 minutes",
    description: "Volume buttons not responding or stuck.",
    icon: "🔈",
    deviceTypes: ["smartphone", "tablet"]
  },
  {
    id: "water-damage",
    name: "Water Damage",
    price: 0,
    duration: "60 minutes",
    description: "Your device was in contact with water or another liquid.",
    badge: "price on request",
    icon: "💧",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "investigation",
    name: "Investigation",
    price: 30,
    duration: "30 minutes",
    description: "Investigation fee only applies to devices that are damaged beyond repair.",
    icon: "🔍",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "motherboard",
    name: "Motherboard",
    price: 0,
    duration: "varies",
    description: "Motherboard issues require diagnosis. Price varies by issue.",
    badge: "price on request",
    icon: "🔧",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "wifi-antenna",
    name: "WiFi Antenna",
    price: 100,
    duration: "25 minutes",
    description: "WiFi not connecting or weak signal.",
    icon: "📶",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "sim-reader",
    name: "SIM Reader",
    price: 110,
    duration: "25 minutes",
    description: "SIM card not being detected or reading errors.",
    icon: "📇",
    deviceTypes: ["smartphone", "tablet"]
  },
  {
    id: "face-id",
    name: "Face ID",
    price: 0,
    duration: "varies",
    description: "Face ID not working after screen replacement (requires original parts).",
    badge: "price on request",
    icon: "👤",
    deviceTypes: ["smartphone", "tablet"]
  },
  {
    id: "touch-id",
    name: "Touch ID",
    price: 0,
    duration: "varies",
    description: "Touch ID/Fingerprint sensor not working.",
    badge: "price on request",
    icon: "👆",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "proximity-sensor",
    name: "Proximity Sensor",
    price: 85,
    duration: "20 minutes",
    description: "Screen doesn't turn off during calls.",
    icon: "📡",
    deviceTypes: ["smartphone"]
  },
  {
    id: "front-camera",
    name: "Front Camera",
    price: 100,
    duration: "20 minutes",
    description: "Front camera not working or producing poor quality images.",
    icon: "🤳",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "rear-camera",
    name: "Rear Camera",
    price: 130,
    duration: "25 minutes",
    description: "Rear camera not working or producing poor quality images.",
    icon: "📸",
    deviceTypes: ["smartphone", "tablet"]
  },
  {
    id: "keyboard",
    name: "Keyboard",
    price: 150,
    duration: "45 minutes",
    description: "Keyboard keys not responding or stuck.",
    icon: "⌨️",
    deviceTypes: ["laptop"]
  },
  {
    id: "trackpad",
    name: "Trackpad",
    price: 120,
    duration: "30 minutes",
    description: "Trackpad not responding or erratic cursor movement.",
    icon: "🖱️",
    deviceTypes: ["laptop"]
  },
  {
    id: "hinge",
    name: "Hinge",
    price: 140,
    duration: "40 minutes",
    description: "Laptop hinge broken or screen won't stay in position.",
    icon: "🔩",
    deviceTypes: ["laptop"]
  },
  {
    id: "data-recovery",
    name: "Data Recovery",
    price: 0,
    duration: "varies",
    description: "Recover data from damaged or non-working devices.",
    badge: "price on request",
    icon: "💾",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
  {
    id: "software-issues",
    name: "Software Issues",
    price: 50,
    duration: "30 minutes",
    description: "Device freezing, apps crashing, or operating system issues.",
    icon: "💻",
    deviceTypes: ["smartphone", "tablet", "laptop"]
  },
];

export const SERVICE_METHODS = [
  {
    id: "location",
    title: "Service at your location",
    subtitle: "Mobile Repair (Tampa Bay Only)",
    badge: "FREE",
    icon: "🏠"
  },
  {
    id: "ship",
    title: "Ship device",
    subtitle: "Repaired within 24 hours",
    badge: "FREE",
    icon: "📦"
  },
];
