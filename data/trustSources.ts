export interface TrustSource {
  src: string;
  alt: string;
}

export const TRUST_SOURCES: TrustSource[] = [
  { src: "/logos/eurostat.png", alt: "Eurostat" },
  { src: "/logos/ons.png",      alt: "ONS" },
  { src: "/logos/destatis.png", alt: "Destatis" },
  { src: "/logos/ine.png",      alt: "INE" },
  { src: "/logos/bfs.jpg",      alt: "BFS" },
  { src: "/logos/scb.png",      alt: "SCB" },
  { src: "/logos/istat.png",    alt: "Istat" },
  { src: "/logos/gus.png",      alt: "GUS" },
];
