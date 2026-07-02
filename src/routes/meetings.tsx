import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Plus, Video, Calendar as CalIcon, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MEETINGS } from "@/lib/demo-data";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meetings — SocialNxt CRM" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const upcoming = MEETINGS.filter((m) => m.status === "Upcoming");
  const completed = MEETINGS.filter((m) => m.status === "Completed");

  return (
    <AppShell
      title="Meetings"
      subtitle="Upcoming syncs and past client conversations."
      actions={<Button className="rounded-xl h-10"><Plus className="h-4 w-4" /> Schedule Meeting</Button>}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Upcoming meetings</h2>
              <Badge variant="secondary" className="rounded-full">{upcoming.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((m) => (
                <div key={m.id} className="card-soft lift p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{m.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.client}</div>
                    </div>
                    <Badge className="rounded-full bg-primary/10 text-primary border-0">Upcoming</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-foreground/70">
                    <span className="flex items-center gap-1.5"><CalIcon className="h-3.5 w-3.5" /> {m.date}</span>
                    <span>{m.time}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{m.attendees.join(", ")}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="rounded-xl h-9 flex-1">Join</Button>
                    <Button variant="outline" className="rounded-xl h-9">Reschedule</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-3">Completed meetings</h2>
            <div className="card-soft divide-y divide-border">
              {completed.map((m) => (
                <div key={m.id} className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center text-muted-foreground shrink-0">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.client} · {m.date}</div>
                  </div>
                  <Badge className="rounded-full bg-[#10B981]/10 text-[#047857] border-0">Completed</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="card-soft p-5">
          <div className="font-semibold mb-3 text-sm">This week</div>
          <div className="space-y-2">
            {["Mon 29", "Tue 30", "Wed 01", "Thu 02", "Fri 03"].map((d, i) => (
              <div key={d} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${i === 3 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <span className="font-medium">{d}</span>
                <span className={`text-xs ${i === 3 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{[0, 1, 0, 2, 1][i]} meetings</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
