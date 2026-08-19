/** Midnight Ledger system: account journeys use understated cards, useful validation, and direct language around secure access. */
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { LedgerRail, PageMeta, SiteLayout } from "@/components/SiteLayout";
import { configurationMessage, isSupabaseConfigured, siteUrl, supabase } from "@/lib/supabase";

function AuthShell({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
  return <SiteLayout><PageMeta title={title} description={copy} /><section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_74%_10%,rgba(213,168,65,.15),transparent_27%),#060a15] px-4 pb-16 pt-32 sm:pt-40"><div className="ledger-ribbon">0 4 0 4</div><div className="relative mx-auto max-w-md"><p className="eyebrow">Member access</p><h1 className="mt-4 font-display text-5xl leading-none text-ivory">{title}</h1><p className="mt-4 text-sm leading-6 text-slate-400">{copy}</p><LedgerRail serial="04" label="Secure entry" /><div className="panel mt-8 p-6 sm:p-8">{!isSupabaseConfigured && <div className="mb-6 border border-amber-300/25 bg-amber-300/5 p-3 text-sm leading-6 text-amber-100">{configurationMessage()}</div>}{children}</div></div></section></SiteLayout>;
}

function PasswordInput({ value, onChange, label, placeholder = "Enter password" }: { value: string; onChange: (value: string) => void; label: string; placeholder?: string }) {
  const [visible, setVisible] = useState(false);
  return <label><span className="form-label">{label}</span><span className="relative block"><input className="form-control pr-12" type={visible ? "text" : "password"} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete={label.toLowerCase().includes("confirm") ? "new-password" : "current-password"} required /><button type="button" onClick={() => setVisible(!visible)} className="absolute right-0 top-0 grid h-full w-11 place-items-center text-slate-400 hover:text-gold-300" aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>;
}

export function RegisterPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", referralCode: "", age: false, terms: false });
  const update = (key: keyof typeof form, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return toast.error(configurationMessage());
    if (!form.age) return toast.error("Please confirm that you meet the applicable age requirement.");
    if (!form.terms) return toast.error("Please accept the Terms and Privacy Notice to continue.");
    if (form.password.length < 10) return toast.error("Choose a password with at least 10 characters.");
    if (form.password !== form.confirmPassword) return toast.error("The two passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { emailRedirectTo: `${siteUrl()}/login`, data: { full_name: form.fullName.trim(), phone: form.phone.trim(), referral_code: form.referralCode.trim() || null, age_confirmed: true, terms_accepted_at: new Date().toISOString() } } });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created successfully. Please login to continue.");
    navigate("/login");
  };

  return <AuthShell title="Create your account" copy="Set up a free account to manage membership access, payment submissions and your dashboard."><form onSubmit={submit} className="grid gap-5"><label><span className="form-label">Full name</span><input className="form-control" value={form.fullName} onChange={event => update("fullName", event.target.value)} placeholder="Your full name" autoComplete="name" required /></label><label><span className="form-label">Email</span><input className="form-control" type="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label><span className="form-label">Mobile number</span><input className="form-control" value={form.phone} onChange={event => update("phone", event.target.value)} placeholder="Your mobile number" inputMode="tel" autoComplete="tel" required /></label><PasswordInput label="Password" value={form.password} onChange={value => update("password", value)} placeholder="At least 10 characters" /><PasswordInput label="Confirm password" value={form.confirmPassword} onChange={value => update("confirmPassword", value)} /><label><span className="form-label">Referral code <span className="normal-case tracking-normal text-slate-500">(optional)</span></span><input className="form-control" value={form.referralCode} onChange={event => update("referralCode", event.target.value)} placeholder="Referral code, if applicable" /></label><label className="flex items-start gap-3 text-sm leading-5 text-slate-300"><input className="mt-1 h-4 w-4 accent-[#d5a841]" type="checkbox" checked={form.age} onChange={event => update("age", event.target.checked)} /><span>I confirm that I meet the applicable age requirement and will use this service responsibly.</span></label><label className="flex items-start gap-3 text-sm leading-5 text-slate-300"><input className="mt-1 h-4 w-4 accent-[#d5a841]" type="checkbox" checked={form.terms} onChange={event => update("terms", event.target.checked)} /><span>I accept the <Link className="text-gold-300 hover:underline" href="/terms">Terms</Link> and <Link className="text-gold-300 hover:underline" href="/privacy">Privacy Notice</Link>.</span></label><button className="btn-gold mt-1 w-full" disabled={loading}>{loading ? "Creating account…" : <>Create account <UserRoundPlus size={16} /></>}</button><p className="text-center text-sm text-slate-400">Already registered? <Link className="text-gold-300 hover:underline" href="/login">Log in</Link></p></form></AuthShell>;
}

export function LoginPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return toast.error(configurationMessage());
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!remember) sessionStorage.setItem("new4d:sessionPreference", "current-tab");
    const returnTo = sessionStorage.getItem("new4d:returnTo") || "/my-account";
    sessionStorage.removeItem("new4d:returnTo");
    toast.success("Welcome back.");
    navigate(returnTo);
  };

  return <AuthShell title="Welcome back" copy="Log in to review your membership state, payment history and available member content."><form onSubmit={submit} className="grid gap-5"><label><span className="form-label">Email</span><input className="form-control" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><PasswordInput label="Password" value={password} onChange={setPassword} /><div className="flex items-center justify-between gap-4"><label className="flex items-center gap-2 text-sm text-slate-400"><input className="h-4 w-4 accent-[#d5a841]" type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />Remember session</label><Link className="text-sm text-gold-300 hover:underline" href="/forgot-password">Forgot password?</Link></div><button className="btn-gold w-full" disabled={loading}>{loading ? "Logging in…" : <>Log in <ArrowRight size={16} /></>}</button><p className="text-center text-sm text-slate-400">New here? <Link className="text-gold-300 hover:underline" href="/register">Create account</Link></p></form></AuthShell>;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return toast.error(configurationMessage());
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${siteUrl()}/login` });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("If this email belongs to an account, a reset link has been sent.");
  };
  return <AuthShell title="Reset your password" copy="Enter the account email address and we will send a secure reset link."><form onSubmit={submit} className="grid gap-5"><div className="grid h-11 w-11 place-items-center rounded-full border border-gold-300/35 bg-gold-300/10 text-gold-300"><KeyRound size={19} /></div><label><span className="form-label">Email</span><input className="form-control" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><button className="btn-gold w-full" disabled={loading}>{loading ? "Sending reset link…" : "Send reset link"}</button><Link className="text-center text-sm text-gold-300 hover:underline" href="/login">Back to login</Link></form></AuthShell>;
}
