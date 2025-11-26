import Layout from "@/components/layout/Layout";
import MetricCard from "@/components/dashboard/MetricCard";
import { metricNames } from "@/utils/mockData";

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MPESA CVM Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all key metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metricNames.map((name) => (
            <MetricCard key={name} title={name} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
