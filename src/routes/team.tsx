import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Loader2, Users, UserCheck, ShieldCheck, Trash2 } from "lucide-react";
import { useCurrentWorkspace, useWorkspaceMembers, useRemoveWorkspaceMember, WorkspaceMember } from "@/lib/queries";
import { sendInvite } from "@/server/invite";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — SocialNxt CRM" }] }),
  component: TeamPage,
});

const ROLE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  admin:    { bg: "bg-purple-100",  text: "text-purple-700",  label: "Admin" },
  employee: { bg: "bg-blue-100",    text: "text-blue-700",    label: "Employee" },
  client:   { bg: "bg-emerald-100", text: "text-emerald-700", label: "Client" },
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin:    <ShieldCheck className="h-3.5 w-3.5" />,
  employee: <UserCheck className="h-3.5 w-3.5" />,
  client:   <Users className="h-3.5 w-3.5" />,
};

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "#2563EB", "#10B981", "#F59E0B", "#EC4899",
  "#8B5CF6", "#06B6D4", "#EF4444", "#0EA5E9",
];

function getAvatarColor(userId: string): string {
  const idx = userId.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function TeamPage() {
  const { data: workspace } = useCurrentWorkspace();
  const { data: members = [], isLoading } = useWorkspaceMembers(workspace?.workspaceId);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"employee" | "client" | "admin">("employee");
  const [isSending, setIsSending] = useState(false);

  const isAdmin = workspace?.role === "admin";

  const employees = members.filter((m) => m.role === "employee" || m.role === "admin");
  const clients = members.filter((m) => m.role === "client");

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.workspaceId) return;
    setIsSending(true);
    try {
      await sendInvite({
        data: {
          email: inviteEmail,
          role: inviteRole,
          workspaceId: workspace.workspaceId,
        },
      });
      toast.success(`Invite sent to ${inviteEmail}!`);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("employee");
    } catch (err: any) {
      toast.error("Failed to send invite: " + (err.message || "Unknown error"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppShell
      title="Team"
      subtitle="Everyone in your workspace, their roles and active workload."
      actions={
        isAdmin ? (
          <Button className="rounded-xl h-10" onClick={() => setIsInviteOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Invite Member
          </Button>
        ) : null
      }
    >
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Team Member</DialogTitle>
            <DialogDescription>
              They will receive an email with a link to join your workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                required
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {inviteRole === "client"
                  ? "Clients can view and approve content on the calendar."
                  : inviteRole === "admin"
                  ? "Admins have full access to the workspace."
                  : "Employees can create and manage content."}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isSending}>
              {isSending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending Invite...</>
              ) : (
                <><Mail className="h-4 w-4 mr-2" /> Send Invite Email</>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <div className="card-soft p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No team members yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Invite employees and clients to collaborate in this workspace.
          </p>
          {isAdmin && (
            <Button onClick={() => setIsInviteOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Invite First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {employees.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Agency Team ({employees.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {employees.map((m) => <MemberCard key={m.id} member={m} />)}
              </div>
            </div>
          )}
          {clients.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Clients ({clients.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {clients.map((m) => <MemberCard key={m.id} member={m} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function MemberCard({ member }: { member: WorkspaceMember }) {
  const user = member.users;
  const email = user?.email ?? "Unknown";
  const name = user?.full_name || null;
  const initials = getInitials(name, email);
  const color = getAvatarColor(member.user_id);
  const roleStyle = ROLE_STYLE[member.role] ?? ROLE_STYLE.employee;
  const joinedDate = new Date(member.created_at).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
  const { data: workspace } = useCurrentWorkspace();
  const isAdmin = workspace?.role === "admin";
  const removeMember = useRemoveWorkspaceMember();

  const handleRemove = async () => {
    if (!workspace?.workspaceId) return;
    if (confirm(`Are you sure you want to remove ${name ?? email} from the workspace?`)) {
      try {
        await removeMember.mutateAsync({ workspace_id: workspace.workspaceId, user_id: member.user_id });
        toast.success("Member removed.");
      } catch (err: any) {
        toast.error("Failed to remove member: " + err.message);
      }
    }
  };

  return (
    <div className="card-soft lift p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-12 w-12 shrink-0 rounded-2xl grid place-items-center text-white text-sm font-semibold"
            style={{ background: color }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{name ?? email.split("@")[0]}</div>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${roleStyle.bg} ${roleStyle.text}`}
            >
              {ROLE_ICON[member.role]}
              {roleStyle.label}
            </span>
          </div>
        </div>
        {isAdmin && member.role !== "admin" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-600 rounded-full shrink-0"
            onClick={handleRemove}
            disabled={removeMember.isPending}
          >
            {removeMember.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="mt-4 text-xs flex items-center gap-2 text-muted-foreground">
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{email}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Joined {joinedDate}</span>
      </div>
    </div>
  );
}
