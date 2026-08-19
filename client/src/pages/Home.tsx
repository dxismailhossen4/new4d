/** Midnight Ledger system: asymmetrical editorial home page that turns real, published content into a calm member journey. */
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Check, CircleHelp, Eye, FileText, LockKeyhole, Play, ShieldCheck, Sparkles, UserRoundPlus } from "lucide-react";
import { DisclaimerStrip, PageMeta, SectionHeading, SiteLayout } from "@/components/SiteLayout";
import { PredictionCard } from "@/components/PredictionCard";
import { officialLogoUrl } from "@/components/BrandMark";
import { managedAsset } from "@/lib/assets";
import { formatDate } from "@/lib/content";
import { useFreePredictions, usePublishedFaq, useResultShowcase } from "@/hooks/useContent";

const heroImage = managedAsset("new4d-hero-midnight-ledger_6e33d219.jpg");
const orbImage = managedAsset("new4d-insight-orb_fe3d1c38.jpg");
const videoImage = managedAsset("new4d-video-poster_88b40868.jpg");

function EmptyContent({ message }: { message: string }) {
  return <div className="empty-state"><Eye size={25} className="text-gold-300" /><p className="max-w-sm text-sm leading-6">{message}</p></div>;
}

export default function Home() {
  const results = useResultShowcase();
  const predictions = useFreePredictions();
  const faq = usePublishedFaq();

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Malaysian Guru 4D Hotline", url: window.location.origin, description: "Responsible, informational 4D tips and premium analysis for Malaysian adults." });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <SiteLayout>
      <PageMeta title="Responsible 4D insights" description="Explore published Malaysian 4D number observations, free tips and responsible premium analysis. No outcomes are guaranteed." />

      <section className="relative min-h-[700px] overflow-hidden bg-ink-950 pt-28 sm:pt-36">
        <img src={heroImage} alt="Abstract midnight ledger with floating digit tiles" className="absolute inset-0 h-full w-full object-cover object-[68%_center] opacity-85" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,10,21,.98)_0%,rgba(6,10,21,.88)_36%,rgba(6,10,21,.25)_76%,rgba(6,10,21,.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_40%,rgba(213,168,65,.14),transparent_34%)]" />
        <div className="container relative grid min-h-[620px] items-end gap-12 pb-14 lg:grid-cols-[1.08fr_.72fr] lg:pb-20">
          <div className="reveal max-w-3xl">
            <p className="eyebrow">A responsible information membership</p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(3.4rem,7.2vw,6.4rem)] font-medium leading-[.84] tracking-[-.055em] text-ivory">Smart 4D insights<br /><span className="text-gold-300">for Malaysian adults.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Explore current number observations, free insights, and premium analysis presented with clarity—not certainty.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/free-prediction" className="btn-gold">View free observations <ArrowRight size={16} /></Link><Link href="/membership" className="btn-quiet">Explore membership</Link></div>
            <div className="mt-8 max-w-2xl"><DisclaimerStrip /></div>
          </div>
          <aside className="reveal-delay self-end border-l border-gold-300/45 py-3 pl-5 lg:justify-self-end lg:pb-6">
            <div className="flex items-center gap-4"><img src={officialLogoUrl} alt="Malaysian Guru 4D Hotline official logo" className="h-[4.5rem] w-[4.5rem] border border-gold-300/30 object-contain sm:h-20 sm:w-20" /><div><p className="eyebrow">Official identity</p><p className="mt-2 max-w-[13rem] font-display text-xl leading-none text-ivory">“Observation first. Guarantees never.”</p></div></div>
            <div className="mt-7 flex gap-3 font-mono text-xs tracking-[.42em] text-gold-300"><span>◇</span><span>◇</span><span>◇</span><span>◇</span></div>
          </aside>
        </div>
      </section>

      <section className="bg-ink-950 py-20 lg:py-28">
        <div className="container">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Historical & community records" title="Result showcase" copy="Only records published by the administrator appear here. Reference links are shown when entered." /><Link href="/free-prediction" className="btn-quiet shrink-0">Explore insights <ArrowRight size={15} /></Link></div>
          <div className="mt-8 table-wrap">
            {results.loading ? <div className="p-8 text-sm text-slate-400">Loading published records…</div> : results.data.length ? <table className="ledger-table"><thead><tr><th>Date</th><th>Game</th><th>Number</th><th>Category</th><th>Reference</th></tr></thead><tbody>{results.data.map((record) => <tr key={record.id}><td className="font-mono text-slate-300">{formatDate(record.result_date)}</td><td>{record.game_name}</td><td className="font-mono text-gold-300">{record.result_number}</td><td>{record.category}</td><td>{record.source_url ? <a className="text-gold-300 hover:underline" href={record.source_url} target="_blank" rel="noreferrer">View source</a> : <span className="text-slate-500">Not supplied</span>}</td></tr>)}</tbody></table> : <EmptyContent message="No verified records have been published yet. The showcase remains intentionally empty until an administrator adds a genuine record." />}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0a1021] py-20 lg:py-28">
        <div className="absolute right-0 top-0 hidden h-full w-[38%] bg-[radial-gradient(circle_at_85%_10%,rgba(213,168,65,.15),transparent_55%)] lg:block" />
        <div className="container relative grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28"><SectionHeading eyebrow="Published by the administrator" title="Free observations" copy="Published entries are loaded directly from the content library and displayed with their date, context, and responsible-use disclosure." /><div className="mt-7"><Link href="/free-prediction" className="btn-gold">Explore free insights <ArrowRight size={16} /></Link></div></div>
          <div className="grid gap-4 md:grid-cols-2">{predictions.loading ? <div className="col-span-full empty-state">Loading published free tips…</div> : predictions.data.length ? predictions.data.slice(0, 4).map((prediction) => <PredictionCard key={prediction.id} prediction={prediction} />) : <div className="md:col-span-2"><EmptyContent message="No free prediction is published at the moment. New content will appear here only when the administrator publishes it." /></div>}</div>
        </div>
      </section>

      <section className="bg-ink-950 py-20 lg:py-28">
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="relative overflow-hidden border border-white/10"><img src={videoImage} alt="Premium editorial desk representing the video library" className="aspect-video h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-tr from-ink-950/90 via-transparent to-transparent" /><div className="absolute bottom-6 left-6"><p className="eyebrow">Video library</p><p className="mt-2 max-w-sm font-display text-3xl leading-none text-ivory">A place for the administrator’s own explanatory notes.</p></div><div className="absolute right-6 top-6 grid h-12 w-12 place-items-center rounded-full border border-gold-300/50 bg-ink-950/60 text-gold-300"><Play size={18} fill="currentColor" /></div></div>
          <div><SectionHeading eyebrow="Context, not hype" title="Watch the reasoning behind a published observation." copy="Published free and premium prediction entries can include an administrator-added video link or video reference. Copyrighted material is never scraped or added automatically." /><div className="mt-7"><Link href="/free-prediction" className="btn-quiet">Browse free library <ArrowRight size={15} /></Link></div></div>
        </div>
      </section>

      <section className="bg-[#10182b] py-20 lg:py-28"><div className="container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div className="overflow-hidden border border-white/10 bg-ink-950"><img src={orbImage} alt="Abstract four-ring observation orb" className="aspect-square h-full w-full object-cover" /></div><div><SectionHeading eyebrow="A clearer member experience" title="Why members use the platform" /><div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">{[[Eye,"Clearly labelled", "Every tip is presented as information, never as a guaranteed outcome."],[FileText,"Published content", "The database powers the card library, so administrators can publish, update, or archive entries."],[ShieldCheck,"Verified access", "Premium access changes only after an administrator verifies a submitted payment."],[Sparkles,"Quietly premium", "A focused membership workspace with no fabricated testimonials or results."]].map(([Icon, title, copy]) => { const I = Icon as typeof Eye; return <div key={String(title)} className="border-t border-white/10 pt-4"><I size={19} className="text-gold-300" /><h3 className="mt-4 font-display text-2xl text-ivory">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{String(copy)}</p></div>; })}</div></div></div></section>

      <section className="bg-ink-950 py-20 lg:py-28"><div className="container"><SectionHeading eyebrow="A straightforward path" title="How it works" align="center" /><div className="mt-12 grid gap-5 md:grid-cols-4">{[["01", Eye, "Explore free tips", "Read current published observations and their stated context."],["02", UserRoundPlus, "Create account", "Register with an age confirmation and accept the terms."],["03", LockKeyhole, "Choose membership", "Review premium informational content access for RM500."],["04", Check, "Access after verification", "Premium content unlocks when payment is reviewed and approved."]].map(([number, Icon, title, copy]) => { const I = Icon as typeof Eye; return <div key={String(number)} className="metric-card"><div className="flex items-center justify-between"><span className="font-mono text-sm text-gold-300">{String(number)}</span><I size={18} className="text-slate-400" /></div><h3 className="mt-9 font-display text-2xl text-ivory">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{String(copy)}</p></div>; })}</div></div></section>

      <section className="relative overflow-hidden bg-[#0a1021] py-20 lg:py-28"><div className="container grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><SectionHeading eyebrow="Premium informational access" title="A focused membership, deliberately described." copy="RM500 provides access to premium analysis, member-only video references, and the membership dashboard. It is not an investment and does not guarantee any outcome or financial return." /><div className="mt-7"><Link href="/membership" className="btn-gold">View membership <ArrowRight size={16} /></Link></div></div><div className="panel relative overflow-hidden p-7 sm:p-9"><div className="absolute right-0 top-0 h-36 w-36 bg-[radial-gradient(circle,rgba(213,168,65,.25),transparent_68%)]" /><p className="eyebrow">Premium membership</p><div className="mt-5 flex items-end gap-2"><span className="font-display text-6xl leading-none text-ivory">RM 500</span><span className="pb-1 text-sm text-slate-400">membership access</span></div><div className="mt-8 grid gap-3 border-y border-white/10 py-6 text-sm text-slate-300">{["Premium insights and analysis", "Member-only video references", "Premium analysis", "Account dashboard and payment history", "Updated content managed by the administrator", "Member support channel"].map(item => <div key={item} className="flex gap-3"><Check size={16} className="shrink-0 text-gold-300" />{item}</div>)}</div><p className="mt-5 text-xs leading-5 text-slate-500">Membership provides access to premium informational content. It does not guarantee any winning outcome or financial return.</p></div></div></section>

      <section className="bg-ink-950 py-20 lg:py-28"><div className="container"><SectionHeading eyebrow="Answers, without ambiguity" title="Frequently asked questions" /><div className="mt-10 grid gap-x-12 gap-y-1 lg:grid-cols-2">{(faq.data.length ? faq.data.slice(0, 6) : [{ id: "responsible", question: "Are predictions guaranteed?", answer: "No. Predictions are informational and entertainment tips; outcomes cannot be guaranteed." }]).map(item => <div key={item.id} className="border-t border-white/10 py-5"><p className="font-display text-2xl leading-tight text-ivory">{item.question}</p><p className="mt-3 text-sm leading-6 text-slate-400">{item.answer}</p></div>)}</div><div className="mt-8"><Link href="/faq" className="btn-quiet">View all FAQs <CircleHelp size={15} /></Link></div></div></section>

      <section className="border-y border-gold-300/35 bg-[#10182b] py-14"><div className="container grid gap-7 md:grid-cols-[1fr_auto] md:items-center"><div className="border-l-2 border-gold-300 pl-5"><p className="eyebrow">Responsible participation notice</p><h2 className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-tight text-ivory sm:text-5xl">Explore the information, make your own decisions, and participate responsibly.</h2></div><Link href="/register" className="btn-gold">Create free account <ArrowRight size={16} /></Link></div></section>
    </SiteLayout>
  );
}
