import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Bell, ChevronRight, ClipboardCheck, CreditCard, FilePlus2, FolderLock, Globe2, LayoutDashboard, LogOut, Settings2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Counts = {
  members: number;
  pendingPayments: number;
  vipMembers: number;
  freePredictions: number;
  results: number;
};

const OWNER_EMAILS = ["dxismailhossen4@gmail.com", "ah2836447@gmail.com"];

const desktopModules = [
  { title: "Member management", description: "Review new registrations, access and membership status.", icon: Users, accent: "gold" },
  { title: "Payment review", description: "Review bKash, bank transfer and Binance payment submissions.", icon: CreditCard, accent: "sky" },
  { title: "Prediction publishing", description: "Create and manage free and VIP informational prediction entries.", icon: Sparkles, accent: "violet" },
  { title: "Final analysis", description: "Record published result-board entries after source review.", icon: ClipboardCheck, accent: "emerald" },
  { title: "Website content", description: "Manage FAQ, public content and contact information.", icon: Globe2, accent: "gold" },
  { title: "Notifications & settings", description: "Open operational messages, security and configuration surfaces.", icon: Bell, accent: "sky" },
];

function StatCard({ label, value, note, icon: Icon }: { label: string; value: number; note: string; icon: typeof Users }) {
  return <article className="panel relative overflow-hidden p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">{label}</p><p className="mt-3 font-mono text-4xl font-semibold tracking-tight text-ivory">{value}</p><p className="mt-2 text-xs text-slate-500">{note}</p></div><span className="grid h-10 w-10 place-items-center rounded-md bg-gold-300/10 text-gold-300"><Icon size={18} /></span></div><span className="ledger-ribbon">PC</span></article>;
}

function AccessGate({ signedIn }: { signedIn: boolean }) {
  return <main className="grid min-h-screen place-items-center bg-ink-950 p-6"><section className="panel relative w-full max-w-2xl overflow-hidden p-8 text-center"><div className="ledger-ribbon">PC / OWNER</div><div className="relative z-10"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold-300/40 bg-gold-300/[.06] text-gold-300"><ShieldCheck size={22} /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[.18em] text-gold-300">Desktop command center</p><h1 className="mt-3 font-display text-4xl text-ivory">{signedIn ? "Owner access required" : "Owner sign-in required"}</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400">This PC dashboard is restricted to the configured owner accounts and verified administrator designation. Passwords are never stored in the browser or desktop dashboard.</p><Link className="btn-gold mt-7" href={signedIn ? "/" : "/login"}>{signedIn ? "Return to website" : "Go to sign in"}</Link></div></section></main>;
}

