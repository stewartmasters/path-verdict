export interface TrustSource {
  src: string;
  alt: string;
}

// Landscape-oriented logos only — square/portrait logos break horizontal logo rows.
// ONS (1024×512), Destatis (427×118), ABS (123×64), CBS (391×129) all have good aspect ratios.
// INE, SCB, StatsCan, BLS, CSO, Stats NZ cited by text only.
export const TRUST_SOURCES: TrustSource[] = [
  { src: "/logos/ons.png",      alt: "ONS" },       // ONS Living Costs & Food Survey FYE2024 (UK)
  { src: "/logos/destatis.png", alt: "Destatis" },  // Destatis EVS 2023 (Germany)
  { src: "/logos/abs.png",      alt: "ABS" },       // ABS Household Expenditure Survey (Australia)
  { src: "/logos/cbs.png",      alt: "CBS" },       // CBS Household Budget Survey (Netherlands)
];
