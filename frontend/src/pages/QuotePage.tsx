
import { QuoteForm } from "@/components/QuoteForm";

const QuotePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Submit a New Quote
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
          Fill out the form below to get started with your roofing project quote
        </p>
        <div className="glass-morphism">
          <QuoteForm />
        </div>
      </div>
    </div>
  );
};

export default QuotePage;
