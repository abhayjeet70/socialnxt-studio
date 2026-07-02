import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import { usePosts, useCurrentWorkspace, useUpdatePostDetails, useCreatePost, uploadMediaFile, Post } from "@/lib/queries";
import { Loader2, UploadCloud, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PLATFORM_COLOR } from "@/lib/demo-data";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks & Content Sheet — SocialNxt" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { data: workspace } = useCurrentWorkspace();
  const { data: posts = [], isLoading } = usePosts(workspace?.workspaceId);
  const createPost = useCreatePost();

  const handleAddRow = () => {
    if (!workspace) return;
    createPost.mutate({
      workspace_id: workspace.workspaceId,
      author_id: workspace.userId,
      status: "draft",
      scheduled_for: new Date().toISOString(),
      content: "",
      topic: "",
      content_type: "",
    }, {
      onSuccess: () => toast.success("Added new row!"),
      onError: (err: any) => {
        console.error("Add Row Error:", err);
        toast.error("Error adding row: " + (err.message || "Unknown error"));
      }
    });
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = a.scheduled_for ? new Date(a.scheduled_for).getTime() : new Date(a.created_at).getTime();
    const dateB = b.scheduled_for ? new Date(b.scheduled_for).getTime() : new Date(b.created_at).getTime();
    return dateA - dateB;
  });

  return (
    <AppShell
      title="Content Sheet"
      subtitle="Spreadsheet view for managing content topics, references, and final deliverables."
      actions={
        <Button onClick={handleAddRow} disabled={!workspace}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      }
    >
      <div className="card-soft overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 border-r border-white/20 font-semibold w-24">DATE</th>
                  <th className="px-4 py-3 border-r border-white/20 font-semibold w-24">WEEK DAY</th>
                  <th className="px-4 py-3 border-r border-white/20 font-semibold w-32">PLATFORM</th>
                  <th className="px-4 py-3 border-r border-white/20 font-semibold w-32">CONTENT TYPE</th>
                  <th className="px-4 py-3 border-r border-white/20 font-semibold w-48">TOPIC</th>
                  <th className="px-4 py-3 border-r border-white/20 font-semibold w-64">REFERENCE CONTENT</th>
                  <th className="px-4 py-3 border-r border-white/20 font-semibold">COMPLETED CONTENT</th>
                  <th className="px-4 py-3 font-semibold w-32 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {sortedPosts.map((post, idx) => (
                  <TaskRow key={post.id} post={post} index={idx} />
                ))}
                {sortedPosts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      No posts found. Add content from the Calendar first!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// Separate component for each row so they manage their own local edit state
function TaskRow({ post, index }: { post: Post; index: number }) {
  const updatePost = useUpdatePostDetails();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTarget, setUploadingTarget] = useState<"reference_content" | "completed_work" | null>(null);

  // Date formatting for the date input
  const dateObj = post.scheduled_for ? new Date(post.scheduled_for) : new Date(post.created_at);
  const dateInputVal = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const weekdayStr = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const rowColor = index % 2 === 0 ? "bg-[#e0f2fe]" : "bg-white"; // Light blue/white alternating

  const handleTextBlur = (field: keyof Post, value: string) => {
    if (post[field] === value) return;
    updatePost.mutate({ id: post.id, updates: { [field]: value } });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    // convert YYYY-MM-DD back to ISO string for backend
    const newDate = new Date(e.target.value);
    updatePost.mutate({ id: post.id, updates: { scheduled_for: newDate.toISOString() } });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTarget) return;

    try {
      toast.info(`Uploading to ${uploadingTarget}...`);
      const url = await uploadMediaFile(file);
      
      // Append to the existing array of URLs
      const existing = post[uploadingTarget] || [];
      updatePost.mutate({ 
        id: post.id, 
        updates: { [uploadingTarget]: [...existing, url] } 
      }, {
        onSuccess: () => toast.success("Upload successful!")
      });
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploadingTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddLink = (target: "reference_content" | "completed_work") => {
    const url = window.prompt("Enter the URL link (e.g., Canva, Drive, Pinterest):");
    if (!url) return;
    
    const existing = post[target] || [];
    updatePost.mutate({ 
      id: post.id, 
      updates: { [target]: [...existing, url] } 
    });
  };

  // Helper to render media items (images or links)
  const renderMedia = (urls: string[] | null) => {
    if (!urls || urls.length === 0) return <div className="text-muted-foreground text-xs opacity-50 italic">Empty</div>;
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {urls.map((url, i) => {
          const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes("supabase.co");
          if (isImage) {
            return (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded overflow-hidden border border-border shrink-0">
                <img src={url} alt="media" className="w-full h-full object-cover" />
              </a>
            );
          }
          return (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100">
              <LinkIcon className="w-3 h-3" /> Link {i+1}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <tr className={`border-b border-gray-200 ${rowColor} hover:bg-gray-50 transition-colors`}>
      <td className="px-4 py-3 font-semibold text-gray-800 border-r border-gray-200 align-top">
        <input 
          type="date"
          value={dateInputVal}
          onChange={handleDateChange}
          className="bg-transparent border-none p-1 focus:ring-1 focus:ring-blue-500 rounded text-sm w-full cursor-pointer"
        />
      </td>
      <td className="px-4 py-3 font-medium text-gray-800 border-r border-gray-200 align-top pt-5">{weekdayStr}</td>
      
      {/* PLATFORM */}
      <td className="p-0 border-r border-gray-200 align-top bg-transparent">
        <select
          defaultValue={post.platform || ""}
          onChange={(e) => updatePost.mutate({ id: post.id, updates: { platform: e.target.value } })}
          className="w-full h-full min-h-[80px] p-3 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer appearance-none"
        >
          <option value="" disabled>Select Platform</option>
          <option value="Instagram">Instagram</option>
          <option value="Facebook">Facebook</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="YouTube">YouTube</option>
          <option value="TikTok">TikTok</option>
        </select>
      </td>

      {/* CONTENT TYPE */}
      <td className="p-0 border-r border-gray-200 align-top">
        <textarea
          defaultValue={post.content_type || ""}
          onBlur={(e) => handleTextBlur("content_type", e.target.value)}
          className="w-full h-full min-h-[80px] p-3 bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          placeholder="e.g. Reel"
        />
      </td>

      {/* TOPIC */}
      <td className="p-0 border-r border-gray-200 align-top">
        <textarea
          defaultValue={post.topic || ""}
          onBlur={(e) => handleTextBlur("topic", e.target.value)}
          className="w-full h-full min-h-[80px] p-3 bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          placeholder="Enter topic..."
        />
      </td>

      {/* REFERENCE CONTENT */}
      <td className="p-3 border-r border-gray-200 align-top">
        {renderMedia(post.reference_content)}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 bg-white/50" onClick={() => handleAddLink("reference_content")}>
            <LinkIcon className="w-3 h-3 mr-1" /> Add Link
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 bg-white/50" onClick={() => { setUploadingTarget("reference_content"); fileInputRef.current?.click(); }}>
            {uploadingTarget === "reference_content" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3 mr-1" />}
            Upload Image
          </Button>
        </div>
      </td>

      {/* COMPLETED CONTENT */}
      <td className="p-3 border-r border-gray-200 align-top">
        {renderMedia(post.completed_work)}
        
        {/* We also show the post.content here (the caption) */}
        <div className="mt-3 mb-2">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Caption Text</label>
          <textarea
            defaultValue={post.content || ""}
            onBlur={(e) => handleTextBlur("content", e.target.value)}
            className="w-full h-16 p-2 bg-white/60 border border-gray-300 rounded text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Final caption goes here..."
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 bg-white/50" onClick={() => handleAddLink("completed_work")}>
            <LinkIcon className="w-3 h-3 mr-1" /> Add Link
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 bg-white/50" onClick={() => { setUploadingTarget("completed_work"); fileInputRef.current?.click(); }}>
            {uploadingTarget === "completed_work" ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3 mr-1" />}
            Upload Final
          </Button>
        </div>
      </td>

      {/* STATUS */}
      <td className="px-4 py-3 align-middle text-center">
        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{
          backgroundColor: post.status === 'draft' ? '#f3f4f6' : 
                          post.status === 'pending_approval' ? '#fef3c7' :
                          post.status === 'approved' ? '#d1fae5' : '#dbeafe',
          color: post.status === 'draft' ? '#4b5563' :
                 post.status === 'pending_approval' ? '#d97706' :
                 post.status === 'approved' ? '#059669' : '#2563eb'
        }}>
          {post.status.replace("_", " ")}
        </span>
      </td>

      {/* Hidden file input for uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleMediaUpload} 
        className="hidden" 
        accept="image/*" 
      />
    </tr>
  );
}
