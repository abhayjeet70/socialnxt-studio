import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Plus, Mail, MoreHorizontal } from "lucide-react";
import { EMPLOYEES } from "@/lib/demo-data";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — SocialNxt CRM" }] }),
  component: TeamPage,
});

const STATUS_DOT: Record<string, string> = {
  Active: "bg-[#10B981]",
  Away: "bg-[#F59E0B]",
  Offline: "bg-muted-foreground",
};

function TeamPage() {
  return (
    <AppShell
      title="Team"
      subtitle="Everyone in your agency, their roles and active workload."
      actions={<Button className="rounded-xl h-10"><Plus className="h-4 w-4" /> Add Employee</Button>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {EMPLOYEES.map((e) => (
          <div key={e.id} className="card-soft lift p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl grid place-items-center text-white text-sm font-semibold" style={{ background: e.color }}>{e.initials}</div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${STATUS_DOT[e.status]}`} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.role}</div>
                </div>
              </div>
              <button className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center"><MoreHorizontal className="h-4 w-4" /></button>
            </div>

            <div className="mt-4 text-xs flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> <span className="truncate">{e.email}</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/50 py-2">
                <div className="text-base font-bold">{e.clients}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Clients</div>
              </div>
              <div className="rounded-xl bg-muted/50 py-2">
                <div className="text-base font-bold">{e.tasks}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tasks</div>
              </div>
              <div className="rounded-xl bg-muted/50 py-2">
                <div className="text-base font-bold">{e.department.split(" ")[0]}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Dept</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs flex items-center gap-1.5 text-foreground/70">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[e.status]}`} /> {e.status}
              </span>
              <button className="text-xs text-primary font-medium hover:underline">View profile</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
