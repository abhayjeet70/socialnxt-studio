import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Plus, IndianRupee, Calendar as CalIcon, User as UserIcon } from "lucide-react";
import { DEALS } from "@/lib/demo-data";

export const Route = createFileRoute("/deals")({
  head: () => ({ meta: [{ title: "Deals — SocialNxt CRM" }] }),
  component: DealsPage,
});

const STAGES = ["New", "Planning", "Design", "Editing", "Review", "Completed"] as const;
const STAGE_COLOR: Record<string, string> = {
  New: "#64748B",
  Planning: "#F59E0B",
  Design: "#8B5CF6",
  Editing: "#06B6D4",
  Review: "#EC4899",
  Completed: "#10B981",
};

function DealsPage() {
  return (
    <AppShell
      title="Deals"
      subtitle="Kanban view of every active project across stages."
      actions={<Button className="rounded-xl h-10"><Plus className="h-4 w-4" /> Add Deal</Button>}
    >
      <div className="overflow-x-auto">
        <div className="grid grid-flow-col auto-cols-[280px] gap-4 min-w-full pb-2">
          {STAGES.map((stage) => {
            const items = DEALS.filter((d) => d.stage === stage);
            const total = items.reduce((s, d) => s + d.amount, 0);
            return (
              <div key={stage} className="bg-muted/40 rounded-2xl p-3">
                <div className="flex items-center justify-between px-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STAGE_COLOR[stage] }} />
                    <span className="text-sm font-semibold">{stage}</span>
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">₹{(total / 1000).toFixed(0)}k</span>
                </div>
                <div className="space-y-2.5">
                  {items.map((d) => (
                    <div key={d.id} className="card-soft p-3.5 cursor-grab active:cursor-grabbing lift">
                      <div className="text-xs text-muted-foreground truncate">{d.client}</div>
                      <div className="font-semibold text-sm mt-0.5 leading-snug">{d.project}</div>
                      <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {d.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {d.owner.split(" ")[0]}</span>
                        <span className="flex items-center gap-1"><CalIcon className="h-3 w-3" /> {d.due}</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-xs text-muted-foreground hover:text-primary py-2 rounded-xl border border-dashed border-border hover:border-primary/40 transition-colors">+ Add deal</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
