import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { executeWorkflow } from "./engine-core.server";

const RunInput = z.object({
  workflowId: z.string().uuid(),
  triggerData: z.any().optional(),
});

export const runWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RunInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    return await executeWorkflow({
      supabase: supabase as any,
      workflowId: data.workflowId,
      userId,
      trigger: "manual",
      triggerData: data.triggerData,
    });
  });
