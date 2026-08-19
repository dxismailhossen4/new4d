/** Midnight Ledger system: membership and payment screens make status, manual review, and responsible access unmistakably clear. */
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, Clock3, CreditCard, FileUp, LayoutDashboard, LockKeyhole, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { DisclaimerStrip, LedgerRail, PageMeta, SectionHeading, SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, membershipLabel, Payment, PaymentStatus } from "@/lib/content";
import { configurationMessage, isSupabaseConfigured, supabase } from "@/lib/supabase";

const membershipFeatures = ["Premium prediction/tips content", "Member-only video references", "Premium analysis", "My Account dashboard", "Updated premium content", "Member support"];

function RequireAccount({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => { if (!loading && !user) { sessionStorage.setItem("new4d:returnTo", window.location.pathname); navigate("/login"); } }, [loading, user, navigate]);
  if (loading) return <SiteLayout><div className="container min-h-screen pt-36 text-sm text-slate-400">Confirming your account…</div></SiteLayout>;
  if (!user) return <SiteLayout><div className="container min-h-screen pt-36"><div className="empty-state"><LockKeyhole size={26} className="text-gold-300" /><p>Redirecting to secure login…</p></div></div></SiteLayout>;
  return <>{children}</>;
}

export function MembershipPage() {
  const { user, membership } = useAuth();
  const active = membership?.status === "active";
  const actionHref = active ? "/paid-prediction" : user ? "/payment" : "/register";
  const actionLabel = active ? "Open premium library" : user ? "Continue to payment" : "Create free account";
  return <SiteLayout><PageMeta title="Membership" description="Review premium informational access, manual payment verification and responsible membership terms." /><section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(213,168,65,.13),transparent_34%),#060a15] pb-12 pt-32 sm:pt-40"><div className="ledger-ribbon">0 4 0 4</div><div className="container relative"><SectionHeading eyebrow="Premium informational access" title="A membership designed for clarity." copy="Access premium analysis and member resources through a manually verified membership. This is access to information, not a promise of a winning outcome." /><LedgerRail serial="05" label="Membership register" /></div></section><section className="container py-14 lg:py-20"><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start"><div className="space-y-7"><div><p className="eyebrow">What membership means</p><h2 className="mt-3 font-display text-4xl leading-none text-ivory">Premium content, never a financial guarantee.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">Premium membership provides access to content the administrator has chosen to publish for members. It does not change the uncertain nature of any outcome and should never be treated as an investment.</p></div><DisclaimerStrip /><div className="border-l border-gold-300/55 pl-5"><p className="eyebrow">Verification workflow</p><p className="mt-2 text-sm leading-6 text-slate-400">After you submit a genuine payment reference and screenshot, the status remains pending until an administrator approves or rejects it. No payment is marked approved automatically.</p></div></div><div className="panel overflow-hidden"><div className="relative border-b border-white/10 p-7 sm:p-9"><div className="absolute right-0 top-0 h-44 w-44 bg-[radial-gradient(circle,rgba(213,168,65,.24),transparent_67%)]" /><p className="eyebrow">Premium membership</p><div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1"><span className="font-display text-6xl leading-none text-ivory">RM 500</span><span className="pb-1 text-sm text-slate-400">membership access</span></div><p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">Access premium informational analysis and member tools after administrator payment verification.</p></div><div className="p-7 sm:p-9"><div className="grid gap-3">{membershipFeatures.map(item => <div className="flex items-center gap-3 text-sm text-slate-300" key={item}><span className="grid h-5 w-5 place-items-center border border-gold-300/40 text-gold-300"><Check size={13} /></span>{item}</div>)}</div><p className="mt-7 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">Membership provides access to premium informational content. It does not guarantee any winning outcome or financial return.</p><Link href={actionHref} className="btn-gold mt-7 w-full">{actionLabel} <ArrowRight size={16} /></Link>{membership && <p className="mt-4 text-center text-xs text-slate-400">Current membership state: <span className="font-semibold capitalize text-gold-300">{membershipLabel(membership.status)}</span></p>}</div></div></div></section></SiteLayout>;
}

function paymentClass(status: PaymentStatus) { return status === "approved" ? "text-emerald-300" : status === "rejected" ? "text-red-300" : status === "more_info" ? "text-amber-200" : "text-gold-300"; }

