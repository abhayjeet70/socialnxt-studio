import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { PLATFORM_COLOR, PLATFORMS } from "@/lib/demo-data";
import { useCurrentWorkspace, usePosts, useCreatePost, useUpdatePostStatus, Post, useClients, useWorkspaceMembers } from "@/lib/queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Content Calendar — SocialNxt CRM" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data: workspace } = useCurrentWorkspace();
  const { data: allPosts = [], isLoading: isLoadingPosts } = usePosts(workspace?.workspaceId);
  const { data: clients = [], isLoading: isLoadingClients } = useClients(workspace?.workspaceId);
  const { data: members = [], isLoading: isLoadingMembers } = useWorkspaceMembers(workspace?.workspaceId);
  const createPost = useCreatePost();
  const updatePostStatus = useUpdatePostStatus();
  const isLoading = isLoadingPosts || isLoadingClients || isLoadingMembers;

  const isClient = workspace?.role === "client";
  const clientNameForFilter = workspace?.userFullName || workspace?.userEmail?.split("@")[0] || "";

  const [selectedClientFilter, setSelectedClientFilter] = useState<string>("All Clients");

  // Filter posts: Only show approved/scheduled/published content on the calendar
  const approvedPosts = allPosts.filter((p) => p.status === "approved" || p.status === "scheduled" || p.status === "published");

  // Further filter for clients
  const posts = isClient
    ? approvedPosts.filter((p) => p.client_name?.toLowerCase() === clientNameForFilter.toLowerCase())
    : selectedClientFilter !== "All Clients"
    ? approvedPosts.filter((p) => p.client_name === selectedClientFilter)
    : approvedPosts;

  // View Post Modal State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const firstWeekday = firstDay.getDay(); 
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const handleStatusChange = (post: Post, newStatus: string) => {
    if (!workspace) return;
    updatePostStatus.mutate({
      id: post.id,
      status: newStatus,
      workspace_id: workspace.workspaceId,
    }, {
      onSuccess: () => {
        toast.success("Post status updated!");
        setSelectedPost(null);
      }
    });
  };

  return (
    <AppShell
      title="Content Calendar"
      subtitle="Plan, schedule and approve content across every platform."
    >
      <div className="card-soft p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="font-semibold text-lg px-2">{monthLabel}</div>
            <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
            
            {!isClient && (
              <div className="ml-2 sm:ml-4 w-40 sm:w-48">
                <Select value={selectedClientFilter} onValueChange={setSelectedClientFilter}>
                  <SelectTrigger className="h-9 rounded-xl bg-white border-input text-xs sm:text-sm">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Clients">All Clients</SelectItem>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="sm:ml-auto flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Platforms:</span>
            {PLATFORMS.map((p) => (
              <button key={p} className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: PLATFORM_COLOR[p as keyof typeof PLATFORM_COLOR] }} />
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2 py-1 font-semibold">{d}</div>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, i) => {
              const dayPosts = d ? posts.filter((p) => {
                if (!p.scheduled_for) return false;
                const date = new Date(p.scheduled_for);
                return date.getDate() === d && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
              }) : [];

              return (
                <div
                  key={i}
                  className={`min-h-[110px] rounded-xl border border-border p-2 ${d ? "bg-white hover:border-primary/30 transition-colors" : "bg-muted/30"}`}
                >
                  {d && (
                    <>
                      <div className="text-xs font-semibold text-foreground/80 mb-1.5">{d}</div>
                      <div className="space-y-1">
                        {dayPosts.map((it) => {
                          const platformMatch = it.content?.match(/^\[(.*?)\]/);
                          const platformName = it.platform || (platformMatch ? platformMatch[1] : "");
                          const text = it.content?.replace(/^\[.*?\]\s*/, "") || "No content";
                          const color = platformName ? (PLATFORM_COLOR[platformName as keyof typeof PLATFORM_COLOR] || "#9CA3AF") : "#9CA3AF";
                          
                          const isImageUrl = (url: string) => url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes("supabase.co");
                          const allMedia = [...(it.completed_work || []), ...(it.reference_content || [])];
                          const previewUrl = allMedia.find(isImageUrl);
                          
                          return (
                            <div
                              key={it.id}
                              onClick={() => setSelectedPost(it)}
                              className={`text-[11px] rounded-lg p-2 text-white cursor-pointer hover:opacity-90 flex flex-col gap-1.5 ${it.status === 'draft' ? 'opacity-60' : ''} ${it.status === 'published' ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
                              style={{ background: color }}
                              title={`${it.status.toUpperCase()} — ${it.topic || text}`}
                            >
                              {it.status === "published" && (
                                <div className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase w-fit tracking-wider">
                                  Posted
                                </div>
                              )}
                              
                              {/* Preview Image */}
                              {previewUrl && (
                                <div className="w-full h-12 rounded bg-black/10 overflow-hidden shrink-0">
                                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                              
                              <div className="flex flex-col">
                                <div className="truncate font-semibold">
                                  {it.topic || text}
                                </div>
                                {it.client_name && !isClient && (
                                  <div className="mt-1">
                                    <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded-full inline-block truncate max-w-full">
                                      Client: {it.client_name}
                                    </span>
                                  </div>
                                )}
                                {it.assigned_to && members && (
                                  <div className="mt-1">
                                    <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded-full inline-block truncate max-w-full">
                                      Emp: {(() => {
                                        const m = members.find(m => m.user_id === it.assigned_to);
                                        return m ? (m.users?.full_name || m.users?.email?.split('@')[0]) : 'Unknown';
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Post Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>Review the final approved content.</DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Topic</span>
                  <p className="text-sm font-medium">{selectedPost.topic || "None"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">Content Type</span>
                  <p className="text-sm font-medium">{selectedPost.content_type || "None"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Caption</span>
                <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>

              {(selectedPost.reference_content?.length || selectedPost.completed_work?.length) ? (
                <div className="space-y-2 pt-2 border-t">
                  {selectedPost.reference_content && selectedPost.reference_content.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold uppercase block mb-1">References</span>
                      <div className="flex gap-2">
                        {selectedPost.reference_content.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Link {i+1}</a>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedPost.completed_work && selectedPost.completed_work.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold uppercase block mb-1">Completed Work</span>
                      <div className="flex gap-2">
                        {selectedPost.completed_work.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Link {i+1}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex items-center gap-2 text-sm pt-2">
                <span className="font-semibold text-muted-foreground">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium text-xs">
                  {selectedPost.status.toUpperCase().replace("_", " ")}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
