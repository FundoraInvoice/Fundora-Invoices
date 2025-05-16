/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import ChatSidebar from "@/components/ChatSidebar";
import FloatingElements from "@/components/FloatingElements";
import SmallInvoiceForm from "@/components/SmallInvoiceForm";
import InvoiceList from "@/components/InvoiceList";
import { FileUp, DollarSign, Wallet } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Toggle chat sidebar
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Check if user is logged in
  useEffect(() => {
  const userInfo = localStorage.getItem("user");
  console.log("userInfo from localStorage:", userInfo);

  if (userInfo) {
    const parsedUser = JSON.parse(userInfo);
    setUser(parsedUser);
    if (parsedUser.role === "investor") {
      setActiveTab("invest");
    }
  } else {
    navigate("/login"); // redirect if not logged in
  }
}, [navigate]);



  if (!user) {
    return null;
  }

  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
  const userInvoices = invoices.filter((invoice: any) =>
    (user.role === "sme" && invoice.ethName === user.username) ||
    (user.role === "investor" && invoice.investor === user.username)
  );

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount) || 0);
  };

  const calculateTotalValue = () => {
    return userInvoices.reduce((total: number, invoice: any) => {
      return total + (parseFloat(invoice.amount) || 0);
    }, 0);
  };

  return (
    <div className="flex h-screen bg-fundora-dark">
      {/* Sidebar from your existing component */}
      <DashboardSidebar user={user} onToggleChat={toggleChat} />

      {/* Chat Sidebar */}
      <ChatSidebar isOpen={isChatOpen} onClose={toggleChat} user={user} />

      {/* Main content */}
      <main className={`flex-1 p-6 overflow-auto relative transition-all ${isChatOpen ? "md:mr-80" : ""}`}>
        <FloatingElements />

        <div className="relative z-10 h-full md:p-10">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-orbitron text-gradient">
              {user.role === "sme" ? "SME Dashboard" : "Investor Dashboard"}
            </h1>
            <p className="text-gray-300 mt-2">
              {user.role === "sme"
                ? "Create and manage your invoices for funding"
                : "Browse and invest in available invoices"}
            </p>
          </header>

          {/* Summary Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-morphism border border-fundora-blue/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-fundora-blue/20">
                    <FileUp className="h-6 w-6 text-fundora-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      {user.role === "sme" ? "Your Invoices" : "Investments"}
                    </p>
                    <h3 className="text-2xl font-semibold text-white">
                      {userInvoices.length}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-morphism border border-fundora-blue/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-fundora-blue/20">
                    <DollarSign className="h-6 w-6 text-fundora-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Value</p>
                    <h3 className="text-2xl font-semibold text-white">
                      {formatCurrency(calculateTotalValue().toString())}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-morphism border border-fundora-blue/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-fundora-blue/20">
                    <Wallet className="h-6 w-6 text-fundora-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Wallet Balance</p>
                    <h3 className="text-2xl font-semibold text-white">
                      {formatCurrency("5000")} {/* Placeholder */}
                    {/* </h3> */}
                  {/* </div> */}
                {/* </div> */}
              {/* </CardContent> */}

            {/* </Card> */}

          {/* </div> */} 

          {/* Tabs and main dashboard content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl">
            <TabsList className={`grid w-full ${user.role === "sme" ? "grid-cols-2" : "grid-cols-2"} glass-morphism mb-6`}>
              {user.role === "sme" ? (
                <>
                  <TabsTrigger
                    value="create"
                    className="py-3 data-[state=active]:text-gradient data-[state=active]:font-semibold"
                  >
                    <FileUp className="mr-2 h-4 w-4" /> Create Invoice
                  </TabsTrigger>
                  {/* <TabsTrigger
                    value="manage"
                    className="py-3 data-[state=active]:text-gradient data-[state=active]:font-semibold"
                  >
                    <DollarSign className="mr-2 h-4 w-4" /> My Invoices
                  </TabsTrigger> */}
                </>
              ) : (
                <>
                  <TabsTrigger
                    value="invest"
                    className="py-3 data-[state=active]:text-gradient data-[state=active]:font-semibold"
                  >
                    <DollarSign className="mr-2 h-4 w-4" /> Invest in Invoices
                  </TabsTrigger>
                  <TabsTrigger
                    value="portfolio"
                    className="py-3 data-[state=active]:text-gradient data-[state=active]:font-semibold"
                  >
                    <FileUp className="mr-2 h-4 w-4" /> My Investments
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* SME Tabs */}
            {user.role === "sme" && (
              <>
                <TabsContent value="create" className="mt-0">
                  <Card className="glass-morphism border border-fundora-blue/30">
                    <CardContent className="pt-6">
                      <SmallInvoiceForm user={user} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="manage" className="mt-0">
                  <Card className="glass-morphism border border-fundora-blue/30">
                    <CardContent className="pt-6">
                      <InvoiceList userRole="sme" username={user.username} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            {/* Investor Tabs */}
            {user.role === "investor" && (
              <>
                <TabsContent value="invest" className="mt-0">
                  <Card className="glass-morphism border border-fundora-blue/30">
                    <CardContent className="pt-6">
                      <InvoiceList userRole="investor" />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="portfolio" className="mt-0">
                  <Card className="glass-morphism border border-fundora-blue/30">
                    <CardContent className="pt-6">
                      <InvoiceList userRole="investor" portfolioOnly={true} username={user.username} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;