function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { if (!supabase || !user) return setLoading(false); const { data } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }); setPayments((data ?? []) as Payment[]); setLoading(false); };
  useEffect(() => { void load(); }, [user?.id]);
  if (loading) return <div className="mt-8 text-sm text-slate-400">Loading payment history…</div>;
  if (!payments.length) return <div className="mt-8 border-t border-white/10 pt-7 text-sm leading-6 text-slate-400">No payment submission has been recorded for this account. Submit payment details only after completing a real payment.</div>;
  return <div className="table-wrap mt-8"><table className="ledger-table"><thead><tr><th>Submitted</th><th>Reference</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>{payments.map(payment => <tr key={payment.id}><td>{formatDate(payment.created_at)}</td><td className="font-mono">{payment.transaction_id}</td><td>{payment.payment_method}</td><td>RM {Number(payment.amount).toFixed(2)}</td><td><span className={`font-semibold capitalize ${paymentClass(payment.status)}`}>{payment.status.replace(/_/g, " ")}</span>{payment.admin_note && <p className="mt-1 text-xs text-slate-500">{payment.admin_note}</p>}</td></tr>)}</tbody></table></div>;
}

export function PaymentPage() {
  return <RequireAccount><PaymentContent /></RequireAccount>;
}

function PaymentContent() {
  const { user, membership, refreshAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ method: "Mobile payment", transactionId: "", amount: "500.00", paymentDate: "" });
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] || null;
    if (!next) return setFile(null);
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(next.type)) { event.target.value = ""; return toast.error("Upload a JPG, PNG or WEBP payment screenshot."); }
    if (next.size > 5 * 1024 * 1024) { event.target.value = ""; return toast.error("Screenshot uploads must be 5 MB or smaller."); }
    setFile(next);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase || !user) return toast.error(configurationMessage());
    if (!file) return toast.error("Attach a genuine payment screenshot for manual verification.");
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Enter a valid payment amount.");
    setLoading(true);
    let screenshotUrl: string | null = null;
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage.from("payment-screenshots").upload(filePath, file, { contentType: file.type, upsert: false });
    if (upload.error) { setLoading(false); return toast.error(upload.error.message); }
    const { data: signed } = await supabase.storage.from("payment-screenshots").createSignedUrl(filePath, 60 * 60 * 24 * 14);
    screenshotUrl = signed?.signedUrl ?? filePath;
    const { error } = await supabase.from("payments").insert({ user_id: user.id, membership_id: membership?.id ?? null, amount, currency: "MYR", payment_method: form.method, transaction_id: form.transactionId.trim(), screenshot_url: screenshotUrl, status: "pending", submitted_date: form.paymentDate || new Date().toISOString().slice(0, 10) });
    setLoading(false);
    if (error) return toast.error(error.message);
    await refreshAccount();
    setForm({ method: "Mobile payment", transactionId: "", amount: "500.00", paymentDate: "" }); setFile(null);
    toast.success("Payment submission received. It remains pending until verified by an administrator.");
  };
  return <SiteLayout><PageMeta title="Payment" description="Submit membership payment details and a screenshot for secure manual verification." /><section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(213,168,65,.13),transparent_34%),#060a15] pb-12 pt-32 sm:pt-40"><div className="container"><SectionHeading eyebrow="Membership verification" title="Submit payment for review" copy="Provide your genuine payment reference and screenshot. Every submission starts pending and must be verified by an authorised administrator." /></div></section><section className="container grid gap-10 py-14 lg:grid-cols-[.85fr_1.15fr] lg:py-20"><aside className="space-y-6"><div className="panel p-6"><CreditCard size={21} className="text-gold-300" /><p className="eyebrow mt-5">Payment method</p><h2 className="mt-2 font-display text-3xl text-ivory">Mobile payment</h2><div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm leading-6 text-slate-300"><p><span className="text-slate-500">Beneficiary</span><br />MD ABID HOSSAIN</p><p><span className="text-slate-500">Mobile payment number</span><br /><span className="font-mono text-gold-300">01781778399</span></p><p className="pt-2 text-xs text-slate-500">Transfer only after confirming the payment instructions are suitable for your situation and lawful where you are located.</p></div></div><DisclaimerStrip /></aside><div><form onSubmit={submit} className="panel grid gap-5 p-6 sm:grid-cols-2 sm:p-8"><label><span className="form-label">Payment method</span><select className="form-control" value={form.method} onChange={event => update("method", event.target.value)}><option value="Mobile payment">Mobile payment</option><option value="Bank transfer">Bank transfer</option></select></label><label><span className="form-label">Amount (RM)</span><input className="form-control" value={form.amount} onChange={event => update("amount", event.target.value)} inputMode="decimal" required /></label><label><span className="form-label">Transaction / reference ID</span><input className="form-control" value={form.transactionId} onChange={event => update("transactionId", event.target.value)} placeholder="Enter your payment reference" required /></label><label><span className="form-label">Payment date</span><input className="form-control" type="date" value={form.paymentDate} onChange={event => update("paymentDate", event.target.value)} required /></label><label className="sm:col-span-2"><span className="form-label">Payment screenshot</span><input className="form-control file:mr-4 file:border-0 file:bg-transparent file:font-semibold file:text-gold-300" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} required /><p className="mt-2 text-xs text-slate-500">JPG, PNG or WEBP only. Maximum 5 MB. The file is stored privately for manual verification.</p></label><div className="sm:col-span-2"><button className="btn-gold" disabled={loading}>{loading ? "Submitting…" : <>I have completed payment <FileUp size={16} /></>}</button></div></form><PaymentHistory /></div></section></SiteLayout>;
}

