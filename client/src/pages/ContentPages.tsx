/** Midnight Ledger system: content pages present only published records, with restrained access gates and no predictive promises. */
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, CircleGauge, LockKeyhole, ShieldAlert } from "lucide-react";
import { DisclaimerStrip, LedgerRail, PageMeta, SectionHeading, SiteLayout } from "@/components/SiteLayout";
import { PredictionCard } from "@/components/PredictionCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFreePredictions, usePremiumPredictions } from "@/hooks/useContent";
import { isSupabaseConfigured } from "@/lib/supabase";

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(213,168,65,.13),transparent_34%),#060a15] pb-12 pt-32 sm:pt-40"><div className="ledger-ribbon">0 4 0 4</div><div className="container relative"><SectionHeading eyebrow={eyebrow} title={title} copy={copy} /><LedgerRail serial="02" label="Library register" /></div></section>;
}

function ContentEmpty({ premium = false }: { premium?: boolean }) {
  return <div className="empty-state"><CircleGauge size={25} className="text-gold-300" /><h2 className="font-display text-2xl text-ivory">No {premium ? "premium" : "free"} insight is published yet.</h2><p className="max-w-md text-sm leading-6">{premium ? "Premium entries appear only when the administrator publishes content for active members." : "The library will show entries only after the administrator publishes a dated observation."}</p></div>;
}

export function FreePredictionPage() {
  const content = useFreePredictions();
  return <SiteLayout><PageMeta title="Free prediction" description="Browse administrator-published free 4D observations and responsible informational tips." /><PageIntro eyebrow="Public content library" title="Free number observations" copy="Browse published number observations, their scheduled draw date, and any administrator-provided analysis. These tips are informational—not guaranteed outcomes." /><section className="bg-ink-950 py-14 lg:py-20"><div className="container"><DisclaimerStrip /><div className="mt-10">{content.loading ? <div className="empty-state">Loading published free insights…</div> : content.error ? <div className="empty-state"><ShieldAlert size={25} className="text-red-300" /><p>Published content could not be loaded. Check the Supabase environment configuration and database policies.</p></div> : content.data.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{content.data.map(prediction => <PredictionCard key={prediction.id} prediction={prediction} />)}</div> : <ContentEmpty />}</div><div className="mt-12 border-t border-white/10 pt-8 text-center"><p className="text-sm text-slate-400">Want to save your account details and manage membership access?</p><Link href="/register" className="btn-gold mt-4">Create free account <ArrowRight size={16} /></Link></div></div></section></SiteLayout>;
}

export function PaidPredictionPage() {
  const { user, membership, loading } = useAuth();
  const [, navigate] = useLocation();
  const allowed = membership?.status === "active";
  const content = usePremiumPredictions(Boolean(allowed));

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem("new4d:returnTo", "/paid-prediction");
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) return <SiteLayout><PageIntro eyebrow="Member library" title="Premium prediction" copy="Confirming membership access…" /><div className="container py-16 text-sm text-slate-400">Confirming your session…</div></SiteLayout>;

  if (!user) return <SiteLayout><PageIntro eyebrow="Member library" title="Premium prediction" copy="Secure sign-in is required before premium content can be displayed." /><div className="container py-16"><div className="empty-state"><LockKeyhole size={26} className="text-gold-300" /><p>Redirecting to login…</p></div></div></SiteLayout>;

  if (!allowed) return <SiteLayout><PageMeta title="Premium access required" description="Premium tips become available after verified membership activation." /><PageIntro eyebrow="Member library" title="Premium access required" copy="Premium content is available after membership activation. Payment submissions remain pending until an administrator reviews them." /><section className="container py-16 lg:py-24"><div className="panel mx-auto max-w-2xl p-7 text-center sm:p-10"><LockKeyhole className="mx-auto text-gold-300" size={30} /><h2 className="mt-5 font-display text-4xl text-ivory">Premium content is available after membership activation.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400">Review the membership details, submit your payment reference and screenshot, then wait for administrator verification. Premium content is not available until that review is complete.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/membership" className="btn-gold">View membership <ArrowRight size={16} /></Link><Link href="/payment" className="btn-quiet">Submit payment</Link></div></div></section></SiteLayout>;

  return <SiteLayout><PageMeta title="Paid prediction" description="Premium informational observations and analysis for active 4D Insights members." /><PageIntro eyebrow="Verified member library" title="Premium prediction" copy="This library is available only to active members. Each published entry remains informational, clearly dated, and free from claims of certainty." /><section className="bg-ink-950 py-14 lg:py-20"><div className="container"><DisclaimerStrip /><div className="mt-10">{!isSupabaseConfigured ? <div className="empty-state"><p>Premium content will load after the Supabase environment variables are configured.</p></div> : content.loading ? <div className="empty-state">Loading premium member content…</div> : content.error ? <div className="empty-state"><ShieldAlert size={25} className="text-red-300" /><p>Premium content could not be loaded. Please refresh or contact support if this continues.</p></div> : content.data.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{content.data.map(prediction => <PredictionCard key={prediction.id} prediction={prediction} premium />)}</div> : <ContentEmpty premium />}</div></div></section></SiteLayout>;
}
