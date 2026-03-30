// TrustStrip is kept as a thin wrapper so existing imports continue to work.
// All logo data and rendering live in TrustSection (single source of truth).
import TrustSection from "./TrustSection";

export default function TrustStrip() {
  return <TrustSection variant="full" />;
}
