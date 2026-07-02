import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users, Briefcase, CalendarClock, Send, IndianRupee, CheckCircle2,
  TrendingUp, ArrowUpRight, MoreHorizontal, Clock, Video,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  CLIENTS, EMPLOYEES, MEETINGS, REVENUE_BY_MONTH, PLATFORM_DISTRIBUTION,
  PLATFORM_COLOR, TASKS,
} from "@/lib/demo-data";
import { supabase } from "@/lib/supabase";
import { useCurrentWorkspace, useDashboardStats } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — SocialNxt CRM" }] }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });

    // If no workspace yet, send to onboarding to create one
    const { data } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", session.user.id)
      .limit(1)
      .maybeSingle();

    if (!data?.workspace_id) throw redirect({ to: "/onboarding" });
  },
  component: Dashboard,
});

const STATS = [
  { label: "Total Clients", value: "24", delta: "+3 this month", icon: Users, tone: "text-primary bg-primary/10" },
  { label: "Active Projects", value: "18", delta: "+2 this week", icon: Briefcase, tone: "text-[#10B981] bg-[#10B981]/10" },
  { label: "Content Scheduled", value: "142", delta: "Next 30 days", icon: CalendarClock, tone: "text-[#F59E0B] bg-[#F59E0B]/10" },
  { label: "Posts Published", value: "386", delta: "+48 this month", icon: Send, tone: "text-[#EC4899] bg-[#EC4899]/10" },
  { label: "Revenue", value: "₹6.4L", delta: "+12.4%", icon: IndianRupee, tone: "text-[#8B5CF6] bg-[#8B5CF6]/10" },
  { label: "Pending Approvals", value: "7", delta: "Needs review", icon: CheckCircle2, tone: "text-[#EF4444] bg-[#EF4444]/10" },
];

function Dashboard() {
  const { data: workspace, isLoading: workspaceLoading } = useCurrentWorkspace();
  const stats = useDashboardStats(workspace?.workspaceId);

  // Build live stat cards (replacing hard-coded STATS)
  const LIVE_STATS = [
    {
      label: "Connected Accounts",
      value: workspaceLoading ? "…" : String(stats.connectedAccounts),
      delta: "Social platforms",
      icon: Users,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Total Posts",
      value: workspaceLoading ? "…" : String(stats.totalPosts),
      delta: "All time",
      icon: Briefcase,
      tone: "text-[#10B981] bg-[#10B981]/10",
    },
    {
      label: "Scheduled",
      value: workspaceLoading ? "…" : String(stats.scheduledPosts),
      delta: "Upcoming",
      icon: CalendarClock,
      tone: "text-[#F59E0B] bg-[#F59E0B]/10",
    },
    {
      label: "Posts Published",
      value: workspaceLoading ? "…" : String(stats.publishedPosts),
      delta: "Live",
      icon: Send,
      tone: "text-[#EC4899] bg-[#EC4899]/10",
    },
    {
      label: "Drafts",
      value: workspaceLoading ? "…" : String(stats.draftPosts),
      delta: "In progress",
      icon: IndianRupee,
      tone: "text-[#8B5CF6] bg-[#8B5CF6]/10",
    },
    {
      label: "Pending Approvals",
      value: workspaceLoading ? "…" : String(stats.pendingApprovals),
      delta: "Needs review",
      icon: CheckCircle2,
      tone: "text-[#EF4444] bg-[#EF4444]/10",
    },
  ];

  return (
    <AppShell
      title={`Good morning, ${workspace?.userEmail?.split("@")[0] ?? "there"}`}
      subtitle="Here's what's happening across your agency today."
      actions={<Button className="rounded-xl h-10">+ Quick Action</Button>}
    >
      {/* Stat cards — live from Supabase */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {LIVE_STATS.map((s) => (
          <div key={s.label} className="card-soft lift p-4">
            <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            <div className="text-[11px] mt-2 text-foreground/70 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-[#10B981]" /> {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="card-soft p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Monthly Revenue</div>
              <div className="text-xs text-muted-foreground">Last 6 months (in ₹ thousands)</div>
            </div>
            <Badge variant="secondary" className="rounded-full">+18.2%</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={REVENUE_BY_MONTH}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Platform Distribution</div>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={PLATFORM_DISTRIBUTION} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {PLATFORM_DISTRIBUTION.map((p) => (
                    <Cell key={p.name} fill={PLATFORM_COLOR[p.name as keyof typeof PLATFORM_COLOR]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {PLATFORM_DISTRIBUTION.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLATFORM_COLOR[p.name as keyof typeof PLATFORM_COLOR] }} />
                  {p.name}
                </span>
                <span className="font-semibold">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content progress + team workload */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Content Progress</div>
            <button className="text-xs text-primary font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {CLIENTS.slice(0, 5).map((c, i) => {
              const pct = [82, 64, 48, 92, 36][i];
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-lg grid place-items-center text-[11px] font-semibold text-white shrink-0" style={{ background: c.color }}>{c.initials}</div>
                      <span className="truncate font-medium">{c.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Team Workload</div>
            <button className="text-xs text-primary font-medium hover:underline">Manage</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={EMPLOYEES.map(e => ({ name: e.name.split(" ")[0], tasks: e.tasks }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="tasks" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tasks + Activity + Meetings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Today's Tasks</div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {TASKS.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${t.priority === "High" ? "bg-[#EF4444]" : t.priority === "Medium" ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.client} · {t.assignee}</div>
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0">{t.due}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Recent Activities</div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <ol className="relative ml-2 border-l border-border space-y-4">
            {[
              { who: "Priya Sharma", what: "uploaded 5 reels for Sukriti Sampada", when: "2h ago" },
              { who: "Karan Patel", what: "approved AAS NGO July plan", when: "4h ago" },
              { who: "Rohan Kapoor", what: "completed fight promo edit", when: "Yesterday" },
              { who: "Neha Verma", what: "added captions for WebNxt", when: "Yesterday" },
              { who: "Vikram Singh", what: "scheduled 12 posts on Instagram", when: "2d ago" },
            ].map((a, i) => (
              <li key={i} className="pl-4 relative">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
                <div className="text-sm"><span className="font-semibold">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> {a.when}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="card-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Upcoming Meetings</div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {MEETINGS.filter(m => m.status === "Upcoming").map((m) => (
              <div key={m.id} className="rounded-xl border border-border p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.client}</div>
                    <div className="text-[11px] mt-1 text-foreground/70">{m.date} · {m.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
