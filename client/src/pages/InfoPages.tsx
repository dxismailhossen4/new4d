/** Midnight Ledger system: practical support and legal pages replace generic marketing with concise, responsible information. */
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { ChevronDown, CircleHelp, Clock3, Mail, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DisclaimerStrip, LedgerRail, PageMeta, SectionHeading, SiteLayout } from "@/components/SiteLayout";
import { usePublishedFaq } from "@/hooks/useContent";
import { disclaimer } from "@/lib/content";
import { configurationMessage, isSupabaseConfigured, supabase } from "@/lib/supabase";

const standardFaq = [
  ["What is the 4D prediction service?", "It is a membership website where the administrator can publish informational number observations, tips, analysis and optional videos."],
  ["How does free prediction work?", "Free prediction entries are shown when the administrator publishes them. Each entry identifies its draw date, context and responsible-use disclosure."],
  ["How do I register?", "Use the Create Account page, provide your details, confirm the applicable age requirement, accept the terms and then log in."],
  ["How do I become a premium member?", "Review the RM500 membership information, submit a payment reference and valid screenshot, then wait for manual verification."],
  ["How does payment verification work?", "Payment submissions start as pending. An authorised administrator reviews the supplied reference and evidence before approving, rejecting, or requesting more information."],
  ["When will premium content become available?", "Premium content is available only after the membership status becomes active following administrator approval."],
  ["Can I access premium predictions after approval?", "Yes. An active member can access the published premium library while their membership remains active."],
  ["Can I cancel my membership?", "Contact support with your account details. Any applicable cancellation or refund treatment is governed by the published Terms."],
  ["Are predictions guaranteed?", "No. Predictions are informational and entertainment tips, and outcomes cannot be guaranteed."],
];

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(213,168,65,.13),transparent_34%),#060a15] pb-12 pt-32 sm:pt-40"><div className="ledger-ribbon">0 4 0 4</div><div className="container relative"><SectionHeading eyebrow={eyebrow} title={title} copy={copy} /><LedgerRail serial="03" label="Member correspondence" /></div></section>;
}

export function ContactPage() {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return toast.error(configurationMessage());
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null, subject: form.subject.trim(), message: form.message.trim() });
    setSending(false);
    if (error) return toast.error(error.message);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    toast.success("Your message has been sent to support.");
  };
  return <SiteLayout><PageMeta title="Contact us" description="Send a message to the 4D Insights Malaysia support team." /><PageIntro eyebrow="Support" title="Contact us" copy="Use the contact form for membership, payment or account questions. Please do not send passwords or sensitive financial details in the message." /><section className="container grid gap-10 py-14 lg:grid-cols-[.78fr_1.22fr] lg:py-20"><aside className="space-y-6"><div className="border-l border-gold-300/55 pl-5"><Mail size={18} className="text-gold-300" /><p className="eyebrow mt-4">Customer support</p><p className="mt-2 text-sm leading-6 text-slate-400">An official support email will be shown here after it is supplied by the site owner.</p></div><div className="border-l border-gold-300/55 pl-5"><Clock3 size={18} className="text-gold-300" /><p className="eyebrow mt-4">Business hours</p><p className="mt-2 text-sm leading-6 text-slate-400">Business hours will be confirmed by the site owner before launch.</p></div><div className="border-l border-gold-300/55 pl-5"><MessageSquareText size={18} className="text-gold-300" /><p className="eyebrow mt-4">Official links</p><p className="mt-2 text-sm leading-6 text-slate-400">Official social links are intentionally not displayed until they are provided and verified.</p></div></aside><form onSubmit={submit} className="panel grid gap-5 p-6 sm:grid-cols-2 sm:p-8"><label><span className="form-label">Name</span><input className="form-control" value={form.name} onChange={event => update("name", event.target.value)} required /></label><label><span className="form-label">Email</span><input className="form-control" type="email" value={form.email} onChange={event => update("email", event.target.value)} required /></label><label><span className="form-label">Phone <span className="normal-case tracking-normal text-slate-500">(optional)</span></span><input className="form-control" value={form.phone} onChange={event => update("phone", event.target.value)} inputMode="tel" /></label><label><span className="form-label">Subject</span><input className="form-control" value={form.subject} onChange={event => update("subject", event.target.value)} required /></label><label className="sm:col-span-2"><span className="form-label">Message</span><textarea className="form-control" value={form.message} onChange={event => update("message", event.target.value)} required /></label><div className="sm:col-span-2"><button className="btn-gold" disabled={sending}>{sending ? "Sending…" : <>Send message <Send size={16} /></>}</button></div></form></section></SiteLayout>;
}

