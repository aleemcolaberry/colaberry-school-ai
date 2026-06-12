/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, @next/next/no-css-tags */
/* ============================================================
   AI Systems Architect Accelerator — Free Open House (v2)
   Faithful Next.js port of the Claude Design "awwwards" handoff
   (AI Accelerator Open House v2.html). Self-contained: renders on
   the Colaberry Design System token/component layer bundled in
   /public/ai-accelerator/styles.css, independent of the site-wide
   Ridge theme. GSAP + Lucide load from CDN via next/script.
   ============================================================ */
import React from "react";
import Head from "next/head";
import Script from "next/script";

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
    lucide?: { createIcons: () => void };
    __gsapReg?: boolean;
  }
}

/** CSS object that may carry custom properties (e.g. `--_c`). */
type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const REGISTER_URL = "https://learn.colaberry.com/";
const LOGO = "/ai-accelerator/logo/colaberry-horizontal.png";
const LOGO_WHITE = "/ai-accelerator/logo/colaberry-horizontal-white.png";
const MARK_WHITE = "/ai-accelerator/logo/colaberry-mark-white.png";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function drawIcons() {
  if (typeof window !== "undefined" && window.lucide) window.lucide.createIcons();
}

/* Run fn only when the document is actually visible. Hidden documents
   (ad-quality crawlers, prerenderers, background tabs) never fire rAF,
   which would leave gsap.from() content stuck invisible at its from-state. */
function awWhenVisible(fn: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  if (!document.hidden) {
    fn();
    return () => {};
  }
  const h = () => {
    if (!document.hidden) {
      document.removeEventListener("visibilitychange", h);
      fn();
    }
  };
  document.addEventListener("visibilitychange", h);
  return () => document.removeEventListener("visibilitychange", h);
}

/* Poll until GSAP + ScrollTrigger (CDN) are present, then register once. */
function useLibs(): boolean {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    let raf = 0;
    const check = () => {
      if (window.gsap && window.ScrollTrigger) {
        if (!window.__gsapReg) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          window.__gsapReg = true;
        }
        setReady(true);
      } else {
        raf = window.requestAnimationFrame(check);
      }
    };
    check();
    return () => window.cancelAnimationFrame(raf);
  }, []);
  return ready;
}

/* ------------------------------------------------------------------ */
/* DS-equivalent primitives (Icon, Button, Input)                     */
/* ------------------------------------------------------------------ */

