import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatNumber } from "@/utils/mockData";

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
}

const SummaryCard = ({ title, value, subtitle }: SummaryCardProps) => {
  const handleExport = () => {
    console.log(`Exporting ${title}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-4xl font-bold text-primary">{formatNumber(value)}</p>
    </Card>
  );
};

export default SummaryCard;
