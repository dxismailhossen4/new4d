/** Midnight Ledger system: a quiet editorial frame, gold ledger rules, and transparent navigation that becomes decisively solid on scroll. */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ArrowUpRight, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { disclaimer } from "@/lib/content";
import { useAuth } from "@/contexts/AuthContext";

const navLink = "nav-link";

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, navigate] = useLocation();
  const { user, membership, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = isAdmin
    ? [{ href: "/admin", label: "Admin" }, { href: "/my-account", label: "My account" }]
    : user
      ? [
          { href: "/free-prediction", label: "Free prediction" },
          ...(membership?.status === "active" ? [{ href: "/paid-prediction", label: "Paid prediction" }] : [{ href: "/membership", label: "Membership" }]),
          { href: "/my-account", label: "My account" },
          { href: "/payment", label: "Payment" },
        ]
      : [
          { href: "/", label: "Home" },
          { href: "/free-prediction", label: "Free prediction" },
          { href: "/membership", label: "Membership" },
          { href: "/contact", label: "Contact us" },
          { href: "/faq", label: "FAQ" },
        ];

  const leave = async () => {
    await signOut();
    toast.success("You have been signed out.");
    navigate("/");
    setOpen(false);
  };

  return (
    <header className={`site-header ${scrolled ? "site-header--solid" : ""}`}>
      <div className="container flex h-[76px] items-center justify-between gap-5">
        <BrandMark />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className={navLink}>{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <button onClick={leave} className="btn-quiet"><LogOut size={15} /> Logout</button>
          ) : (
            <>
              <Link href="/login" className="btn-quiet">Log in</Link>
              <Link href="/register" className="btn-gold">Create account <ArrowUpRight size={16} /></Link>
            </>
          )}
        </div>
        <button aria-label="Open navigation" className="grid h-10 w-10 place-items-center text-ivory lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="mobile-menu lg:hidden">
          <div className="container py-7">
            <div className="flex flex-col gap-1">
              {links.map((link) => <Link key={link.href} href={link.href} className="mobile-nav-link" onClick={() => setOpen(false)}>{link.label}</Link>)}
            </div>
            <div className="mt-7 border-t border-white/10 pt-5">
              {user ? (
                <button onClick={leave} className="btn-quiet w-full justify-center"><LogOut size={15} /> Logout</button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" className="btn-quiet justify-center" onClick={() => setOpen(false)}>Log in</Link>
                  <Link href="/register" className="btn-gold justify-center" onClick={() => setOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandMark />
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">A responsible membership space for clearly labelled number observations, free tips, and premium analysis.</p>
          </div>
          <div>
            <p className="eyebrow">Explore</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <Link href="/free-prediction">Free prediction</Link><Link href="/membership">Membership</Link><Link href="/my-account">My account</Link><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link>
            </div>
          </div>
          <div>
            <p className="eyebrow">Responsible use</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">{disclaimer}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gold-300"><Link href="/disclaimer">Disclaimer</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between"><span>© 2026 4D Insights Malaysia. All rights reserved.</span><span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> Responsible participation only</span></div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen overflow-x-hidden bg-ink-950 text-ivory"><Header /><main>{children}</main><Footer /></div>;
}

export function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} | 4D Insights Malaysia`;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute("content", description);
    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.setAttribute("href", `${window.location.origin}${window.location.pathname}`);
  }, [title, description]);
  return null;
}

export function SectionHeading({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy?: string; align?: "left" | "center" }) {
  return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-3">{title}</h2>{copy && <p className="mt-4 text-base leading-7 text-slate-400">{copy}</p>}</div>;
}

export function DisclaimerStrip() {
  return <div className="disclaimer-strip"><ShieldCheck size={16} /><p>{disclaimer}</p></div>;
}

export function LedgerRail({ serial = "01", label = "Published information" }: { serial?: string; label?: string }) {
  return <aside className="ledger-rail" aria-hidden="true"><span className="font-mono text-gold-300">{serial.padStart(2, "0")}</span><span>{label}</span><i>0 4 0 4</i></aside>;
}

export function AccountLink({ label = "Access my account" }: { label?: string }) {
  return <Link href="/my-account" className="btn-gold"><LayoutDashboard size={16} /> {label}</Link>;
}
