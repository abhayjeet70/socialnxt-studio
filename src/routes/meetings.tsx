import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Plus, Video, Calendar as CalIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrentWorkspace, useMeetings, useCreateMeeting, useWorkspaceMembers } from "@/lib/queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meetings — SocialNxt CRM" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { data: workspace } = useCurrentWorkspace();
  const { data: allMeetings = [], isLoading } = useMeetings(workspace?.workspaceId);
  const { data: members = [] } = useWorkspaceMembers(workspace?.workspaceId);
  const createMeeting = useCreateMeeting();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agenda, setAgenda] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [clientId, setClientId] = useState<string>("none");

  const isClient = workspace?.role === "client";
  const canCreate = workspace?.role === "admin" || workspace?.role === "employee";

  // Clients only see meetings tagged to them; admins/employees see all
  const meetings = isClient
    ? allMeetings.filter((m) => (m as any).client_id === workspace?.userId)
    : allMeetings;

  // Only show client members in the picker
  const clientMembers = members.filter((m) => m.role === "client");

  const now = new Date();
  const upcoming = meetings.filter((m) => new Date(m.scheduled_at) > now);
  const completed = meetings.filter((m) => new Date(m.scheduled_at) <= now);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    
    // Combine date and time
    const scheduled_at = new Date(`${date}T${time}`).toISOString();

    try {
      await createMeeting.mutateAsync({
        workspace_id: workspace.workspaceId,
        created_by: workspace.userId,
        agenda,
        meet_link: meetLink,
        scheduled_at,
        ...(clientId !== "none" && { client_id: clientId }),
      } as any);
      toast.success("Meeting scheduled!");
      setIsDialogOpen(false);
      setAgenda("");
      setMeetLink("");
      setDate("");
      setTime("");
    } catch (err: any) {
      toast.error("Failed to schedule: " + err.message);
    }
  };

  return (
    <AppShell
      title="Meetings"
      subtitle="Upcoming syncs and past client conversations."
      actions={
        canCreate && (
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl h-10">
            <Plus className="h-4 w-4 mr-2" /> Schedule Meeting
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 gap-4 max-w-5xl">
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Upcoming meetings</h2>
              <Badge variant="secondary" className="rounded-full">{upcoming.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.length === 0 && !isLoading && (
                <div className="text-sm text-muted-foreground italic">No upcoming meetings.</div>
              )}
              {upcoming.map((m) => {
                const dateObj = new Date(m.scheduled_at);
                const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const displayTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                const organizer = m.users?.full_name || m.users?.email?.split('@')[0] || "Unknown";

                return (
                  <div key={m.id} className="card-soft lift p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                        <Video className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{m.agenda}</div>
                        <div className="text-xs text-muted-foreground truncate">Scheduled by {organizer}</div>
                      </div>
                      <Badge className="rounded-full bg-primary/10 text-primary border-0">Upcoming</Badge>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-foreground/70">
                      <span className="flex items-center gap-1.5"><CalIcon className="h-3.5 w-3.5" /> {displayDate}</span>
                      <span>{displayTime}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => window.open(m.meet_link, "_blank")} className="rounded-xl h-9 flex-1">
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-3">Completed meetings</h2>
            <div className="card-soft divide-y divide-border">
              {completed.length === 0 && !isLoading && (
                <div className="p-4 text-sm text-muted-foreground italic">No completed meetings.</div>
              )}
              {completed.map((m) => {
                const dateObj = new Date(m.scheduled_at);
                const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={m.id} className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center text-muted-foreground shrink-0">
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{m.agenda}</div>
                      <div className="text-xs text-muted-foreground truncate">{displayDate}</div>
                    </div>
                    <Badge className="rounded-full bg-[#10B981]/10 text-[#047857] border-0">Completed</Badge>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>Create a new meeting and optionally tag it to a specific client.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateMeeting} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Meeting Agenda / Title</Label>
              <Input value={agenda} onChange={(e) => setAgenda(e.target.value)} required placeholder="e.g. Weekly Sync with Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input type="url" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} required placeholder="https://meet.google.com/..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>
            {clientMembers.length > 0 && (
              <div className="space-y-2">
                <Label>Invite Client (optional)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific client</SelectItem>
                    {clientMembers.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.users?.full_name || m.users?.email || m.user_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Tagged clients will see this meeting in their portal.</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={createMeeting.isPending}>
              {createMeeting.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Schedule Meeting
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
