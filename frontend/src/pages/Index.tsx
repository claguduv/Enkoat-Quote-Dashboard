
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          EnKoat Quote Portal
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Submit roofing project quotes and track performance metrics with our
          comprehensive dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/quote" className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Submit Quote
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              View Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
