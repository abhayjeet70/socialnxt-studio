import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertOctagon } from "lucide-react";
import { ISSUES } from "@/lib/demo-data";

export const Route = createFileRoute("/issues")({
  head: () => ({ meta: [{ title: "Client Issues — SocialNxt CRM" }] }),
  component: IssuesPage,
});

const PRIORITY_TONE: Record<string, string> = {
  Low: "bg-[#10B981]/10 text-[#047857]",
  Medium: "bg-[#F59E0B]/10 text-[#B45309]",
  High: "bg-[#EF4444]/10 text-[#B91C1C]",
  Critical: "bg-[#7F1D1D] text-white",
};
const STATUS_TONE: Record<string, string> = {
  Open: "bg-[#EF4444]/10 text-[#B91C1C]",
  "In Progress": "bg-primary/10 text-primary",
  Resolved: "bg-[#10B981]/10 text-[#047857]",
};

function IssuesPage() {
  return (
    <AppShell
      title="Client Issues"
      subtitle="Track and resolve every issue raised by your clients."
      actions={<Button className="rounded-xl h-10"><Plus className="h-4 w-4" /> Report Issue</Button>}
    >
      <div className="card-soft p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Issue</th>
                <th className="px-3 py-3 font-semibold">Client</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Assigned To</th>
                <th className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {ISSUES.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#EF4444]/10 text-[#B91C1C] grid place-items-center shrink-0">
                        <AlertOctagon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">{i.title}</div>
                        <div className="text-xs text-muted-foreground">#{i.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-foreground/80">{i.client}</td>
                  <td className="px-3 py-3"><Badge className={`rounded-full border-0 ${PRIORITY_TONE[i.priority]}`}>{i.priority}</Badge></td>
                  <td className="px-3 py-3 text-foreground/80">{i.assignee}</td>
                  <td className="px-3 py-3"><Badge className={`rounded-full border-0 ${STATUS_TONE[i.status]}`}>{i.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
