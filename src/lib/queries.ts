import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Post = {
  id: string;
  workspace_id: string;
  author_id: string;
  content: string | null;
  content_type: string | null;
  topic: string | null;
  platform: string | null;
  reference_content: string[] | null;
  completed_work: string[] | null;
  media_urls: string[] | null;
  status: "draft" | "pending_approval" | "approved" | "scheduled" | "published" | "failed";
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialAccount = {
  id: string;
  platform: "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok";
  account_name: string;
};

export type DashboardStats = {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  pendingApprovals: number;
  draftPosts: number;
  connectedAccounts: number;
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Fetch all posts for the first workspace the current user belongs to */
export function usePosts(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["posts", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });
}

/** Fetch the social accounts connected to a workspace */
export function useSocialAccounts(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["social_accounts", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("id, platform, account_name")
        .eq("workspace_id", workspaceId!);
      if (error) throw error;
      return data as SocialAccount[];
    },
  });
}

/** Resolve the current Supabase user and their first workspace */
export function useCurrentWorkspace() {
  return useQuery({
    queryKey: ["current_workspace"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces(id, name)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (error) throw error;
      return {
        workspaceId: data.workspace_id as string,
        role: data.role as string,
        workspaceName: (data.workspaces as unknown as { name: string })?.name ?? "My Workspace",
        userId: user.id,
        userEmail: user.email,
      };
    },
  });
}

/** Derive dashboard summary stats from raw posts + accounts */
export function useDashboardStats(workspaceId: string | undefined): DashboardStats {
  const { data: posts = [] } = usePosts(workspaceId);
  const { data: accounts = [] } = useSocialAccounts(workspaceId);

  return {
    totalPosts: posts.length,
    scheduledPosts: posts.filter((p) => p.status === "scheduled").length,
    publishedPosts: posts.filter((p) => p.status === "published").length,
    pendingApprovals: posts.filter((p) => p.status === "pending_approval").length,
    draftPosts: posts.filter((p) => p.status === "draft").length,
    connectedAccounts: accounts.length,
  };
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: Partial<Post> & { workspace_id: string; author_id: string }) => {
      const { data, error } = await supabase.from("posts").insert(post).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts", variables.workspace_id] });
    },
  });
}

export function useUpdatePostStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, workspace_id }: { id: string; status: string; workspace_id: string }) => {
      const { data, error } = await supabase.from("posts").update({ status }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts", variables.workspace_id] });
    },
  });
}

/** Helper to upload a file to Supabase Storage */
export async function uploadMediaFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("post_media")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("post_media")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export function useUpdatePostDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Post> }) => {
      const { data, error } = await supabase.from("posts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate everything to be safe
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

