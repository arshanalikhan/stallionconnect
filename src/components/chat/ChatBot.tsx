"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormDialog } from "@/components/forms/FormDialogs";
import { Icon } from "@/components/ui/Icon";
import { site, whatsappUrl } from "@/config/site";
import { actionLabels, fallback, faqs, greeting, menu, type ChatAction } from "@/content/chatbot";
import { cn } from "@/lib/cn";
import {
  applicationSchema,
  enquirySchema,
  experienceOptions,
  HONEYPOT_FIELD,
  roleOptions,
  serviceOptions,
  teamSizeOptions,
} from "@/lib/forms/schemas";
import { isStaticPreview } from "@/lib/forms/submit";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type LinkOut = { label: string; href: string; external?: boolean };
type Msg = { id: number; from: "bot" | "user"; text: string; links?: LinkOut[] };
type Chip = { label: string; value: string };

/* ---------- guided flows ---------- */

type Field = {
  key: string;
  ask: (d: Record<string, unknown>) => string;
  choices?: readonly string[];
  optional?: boolean;
  consent?: boolean;
  multiline?: boolean;
  inputType?: string;
};

const first = (d: Record<string, unknown>) => String(d.name ?? "").split(" ")[0] || "there";

const quoteFields: Field[] = [
  { key: "name", ask: () => "Great, let's get you a quote. What's your full name?" },
  {
    key: "company",
    ask: (d) => `Thanks, ${first(d)}. Which company are you with?`,
    optional: true,
  },
  { key: "email", ask: () => "What's the best email address to reach you?", inputType: "email" },
  {
    key: "phone",
    ask: () => "And a phone number? Add the country code if you're outside India.",
    inputType: "tel",
  },
  { key: "service", ask: () => "Which service do you need?", choices: serviceOptions },
  {
    key: "teamSize",
    ask: () => "Roughly how big a team do you have in mind?",
    choices: teamSizeOptions,
  },
  {
    key: "message",
    ask: () =>
      "Tell me a little about your process: volumes, languages, hours and when you'd like to start.",
    multiline: true,
  },
  {
    key: "consent",
    ask: () =>
      "Can we store these details and contact you about this enquiry, as described in our privacy policy?",
    consent: true,
  },
];

const applyFields: Field[] = [
  { key: "name", ask: () => "Happy to help you apply. What's your full name?" },
  {
    key: "email",
    ask: (d) => `Thanks, ${first(d)}. What's your email address?`,
    inputType: "email",
  },
  { key: "phone", ask: () => "And your phone number?", inputType: "tel" },
  { key: "role", ask: () => "Which role are you interested in?", choices: roleOptions },
  {
    key: "experience",
    ask: () => "How much work experience do you have?",
    choices: experienceOptions,
  },
  { key: "city", ask: () => "Which city are you in?", optional: true },
  { key: "languages", ask: () => "Which languages do you speak?", optional: true },
  {
    key: "consent",
    ask: () =>
      "Can we store your details for recruitment and contact you about this application, as described in our privacy policy?",
    consent: true,
  },
];

const flows = {
  quote: {
    fields: quoteFields,
    schema: enquirySchema,
    kind: "enquiries" as const,
    endpoint: "/api/enquiries",
  },
  apply: {
    fields: applyFields,
    schema: applicationSchema,
    kind: "applications" as const,
    endpoint: "/api/applications",
  },
};
type FlowName = keyof typeof flows;

const labels: Record<string, string> = {
  name: "Name",
  company: "Company",
  email: "Email",
  phone: "Phone",
  service: "Service",
  teamSize: "Team size",
  message: "Requirements",
  role: "Role",
  experience: "Experience",
  city: "City",
  languages: "Languages",
};

