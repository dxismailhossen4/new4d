/** Midnight Ledger system: the gold four-part mark is always presented with breathing room and never reduced to a tiny decoration. */
import { Link } from "wouter";

const symbolUrl = "/manus-storage/new4d-symbol_66725c26.png";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="4D Insights Malaysia home">
      <img src={symbolUrl} className={compact ? "h-8 w-8" : "h-10 w-10"} alt="4D Insights abstract gold symbol" />
      <span className="brand-lockup">
        <strong>4D</strong>
        <em>INSIGHTS</em>
      </span>
    </Link>
  );
}
