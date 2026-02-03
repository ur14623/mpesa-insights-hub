import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import Dashboard from "./pages/Dashboard";
import MetricDetail from "./pages/MetricDetail";
import BasePreparation from "./pages/BasePreparation";
import TableDetailPage from "./pages/base-preparation/TableDetailPage";
import MySchemaPage from "./pages/tables/MySchemaPage";
import SavedTablesPage from "./pages/tables/SavedTablesPage";
import TableViewPage from "./pages/tables/TableViewPage";
import SQLQueryLibrary from "./pages/SQLQueryLibrary";
import SQLQueryDetail from "./pages/SQLQueryDetail";
import TaskManager from "./pages/TaskManager";
import CVMFlowPage from "./pages/cvm/CVMFlowPage";
import GAFlowManagement from "./pages/cvm/GAFlowManagement";
import CreateFlowPage from "./pages/cvm/CreateFlowPage";
import DailyDropperTracking from "./pages/cvm/DailyDropperTracking";
import ThirtyDayDropperTracking from "./pages/cvm/ThirtyDayDropperTracking";
import UnutilizedBalanceTracking from "./pages/cvm/UnutilizedBalanceTracking";
import DormantActivation from "./pages/cvm/DormantActivation";
import PinUnlock from "./pages/cvm/PinUnlock";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="metric/:metricId" element={<MetricDetail />} />
            <Route path="base-preparation" element={<BasePreparation />} />
            <Route path="base-preparation/table/:tableName" element={<TableDetailPage />} />
            <Route path="tables/schema" element={<MySchemaPage />} />
            <Route path="tables/saved" element={<SavedTablesPage />} />
            <Route path="tables/schema/:tableName/view" element={<TableViewPage />} />
            <Route path="tables/saved/:tableName/view" element={<TableViewPage />} />
            <Route path="sql-query-library" element={<SQLQueryLibrary />} />
            <Route path="sql-query/:queryId" element={<SQLQueryDetail />} />
            <Route path="task-manager" element={<TaskManager />} />
            <Route path="cvm/ga-flow-up" element={<GAFlowManagement />} />
            <Route path="cvm/ga-flow-up/create" element={<CreateFlowPage />} />
            <Route path="cvm/daily-dropper" element={<DailyDropperTracking />} />
            <Route path="cvm/30d-dropper" element={<ThirtyDayDropperTracking />} />
            <Route path="cvm/unutilized-balance" element={<UnutilizedBalanceTracking />} />
            <Route path="cvm/dormant-activation" element={<DormantActivation />} />
            <Route path="cvm/pin-unlock" element={<PinUnlock />} />
            <Route path="cvm/:flowType" element={<CVMFlowPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
