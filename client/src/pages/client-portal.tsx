import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Wallet, Receipt, TrendingUp, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClientWithDetails } from "@shared/schema";

export default function ClientPortal() {
  const [match, params] = useRoute("/portal/:portalKey");
  const [clientData, setClientData] = useState<ClientWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch client data by portal key
  useEffect(() => {
    const fetchClientData = async () => {
      if (!params?.portalKey) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/clients/portal/${params.portalKey}`);
        
        if (!response.ok) {
          throw new Error("ক্লায়েন্ট তথ্য পাওয়া যায়নি");
        }
        
        const data = await response.json();
        setClientData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [params?.portalKey]);

  if (!match) {
    return <div>পেজ পাওয়া যায়নি</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-red-600 text-lg">{error || "ক্লায়েন্ট তথ্য পাওয়া যায়নি"}</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  const currentBalance = clientData.walletDeposited - clientData.walletSpent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">স্বাগতম, {clientData.name}</h1>
                <p className="text-gray-600">আপনার প্রজেক্ট এবং ব্যালেন্সের বিস্তারিত তথ্য</p>
              </div>
            </div>
            <Badge variant={clientData.status === "Active" ? "default" : "secondary"}>
              {clientData.status === "Active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                মোট জমা
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-600">
                ৳{clientData.walletDeposited.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                মোট খরচ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-red-600">
                ৳{clientData.walletSpent.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                বর্তমান ব্যালেন্স
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ৳{currentBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">আপনার তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">নাম</p>
                <p className="font-medium">{clientData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ফোন</p>
                <p className="font-medium">{clientData.phone}</p>
              </div>
              {clientData.fb && (
                <div>
                  <p className="text-sm text-gray-600">ফেসবুক</p>
                  <a href={clientData.fb} target="_blank" rel="noopener noreferrer" 
                     className="text-purple-600 hover:underline text-sm">
                    Facebook Profile
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-2">সার্ভিস স্কোপ</p>
                <div className="flex flex-wrap gap-1">
                  {clientData.scopes.map((scope, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Service Scopes */}
          <Card className="lg:col-span-2 rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">সক্রিয় সার্ভিস স্কোপ</CardTitle>
            </CardHeader>
            <CardContent>
              {clientData.serviceScopes && clientData.serviceScopes.length > 0 ? (
                <div className="space-y-3">
                  {clientData.serviceScopes
                    .filter(scope => scope.status === "Active")
                    .map((scope) => (
                    <div key={scope.id} className="border rounded-lg p-3 bg-purple-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="default" className="bg-purple-600">{scope.serviceName}</Badge>
                          </div>
                          <p className="text-sm text-gray-700">{scope.scope}</p>
                          {scope.notes && (
                            <p className="text-xs text-gray-500 mt-1">{scope.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  কোনো সক্রিয় সার্ভিস স্কোপ নেই
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Spending History */}
        <Card className="rounded-2xl shadow-sm mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">খরচের ইতিহাস</CardTitle>
            <p className="text-sm text-gray-600">আপনার সাম্প্রতিক লেনদেনের বিস্তারিত</p>
          </CardHeader>
          <CardContent>
            {clientData.logs && clientData.logs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>খরচ</TableHead>
                    <TableHead>বিবরণ</TableHead>
                    <TableHead className="text-right">ব্যালেন্স</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.logs
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10) // Show last 10 transactions
                    .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-red-600 font-medium">
                        -৳{log.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{log.note || "—"}</TableCell>
                      <TableCell className={`text-right font-medium ${log.balanceAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ৳{log.balanceAfter.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                কোনো লেনদেনের ইতিহাস নেই
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>আরো তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন</p>
          <p className="mt-1">© {new Date().getFullYear()} Social Ads Expert</p>
        </div>
      </div>
    </div>
  );
}