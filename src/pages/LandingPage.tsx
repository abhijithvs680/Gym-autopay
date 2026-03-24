import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import GympayLogo from "@/components/branding/GympayLogo";
import { btnPrimary, btnSecondary } from "@/lib/buttonStyles";
import { useAuth } from "@/context/AuthContext";

/** Unsplash — distinct theme per slide (backgrounds update as slides change) */
const slides = [
  {
    icon: "monitoring",
    headline: "Track revenue\nin real time.",
    desc: "See total collections, overdue amounts, and member stats — updated live.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    icon: "group",
    headline: "Manage every\nmember.",
    desc: "Add, edit, and track each member with payment status indicators.",
    image:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    icon: "schedule_send",
    headline: "Send autopay\nlinks instantly.",
    desc: "Generate payment links so members can set up automatic billing.",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80",
  },
  {
    icon: "notifications_active",
    headline: "Never miss\nan overdue.",
    desc: "Spot failed and overdue payments before they become a problem.",
    image:
      "https://images.unsplash.com/photo-1616400619175-5beda3a17896?auto=format&fit=crop&w=1400&q=80",
  },
  {
    icon: "history",
    headline: "Full payment\nhistory.",
    desc: "Month-by-month records for every member in one place.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    icon: "lock",
    headline: "Secure\ngateway.",
    desc: "Connect your payment provider with encrypted API credentials.",
    image:
      "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

const AUTO_MS = 3000;
const RESUME_AFTER_MANUAL_MS = 7000;

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const activeSlideRef = useRef(0);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticScrollRef = useRef(false);
  const goToSlideRef = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const idx = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
      setActiveSlide(idx);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function clearAuto() {
      if (autoIntervalRef.current) {
        window.clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
    }

    function startAuto() {
      clearAuto();
      autoIntervalRef.current = window.setInterval(() => {
        const node = scrollRef.current;
        if (!node) return;
        const w = node.clientWidth;
        if (w <= 0) return;
        programmaticScrollRef.current = true;
        const next = (activeSlideRef.current + 1) % slides.length;
        node.scrollTo({ left: next * w, behavior: "smooth" });
        window.setTimeout(() => {
          programmaticScrollRef.current = false;
        }, 700);
      }, AUTO_MS);
    }

    function pauseAutoThenResumeLater() {
      clearAuto();
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      resumeTimeoutRef.current = window.setTimeout(() => {
        resumeTimeoutRef.current = null;
        startAuto();
      }, RESUME_AFTER_MANUAL_MS);
    }

    function onUserInteractCarousel() {
      pauseAutoThenResumeLater();
    }

    goToSlideRef.current = (i: number) => {
      pauseAutoThenResumeLater();
      const nav = scrollRef.current;
      if (!nav) return;
      const w = nav.clientWidth;
      if (w <= 0) return;
      programmaticScrollRef.current = true;
      nav.scrollTo({ left: i * w, behavior: "smooth" });
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 700);
    };

    const node = scrollRef.current;
    if (!node) return;

    startAuto();

    node.addEventListener("pointerdown", onUserInteractCarousel);
    node.addEventListener("touchstart", onUserInteractCarousel, { passive: true });
    node.addEventListener("wheel", onUserInteractCarousel, { passive: true });

    return () => {
      clearAuto();
      if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
      node.removeEventListener("pointerdown", onUserInteractCarousel);
      node.removeEventListener("touchstart", onUserInteractCarousel);
      node.removeEventListener("wheel", onUserInteractCarousel);
    };
  }, []);

  function handleEmailContinue(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStep("password");
    setTimeout(() => passwordRef.current?.focus(), 50);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) return;
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate("/dashboard", { replace: true });
    }
  }

  function handleBack() {
    setStep("email");
    setPassword("");
    setError("");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black">
      {/* Top: Feature carousel — fills remaining space */}
      <div className="flex min-h-0 flex-1 flex-col pt-safe">
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="relative flex w-full shrink-0 snap-center flex-col items-center justify-center bg-black bg-cover bg-center bg-no-repeat px-8 text-center"
              style={{ backgroundImage: `url(${s.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/75 to-black/90" aria-hidden />
              <div className="relative z-10 flex flex-col items-center">
                <span
                  className="material-symbols-outlined mb-4 text-4xl text-lime drop-shadow-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {s.icon}
                </span>
                <h2 className="whitespace-pre-line text-[clamp(1.5rem,5vw,2.25rem)] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm">
                  {s.headline}
                </h2>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/80">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex shrink-0 items-center justify-center gap-2 py-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlideRef.current(i)}
              className={`h-2 rounded-full transition-all duration-200 ease-out ${
                i === activeSlide ? "w-5 bg-lime shadow-glow-lime" : "w-2 bg-white/25"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom: Auth card — fixed height, never overflows */}
      <div className="shrink-0 rounded-t-3xl bg-surface/95 px-5 pb-safe backdrop-blur-md">
        <div className="mx-auto w-full max-w-sm py-5">
          <div className="flex items-center justify-center gap-2">
            <GympayLogo size="md" wordmark />
          </div>

          <h3 className="mt-3 text-center text-base font-bold tracking-tight text-ink">
            {step === "email" ? "Log in or sign up" : "Enter your password"}
          </h3>

          {error && (
            <p className="mt-3 rounded-lg border-l-2 border-status-overdue bg-status-overdue/5 px-4 py-2 text-sm font-medium text-status-overdue">
              {error}
            </p>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailContinue} className="mt-4">
              <div className="flex h-12 items-center overflow-hidden rounded-lg border border-border bg-bg">
                <div className="flex shrink-0 items-center gap-1.5 border-r border-border px-3">
                  <span className="material-symbols-outlined text-lg text-ink-muted">mail</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-full min-w-0 flex-1 border-none bg-transparent px-3 text-base text-ink placeholder:text-ink-muted focus:outline-none focus:ring-0"
                  autoFocus
                />
              </div>

              <button type="submit" className={`${btnPrimary} mt-4 w-full`}>
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-4">
              <button
                type="button"
                onClick={handleBack}
                className="mb-3 flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                {email}
              </button>

              <div className="flex h-12 items-center overflow-hidden rounded-lg border border-border bg-bg">
                <div className="flex shrink-0 items-center gap-1.5 border-r border-border px-3">
                  <span className="material-symbols-outlined text-lg text-ink-muted">lock</span>
                </div>
                <input
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-full min-w-0 flex-1 border-none bg-transparent px-3 text-base text-ink placeholder:text-ink-muted focus:outline-none focus:ring-0"
                />
              </div>

              <button type="submit" disabled={loading} className={`${btnPrimary} mt-4 w-full`}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
          )}

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Link to="/register" className={`${btnSecondary} mt-4 w-full`}>
            Create a new account
          </Link>

          <p className="mt-3 text-center text-[10px] text-ink-muted">
            &copy; {new Date().getFullYear()} Gympay. Built with precision.
          </p>
        </div>
      </div>
    </div>
  );
}
