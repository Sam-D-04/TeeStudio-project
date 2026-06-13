export interface FontCategory {
  id: string;
  name: string;
  fonts: string[];
}

export const FONT_CATEGORIES: FontCategory[] = [
  {
    id: "sans-serif",
    name: "Hiện đại",
    fonts: ["Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", "Oswald", "Lato", "Quicksand"],
  },
  {
    id: "serif",
    name: "Sang trọng",
    fonts: ["Playfair Display", "Merriweather", "Lora", "PT Serif", "Noto Serif", "Cinzel"],
  },
  {
    id: "display",
    name: "Cách điệu",
    fonts: ["Bebas Neue", "Righteous", "Lobster", "Abril Fatface", "Concert One", "Fredoka One", "Alfa Slab One", "Russo One"],
  },
  {
    id: "handwriting",
    name: "Viết tay",
    fonts: ["Dancing Script", "Pacifico", "Caveat", "Satisfy", "Great Vibes", "Amatic SC"],
  },
  {
    id: "monospace",
    name: "Công nghệ",
    fonts: ["Space Mono", "Roboto Mono", "Fira Code", "VT323"],
  }
];

export const ALL_FONTS = FONT_CATEGORIES.flatMap(c => c.fonts);

export const getGoogleFontsUrl = () => {
  const families = ALL_FONTS.map(font => {
    // Some fonts might only have 400, but we request 400,700. 
    // Google API handles missing weights gracefully for some, but fails for others.
    // To be safe, we request only default if we aren't sure, but for T-shirt design, italic and bold are common.
    // We'll request without weights first (gives 400 regular), or we can use:
    // family=Font+Name:ital,wght@0,400;0,700;1,400;1,700
    // Actually, simpler:
    return `family=${font.replace(/ /g, "+")}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
};
