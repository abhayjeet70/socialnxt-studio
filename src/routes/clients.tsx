import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { CLIENTS, PLATFORM_COLOR } from "@/lib/demo-data";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — SocialNxt CRM" }] }),
  component: ClientsPage,
});

const STATUS_TONE: Record<string, string> = {
  Planning: "bg-[#F59E0B]/10 text-[#B45309]",
  Designing: "bg-[#8B5CF6]/10 text-[#6D28D9]",
  Editing: "bg-[#06B6D4]/10 text-[#0E7490]",
  Review: "bg-[#F59E0B]/10 text-[#B45309]",
  Published: "bg-[#10B981]/10 text-[#047857]",
  Completed: "bg-[#10B981]/10 text-[#047857]",
};

function ClientsPage() {
  return (
    <AppShell
      title="Clients"
      subtitle="All active and onboarding accounts across the agency."
      actions={<Button className="rounded-xl h-10"><Plus className="h-4 w-4" /> Add Client</Button>}
    >
      <div className="card-soft p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-9 h-10 rounded-xl bg-muted/50 border-transparent" />
          </div>
          <Button variant="outline" className="rounded-xl h-10"><Filter className="h-4 w-4" /> Filters</Button>
          <Button variant="outline" className="rounded-xl h-10">All Statuses</Button>
          <Button variant="outline" className="rounded-xl h-10">All Platforms</Button>
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="font-semibold px-3 py-3">Client</th>
                <th className="font-semibold px-3 py-3">Industry</th>
                <th className="font-semibold px-3 py-3">Account Manager</th>
                <th className="font-semibold px-3 py-3">Designer</th>
                <th className="font-semibold px-3 py-3">Video Editor</th>
                <th className="font-semibold px-3 py-3">Platforms</th>
                <th className="font-semibold px-3 py-3">Status</th>
                <th className="font-semibold px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-xl grid place-items-center text-white text-xs font-semibold" style={{ background: c.color }}>{c.initials}</div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">#{c.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-foreground/80">{c.industry}</td>
                  <td className="px-3 py-3 text-foreground/80">{c.accountManager}</td>
                  <td className="px-3 py-3 text-foreground/80">{c.designer}</td>
                  <td className="px-3 py-3 text-foreground/80">{c.videoEditor}</td>
                  <td className="px-3 py-3">
                    <div className="flex -space-x-1">
                      {c.platforms.map((p) => (
                        <span key={p} title={p} className="h-6 w-6 rounded-full ring-2 ring-white grid place-items-center text-[10px] font-bold text-white" style={{ background: PLATFORM_COLOR[p] }}>
                          {p[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge className={`rounded-full font-medium border-0 ${STATUS_TONE[c.status]}`}>{c.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center"><MoreHorizontal className="h-4 w-4" /></button>
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
