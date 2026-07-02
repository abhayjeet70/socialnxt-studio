import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Check, X, Plus, FileText } from "lucide-react";
import { PROPOSALS } from "@/lib/demo-data";

export const Route = createFileRoute("/proposals")({
  head: () => ({ meta: [{ title: "Proposals — SocialNxt CRM" }] }),
  component: ProposalsPage,
});

const STATUS_TONE: Record<string, string> = {
  Draft: "bg-muted text-foreground/70",
  Sent: "bg-primary/10 text-primary",
  Approved: "bg-[#10B981]/10 text-[#047857]",
  Rejected: "bg-[#EF4444]/10 text-[#B91C1C]",
};

function ProposalsPage() {
  return (
    <AppShell
      title="Proposals"
      subtitle="Send, track and manage client proposals end-to-end."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl h-10"><Upload className="h-4 w-4" /> Upload</Button>
          <Button className="rounded-xl h-10"><Plus className="h-4 w-4" /> New Proposal</Button>
        </div>
      }
    >
      <div className="card-soft p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Proposal</th>
                <th className="px-3 py-3 font-semibold">Client</th>
                <th className="px-3 py-3 font-semibold">Amount</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Created</th>
                <th className="px-3 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PROPOSALS.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="font-semibold">{p.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-foreground/80">{p.client}</td>
                  <td className="px-3 py-3 font-semibold">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-3"><Badge className={`rounded-full border-0 ${STATUS_TONE[p.status]}`}>{p.status}</Badge></td>
                  <td className="px-3 py-3 text-foreground/80">{p.created}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button title="Download" className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center"><Download className="h-4 w-4" /></button>
                      <button title="Approve" className="h-8 w-8 rounded-lg hover:bg-[#10B981]/10 text-[#047857] grid place-items-center"><Check className="h-4 w-4" /></button>
                      <button title="Reject" className="h-8 w-8 rounded-lg hover:bg-[#EF4444]/10 text-[#B91C1C] grid place-items-center"><X className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
