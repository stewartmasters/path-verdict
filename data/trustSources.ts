export interface TrustSource {
  src: string;
  alt: string;
}

// Landscape-oriented logos only.
// ONS (1024×512), Destatis (427×118), ABS (123×64), CBS (391×129),
// BLS (SVG), StatsCan (281×64) all have good aspect ratios.
// INE and SCB need better landscape logo files before they can be added.
export const TRUST_SOURCES: TrustSource[] = [
  { src: "/logos/ons.png",      alt: "ONS" },
  { src: "/logos/destatis.png", alt: "Destatis" },
  { src: "/logos/bls.svg",      alt: "BLS" },
  { src: "/logos/abs.png",      alt: "ABS" },
  { src: "/logos/statscan.png", alt: "StatsCan" },
  { src: "/logos/cbs.png",      alt: "CBS" },
  { src: "/logos/ine.png",      alt: "INE" },
  { src: "/logos/scb.png",      alt: "SCB" },
];
