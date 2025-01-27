import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardActions from "@/components/dashboard/DashboardActions";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <main className="container mx-auto p-6">
        <div className="grid gap-6">
          <DashboardActions />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;