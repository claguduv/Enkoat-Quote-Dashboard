
import { Dashboard } from "@/components/Dashboard";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Track your project metrics and analyze performance trends across different regions and roof types
          </p>
        </div>
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
