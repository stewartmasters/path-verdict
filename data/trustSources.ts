export interface TrustSource {
  src: string;
  alt: string;
}

// Landscape-oriented logos only.
// ONS (1024×512), Destatis (427×118), ABS (123×64), CBS (391×129),
// BLS (SVG), StatsCan (281×64) all have good aspect ratios.
// INE and SCB need better landscape logo files before they can be added.
export const TRUST_SOURCES: TrustSource[] = [
  { src: "/logos/ons.png",      alt: "ONS" },       // ONS Living Costs & Food Survey FYE2024 (UK)
  { src: "/logos/destatis.png", alt: "Destatis" },  // Destatis EVS 2023 (Germany)
  { src: "/logos/bls.svg",      alt: "BLS" },       // BLS Consumer Expenditure Survey 2023 (US)
  { src: "/logos/abs.png",      alt: "ABS" },       // ABS Household Expenditure Survey (Australia)
  { src: "/logos/statscan.png", alt: "StatsCan" },  // Statistics Canada SHS 2023
  { src: "/logos/cbs.png",      alt: "CBS" },       // CBS Household Budget Survey (Netherlands)
];
