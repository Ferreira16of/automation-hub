import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // getUser awaits storage hydration + token refresh, avoiding the
    // race where getSession() returns null mid-refresh and bounces the
    // user to /login.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
