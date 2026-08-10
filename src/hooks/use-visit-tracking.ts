import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { recordVisit, syncMyProfile } from "@/lib/audience.functions";

type Site = "bwn" | "nest" | "events" | "swag" | "other";

function sessionId() {
  try {
    const key = "nest_sid";
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

/**
 * Records one page view per route visit and keeps the signed-in visitor's
 * profile row fresh, so the audience report has both traffic and accounts.
 */
export function useVisitTracking(site: Site) {
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    const once = `nest_v:${site}:${path}`;
    if (!sessionStorage.getItem(once)) {
      sessionStorage.setItem(once, "1");
      void recordVisit({
        data: {
          site,
          path: path.slice(0, 300),
          referrer: document.referrer ? document.referrer.slice(0, 500) : null,
          user_agent: navigator.userAgent.slice(0, 400),
          session_id: sessionId(),
        },
      }).catch(() => {});
    }

    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
      void syncMyProfile({
        data: {
          full_name: meta["full_name"] ?? meta["name"] ?? null,
          avatar_url: meta["avatar_url"] ?? meta["picture"] ?? null,
          signup_source: site,
          provider: user.app_metadata?.provider ?? null,
        },
      }).catch(() => {});
    });
  }, [site]);
}