/* React-safe Lucide icon — React owns the <span>, Lucide swaps the inner <i>. */
function I({
  n,
  s,
  c,
  className = "",
  style,
}: {
  n: string;
  s?: number;
  c?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const st: React.CSSProperties = { fontSize: s ? s + "px" : undefined, color: c, ...style };
  return (
    <span
      className={"cb-i " + className}
      aria-hidden="true"
      style={st}
      dangerouslySetInnerHTML={{ __html: `<i data-lucide="${n}"></i>` }}
    />
  );
}

interface ButtonOwnProps {
  variant?: "primary" | "solid" | "outline" | "ghost" | "link";
  tone?: "green" | "blue";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  as?: "a" | "button";
  className?: string;
  children?: React.ReactNode;
}
type ButtonProps = ButtonOwnProps &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ButtonOwnProps
  >;

function Button({
  variant = "primary",
  tone,
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  as,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = ["cb-btn"];
  if (variant === "primary") classes.push("cb-btn--primary");
  if (variant === "outline") classes.push("cb-btn--outline");
  if (variant === "ghost") classes.push("cb-btn--ghost");
  if (variant === "link") classes.push("cb-btn--link");
  if ((variant === "primary" || variant === "solid") && tone === "green") classes.push("cb-btn--green");
  if ((variant === "primary" || variant === "solid") && tone === "blue") classes.push("cb-btn--blue");
  if (size === "sm") classes.push("cb-btn--sm");
  if (size === "lg") classes.push("cb-btn--lg");
  if (fullWidth) classes.push("cb-btn--full");
  if (className) classes.push(className);

  const Tag: "a" | "button" = (rest as any).href || as === "a" ? "a" : as || "button";
  const props: any = { className: classes.join(" "), ...rest };
  if (Tag === "button" && props.type === undefined) props.type = "button";

  return (
    <Tag {...props}>
      {leadingIcon}
      {children != null && <span>{children}</span>}
      {trailingIcon}
    </Tag>
  );
}

type InputProps = {
  label?: React.ReactNode;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  error?: string;
  helperText?: string;
  id?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

let _id = 0;
function Input({
  label,
  required = false,
  size = "md",
  error,
  helperText,
  id,
  className = "",
  ...rest
}: InputProps) {
  const fieldId = React.useMemo(() => id || "cb-input-" + ++_id, [id]);
  const inputClasses = ["cb-input"];
  if (size === "sm") inputClasses.push("cb-input--sm");
  if (size === "lg") inputClasses.push("cb-input--lg");
  if (className) inputClasses.push(className);
  const msg = error || helperText;
  return (
    <div className={"cb-field" + (error ? " cb-field--error" : "")}>
      {label && (
        <label className="cb-field__label" htmlFor={fieldId}>
          {label}
          {required && (
            <span className="cb-field__req" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <input id={fieldId} className={inputClasses.join(" ")} aria-invalid={!!error} {...rest} />
      {msg && <span className="cb-field__msg">{msg}</span>}
    </div>
  );
}

function Logo({ height = 30 }: { height?: number }) {
  return <img src={LOGO} alt="Colaberry" style={{ height, display: "block" }} />;
}

/* ------------------------------------------------------------------ */
/* Registration card (carried over from v1 — user-approved)           */
/* ------------------------------------------------------------------ */

function RegCard() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError(email.trim() ? "Enter a valid email address." : "Please add your email to save your seat.");
      return;
    }
    setError("");
    setDone(true);
  };
  React.useEffect(() => {
    drawIcons();
  }, [done]);

  const rows = [
    { icon: "calendar-days", l: "Date", v: "June 21, 2026" },
    { icon: "monitor", l: "Format", v: "Live online event" },
    { icon: "ticket", l: "Price", v: "Free registration" },
  ];

  return (
    <div className="cbx-regcard">
      <div className="cbx-regcard__head">
        <span className="cbx-regcard__live">
          <span className="cbx-regcard__dot" />
          Free Open House
        </span>
        <span className="cbx-regcard__seats">
          <I n="users" s={13} />
          Limited seats
        </span>
      </div>
      <div className="cbx-regcard__body">
        {done ? (
          <div className="cbx-regcard__done">
            <span className="cbx-regcard__doneicon">
              <I n="mail-check" />
            </span>
            <h3>Almost there — check your inbox</h3>
            <p>
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to lock in your free seat
              for June 21.
            </p>
          </div>
        ) : (
          <>
            <div className="cbx-regcard__rows">
              {rows.map((r, i) => (
                <div className="cbx-regcard__row" key={i}>
                  <span className="cbx-regcard__rowicon">
                    <I n={r.icon} s={18} />
                  </span>
                  <span className="cbx-regcard__rowl">{r.l}</span>
                  <span className="cbx-regcard__rowv">{r.v}</span>
                </div>
              ))}
            </div>
            <form className="cbx-regcard__form" onSubmit={submit} noValidate>
              <Input
                id="hero-email"
                label="Save your seat"
                type="email"
                placeholder="you@email.com"
                required
                autoComplete="email"
                inputMode="email"
                name="email"
                error={error || undefined}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />
              <Button type="submit" fullWidth trailingIcon={<I n="arrow-right" s={17} />}>
                Reserve my free seat
              </Button>
              <p className="cbx-regcard__fine">
                <I n="shield-check" s={14} />
                Free to attend · we&apos;ll email your join link · no spam.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nav + Marquee                                                      */
/* ------------------------------------------------------------------ */

function AwNav() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="aw-nav" data-scrolled={scrolled}>
      <div className="aw-nav__inner">
        <Logo />
        <div className="aw-nav__meta">
          <span className="aw-nav__date">
            <I n="calendar-days" s={15} />
            JUN 21 2026 — LIVE ONLINE
          </span>
          <Button
            size="sm"
            as="a"
            href={REGISTER_URL}
            target="_blank"
            rel="noopener"
            trailingIcon={<I n="arrow-right" s={15} />}
          >
            Reserve my free seat
          </Button>
        </div>
      </div>
    </header>
  );
}

function AwMarquee() {
  const items = [
    <span key="a">
      Learn with <em className="is-blue">Claude</em>
    </span>,
    <span key="b">
      Build through <em className="is-green">Colaberry</em>
    </span>,
    <span key="c">
      Deploy in the <em className="is-red">real world</em>
    </span>,
    <span key="d">Free Open House — June 21, 2026</span>,
  ];
  const list = (hidden: boolean) => (
    <div className="aw-mq__list" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span className="aw-mq__item" key={i}>
          {it}
          <span className="aw-mq__dot" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="aw-mq">
      <div className="aw-mq__inner">
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generative node-network canvas — "AI systems" motif for the hero.  */
/* ------------------------------------------------------------------ */

function AwCanvas() {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const tok = (n: string, fb: string) => (css.getPropertyValue(n) || fb).trim();
    const COLORS = [tok("--blue-500", "#367895"), tok("--green-500", "#77BB4A"), tok("--red-500", "#FB2832")];
    let nodes: Array<{ x: number; y: number; vx: number; vy: number; r: number; c: string | null }> = [];
    let raf = 0;
    let running = true;
    let W = 0;
    let H = 0;

    const build = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.max(26, Math.round(W / 24)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.2 + Math.random() * 1.6,
        c: Math.random() < 0.8 ? null : COLORS[(Math.random() * 3) | 0],
      }));
    };

    const frame = (move: boolean) => {
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        if (move) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -10) n.x = W + 10;
          else if (n.x > W + 10) n.x = -10;
          if (n.y < -10) n.y = H + 10;
          else if (n.y > H + 10) n.y = -10;
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16900) {
            const o = (1 - Math.sqrt(d2) / 130) * 0.14;
            ctx.strokeStyle = "rgba(74,74,74," + o.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = n.c ? n.c + "99" : "rgba(74,74,74,.30)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      frame(true);
      raf = requestAnimationFrame(loop);
    };

    build();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !running) {
          running = true;
          loop();
        } else if (!e.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      });
    });
    io.observe(canvas);
    loop();
    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <div className="aw-hero__canvas" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

function AwChars({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span className="aw-ch" key={i}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

function AwHero() {
  const ref = React.useRef<HTMLElement>(null);
  const ready = useLibs();
  React.useEffect(() => {
    if (!ready || !window.gsap || !ref.current) return;
    let ctx: any = null;
    const cancel = awWhenVisible(() => {
      if (!ref.current) return;
      ctx = window.gsap.context(() => {
        const tl = window.gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from(
          ref.current!.querySelectorAll(".aw-line__mask .aw-ch"),
          { yPercent: 115, duration: 0.9, stagger: { each: 0.025, from: "start" } },
          0.15
        )
          .from(
            ref.current!.querySelectorAll(".aw-line__note"),
            { opacity: 0, x: -14, duration: 0.6, stagger: 0.12 },
            "-=.55"
          )
          .from(ref.current!.querySelector(".aw-hero__eyebrow"), { opacity: 0, y: 10, duration: 0.5 }, "<")
          .from(
            ref.current!.querySelectorAll(".aw-hero__sub, .aw-hero__meta"),
            { opacity: 0, y: 22, duration: 0.65, stagger: 0.1 },
            "-=.4"
          )
          .from(ref.current!.querySelector(".aw-hero__card"), { opacity: 0, y: 34, duration: 0.8 }, "-=.5");
      }, ref);
    });
    return () => {
      cancel();
      if (ctx) ctx.revert();
    };
  }, [ready]);

  return (
    <section className="aw-hero aw-grain" ref={ref} id="top">
      <AwCanvas />
      <div className="aw-hero__grid">
        <div className="aw-hero__copy">
          <span className="aw-hero__eyebrow">
            <span className="aw-hero__eyebrow-dot" />
            Free live Open House — Founding Cohort
          </span>
          <h1
            className="aw-hero__h1"
            aria-label="Learn with Claude. Build through Colaberry. Deploy in the real world."
          >
            <span className="aw-line" aria-hidden="true">
              <span className="aw-line__mask">
                <span className="aw-line__word">
                  <AwChars text="Learn" />
                  <span className="aw-ch aw-line__dot--blue">.</span>
                </span>
              </span>
              <span className="aw-line__note aw-line__note--blue">01 — with Claude</span>
            </span>
            <span className="aw-line" aria-hidden="true">
              <span className="aw-line__mask">
                <span className="aw-line__word">
                  <AwChars text="Build" />
                  <span className="aw-ch aw-line__dot--green">.</span>
                </span>
              </span>
              <span className="aw-line__note aw-line__note--green">02 — through Colaberry</span>
            </span>
            <span className="aw-line" aria-hidden="true">
              <span className="aw-line__mask">
                <span className="aw-line__word">
                  <AwChars text="Deploy" />
                  <span className="aw-ch aw-line__dot--red">.</span>
                </span>
              </span>
              <span className="aw-line__note aw-line__note--red">03 — in the real world</span>
            </span>
          </h1>
          <p className="aw-hero__sub">
            AI isn&apos;t replacing people. <strong>It&apos;s replacing the people who don&apos;t know how to build
            with it.</strong> Join our free Open House and see how professionals, career changers, and aspiring
            builders turn ideas into AI systems that solve real problems.
          </p>
          <div className="aw-hero__meta">
            <span>
              <I n="calendar-days" />
              June 21, 2026
            </span>
            <span>
              <I n="monitor" />
              Live online event
            </span>
            <span>
              <I n="badge-check" />
              <b>Free</b> registration
            </span>
          </div>
        </div>
        <div className="aw-hero__card">
          <RegCard />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why + Stats + Who                                                  */
/* ------------------------------------------------------------------ */

function AwWhy() {
  const items = [
    "How modern AI systems are built",
    "How Claude is being used in real-world applications",
    "What students build inside the Accelerator",
    "How to turn your own idea into an AI project",
    "How to access Founding Cohort pricing",
  ];
  return (
    <section className="aw-section" data-rv-group>
      <div className="aw-why">
        <div data-rv>
          <span className="aw-kicker aw-kicker--red">
            <span className="aw-kicker__n">01</span>Why attend
          </span>
          <h2 className="aw-h2">
            Most people are <span className="is-red">consuming</span> AI.
            <br />
            Very few can <span className="is-red">build</span> with it.
          </h2>
          <p className="aw-why__p">
            In this free Open House you&apos;ll learn how to move from AI user to AI builder — and exactly what that
            journey looks like.
          </p>
        </div>
        <div className="aw-checklist">
          {items.map((t, i) => (
            <div className="aw-check" data-rv key={i}>
              <span className="aw-check__n">{"0" + (i + 1)}</span>
              <span className="aw-check__t">{t}</span>
              <I n="check" s={20} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AwStats() {
  const ref = React.useRef<HTMLDivElement>(null);
  const ready = useLibs();
  const stats = [
    { n: 5000, suffix: "+", label: "careers changed since 2012", em: true },
    { n: 49, suffix: "", label: "countries with Colaberry learners" },
    { n: 12, suffix: "", label: "weeks from idea to working AI system" },
    { n: 90, suffix: "", label: "minutes of live demos, stories & Q&A" },
  ];
  const fmt = (v: number) => v.toLocaleString("en-US");
  React.useEffect(() => {
    if (!ready || !window.gsap || !ref.current) return;
    const ctx = window.gsap.context(() => {
      const els = ref.current!.querySelectorAll("[data-count]");
      els.forEach((el: Element) => {
        const target = parseInt(el.getAttribute("data-count") || "0", 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const obj = { v: 0 };
        window.gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = fmt(Math.round(obj.v)) + suffix;
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [ready]);
  return (
    <div className="aw-stats" ref={ref}>
      <div className="aw-stats__grid">
        {stats.map((s, i) => (
          <div className="aw-stat" key={i}>
            <div className="aw-stat__n">
              {s.em ? (
                <em data-count={s.n} data-suffix={s.suffix}>
                  {fmt(s.n) + s.suffix}
                </em>
              ) : (
                <span data-count={s.n} data-suffix={s.suffix}>
                  {fmt(s.n) + s.suffix}
                </span>
              )}
            </div>
            <div className="aw-stat__l">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AwWho() {
  const aud = [
    { c: "var(--blue-500)", icon: "route", h: "Career Changers", p: "Looking for a practical path into AI." },
    {
      c: "var(--green-600)",
      icon: "briefcase",
      h: "Working Professionals",
      p: "Wanting to stay relevant as AI transforms their industry.",
    },
    {
      c: "var(--red-500)",
      icon: "blocks",
      h: "Builders & Entrepreneurs",
      p: "Ready to turn ideas into products and opportunities.",
    },
    {
      c: "var(--blue-600)",
      icon: "terminal",
      h: "Developers & Technical Pros",
      p: "Looking to move beyond prompts and learn real AI systems.",
    },
  ];
  return (
    <section className="aw-section" data-rv-group>
      <div className="aw-who__head" data-rv>
        <div>
          <span className="aw-kicker aw-kicker--blue">
            <span className="aw-kicker__n">02</span>Who is this for
          </span>
          <h2 className="aw-h2">
            Built for the people who
            <br />
            refuse to be left behind
          </h2>
        </div>
      </div>
      <div className="aw-who__grid">
        {aud.map((a, i) => (
          <div className="aw-whocard" data-rv key={i} style={{ "--_c": a.c } as Vars}>
            <span className="aw-whocard__n">{"0" + (i + 1)}</span>
            <div className="aw-whocard__icon">
              <I n={a.icon} />
            </div>
            <h3>{a.h}</h3>
            <p>{a.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Blueprint-style system schematics                                  */
/* ------------------------------------------------------------------ */

function AwIlloFrame({
  children,
  label,
  viewBox = "0 0 300 230",
}: {
  children: React.ReactNode;
  label?: string;
  viewBox?: string;
}) {
  return (
    <div className="aw-illo">
      <svg viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {children}
      </svg>
      {label ? <span className="aw-illo__cap">{label}</span> : null}
    </div>
  );
}

function AwIlloLearn() {
  const line = "var(--neutral-300)";
  const ink = "var(--neutral-500)";
  const c = "var(--blue-500)";
  return (
    <AwIlloFrame label="FIG. 01 — PROMPT → MODEL → SKILL">
      <rect x="14" y="58" width="92" height="64" rx="10" stroke={ink} strokeWidth="2" />
      <line x1="28" y1="78" x2="92" y2="78" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="92" x2="78" y2="92" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="106" x2="86" y2="106" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <text x="14" y="44" className="aw-illo__t">
        PROMPT
      </text>
      <path d="M106 90 H 138" stroke={c} strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" className="aw-illo__dash" />
      <circle cx="172" cy="90" r="32" stroke={c} strokeWidth="2.5" />
      <circle cx="172" cy="90" r="20" stroke={line} strokeWidth="2" strokeDasharray="2 5" className="aw-illo__dash" />
      <circle cx="172" cy="90" r="5" fill={c} />
      <text x="146" y="142" className="aw-illo__t">
        CLAUDE
      </text>
      <path d="M204 90 H 236" stroke={c} strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" className="aw-illo__dash" />
      <rect x="236" y="62" width="50" height="16" rx="6" stroke={ink} strokeWidth="2" />
      <rect x="236" y="84" width="50" height="16" rx="6" stroke={ink} strokeWidth="2" />
      <rect x="236" y="106" width="50" height="16" rx="6" stroke={c} strokeWidth="2.5" />
      <text x="236" y="44" className="aw-illo__t">
        SKILLS
      </text>
      <circle cx="40" cy="180" r="2" fill={line} />
      <circle cx="70" cy="180" r="2" fill={line} />
      <circle cx="100" cy="180" r="2" fill={line} />
      <circle cx="130" cy="180" r="2" fill={line} />
      <circle cx="160" cy="180" r="2" fill={line} />
      <circle cx="190" cy="180" r="2" fill={c} />
    </AwIlloFrame>
  );
}

function AwIlloBuild() {
  const line = "var(--neutral-300)";
  const ink = "var(--neutral-500)";
  const c = "var(--green-600)";
  return (
    <AwIlloFrame label="FIG. 02 — YOUR AGENT TEAM">
      <rect x="112" y="22" width="76" height="40" rx="10" stroke={c} strokeWidth="2.5" />
      <circle cx="150" cy="42" r="6" fill={c} />
      <text x="112" y="14" className="aw-illo__t">
        ORCHESTRATOR
      </text>
      <path
        d="M150 62 V 88 M150 88 H 60 M150 88 H 240 M60 88 V 112 M150 88 V 112 M240 88 V 112"
        stroke={line}
        strokeWidth="2"
        strokeDasharray="3 6"
        className="aw-illo__dash"
      />
      <rect x="28" y="112" width="64" height="48" rx="10" stroke={ink} strokeWidth="2" />
      <circle cx="60" cy="130" r="7" stroke={c} strokeWidth="2" />
      <line x1="44" y1="148" x2="76" y2="148" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <rect x="118" y="112" width="64" height="48" rx="10" stroke={ink} strokeWidth="2" />
      <circle cx="150" cy="130" r="7" stroke={c} strokeWidth="2" />
      <line x1="134" y1="148" x2="166" y2="148" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <rect x="208" y="112" width="64" height="48" rx="10" stroke={ink} strokeWidth="2" />
      <circle cx="240" cy="130" r="7" stroke={c} strokeWidth="2" />
      <line x1="224" y1="148" x2="256" y2="148" stroke={line} strokeWidth="2" strokeLinecap="round" />
      <text x="28" y="178" className="aw-illo__t">
        AGENT 01
      </text>
      <text x="118" y="178" className="aw-illo__t">
        AGENT 02
      </text>
      <text x="208" y="178" className="aw-illo__t">
        AGENT 03
      </text>
      <path d="M252 36 l5 5 9 -10" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="244" y="24" width="30" height="30" rx="8" stroke={line} strokeWidth="2" />
    </AwIlloFrame>
  );
}

function AwIlloDeploy() {
  const line = "var(--neutral-300)";
  const ink = "var(--neutral-500)";
  const c = "var(--red-500)";
  return (
    <AwIlloFrame label="FIG. 03 — SHIP TO PRODUCTION">
      <rect x="20" y="64" width="74" height="20" rx="6" stroke={ink} strokeWidth="2" />
      <rect x="20" y="90" width="74" height="20" rx="6" stroke={ink} strokeWidth="2" />
      <rect x="20" y="116" width="74" height="20" rx="6" stroke={c} strokeWidth="2.5" />
      <circle cx="32" cy="74" r="2.5" fill={c} />
      <circle cx="32" cy="100" r="2.5" fill={line} />
      <circle cx="32" cy="126" r="2.5" fill={c} />
      <text x="20" y="50" className="aw-illo__t">
        YOUR SYSTEM
      </text>
      <path d="M94 100 H 140" stroke={c} strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" className="aw-illo__dash" />
      <path d="M132 92 l10 8 -10 8" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="196" cy="100" r="40" stroke={ink} strokeWidth="2" />
      <ellipse cx="196" cy="100" rx="18" ry="40" stroke={line} strokeWidth="2" />
      <line x1="156" y1="100" x2="236" y2="100" stroke={line} strokeWidth="2" />
      <text x="172" y="162" className="aw-illo__t">
        REAL WORLD
      </text>
      <circle cx="262" cy="58" r="9" stroke={c} strokeWidth="2" />
      <path d="M249 84 a13 11 0 0 1 26 0" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="284" cy="106" r="7" stroke={ink} strokeWidth="2" />
      <path d="M274 126 a10 9 0 0 1 20 0" stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M228 72 L 250 62 M232 96 L 274 102" stroke={line} strokeWidth="2" strokeDasharray="3 6" className="aw-illo__dash" />
    </AwIlloFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Framework — pinned horizontal panels on desktop, vertical otherwise */
/* ------------------------------------------------------------------ */

function AwFramework() {
  const ref = React.useRef<HTMLElement>(null);
  const ready = useLibs();
  React.useEffect(() => {
    if (!ready || !window.gsap || !ref.current) return;
    const mm = window.gsap.matchMedia();
    mm.add("(min-width: 1100px)", () => {
      const section = ref.current!;
      const track = section.querySelector(".aw-fw__track");
      section.setAttribute("data-h", "1");
      window.gsap.to(track, {
        xPercent: -66.666,
        ease: "none",
        scrollTrigger: { trigger: section, pin: true, scrub: 1, end: "+=180%", anticipatePin: 1 },
      });
      return () => section.removeAttribute("data-h");
    });
    return () => mm.revert();
  }, [ready]);

  const steps = [
    {
      c: "var(--blue-500)",
      k: "aw-kicker--blue",
      n: "01",
      illo: <AwIlloLearn />,
      h: (
        <>
          Learn with <em>Claude</em>
        </>
      ),
      p: "Learn the concepts, workflows, and capabilities behind modern AI systems.",
    },
    {
      c: "var(--green-600)",
      k: "aw-kicker--green",
      n: "02",
      illo: <AwIlloBuild />,
      h: (
        <>
          Build through <em>Colaberry</em>
        </>
      ),
      p: "Apply what you learn by building your own project with expert guidance.",
    },
    {
      c: "var(--red-500)",
      k: "aw-kicker--red",
      n: "03",
      illo: <AwIlloDeploy />,
      h: (
        <>
          Deploy in the <em>real world</em>
        </>
      ),
      p: "Create something that solves a real problem and demonstrates real capability.",
    },
  ];
  return (
    <section className="aw-fw" ref={ref} id="framework">
      <div className="aw-fw__stage">
        <div className="aw-fw__track">
          {steps.map((s, i) => (
            <div className="aw-fw__panel" key={i} style={{ "--_c": s.c } as Vars}>
              <div className="aw-fw__inner">
                <span className="aw-fw__big" aria-hidden="true">
                  {s.n}
                </span>
                <div className="aw-fw__body">
                  <span className={"aw-kicker " + s.k}>
                    <span className="aw-kicker__n">{s.n}</span>The framework
                  </span>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
                {s.illo}
              </div>
            </div>
          ))}
        </div>
        <span className="aw-fw__hint">
          <I n="move-horizontal" s={15} />
          Scroll
        </span>
      </div>
    </section>
  );
}

function AwSee() {
  const items = [
    {
      bg: "var(--surface-blue-subtle)",
      c: "var(--blue-600)",
      icon: "monitor-play",
      h: "Live AI demonstrations",
      p: "See modern AI systems and workflows in action.",
    },
    {
      bg: "var(--surface-green-subtle)",
      c: "var(--green-700)",
      icon: "trophy",
      h: "Student success stories",
      p: "Hear how students transformed ideas into working projects.",
    },
    {
      bg: "var(--surface-blue-subtle)",
      c: "var(--blue-600)",
      icon: "messages-square",
      h: "Live Q&A",
      p: "Ask questions about careers, projects, and the future of AI.",
    },
    {
      bg: "var(--surface-brand-subtle)",
      c: "var(--red-600)",
      icon: "sparkles",
      h: "Founding Cohort reveal",
      p: "An inside look at the Accelerator and exclusive founding cohort pricing.",
    },
  ];
  return (
    <section className="aw-section" data-rv-group>
      <div data-rv>
        <span className="aw-kicker aw-kicker--red">
          <span className="aw-kicker__n">04</span>The Open House
        </span>
        <h2 className="aw-h2">90 minutes. Zero sales pitch.</h2>
      </div>
      <div className="aw-see__rows">
        {items.map((s, i) => (
          <div className="aw-seerow" data-rv key={i} style={{ "--_bg": s.bg, "--_c": s.c } as Vars}>
            <span className="aw-seerow__n">{"0" + (i + 1)}</span>
            <span className="aw-seerow__icon">
              <I n={s.icon} />
            </span>
            <h3>{s.h}</h3>
            <p>{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Program — dark band, sticky rail + stacked cards                   */
/* ------------------------------------------------------------------ */

function AwProgram() {
  const ref = React.useRef<HTMLElement>(null);
  const ready = useLibs();
  const phases = [
    {
      tone: "blue",
      wk: "WEEKS 01–03",
      rail: "01–03",
      name: "Build your AI foundation",
      h: "Build your AI foundation",
      p: "Create your AI workspace, learn modern AI workflows, and build your first working AI system.",
      chips: ["AI workspace", "Modern workflows", "First working system"],
      outcome: false,
    },
    {
      tone: "green",
      wk: "WEEKS 04–06",
      rail: "04–06",
      name: "Create your AI team",
      h: "Create your AI team",
      p: "Design and deploy AI agents that work together to solve real problems and automate workflows.",
      chips: ["Agent design", "Multi-agent teamwork", "Automation"],
      outcome: false,
    },
    {
      tone: "teal",
      wk: "WEEKS 07–09",
      rail: "07–09",
      name: "Connect AI to the real world",
      h: "Connect AI to the real world",
      p: "Integrate your system with real data, tools, and business processes using modern AI infrastructure.",
      chips: ["Real data", "Tool integrations", "Business processes"],
      outcome: false,
    },
    {
      tone: "red",
      wk: "WEEKS 10–12",
      rail: "10–12",
      name: "Design AI that scales",
      h: "Design AI that scales",
      p: "Build a production-ready AI solution with architecture, governance, deployment planning, and long-term scalability.",
      chips: ["Architecture", "Governance", "Deployment plan"],
      outcome: false,
    },
    {
      tone: "green",
      outcome: true,
      wk: "FINAL OUTCOME",
      rail: "DONE",
      name: "Your working system",
      h: "Bring your idea. Leave with a working system.",
      p: null,
      chips: ["Working AI system", "Portfolio-ready project", "Reusable framework"],
    },
  ];

  React.useEffect(() => {
    if (!ready || !window.gsap || !window.ScrollTrigger || !ref.current) return;
    const root = ref.current;
    const wkEl = root.querySelector("[data-rail-wk]") as HTMLElement | null;
    const phEl = root.querySelector("[data-rail-phase]") as HTMLElement | null;
    const dots = root.querySelectorAll(".aw-rail__dot");
    const cards = root.querySelectorAll(".aw-pcard");
    const ctx = window.gsap.context(() => {
      cards.forEach((card: Element, i: number) => {
        window.ScrollTrigger.create({
          trigger: card,
          start: "top-=14 55%",
          end: "bottom+=14 55%",
          onToggle: (self: any) => {
            if (!self.isActive) return;
            if (wkEl) wkEl.textContent = phases[i].rail;
            if (phEl) phEl.textContent = phases[i].name;
            dots.forEach((d, j) => d.classList.toggle("is-on", j <= i));
          },
        });
        if (i > 0) {
          window.ScrollTrigger.create({
            trigger: card,
            start: "top 80%",
            onEnter: () => cards[i - 1].classList.add("is-behind"),
            onLeaveBack: () => cards[i - 1].classList.remove("is-behind"),
          });
        }
      });
    }, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <section className="aw-prog aw-grain aw-grain--light" ref={ref}>
      <div className="aw-prog__inner">
        <div className="aw-prog__head" data-rv>
          <span className="aw-kicker aw-kicker--green">
            <span className="aw-kicker__n">05</span>The Accelerator
          </span>
          <h2 className="aw-h2">12 weeks from AI consumer to AI builder</h2>
          <p>
            An implementation-focused program designed to help you build, deploy, and scale a real AI system —
            start to finish.
          </p>
        </div>
        <div className="aw-prog__grid">
          <aside className="aw-rail" aria-hidden="true">
            <div className="aw-rail__label">You are here</div>
            <div className="aw-rail__wk">
              <small>WEEKS</small>
              <span data-rail-wk>01–03</span>
            </div>
            <div className="aw-rail__phase" data-rail-phase>
              Build your AI foundation
            </div>
            <div className="aw-rail__dots">
              {phases.map((_, i) => (
                <span className={"aw-rail__dot" + (i === 0 ? " is-on" : "")} key={i} />
              ))}
            </div>
          </aside>
          <div className="aw-prog__stack">
            {phases.map((ph, i) => (
              <article
                className={"aw-pcard aw-pcard--" + ph.tone + (ph.outcome ? " aw-pcard--outcome" : "")}
                key={i}
              >
                <div className="aw-pcard__top">
                  <span className="aw-pcard__wk">{ph.wk}</span>
                  <span className="aw-pcard__ix">{"0" + (i + 1) + " / 05"}</span>
                </div>
                <h3>{ph.h}</h3>
                {ph.outcome ? (
                  <p>
                    Walk away with a <strong>working AI system</strong>, a <strong>portfolio-ready project</strong>,
                    and a framework you can use again and again.
                  </p>
                ) : (
                  <p>{ph.p}</p>
                )}
                <div className="aw-pcard__chips">
                  {ph.chips.map((c, j) => (
                    <span className="aw-pcard__chip" key={j}>
                      {c}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Magnetic hover wrapper (fine pointers + motion only). */
function Magnetic({ children, strength = 0.32 }: { children: React.ReactNode; strength?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.gsap) return;
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      window.gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: "power3.out" });
    };
    const onLeave = () => window.gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);
  return (
    <div ref={ref} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}

function AwFinal() {
  return (
    <section className="aw-final aw-grain aw-grain--light" id="reserve">
      <img className="aw-final__mark" src={MARK_WHITE} alt="" aria-hidden="true" />
      <div className="aw-final__inner">
        <span className="aw-final__kicker">FREE — JUNE 21, 2026 — LIVE ONLINE</span>
        <h2 className="aw-final__h">Save your seat.</h2>
        <p className="aw-final__p">
          Seats are limited for this live event. Register today and see how AI builders are creating the next
          generation of products, careers, and opportunities.
        </p>
        <span className="aw-final__btn">
          <Magnetic>
            <Button
              size="lg"
              as="a"
              href={REGISTER_URL}
              target="_blank"
              rel="noopener"
              trailingIcon={<I n="arrow-right" s={18} />}
            >
              Reserve my free seat
            </Button>
          </Magnetic>
        </span>
        <div className="aw-final__meta">NO DEGREE REQUIRED — NO TESTS — JUST BRING AN IDEA</div>
      </div>
    </section>
  );
}

function AwFooter() {
  return (
    <footer className="aw-footer">
      <div className="aw-footer__inner">
        <div className="aw-footer__brand">
          <img src={LOGO_WHITE} alt="Colaberry" style={{ height: 30, display: "block" }} />
          <p>
            Learn with Claude. Build through Colaberry. Deploy in the real world. Helping people move from AI
            consumer to AI builder since 2012.
          </p>
        </div>
        <div className="aw-footer__meta">
          <span>
            <I n="calendar-days" s={16} />
            June 21, 2026 · Free Open House
          </span>
          <span>
            <I n="monitor" s={16} />
            Live online event
          </span>
          <span>
            <I n="map-pin" s={16} />
            Plano, TX · Boston, MA
          </span>
        </div>
      </div>
      <span className="aw-footer__word" aria-hidden="true">
        colaberry
      </span>
      <div className="aw-footer__bar">
        <div>
          <span>© 2026 Colaberry, Inc. · Texas Workforce Commission approved</span>
          <span className="aw-footer__links">
            <a href="https://colaberry.com" target="_blank" rel="noopener">
              colaberry.com
            </a>
            <a href="https://training.colaberry.com" target="_blank" rel="noopener">
              training.colaberry.com
            </a>
            <a href={REGISTER_URL} target="_blank" rel="noopener">
              Register
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function AiAcceleratorOpenHouse() {
  const ready = useLibs();

  // Lucide: redraw icons for a few seconds after mount (component icons mount lazily).
  React.useEffect(() => {
    drawIcons();
    const t = window.setInterval(drawIcons, 400);
    const stop = window.setTimeout(() => window.clearInterval(t), 3000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, []);

  // Generic scroll reveals for [data-rv] groups — armed only once visible.
  React.useEffect(() => {
    if (!ready || !window.gsap || !window.ScrollTrigger) return;
    let ctx: any = null;
    const cancel = awWhenVisible(() => {
      ctx = window.gsap.context(() => {
        document.querySelectorAll("[data-rv-group]").forEach((group) => {
          const els = group.querySelectorAll("[data-rv]");
          if (!els.length) return;
          window.gsap.from(els, {
            y: 44,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: group, start: "top 74%", once: true },
          });
        });
        window.ScrollTrigger.refresh();
      });
    });
    return () => {
      cancel();
      if (ctx) ctx.revert();
    };
  }, [ready]);

  return (
    <>
      <Head>
        <title>AI Systems Architect Accelerator — Free Open House | Colaberry</title>
        <meta
          name="description"
          content="Free live Open House — June 21, 2026. Learn with Claude, build through Colaberry, deploy in the real world. See how the 12-week AI Systems Architect Accelerator turns your idea into a working AI system."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AI Systems Architect Accelerator — Free Open House" />
        <meta
          property="og:description"
          content="Learn with Claude. Build through Colaberry. Deploy in the real world. Free live Open House — June 21, 2026."
        />
        <meta property="og:image" content="/ai-accelerator/logo/og-1200x630.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Systems Architect Accelerator — Free Open House" />
        <meta
          name="twitter:description"
          content="Learn with Claude. Build through Colaberry. Deploy in the real world. Free live Open House — June 21, 2026."
        />
        <meta name="twitter:image" content="/ai-accelerator/logo/og-1200x630.png" />
        <link rel="icon" href="/ai-accelerator/logo/favicon-32.png" />
        <link rel="stylesheet" href="/ai-accelerator/styles.css" />
      </Head>

      <Script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js" strategy="afterInteractive" onLoad={drawIcons} />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="afterInteractive" />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
        strategy="afterInteractive"
      />

      <noscript>
        <div
          style={{
            maxWidth: 560,
            margin: "80px auto",
            padding: "0 24px",
            fontFamily: "Roboto, Arial, sans-serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 28 }}>AI Systems Architect Accelerator — Free Open House</h1>
          <p style={{ fontSize: 17, color: "#4A4A4A" }}>
            June 21, 2026 · Live online · Free. This page needs JavaScript — or register directly at{" "}
            <a href={REGISTER_URL} style={{ color: "#E5121D" }}>
              learn.colaberry.com
            </a>
            .
          </p>
        </div>
      </noscript>

      <div className="aw">
        <a className="aw-skip" href="#main">
          Skip to content
        </a>
        <AwNav />
        <main id="main">
          <AwHero />
          <AwMarquee />
          <AwWhy />
          <AwStats />
          <AwWho />
          <AwFramework />
          <AwSee />
          <AwProgram />
          <AwFinal />
        </main>
        <AwFooter />
      </div>
    </>
  );
}
