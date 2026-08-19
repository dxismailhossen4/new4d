/** Midnight Ledger system: the owner-provided Malaysian Guru 4D Hotline seal anchors every global brand surface. */
import { Link } from "wouter";
import { managedAsset } from "@/lib/assets";

export const officialLogoUrl = managedAsset("malaysian-guru-4d-hotline-logo_a0093a5d.png");

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="Malaysian Guru 4D Hotline home">
      <img src={officialLogoUrl} className={compact ? "brand-logo brand-logo--compact" : "brand-logo"} alt="Malaysian Guru 4D Hotline official logo" />
      <span className="brand-lockup">
        <strong>Malaysian Guru</strong>
        <em>4D Hotline</em>
      </span>
    </Link>
  );
}
