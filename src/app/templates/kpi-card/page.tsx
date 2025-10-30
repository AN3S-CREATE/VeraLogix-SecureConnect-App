import { ArrowUp, ArrowDown } from "lucide-react";

export default function KpiCardTemplatePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">KPI Card Template Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 vx-card">
          <p className="text-sm text-foreground/80">Active Users</p>
          <p className="text-4xl font-bold text-gradient-primary">1,234</p>
          <div className="flex items-center text-sm mt-2 delta-positive">
            <ArrowUp className="h-4 w-4 mr-1" />
            <span>5.2% vs last month</span>
          </div>
        </div>
        <div className="p-6 vx-card">
          <p className="text-sm text-foreground/80">Incidents Reported</p>
          <p className="text-4xl font-bold text-gradient-primary">87</p>
          <div className="flex items-center text-sm mt-2 delta-negative">
            <ArrowDown className="h-4 w-4 mr-1" />
            <span>-1.8% vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