/** Finds the FAQ that best matches what the visitor typed. */
function matchFaq(text: string) {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9/+ ]+/g, " ")} `;
  let best: (typeof faqs)[number] | undefined;
  let score = 0;
  for (const f of faqs) {
    const s = f.keywords.reduce(
      (n, k) => n + (t.includes(` ${k} `) || (k.length > 4 && t.includes(k)) ? k.length : 0),
      0,
    );
    if (s > score) {
      score = s;
      best = f;
    }
  }
  return best;
}

const chipFor = (v: string | ChatAction): Chip => {
  const f = faqs.find((x) => x.id === v);
  return { label: f ? f.label : (actionLabels[v as ChatAction] ?? v), value: v };
};

/* ---------- component ---------- */

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  /** The question currently being asked in a flow (drives the input hints). */
  const [field, setField] = useState<Field | undefined>();
  const flow = useRef<{ name: FlowName; step: number; data: Record<string, unknown> } | null>(null);
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { open: openForm } = useFormDialog();

  const push = useCallback((m: Omit<Msg, "id">) => {
    setMsgs((list) => [...list, { ...m, id: nextId.current++ }]);
  }, []);

  /** Bot replies after a short "typing" pause so it reads naturally. */
  const say = useCallback(
    (text: string, next: Chip[] = [], links?: LinkOut[]) => {
      setChips([]);
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        push({ from: "bot", text, links });
        setChips(next);
      }, 450);
    },
    [push],
  );

  const showMenu = useCallback(
    (text = "Anything else I can help with?") => say(text, menu.map(chipFor)),
    [say],
  );

  useEffect(() => {
    // Focus the input on desktop only; on phones it would pop the keyboard open.
    if (open && window.matchMedia("(pointer: fine)").matches)
      window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const toggle = () => {
    // Greeting on first open.
    if (!open && msgs.length === 0) say(greeting, menu.map(chipFor));
    setOpen((v) => !v);
    setTeaser(false);
  };

  // Keep the newest message in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, chips]);

  // A small hello bubble once per visit, after a while on the page.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("sc-chat-teaser") === "1";
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = window.setTimeout(() => {
      setTeaser(true);
      try {
        sessionStorage.setItem("sc-chat-teaser", "1");
      } catch {
        /* ignore */
      }
    }, 9000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* ----- flows ----- */

  const askCurrent = useCallback(() => {
    const f = flow.current!;
    const field = flows[f.name].fields[f.step];
    setField(field);
    const opts: Chip[] = field.choices
      ? field.choices.map((c) => ({ label: c, value: c }))
      : field.consent
        ? [
            { label: "Yes, I agree", value: "__yes" },
            { label: "No", value: "__no" },
          ]
        : field.optional
          ? [{ label: "Skip", value: "__skip" }]
          : [];
    say(
      field.ask(f.data),
      opts,
      field.consent ? [{ label: "Privacy policy", href: "/privacy" }] : undefined,
    );
  }, [say]);

  const startFlow = useCallback(
    (name: FlowName) => {
      flow.current = { name, step: 0, data: { source: "chatbot" } };
      askCurrent();
    },
    [askCurrent],
  );

  const summary = (name: FlowName, d: Record<string, unknown>) =>
    flows[name].fields
      .filter((f) => !f.consent)
      .map((f) => `${labels[f.key]}: ${String(d[f.key] ?? "") || "-"}`)
      .join("\n");

  const submit = useCallback(async () => {
    const f = flow.current!;
    const cfg = flows[f.name];
    const parsed = cfg.schema.safeParse(f.data);
    if (!parsed.success) {
      flow.current = null;
      say("Something in those details didn't look right. Let's try again, or use the full form.", [
        chipFor(f.name),
        chipFor("form"),
      ]);
      return;
    }
    const doneText =
      f.name === "quote"
        ? `Thank you, ${first(f.data)}! Your enquiry is registered. Our team will get back to you within one working day.`
        : `Thank you, ${first(f.data)}! Your application is registered. Please email your CV to ${site.contact.careersEmail} with your name and the role in the subject line.`;

    if (isStaticPreview) {
      const { demoStore } = await import("@/lib/admin/demo");
      demoStore.add(cfg.kind, parsed.data as Record<string, unknown>);
      flow.current = null;
      say(
        `${doneText}\n\n(Preview site: nothing was sent. The enquiry was saved in this browser so you can see it in the demo admin panel.)`,
        menu.map(chipFor),
        [{ label: "Open demo admin", href: `/admin/${cfg.kind}` }],
      );
      return;
    }

    setTyping(true);
    try {
      const res = await fetch(`${basePath}${cfg.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, [HONEYPOT_FIELD]: "" }),
      });
      setTyping(false);
      if (!res.ok) throw new Error();
      flow.current = null;
      say(doneText, menu.map(chipFor));
    } catch {
      setTyping(false);
      say(
        `Sorry, I couldn't send that just now. Please try again in a moment, or email us at ${site.contact.email}.`,
        [{ label: "Try again", value: "__send" }, chipFor("human")],
      );
    }
  }, [say]);

  /** Handles an answer while a flow is running. Returns true if consumed. */
  const answerFlow = useCallback(
    (raw: string): boolean => {
      const f = flow.current;
      if (!f) return false;
      const cfg = flows[f.name];

      if (f.step >= cfg.fields.length) {
        // Summary step
        if (raw === "__send") void submit();
        else if (raw === "__restart") startFlow(f.name);
        else
          say("Please choose Send or Start over.", [
            { label: "Send", value: "__send" },
            { label: "Start over", value: "__restart" },
          ]);
        return true;
      }

      const field = cfg.fields[f.step];
      let value: unknown = raw.trim();

      if (field.consent) {
        const yes = raw === "__yes" || /^(yes|y|ok|okay|agree|sure)\b/i.test(raw);
        const no = raw === "__no" || /^(no|n|nope)\b/i.test(raw);
        if (no) {
          flow.current = null;
          say("No problem, nothing has been saved. You can still reach us directly.", [
            chipFor("human"),
            chipFor("menu"),
          ]);
          return true;
        }
        if (!yes) {
          say("Please choose Yes or No.", [
            { label: "Yes, I agree", value: "__yes" },
            { label: "No", value: "__no" },
          ]);
          return true;
        }
        value = true;
      } else if (raw === "__skip" && field.optional) {
        value = "";
      } else if (field.choices) {
        const hit =
          field.choices.find((c) => c.toLowerCase() === String(value).toLowerCase()) ??
          field.choices.find(
            (c) =>
              c.toLowerCase().includes(String(value).toLowerCase()) && String(value).length > 2,
          );
        if (!hit) {
          say(
            "Please pick one of these options.",
            field.choices.map((c) => ({ label: c, value: c })),
          );
          return true;
        }
        value = hit;
      }

      // Check this one field with the same rules as the website form.
      const shape = cfg.schema.shape as Record<
        string,
        {
          safeParse: (v: unknown) => {
            success: boolean;
            error?: { issues: { message: string }[] };
          };
        }
      >;
      const check = shape[field.key].safeParse(value);
      if (!check.success) {
        say(
          check.error?.issues[0]?.message ?? "That doesn't look right, please try again.",
          field.optional ? [{ label: "Skip", value: "__skip" }] : [],
        );
        return true;
      }

      f.data[field.key] = value;
      f.step++;
      if (f.step < cfg.fields.length) {
        askCurrent();
      } else {
        say(`Here's what I'll send:\n\n${summary(f.name, f.data)}`, [
          { label: f.name === "quote" ? "Send enquiry" : "Send application", value: "__send" },
          { label: "Start over", value: "__restart" },
        ]);
      }
      return true;
    },
    [askCurrent, say, startFlow, submit],
  );

  /* ----- input ----- */

  const handle = useCallback(
    (value: string, label?: string) => {
      const shown = label ?? value;
      if (!value.trim()) return;
      // Do not echo internal values; show the button label instead.
      push({ from: "user", text: shown.startsWith("__") ? "Skip" : shown });
      setChips([]);

      const consumed = answerFlow(value);
      const f = flow.current;
      if (!f || f.step >= flows[f.name].fields.length) setField(undefined);
      if (consumed) return;

      if (value === "quote" || value === "apply") return startFlow(value);
      if (value === "form") return openForm({ type: "quote" });
      if (value === "menu") return showMenu("Here's what I can help with:");
      if (value === "human") {
        return say(
          "You can reach our team directly:",
          [chipFor("quote"), chipFor("menu")],
          [
            { label: "Chat on WhatsApp", href: whatsappUrl(), external: true },
            { label: `Call ${site.contact.phone}`, href: `tel:${site.contact.phoneHref}` },
            { label: `Email ${site.contact.email}`, href: `mailto:${site.contact.email}` },
          ],
        );
      }

      const faq = faqs.find((f) => f.id === value) ?? matchFaq(value);
      if (faq) return say(faq.answer, (faq.next ?? ["menu"]).map(chipFor));

      // Typed requests that mean "quote" or "apply".
      if (/\b(quote|enquir|enquiry|inquir|proposal|hire you|outsourc)/i.test(value))
        return startFlow("quote");
      say(fallback, [chipFor("quote"), chipFor("human"), chipFor("menu")]);
    },
    [answerFlow, openForm, push, say, showMenu, startFlow],
  );

  const send = () => {
    const v = input;
    setInput("");
    handle(v);
  };

  return (
    <>
      {/* Launcher */}
      <div className="fixed right-4 bottom-4 z-[60] flex items-end gap-3 sm:right-6 sm:bottom-6">
        {teaser && !open && (
          <div className="chat-pop relative mb-2 max-w-[220px] rounded-2xl rounded-br-sm border border-white/80 bg-white/95 px-4 py-3 text-sm text-ink shadow-lift backdrop-blur">
            <button
              type="button"
              onClick={() => setTeaser(false)}
              aria-label="Dismiss"
              className="absolute -top-2 -left-2 grid size-6 place-items-center rounded-full bg-white text-xs text-muted shadow"
            >
              &times;
            </button>
            Hi! Questions about our services? <strong className="text-navy">Ask me.</strong>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={open ? "Close chat" : "Open chat"}
          aria-expanded={open}
          aria-controls="chatbot"
          className="relative grid size-14 place-items-center rounded-full bg-linear-to-b from-[#1f5ed6] to-navy text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_12px_30px_-8px_rgb(1_43_117/0.6)] transition hover:scale-105"
        >
          {open ? (
            <span className="text-2xl leading-none">&times;</span>
          ) : (
            <>
              <Icon name="chat" className="size-6" strokeWidth={1.8} />
              <span className="absolute top-0.5 right-0.5 size-3 rounded-full border-2 border-white bg-brand-green-light" />
            </>
          )}
        </button>
      </div>

      {/* Panel */}
      {open && (
        <section
          id="chatbot"
          role="dialog"
          aria-label="Chat with Stallion Connect"
          className="chat-pop fixed inset-x-3 bottom-22 z-[60] flex h-[min(620px,calc(100svh-12rem))] flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-linear-to-b from-white/95 to-[#f4f8fd]/95 shadow-[inset_0_1px_0_#fff,0_40px_80px_-24px_rgb(0_20_60/0.5)] backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[380px]"
        >
          <header className="relative flex items-center gap-3 overflow-hidden bg-linear-to-br from-[#0a3f95] via-navy to-[#04402a] px-5 py-4 text-white">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/15 to-transparent"
            />
            <span className="relative grid size-10 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
              <Icon name="headset" className="size-5" />
            </span>
            <span className="relative">
              <span className="block font-display text-[17px] font-bold">Stallion Assistant</span>
              <span className="flex items-center gap-1.5 text-xs text-white/75">
                <span className="size-2 rounded-full bg-brand-green-light" /> Usually replies
                instantly
              </span>
            </span>
          </header>

          <div
            ref={logRef}
            aria-live="polite"
            className="chat-log flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
          >
            {msgs.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-line",
                    m.from === "user"
                      ? "rounded-br-sm bg-linear-to-b from-[#24b84c] to-[#108a26] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]"
                      : "rounded-bl-sm border border-line/70 bg-white text-ink shadow-[0_1px_2px_rgb(16_24_40/0.05)]",
                  )}
                >
                  {m.text}
                  {m.links && (
                    <span className="mt-2 flex flex-col gap-1.5">
                      {m.links.map((l) =>
                        l.external || l.href.startsWith("tel:") || l.href.startsWith("mailto:") ? (
                          <a
                            key={l.href}
                            href={l.href}
                            target={l.external ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="font-semibold text-royal underline underline-offset-2"
                          >
                            {l.label}
                          </a>
                        ) : (
                          <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="font-semibold text-royal underline underline-offset-2"
                          >
                            {l.label}
                          </Link>
                        ),
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex">
                <span
                  className="flex gap-1 rounded-2xl rounded-bl-sm border border-line/70 bg-white px-3.5 py-3"
                  aria-label="Typing"
                >
                  <span className="chat-dot" />
                  <span className="chat-dot [animation-delay:0.15s]" />
                  <span className="chat-dot [animation-delay:0.3s]" />
                </span>
              </div>
            )}
            {chips.length > 0 && !typing && (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handle(c.value, c.label)}
                    className="rounded-full border border-navy/15 bg-white px-3.5 py-1.5 text-left text-sm font-semibold text-navy shadow-[inset_0_1px_0_#fff,0_1px_2px_rgb(16_24_40/0.05)] transition hover:border-navy/40 hover:bg-[#f2f6fc]"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 border-t border-line/70 bg-white/80 p-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              Type your message
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              inputMode={
                field?.inputType === "email" ? "email" : field?.inputType === "tel" ? "tel" : "text"
              }
              placeholder={
                field
                  ? field.choices
                    ? "Pick an option or type it"
                    : "Type your answer..."
                  : "Ask a question..."
              }
              className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-royal focus:ring-4 focus:ring-royal/15"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim()}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-b from-[#24b84c] to-[#108a26] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] disabled:opacity-40"
            >
              <Icon name="arrow" className="size-5" strokeWidth={2.2} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
