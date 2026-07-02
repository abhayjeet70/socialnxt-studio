import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { PLATFORM_COLOR, PLATFORMS } from "@/lib/demo-data";
import { useCurrentWorkspace, usePosts, useCreatePost, useUpdatePostStatus, Post } from "@/lib/queries";
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
  const { data: posts = [], isLoading } = usePosts(workspace?.workspaceId);
  const createPost = useCreatePost();
  const updatePostStatus = useUpdatePostStatus();

  // Create Post Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("Reel");
  const [platform, setPlatform] = useState<string>("Instagram");
  const [scheduledDay, setScheduledDay] = useState<string>("");

  // View Post Modal State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Generate calendar days for current month (Hardcoded to July 2026 for demo sync)
  const monthLabel = "July 2026";
  const firstWeekday = 3; // Wed
  const daysInMonth = 31;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    
    // Convert day to a mock date in July 2026
    const day = parseInt(scheduledDay);
    const date = new Date(2026, 6, day, 12, 0, 0).toISOString();

    createPost.mutate({
      workspace_id: workspace.workspaceId,
      author_id: workspace.userId,
      content: content,
      topic,
      platform,
      content_type: contentType,
      status: "draft",
      scheduled_for: date,
    }, {
      onSuccess: () => {
        toast.success("Post drafted successfully!");
        setIsCreateOpen(false);
        setContent("");
        setTopic("");
        setScheduledDay("");
      },
      onError: (err) => {
        toast.error(err.message);
      }
    });
  };

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
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-10" disabled={!workspace || workspace.role === 'client'}>
              <Plus className="h-4 w-4 mr-1" /> Add Content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Draft New Post</DialogTitle>
              <DialogDescription>Create a new post for your clients to review.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Input
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  placeholder="e.g. Reel, Static, Carousel"
                />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Summer Skincare Routine"
                />
              </div>
              <div className="space-y-2">
                <Label>Caption Draft</Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-20 p-3 rounded-lg border border-input bg-background text-sm"
                  placeholder="Write your post caption here..."
                />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Day (July 2026)</Label>
                <Input
                  required
                  type="number"
                  min="1" max="31"
                  value={scheduledDay}
                  onChange={(e) => setScheduledDay(e.target.value)}
                  placeholder="e.g. 15"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createPost.isPending}>
                {createPost.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Draft"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="card-soft p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="font-semibold text-lg px-2">{monthLabel}</div>
            <Button variant="outline" size="icon" className="rounded-xl h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
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
                return date.getDate() === d && date.getMonth() === 6 && date.getFullYear() === 2026;
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
                          const platformName = it.platform || (platformMatch ? platformMatch[1] : "Instagram");
                          const text = it.content?.replace(/^\[.*?\]\s*/, "") || "No content";
                          const color = PLATFORM_COLOR[platformName as keyof typeof PLATFORM_COLOR] || PLATFORM_COLOR["Instagram"];
                          
                          return (
                            <div
                              key={it.id}
                              onClick={() => setSelectedPost(it)}
                              className={`text-[11px] rounded-lg px-2 py-1.5 text-white truncate cursor-pointer hover:opacity-90 ${it.status === 'draft' ? 'opacity-60' : ''}`}
                              style={{ background: color }}
                              title={`${it.status.toUpperCase()} — ${it.topic || text}`}
                            >
                              {it.topic ? (
                                <span className="font-semibold">{it.topic}</span>
                              ) : (
                                <span>{text}</span>
                              )}
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

      {/* View/Edit Post Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Content Approval Workflow</DialogTitle>
            <DialogDescription>Review and change the status of this post.</DialogDescription>
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
                <span className="font-semibold text-muted-foreground">Current Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                  {selectedPost.status.toUpperCase().replace("_", " ")}
                </span>
              </div>
              
              <div className="pt-4 border-t flex flex-wrap gap-2">
                {/* Employees OR Admins can submit drafts for approval */}
                {(workspace?.role === "employee" || workspace?.role === "admin") && selectedPost.status === "draft" && (
                  <Button onClick={() => handleStatusChange(selectedPost, "pending_approval")}>
                    Submit for Approval
                  </Button>
                )}
                
                {/* Clients OR Admins can approve/reject pending posts */}
                {(workspace?.role === "client" || workspace?.role === "admin") && selectedPost.status === "pending_approval" && (
                  <>
                    <Button onClick={() => handleStatusChange(selectedPost, "approved")} className="bg-green-600 hover:bg-green-700">
                      Approve Post
                    </Button>
                    <Button variant="destructive" onClick={() => handleStatusChange(selectedPost, "draft")}>
                      Reject (Needs Edit)
                    </Button>
                  </>
                )}

                {/* Only Admins can final-schedule approved posts */}
                {workspace?.role === "admin" && selectedPost.status === "approved" && (
                  <Button onClick={() => handleStatusChange(selectedPost, "scheduled")}>
                    Schedule & Lock
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