export default function PCDashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const [counts, setCounts] = useState<Counts>({ members: 0, pendingPayments: 0, vipMembers: 0, freePredictions: 0, results: 0 });
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState("");
  const isAllowed = OWNER_EMAILS.includes((user?.email || "").toLowerCase()) && (!profile || profile.role === "admin");

  const refresh = async () => {
    if (!isSupabaseConfigured || !supabase) { setSyncing(false); setError("Supabase is not configured in this environment."); return; }
    setSyncing(true); setError("");
    const [members, pendingPayments, vipMembers, freePredictions, results] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }).in("status", ["pending", "more_info"]),
      supabase.from("memberships").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("free_predictions").select("id", { count: "exact", head: true }),
      supabase.from("result_showcase").select("id", { count: "exact", head: true }),
    ]);
    const firstError = [members, pendingPayments, vipMembers, freePredictions, results].find(result => result.error)?.error?.message || "";
    if (firstError) setError(firstError);
    setCounts({ members: members.count || 0, pendingPayments: pendingPayments.count || 0, vipMembers: vipMembers.count || 0, freePredictions: freePredictions.count || 0, results: results.count || 0 });
    setSyncing(false);
  };

  useEffect(() => { if (isAllowed) void refresh(); }, [isAllowed]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-ink-950 text-sm text-slate-400">Loading secure PC workspace…</main>;
  if (!user || !isAllowed) return <AccessGate signedIn={Boolean(user)} />;

  return <div className="min-h-screen bg-ink-950 text-slate-300"><div className="flex min-h-screen"><aside className="hidden w-[300px] shrink-0 flex-col border-r border-white/10 bg-[#0a0f1d] lg:flex"><div className="border-b border-white/10 px-7 py-7"><Link href="/" className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full border border-gold-300/50 font-display text-xl text-gold-300">4D</span><span><strong className="block font-display text-2xl text-ivory">Insights</strong><small className="text-[9px] uppercase tracking-[.22em] text-slate-500">Malaysia / PC admin</small></span></Link></div><nav className="flex-1 px-4 py-6"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">Desktop workspace</p><Link href="/pc-dashboard" className="flex items-center gap-3 rounded-md bg-gold-300/10 px-3 py-3 text-sm font-semibold text-gold-200"><LayoutDashboard size={17} /> Overview</Link><Link href="/admin" className="mt-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-ivory"><Settings2 size={17} /> Full admin controls <ChevronRight className="ml-auto" size={14} /></Link><Link href="/file-vault" className="mt-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-ivory"><FolderLock size={17} /> Secure file vault <ChevronRight className="ml-auto" size={14} /></Link><p className="mt-2 px-3 text-[10px] leading-4 text-slate-600">File vault opens its separate Manus-authenticated workspace.</p></nav><div className="border-t border-white/10 p-5"><div className="flex items-center gap-3 rounded-md bg-white/[.03] p-3"><ShieldCheck size={18} className="text-emerald-300" /><div><p className="text-xs font-semibold text-ivory">Secure session</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-slate-500">Supabase RLS enforced</p></div></div></div></aside><div className="min-w-0 flex-1"><header className="flex min-h-[82px] items-center justify-between border-b border-white/10 px-5 py-4 lg:px-10"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold-300">Desktop command center</p><h1 className="mt-1 font-display text-3xl text-ivory">PC dashboard</h1></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-ivory">{user.email}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-slate-500">Owner session</p></div><button className="btn-quiet min-h-10 px-3" onClick={() => void signOut()}><LogOut size={16} /><span className="hidden sm:inline">Logout</span></button></div></header><main className="mx-auto max-w-[1680px] px-5 py-7 lg:px-10 lg:py-10"><div className="panel relative overflow-hidden p-6 lg:p-8"><div className="relative z-10 max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold-300">New4D operations</p><h2 className="mt-3 font-display text-4xl leading-[1.05] text-ivory lg:text-5xl">A desktop view for clear operational control.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">Use the PC dashboard for a widescreen overview, then open the full administrative workspace for detailed payment, member, content and prediction workflows.</p></div><div className="relative z-10 mt-7 flex flex-wrap gap-3"><Link href="/admin" className="btn-gold">Open full admin controls <ChevronRight size={15} /></Link><Link href="/file-vault" className="btn-quiet"><FolderLock size={16} /> Open file vault</Link></div><span className="ledger-ribbon">PC / 04</span></div>{error && <div className="mt-6 border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-100">{error}</div>}<section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Total members" value={counts.members} note="Registered profiles" icon={Users} /><StatCard label="Pending payments" value={counts.pendingPayments} note="Awaiting review" icon={CreditCard} /><StatCard label="Active VIP members" value={counts.vipMembers} note="Live memberships" icon={Sparkles} /><StatCard label="Free predictions" value={counts.freePredictions} note="Content library" icon={FilePlus2} /><StatCard label="Results" value={counts.results} note="Result board entries" icon={ClipboardCheck} /></section><section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{desktopModules.map(({ title, description, icon: Icon, accent }) => <Link key={title} href="/admin" className="panel group p-5 transition hover:-translate-y-1 hover:border-gold-300/30"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-md ${accent === "emerald" ? "bg-emerald-300/10 text-emerald-300" : accent === "sky" ? "bg-sky-300/10 text-sky-300" : accent === "violet" ? "bg-violet-300/10 text-violet-300" : "bg-gold-300/10 text-gold-300"}`}><Icon size={18} /></span><ChevronRight size={17} className="text-slate-600 transition group-hover:text-gold-300" /></div><h3 className="mt-8 font-display text-2xl text-ivory">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><p className="mt-5 text-[10px] font-bold uppercase tracking-[.14em] text-gold-300">Open admin workspace</p></Link>)}</section><section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><div className="panel p-6"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-gold-300">Desktop workflow</p><h2 className="mt-2 font-display text-3xl text-ivory">Start from the overview, act in the full workspace.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Counts above are read from Supabase under the current owner session. The detailed workspace retains its individual tables, review controls and publishing forms to keep PC operations traceable.</p><button className="btn-quiet mt-6" disabled={syncing} onClick={() => void refresh()}>{syncing ? "Syncing…" : "Refresh dashboard data"}</button></div><div className="panel border-gold-300/20 bg-gold-300/[.04] p-6"><FolderLock size={21} className="text-gold-300" /><h2 className="mt-4 font-display text-3xl text-ivory">Secure files</h2><p className="mt-2 text-sm leading-7 text-slate-400">The file vault stores approved file types with owner-scoped access. It uses a separate Manus account session, so it does not silently reuse the Supabase member login.</p><Link href="/file-vault" className="mt-5 inline-flex text-xs font-bold uppercase tracking-[.12em] text-gold-300">Go to file vault <ChevronRight size={14} /></Link></div></section></main></div></div></div>;
}
