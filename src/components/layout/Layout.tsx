import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="ml-64 mt-16 mb-16 p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
