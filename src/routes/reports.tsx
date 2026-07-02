import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalIcon } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { CLIENTS, EMPLOYEES, REVENUE_BY_MONTH, PLATFORM_DISTRIBUTION, PLATFORM_COLOR } from "@/lib/demo-data";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — SocialNxt CRM" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AppShell
      title="Reports"
      subtitle="Agency-wide performance, revenue and team productivity."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl h-10"><CalIcon className="h-4 w-4" /> Last 30 days</Button>
          <Button className="rounded-xl h-10"><Download className="h-4 w-4" /> Export Report</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card-soft p-5 xl:col-span-2">
          <div className="text-sm font-semibold mb-1">Revenue</div>
          <div className="text-xs text-muted-foreground mb-4">Monthly recognized revenue</div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={REVENUE_BY_MONTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="text-sm font-semibold mb-1">Platform analytics</div>
          <div className="text-xs text-muted-foreground mb-4">Share of published content</div>
          <div className="h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={PLATFORM_DISTRIBUTION} dataKey="value" innerRadius={48} outerRadius={84} paddingAngle={2}>
                  {PLATFORM_DISTRIBUTION.map((p) => (
                    <Cell key={p.name} fill={PLATFORM_COLOR[p.name as keyof typeof PLATFORM_COLOR]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5 xl:col-span-2">
          <div className="text-sm font-semibold mb-1">Monthly performance</div>
          <div className="text-xs text-muted-foreground mb-4">Posts published vs. scheduled</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={REVENUE_BY_MONTH.map((r, i) => ({ month: r.month, published: 40 + i * 12, scheduled: 60 + i * 10 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Line type="monotone" dataKey="published" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="scheduled" stroke="#10B981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="text-sm font-semibold mb-4">Team productivity</div>
          <div className="space-y-3">
            {EMPLOYEES.slice(0, 6).map((e) => {
              const pct = Math.min(100, e.tasks * 7);
              return (
                <div key={e.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium truncate">{e.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-soft p-5 xl:col-span-3">
          <div className="text-sm font-semibold mb-4">Top clients by revenue</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Client</th>
                  <th className="px-3 py-2 font-semibold">Industry</th>
                  <th className="px-3 py-2 font-semibold">Active projects</th>
                  <th className="px-3 py-2 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {CLIENTS.slice(0, 6).map((c, i) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-3 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-7 w-7 rounded-lg grid place-items-center text-[10px] font-semibold text-white" style={{ background: c.color }}>{c.initials}</span>
                        {c.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-foreground/80">{c.industry}</td>
                    <td className="px-3 py-3 text-foreground/80">{2 + (i % 3)}</td>
                    <td className="px-3 py-3 font-semibold">₹{(180 - i * 18).toFixed(0)}k</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
