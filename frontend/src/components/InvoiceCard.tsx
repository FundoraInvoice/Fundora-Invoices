import React from 'react';
import { Calendar, DollarSign, Clock, Link } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InvoiceProps {
  invoiceId: string;
  amount: number;
  duration: number;
  dueDate: string;
  explorerUrl?: string;
}

const InvoiceCard: React.FC<InvoiceProps> = ({
  invoiceId,
  amount,
  duration,
  dueDate,
  explorerUrl
}) => {
  // Calculate days remaining
  const dueDateTime = new Date(dueDate).getTime();
  const currentTime = new Date().getTime();
  const daysRemaining = Math.ceil((dueDateTime - currentTime) / (1000 * 60 * 60 * 24));
  
  // Determine status badge color - using only allowed variants
  const getBadgeVariant = () => {
    if (daysRemaining < 0) return "destructive";
    if (daysRemaining < 7) return "secondary"; // Changed from "warning" to "secondary"
    return "outline";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800 transition-all duration-200 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-white">ID: {invoiceId}</CardTitle>
          <Badge variant={getBadgeVariant()} className="ml-2">
            {daysRemaining < 0 
              ? 'Overdue' 
              : daysRemaining === 0 
                ? 'Due Today'
                : `${daysRemaining} days left`
            }
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-3">
        <div className="space-y-3">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-400" />
            <span className="text-lg font-semibold">{amount} USD</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            <span>{duration} Days</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-400" />
            <span>Due: {formatDate(dueDate)}</span>
          </div>
        </div>
      </CardContent>
      
      {explorerUrl && (
        <CardFooter className="pt-0 border-t border-gray-800">
          <Button variant="link" className="p-0 h-auto text-blue-400 hover:text-blue-300" asChild>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
              <Link className="w-4 h-4 mr-1" />
              View on Explorer
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default InvoiceCard;
