import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient, session: null as Session | null },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

/** Call this once at startup to inject the real session into the router */
export async function resolveRouterContext() {
  const { data: { session } } = await supabase.auth.getSession();
  return { session };
}