export function FAQPage() {
  const faq = usePublishedFaq();
  const [open, setOpen] = useState<string | null>(null);
  const items = faq.data.length ? faq.data.map(item => [item.question, item.answer, item.id]) : standardFaq.map(([question, answer], index) => [question, answer, `standard-${index}`]);
  return <SiteLayout><PageMeta title="FAQ" description="Find practical answers about accounts, membership, payment verification and responsible use." /><PageIntro eyebrow="Before you continue" title="Frequently asked questions" copy="Clear answers on accounts, membership verification and informational content. The service never guarantees an outcome." /><section className="container py-14 lg:py-20"><div className="mx-auto max-w-3xl">{items.map(([question, answer, id]) => <div key={String(id)} className="border-b border-white/10"><button className="flex w-full items-center justify-between gap-5 py-5 text-left" onClick={() => setOpen(open === id ? null : String(id))}><span className="font-display text-2xl leading-tight text-ivory">{String(question)}</span><ChevronDown size={18} className={`shrink-0 text-gold-300 transition-transform ${open === id ? "rotate-180" : ""}`} /></button>{open === id && <p className="max-w-2xl pb-6 text-sm leading-7 text-slate-400">{String(answer)}</p>}</div>)}</div><div className="mx-auto mt-12 max-w-3xl"><DisclaimerStrip /></div></section></SiteLayout>;
}

const legalCopy = {
  disclaimer: { eyebrow: "Responsible participation", title: "Disclaimer", blocks: [["Informational and entertainment content", disclaimer], ["No guarantees", "Nothing on this website represents a guaranteed result, guaranteed profit, fixed winning number, jackpot claim, or no-loss outcome. Any number observation, tip, analysis or video is for informational and entertainment purposes only."], ["Personal responsibility", "Users remain responsible for their own decisions and must comply with applicable laws, age requirements and responsible participation practices."]] },
  terms: { eyebrow: "Website terms", title: "Terms & conditions", blocks: [["Membership access", "A premium membership provides access to the administrator’s premium informational prediction and tips content. It is not an investment product and is not a promise of any financial return."], ["Account use", "You must provide accurate account information, keep your credentials secure and use the website only in accordance with applicable law and these terms."], ["Payment verification", "Membership activation occurs only after a payment is manually verified by an authorised administrator. Submitting a reference or screenshot does not itself activate membership."], ["Content use", "Website content may not be copied, republished or commercially redistributed without permission from the site owner."]] },
  privacy: { eyebrow: "Privacy notice", title: "Privacy", blocks: [["Information processed", "The website processes the details you provide for account creation, payment verification, support requests and service administration."], ["Security", "Authentication, database access and file-storage permissions are designed around Supabase access policies. Users should not submit passwords or unnecessary sensitive financial details through support messages."], ["Retention and access", "The site owner is responsible for defining the final retention period, responding to lawful privacy requests and completing any required privacy notices before public launch."]] },
} as const;

export function LegalPage({ type }: { type: keyof typeof legalCopy }) {
  const content = legalCopy[type];
  return <SiteLayout><PageMeta title={content.title} description={`${content.title} for 4D Insights Malaysia.`} /><PageIntro eyebrow={content.eyebrow} title={content.title} copy="Please read this information before using the website or applying for premium membership." /><section className="container py-14 lg:py-20"><div className="mx-auto max-w-3xl space-y-8">{content.blocks.map(([heading, copy]) => <article key={heading} className="border-l border-gold-300/55 pl-6"><h2 className="font-display text-3xl text-ivory">{heading}</h2><p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p></article>)}<div className="panel mt-10 flex gap-4 p-5"><CircleHelp size={21} className="shrink-0 text-gold-300" /><p className="text-sm leading-6 text-slate-300">For account-specific questions, use the <Link className="text-gold-300 hover:underline" href="/contact">contact form</Link>. The final legal information must be reviewed by the owner for operational and jurisdictional suitability before launch.</p></div></div></section></SiteLayout>;
}
