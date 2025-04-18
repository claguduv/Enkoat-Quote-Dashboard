
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold text-primary">
            EnKoat Portal
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/quote" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>New Quote</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/dashboard" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
