/** Midnight Ledger system: published tips are framed as dated observations, never as promises or fabricated winners. */
import { CalendarDays, CircleGauge, ExternalLink, LockKeyhole, Play } from "lucide-react";
import type { Prediction } from "@/lib/content";
import { disclaimer, formatDate, formatNumbers } from "@/lib/content";

export function PredictionCard({ prediction, premium = false }: { prediction: Prediction; premium?: boolean }) {
  const numbers = formatNumbers(prediction.tip_numbers);
  return (
    <article className="prediction-card">
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow">{premium ? "Premium analysis" : "Free observation"}</p><h3 className="mt-2 font-mono text-lg font-semibold tracking-tight text-ivory">{prediction.game_name}</h3></div>
        <span className={premium ? "status-pill status-pill--gold" : "status-pill"}>{premium ? <LockKeyhole size={13} /> : <CircleGauge size={13} />}{premium ? "Member" : "Informational"}</span>
      </div>
      <div className="mt-7 grid grid-cols-[1fr_auto] items-end gap-4 border-y border-white/10 py-5">
        <div><p className="data-label">Draw date</p><p className="mt-1 text-sm text-slate-300"><CalendarDays size={14} className="mr-1 inline text-gold-300" />{formatDate(prediction.draw_date)}</p></div>
        <div className="text-right"><p className="data-label">Observation set</p><div className="mt-2 flex flex-wrap justify-end gap-1.5">{numbers.length ? numbers.map((number) => <span key={number} className="number-chip">{number}</span>) : <span className="text-sm text-slate-500">Not provided</span>}</div></div>
      </div>
      <div className="mt-5"><p className="data-label">Analysis</p><p className="mt-2 text-sm leading-6 text-slate-300">{prediction.analysis || "The administrator has not added analysis for this published observation."}</p></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><span className="text-xs text-slate-500">{prediction.confidence_label || "Informational Tip"}</span>{prediction.video_url && <a className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200" href={prediction.video_url} target="_blank" rel="noreferrer"><Play size={14} fill="currentColor" /> Watch note <ExternalLink size={12} /></a>}</div>
      <p className="mt-4 text-[11px] leading-5 text-slate-500">{disclaimer}</p>
    </article>
  );
}