export function MyAccountPage() { return <RequireAccount><MyAccountContent /></RequireAccount>; }

function MyAccountContent() {
  const { user, profile, membership, signOut } = useAuth();
  const [, navigate] = useLocation();
  const leave = async () => { await signOut(); toast.success("You have been signed out."); navigate("/"); };
  const status = membership?.status || "inactive";
  return <SiteLayout><PageMeta title="My account" description="Review your profile, membership access and payment history." /><section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(213,168,65,.13),transparent_34%),#060a15] pb-12 pt-32 sm:pt-40"><div className="container"><p className="eyebrow">Member dashboard</p><h1 className="mt-3 font-display text-5xl text-ivory sm:text-6xl">Welcome back, {profile?.full_name || user?.email?.split("@")[0] || "member"}.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Your membership state, payment submissions and access options are shown below.</p></div></section><section className="container py-14 lg:py-20"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="metric-card"><p className="data-label">Membership status</p><p className={`mt-3 font-display text-3xl capitalize ${status === "active" ? "text-emerald-300" : "text-gold-300"}`}>{membershipLabel(status)}</p></div><div className="metric-card"><p className="data-label">Membership expiry</p><p className="mt-3 text-lg text-ivory">{membership?.expires_at ? formatDate(membership.expires_at) : "Not set"}</p></div><div className="metric-card"><p className="data-label">Account email</p><p className="mt-3 truncate text-sm text-ivory">{user?.email || "Not available"}</p></div><div className="metric-card"><p className="data-label">Account role</p><p className="mt-3 text-lg capitalize text-ivory">{profile?.role || "member"}</p></div></div><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><Link href="/free-prediction" className="panel flex min-h-36 flex-col justify-between p-6 transition hover:-translate-y-1"><EyeLink label="Free prediction" copy="Review current published free observations." /></Link><Link href={status === "active" ? "/paid-prediction" : "/membership"} className="panel flex min-h-36 flex-col justify-between p-6 transition hover:-translate-y-1"><EyeLink label={status === "active" ? "Paid prediction" : "Premium access"} copy={status === "active" ? "Open your member-only content library." : "Review the verification path to premium content."} /></Link><Link href="/payment" className="panel flex min-h-36 flex-col justify-between p-6 transition hover:-translate-y-1"><EyeLink label="Payment history" copy="Submit or review membership payment verification." /></Link></div><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="eyebrow">Account information</p><div className="mt-4 table-wrap"><table className="ledger-table"><tbody><tr><td className="w-48 text-slate-500">Full name</td><td>{profile?.full_name || "Not provided"}</td></tr><tr><td className="text-slate-500">Mobile number</td><td>{profile?.phone || "Not provided"}</td></tr><tr><td className="text-slate-500">Registration</td><td>{profile?.created_at ? formatDate(profile.created_at) : "Not available"}</td></tr></tbody></table></div></div><div className="flex flex-wrap gap-3"><Link href="/contact" className="btn-quiet">Contact support</Link><button onClick={leave} className="btn-danger">Sign out</button></div></div></section></SiteLayout>;
}

function EyeLink({ label, copy }: { label: string; copy: string }) { return <><LayoutDashboard size={19} className="text-gold-300" /><div><p className="font-display text-2xl text-ivory">{label}</p><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p></div><ArrowRight size={16} className="mt-3 text-gold-300" /></>; }
