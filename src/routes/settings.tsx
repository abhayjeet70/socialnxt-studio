import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal } from "lucide-react";
import { EMPLOYEES, ROLES } from "@/lib/demo-data";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SocialNxt CRM" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Manage members, roles, departments and workspace preferences.">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-muted/60 p-1 rounded-xl flex flex-wrap h-auto">
          {["members", "roles", "permissions", "departments", "leads", "company"].map((v) => (
            <TabsTrigger key={v} value={v} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm capitalize">
              {v === "leads" ? "Lead Assignment" : v === "company" ? "Company Settings" : v}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="members" className="mt-5">
          <div className="card-soft p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <div className="font-semibold">Employee management</div>
                <div className="text-xs text-muted-foreground">Toggle active status and manage workspace access.</div>
              </div>
              <Button className="rounded-xl h-10"><Plus className="h-4 w-4" /> Add Employee</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-3 py-3 font-semibold">Department</th>
                    <th className="px-3 py-3 font-semibold">Active</th>
                    <th className="px-3 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {EMPLOYEES.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-semibold" style={{ background: e.color }}>{e.initials}</div>
                          <div>
                            <div className="font-semibold">{e.name}</div>
                            <div className="text-xs text-muted-foreground">{e.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-foreground/80">{e.role}</td>
                      <td className="px-3 py-3 text-foreground/80">{e.department}</td>
                      <td className="px-3 py-3"><Switch defaultChecked={e.status !== "Offline"} /></td>
                      <td className="px-3 py-3 text-right">
                        <button className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center"><MoreHorizontal className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map((r) => (
              <div key={r} className="card-soft p-5">
                <div className="font-semibold">{r}</div>
                <div className="text-xs text-muted-foreground mt-1">{EMPLOYEES.filter(e => e.role === r).length} members</div>
                <Badge variant="secondary" className="mt-3 rounded-full">Standard access</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-5">
          <div className="card-soft p-5 space-y-4">
            {[
              "View all clients",
              "Edit content calendar",
              "Approve proposals",
              "Manage employees",
              "Export reports",
            ].map((p) => (
              <div key={p} className="flex items-center justify-between">
                <div className="text-sm font-medium">{p}</div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Client Services", "Creative", "Content", "Strategy"].map((d) => (
              <div key={d} className="card-soft p-5">
                <div className="font-semibold">{d}</div>
                <div className="text-xs text-muted-foreground mt-1">{EMPLOYEES.filter(e => e.department === d).length} members</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-5">
          <div className="card-soft p-5 space-y-4 max-w-xl">
            <div>
              <Label>Default assignment</Label>
              <Input className="mt-1.5 rounded-xl h-11" defaultValue="Round robin" />
            </div>
            <div>
              <Label>Auto-assign threshold</Label>
              <Input className="mt-1.5 rounded-xl h-11" defaultValue="10 tasks per employee" />
            </div>
            <Button className="rounded-xl h-10">Save changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="company" className="mt-5">
          <div className="card-soft p-5 space-y-4 max-w-xl">
            <div>
              <Label>Company name</Label>
              <Input className="mt-1.5 rounded-xl h-11" defaultValue="SocialNxt" />
            </div>
            <div>
              <Label>Workspace URL</Label>
              <Input className="mt-1.5 rounded-xl h-11" defaultValue="socialnxt.crm" />
            </div>
            <div>
              <Label>Support email</Label>
              <Input className="mt-1.5 rounded-xl h-11" defaultValue="hello@socialnxt.in" />
            </div>
            <Button className="rounded-xl h-10">Save changes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
