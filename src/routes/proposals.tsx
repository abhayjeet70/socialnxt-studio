import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Check, X, Plus, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  useCurrentWorkspace, useProposals, useCreateProposal,
  useUpdateProposalStatus, useDeleteProposal, useClients, Proposal,
} from "@/lib/queries";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

const STATUSES = ["Draft", "Sent", "Approved", "Rejected"];

function ProposalsPage() {
  const { data: workspace } = useCurrentWorkspace();
  const { data: proposals = [], isLoading } = useProposals(workspace?.workspaceId);
  const { data: clients = [] } = useClients(workspace?.workspaceId);
  const createProposal = useCreateProposal();
  const updateStatus = useUpdateProposalStatus();
  const deleteProposal = useDeleteProposal();

  const isClient = workspace?.role === "client";
  const isAdmin = workspace?.role === "admin";
  const canEdit = workspace?.role === "admin" || workspace?.role === "employee";

  // New Proposal Dialog state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", client_name: "", amount: "", notes: "", status: "Draft" });

  const handleCreate = async () => {
    if (!form.title || !form.client_name || !form.amount) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!workspace) return;
    const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
    if (!user) return;

    createProposal.mutate(
      {
        workspace_id: workspace.workspaceId,
        created_by: user.id,
        title: form.title,
        client_name: form.client_name,
        amount: parseFloat(form.amount),
        notes: form.notes || null,
        status: form.status as Proposal["status"],
      },
      {
        onSuccess: () => {
          toast.success("Proposal created!");
          setOpen(false);
          setForm({ title: "", client_name: "", amount: "", notes: "", status: "Draft" });
        },
        onError: (e) => toast.error("Failed: " + e.message),
      }
    );
  };

  const handleStatusChange = (proposal: Proposal, newStatus: string) => {
    if (!workspace) return;
    updateStatus.mutate(
      { id: proposal.id, status: newStatus, workspace_id: workspace.workspaceId, proposal },
      {
        onSuccess: () => {
          toast.success(
            newStatus === "Approved"
              ? "Proposal approved! Revenue updated."
              : `Proposal marked as ${newStatus}.`
          );
        },
        onError: (e) => toast.error("Failed: " + e.message),
      }
    );
  };

  const handleDelete = (proposal: Proposal) => {
    if (!confirm(`Delete proposal "${proposal.title}"?`)) return;
    deleteProposal.mutate(
      { id: proposal.id },
      {
        onSuccess: () => toast.success("Proposal deleted."),
        onError: (e) => toast.error("Failed: " + e.message),
      }
    );
  };

  return (
    <AppShell
      title="Proposals"
      subtitle="Send, track and manage client proposals end-to-end."
      actions={
        canEdit ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl h-10"><Upload className="h-4 w-4" /> Upload</Button>
            <Button className="rounded-xl h-10" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Proposal</Button>
          </div>
        ) : null
      }
    >
      <div className="card-soft p-4 sm:p-5">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : proposals.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No proposals yet.{canEdit && " Click \"New Proposal\" to create one."}
          </div>
        ) : (
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
                {proposals.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{p.title}</div>
                          {p.notes && <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{p.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-foreground/80">{p.client_name}</td>
                    <td className="px-3 py-3 font-semibold">₹{p.amount.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-3">
                      {canEdit ? (
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_TONE[p.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge className={`rounded-full border-0 ${STATUS_TONE[p.status]}`}>{p.status}</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-foreground/80">
                      {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button title="Download" className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center">
                          <Download className="h-4 w-4" />
                        </button>
                        {canEdit && p.status !== "Approved" && (
                          <button
                            title="Approve"
                            onClick={() => handleStatusChange(p, "Approved")}
                            className="h-8 w-8 rounded-lg hover:bg-[#10B981]/10 text-[#047857] grid place-items-center"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            title="Delete"
                            onClick={() => handleDelete(p)}
                            className="h-8 w-8 rounded-lg hover:bg-[#EF4444]/10 text-[#B91C1C] grid place-items-center"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Proposal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Proposal</DialogTitle>
            <DialogDescription>Create a new client proposal. Approving it will automatically update revenue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Proposal Title *</Label>
              <Input placeholder="e.g. Q3 Social Retainer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Client *</Label>
              {clients.length > 0 ? (
                <Select value={form.client_name} onValueChange={(v) => setForm({ ...form, client_name: v })}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input placeholder="Client name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
              )}
            </div>
            <div className="space-y-1">
              <Label>Amount (₹) *</Label>
              <Input type="number" placeholder="e.g. 135000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input placeholder="Optional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createProposal.isPending}>
                {createProposal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Proposal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
