import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Plus, IndianRupee, Calendar as CalIcon, User as UserIcon, Loader2, MoreHorizontal } from "lucide-react";
import { useCurrentWorkspace, useDeals, useCreateDeal, useUpdateDealStage } from "@/lib/queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const { data: workspace } = useCurrentWorkspace();
  const { data: deals = [], isLoading } = useDeals(workspace?.workspaceId);
  const createDeal = useCreateDeal();
  const updateStage = useUpdateDealStage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const isClient = workspace?.role === "client";
  const visibleDeals = isClient
    ? deals.filter((d) => d.client_name?.toLowerCase() === workspace?.userEmail?.split("@")[0]?.toLowerCase() || d.client_name?.toLowerCase() === workspace?.userFullName?.toLowerCase())
    : deals;

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    try {
      await createDeal.mutateAsync({
        workspace_id: workspace.workspaceId,
        created_by: workspace.userId,
        client_name: clientName,
        project_name: projectName,
        amount: Number(amount),
        days,
        stage: "New",
      });
      toast.success("Deal created successfully!");
      setIsDialogOpen(false);
      setClientName("");
      setProjectName("");
      setAmount("");
      setDays("");
    } catch (err: any) {
      toast.error("Failed to create deal: " + err.message);
    }
  };

  return (
    <AppShell
      title="Deals"
      subtitle="Kanban view of every active project across stages."
      actions={
        !isClient && (
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl h-10">
            <Plus className="h-4 w-4 mr-2" /> Add Deal
          </Button>
        )
      }
    >
      <div className="overflow-x-auto">
        <div className="grid grid-flow-col auto-cols-[280px] gap-4 min-w-full pb-2">
          {STAGES.map((stage) => {
            const items = visibleDeals.filter((d) => d.stage === stage);
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
                  {items.map((d) => {
                    const ownerName = d.users?.full_name || d.users?.email?.split("@")[0] || "Unknown";
                    return (
                      <div key={d.id} className="card-soft p-3.5 relative lift">
                        <div className="flex justify-between items-start">
                          <div className="text-xs text-muted-foreground truncate pr-6">{d.client_name}</div>
                          
                          {!isClient && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Move to stage</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {STAGES.filter(s => s !== stage).map((s) => (
                                  <DropdownMenuItem 
                                    key={s} 
                                    onClick={() => updateStage.mutate({ id: d.id, stage: s })}
                                  >
                                    {s}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                        </div>
                        <div className="font-semibold text-sm mt-0.5 leading-snug">{d.project_name}</div>
                        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {d.amount.toLocaleString("en-IN")}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {ownerName.split(" ")[0]}</span>
                          <span className="flex items-center gap-1"><CalIcon className="h-3 w-3" /> {d.days}</span>
                        </div>
                      </div>
                    );
                  })}
                  {!isClient && (
                    <button onClick={() => setIsDialogOpen(true)} className="w-full text-xs text-muted-foreground hover:text-primary py-2 rounded-xl border border-dashed border-border hover:border-primary/40 transition-colors">+ Add deal</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>Add a new project to your deals pipeline.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDeal} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Type of Work / Project Name</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} required placeholder="e.g. Website Redesign" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="e.g. 50000" />
              </div>
              <div className="space-y-2">
                <Label>Days / Duration</Label>
                <Input value={days} onChange={(e) => setDays(e.target.value)} required placeholder="e.g. 14 Days" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createDeal.isPending}>
              {createDeal.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Deal
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
