export interface TrustSource {
  src: string;
  alt: string;
}

// Household expenditure and savings survey agencies used in PathVerdict's benchmark model.
// Logo files available in /public/logos/ — BLS, ABS, StatsCan, CBS, CSO, Stats NZ cited by text.
export const TRUST_SOURCES: TrustSource[] = [
  { src: "/logos/ons.png",      alt: "ONS" },       // ONS Living Costs & Food Survey FYE2024 (UK)
  { src: "/logos/destatis.png", alt: "Destatis" },  // Destatis EVS 2023 (Germany)
  { src: "/logos/ine.png",      alt: "INE" },       // INE EPF (Spain)
  { src: "/logos/scb.png",      alt: "SCB" },       // SCB HEK (Sweden)
];
