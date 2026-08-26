/** Midnight Ledger system: routes preserve calm public discovery, guarded member access, and a separate operational admin workspace. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
const FreePredictionPage = lazy(() => import("./pages/ContentPages").then(module => ({ default: module.FreePredictionPage })));
const PaidPredictionPage = lazy(() => import("./pages/ContentPages").then(module => ({ default: module.PaidPredictionPage })));
const ForgotPasswordPage = lazy(() => import("./pages/AuthPages").then(module => ({ default: module.ForgotPasswordPage })));
const LoginPage = lazy(() => import("./pages/AuthPages").then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/AuthPages").then(module => ({ default: module.RegisterPage })));
const MembershipPage = lazy(() => import("./pages/MemberPages").then(module => ({ default: module.MembershipPage })));
const MyAccountPage = lazy(() => import("./pages/MemberPages").then(module => ({ default: module.MyAccountPage })));
const PaymentPage = lazy(() => import("./pages/MemberPages").then(module => ({ default: module.PaymentPage })));
const ContactPage = lazy(() => import("./pages/InfoPages").then(module => ({ default: module.ContactPage })));
const FAQPage = lazy(() => import("./pages/InfoPages").then(module => ({ default: module.FAQPage })));
const LegalPage = lazy(() => import("./pages/InfoPages").then(module => ({ default: module.LegalPage })));
const AdminPage = lazy(() => import("./pages/Admin"));
const PCDashboardPage = lazy(() => import("./pages/PCDashboard"));
const FileVaultPage = lazy(() => import("./pages/FileVault"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-ink-950 text-sm text-slate-400">Loading secure workspace…</div>}>
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/free-prediction"} component={FreePredictionPage} />
      <Route path={"/paid-prediction"} component={PaidPredictionPage} />
      <Route path={"/membership"} component={MembershipPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/forgot-password"} component={ForgotPasswordPage} />
      <Route path={"/payment"} component={PaymentPage} />
      <Route path={"/my-account"} component={MyAccountPage} />
      <Route path={"/contact"} component={ContactPage} />
      <Route path={"/faq"} component={FAQPage} />
      <Route path={"/admin"} component={AdminPage} />
      <Route path={"/pc-dashboard"} component={PCDashboardPage} />
      <Route path={"/file-vault"} component={FileVaultPage} />
      <Route path={"/disclaimer"}>{() => <LegalPage type="disclaimer" />}</Route>
      <Route path={"/terms"}>{() => <LegalPage type="terms" />}</Route>
      <Route path={"/privacy"}>{() => <LegalPage type="privacy" />}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  </Suspense>;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster richColors theme="dark" />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
