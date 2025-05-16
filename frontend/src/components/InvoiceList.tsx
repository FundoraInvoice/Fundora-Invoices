import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Search, Filter, DollarSign, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DB_KEYS, Invoice, Investment } from "@/types/database";
import { format } from "date-fns";

interface InvoiceListProps {
  userRole: "sme" | "investor";
  username?: string;
  userId?: string;
  portfolioOnly?: boolean;
}

const InvoiceList = ({ userRole, username, userId, portfolioOnly = false }: InvoiceListProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Load invoices and investments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Always load investments from localStorage
        const storedInvestments = localStorage.getItem(DB_KEYS.INVESTMENTS);
        if (storedInvestments) {
          setInvestments(JSON.parse(storedInvestments));
        }

        // Fetch invoices based on user role and view
        if (userRole === "investor" && !portfolioOnly) {
          // Fetch all available invoices from MongoDB for investor view
          const response = await fetch('http://localhost:5000/api/invoices/all');
          if (!response.ok) throw new Error('Failed to fetch invoices');
          
          const data = await response.json();
          setInvoices(data.filter((invoice: Invoice) => invoice.status === "Available"));
          setFilteredInvoices(data.filter((invoice: Invoice) => invoice.status === "Available"));
        } else if (userRole === "investor" && portfolioOnly && userId) {
          // For investor portfolio, show only their invested invoices
          const investedInvoiceIds = investments
            .filter(inv => inv.investor_id === userId)
            .map(inv => inv.invoice_id);

          const response = await fetch('http://localhost:5000/api/invoices/all');
          if (!response.ok) throw new Error('Failed to fetch invoices');
          
          const data = await response.json();
          const portfolioInvoices = data.filter((invoice: Invoice) => 
            investedInvoiceIds.includes(invoice.id)
          );
          
          setInvoices(portfolioInvoices);
          setFilteredInvoices(portfolioInvoices);
        } else if (userRole === "sme" && userId) {
          // For SME, fetch their own invoices
          const response = await fetch(`http://localhost:5000/api/invoices?smeId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch invoices');
          
          const data = await response.json();
          setInvoices(data);
          setFilteredInvoices(data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data from server');
        
        // Fallback to localStorage if API fails
        const storedInvoices = localStorage.getItem(DB_KEYS.INVOICES);
        if (storedInvoices) {
          const parsedInvoices = JSON.parse(storedInvoices);
          setInvoices(parsedInvoices);
          setFilteredInvoices(parsedInvoices);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userRole, userId, portfolioOnly]);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    let result = [...invoices];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        invoice => 
          (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (invoice.description && invoice.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        invoice => invoice.status && invoice.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply amount filter
    if (amountFilter !== "all") {
      const [min, max] = amountFilter.split("-").map(Number);
      result = result.filter(invoice => {
        const amount = parseFloat(invoice.amount);
        if (max) {
          return amount >= min && amount <= max;
        } else {
          return amount >= min;
        }
      });
    }
    
    setFilteredInvoices(result);
  }, [searchTerm, statusFilter, amountFilter, invoices]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount) || 0);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    // Show investment details if it's an investor viewing their portfolio
    if (userRole === "investor" && portfolioOnly && userId) {
      const investment = investments.find(
        inv => inv.invoice_id === invoice.id && inv.investor_id === userId
      );
      
      if (investment) {
        toast.info(`Investment of ${formatCurrency(investment.amount)} made on ${format(new Date(investment.created_at), 'MMM dd, yyyy')}`);
      }
    } else {
      toast.info(`Viewing invoice: ${invoice.invoiceNumber}`);
    }
  };

  const handleInvest = async (invoice: Invoice) => {
    if (!userId) {
      toast.error("Please log in to invest");
      return;
    }
    
    try {
      // Create new investment
      const newInvestment: Investment = {
        id: crypto.randomUUID(),
        invoice_id: invoice.id,
        investor_id: userId,
        amount: invoice.amount,
        status: 'Confirmed',
        transaction_hash: "0x" + Math.random().toString(36).substring(2, 15),
        return_amount: (parseFloat(invoice.amount) * 1.1).toFixed(2), // 10% return
        return_date: new Date(
          new Date().getTime() + parseInt(invoice.duration) * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save investment to localStorage
      const existingInvestments = JSON.parse(localStorage.getItem(DB_KEYS.INVESTMENTS) || "[]");
      existingInvestments.push(newInvestment);
      localStorage.setItem(DB_KEYS.INVESTMENTS, JSON.stringify(existingInvestments));
      
      // Update the invoice's status in MongoDB
      const response = await fetch(`http://localhost:5000/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "Funded",
          investor_id: userId
        })
      });
      
      if (!response.ok) throw new Error('Failed to update invoice status');
      
      // Refresh the list
      const updatedResponse = await fetch('http://localhost:5000/api/invoices/all');
      const updatedData = await updatedResponse.json();
      setInvoices(updatedData.filter((inv: Invoice) => inv.status === "Available"));
      
      toast.success("Investment successful!");
    } catch (error) {
      console.error('Investment error:', error);
      toast.error("Failed to complete investment");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-300">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search invoices..." 
            className="bg-white/10 border-fundora-blue/30 text-white pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px] bg-white/10 border-fundora-blue/30 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={amountFilter} 
          onValueChange={setAmountFilter}
        >
          <SelectTrigger className="w-[180px] bg-white/10 border-fundora-blue/30 text-white">
            <SelectValue placeholder="Filter by amount" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Amounts</SelectItem>
            <SelectItem value="0-1000">$0 - $1,000</SelectItem>
            <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
            <SelectItem value="10000-50000">$10,000 - $50,000</SelectItem>
            <SelectItem value="50000">$50,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-10">
          <FileUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-orbitron text-gradient mb-2">No Invoices Found</h3>
          <p className="text-gray-300 max-w-md mx-auto">
            {invoices.length === 0 ? 
              (userRole === "sme" ? 
                "Create your first invoice to get started." : 
                "No invoices available for investment at the moment.") : 
              "No invoices match your current filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="bg-white/5 border border-fundora-blue/30 hover:border-fundora-blue transition-all"
            >
              <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">Invoice #{invoice.invoiceNumber}</h3>
                    <Badge className={
                      invoice.status === "Available" ? "bg-green-500/70" :
                      invoice.status === "Funded" ? "bg-blue-500/70" :
                      "bg-purple-500/70"
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                  {invoice.description && (
                    <p className="text-sm text-gray-400 line-clamp-1">{invoice.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Due date: {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex flex-col md:items-end">
                  <span className="font-semibold text-white">
                    {formatCurrency(invoice.amount)}
                  </span>
                  
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline" 
                      size="sm"
                      className="text-xs glass-morphism"
                      onClick={() => handleViewDetails(invoice)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    
                    {userRole === "investor" && invoice.status === "Available" && !portfolioOnly && (
                      <Button
                        size="sm"
                        className="text-xs bg-gradient-to-r from-fundora-blue to-fundora-cyan"
                        onClick={() => handleInvest(invoice)}
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Invest
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceList;