"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logoFull from "@/assets/brand/logo-full.webp";
import { buttonClasses } from "@/components/ui/Button";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function post(path: string, body: unknown) {
  const res = await fetch(`${base}/api/admin/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    challenge?: string;
    sentTo?: string;
    expired?: boolean;
  };
  return { ok: res.ok && data.ok !== false, ...data };
}

const input =
  "w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-3 text-ink outline-none focus:border-royal focus:ring-4 focus:ring-royal/15";

/** Admin sign-in: email and password, then a 6-digit code sent by email. */
export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode() {
    setBusy(true);
    setError("");
    setInfo("");
    const r = await post("login", { email, password });
    setBusy(false);
    if (!r.ok || !r.challenge) return setError(r.error ?? "Could not sign in. Please try again.");
    setChallenge(r.challenge);
    setSentTo(r.sentTo ?? email);
    setCode("");
    setStep("code");
  }

  async function verify() {
    setBusy(true);
    setError("");
    const r = await post("verify", { challenge, code });
    setBusy(false);
    if (r.ok) return onSignedIn();
    setError(r.error ?? "Could not verify the code.");
    if (r.expired) {
      setStep("password");
      setPassword("");
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[#f3f6fb] p-5">
      <div className="gloss w-full max-w-md rounded-[1.75rem] border border-line/80 bg-white p-7 shadow-lift sm:p-9">
        <Image src={logoFull} alt="Stallion Connect" className="h-11 w-auto" priority />
        <p className="mt-7 font-display text-xs font-semibold tracking-[0.16em] text-brand-green uppercase">
          Staff login
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          {step === "password" ? "Sign in to the admin panel" : "Check your email"}
        </h1>

        {step === "password" ? (
          <form
            className="mt-6 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void requestCode();
            }}
          >
            <label className="grid gap-1.5 text-sm font-semibold text-navy">
              Email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-navy">
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
              />
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-[#fdecea] px-3.5 py-2.5 text-sm text-[#8a1f17]"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className={buttonClasses({ className: "mt-1 w-full" })}
            >
              {busy ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form
            className="mt-4 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <p className="text-muted">
              We sent a 6-digit code to <strong className="text-navy">{sentTo}</strong>. It expires
              in 10 minutes.
            </p>
            <label className="grid gap-1.5 text-sm font-semibold text-navy">
              Code
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={`${input} text-center font-display text-2xl tracking-[0.5em]`}
              />
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-[#fdecea] px-3.5 py-2.5 text-sm text-[#8a1f17]"
              >
                {error}
              </p>
            )}
            {info && <p className="text-sm text-brand-green-dark">{info}</p>}
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className={buttonClasses({ className: "w-full" })}
            >
              {busy ? "Verifying..." : "Sign in"}
            </button>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("password");
                  setError("");
                }}
                className="font-semibold text-navy hover:underline"
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  await requestCode();
                  setInfo("A new code is on its way.");
                }}
                className="font-semibold text-navy hover:underline"
              >
                Send a new code
              </button>
            </div>
          </form>
        )}

        <Link href="/" className="mt-7 inline-block text-sm text-muted hover:text-navy">
          Back to the website
        </Link>
      </div>
    </main>
  );
}
