"use client";

import { useCallback, useEffect, useState } from "react";
import type { MemberPayload } from "@/lib/member-types";

export function useCurrentMember() {
  const [member, setMember] = useState<MemberPayload | null>(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    try {
      const response = await fetch("/api/members/me");
      if (response.status === 401) {
        setMember(null);
        return;
      }

      const payload = (await response.json()) as {
        ok: boolean;
        member?: MemberPayload;
      };

      if (response.ok && payload.ok && payload.member) {
        setMember(payload.member);
      } else {
        setMember(null);
      }
    } catch {
      setMember(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { member, ready, setMember, reload };
}
