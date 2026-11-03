"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminClient, AuthError } from "@/lib/admin/client";
import type { Application, Enquiry, LeadKind, LeadStatus } from "@/lib/db/types";

type Status = "loading" | "ready" | "unauthorised" | "error";
type Data = {
  status: Status;
  admin: string;
  enquiries: Enquiry[];
  applications: Application[];
  refresh: () => Promise<void>;
  update: (
    kind: LeadKind,
    id: string,
    patch: { status?: LeadStatus; note?: string },
  ) => Promise<void>;
  remove: (kind: LeadKind, id: string) => Promise<void>;
};

const Ctx = createContext<Data | null>(null);

export function useAdminData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminData must be used inside <AdminDataProvider>");
  return v;
}

/** Loads both lead lists once and keeps them in sync with edits. */
export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [admin, setAdmin] = useState("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [e, a] = await Promise.all([
        adminClient.list("enquiries"),
        adminClient.list("applications"),
      ]);
      setEnquiries(e.rows);
      setApplications(a.rows);
      setAdmin(e.admin);
      setStatus("ready");
    } catch (err) {
      setStatus(err instanceof AuthError ? "unauthorised" : "error");
    }
  }, []);

  useEffect(() => {
    // Initial load: state is set only after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const patchLocal = (kind: LeadKind, id: string, patch: Partial<Enquiry & Application>) => {
    const apply = <T extends { id: string }>(rows: T[]) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    if (kind === "enquiries") setEnquiries(apply);
    else setApplications(apply);
  };

  const update: Data["update"] = async (kind, id, patch) => {
    patchLocal(kind, id, patch); // optimistic
    try {
      await adminClient.update(kind, id, patch);
    } catch (err) {
      await refresh();
      throw err;
    }
  };

  const remove: Data["remove"] = async (kind, id) => {
    await adminClient.remove(kind, id);
    if (kind === "enquiries") setEnquiries((r) => r.filter((x) => x.id !== id));
    else setApplications((r) => r.filter((x) => x.id !== id));
  };

  return (
    <Ctx.Provider value={{ status, admin, enquiries, applications, refresh, update, remove }}>
      {children}
    </Ctx.Provider>
  );
}
