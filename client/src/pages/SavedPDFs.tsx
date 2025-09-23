import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, ExternalLink, Search, Calendar, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import { useToast } from "@/hooks/use-toast";
import type { InvoicePdf, Client } from "@shared/schema";

export default function SavedPDFs() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch saved PDFs
  const { data: savedPDFs = [], isLoading } = useQuery<InvoicePdf[]>({
    queryKey: ["/api/invoice-pdfs"],
  });

  // Fetch clients for name mapping
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Create client mapping for quick lookup
  const clientMap = clients.reduce((acc, client) => {
    acc[client.id] = client.name;
    return acc;
  }, {} as Record<string, string>);

  // Filter PDFs based on search
  const filteredPDFs = savedPDFs.filter(pdf => {
    if (!searchQuery.trim()) return true;
    const searchTerm = searchQuery.toLowerCase();
    const clientName = clientMap[pdf.clientId] || "";
    
    return (
      pdf.fileName.toLowerCase().includes(searchTerm) ||
      pdf.invoiceNo.toLowerCase().includes(searchTerm) ||
      clientName.toLowerCase().includes(searchTerm)
    );
  });

  const handleDownloadPDF = (pdf: InvoicePdf) => {
    if (!pdf.data || !pdf.data.startsWith('data:application/pdf')) {
      toast({
        title: "ত্রুটি",
        description: "PDF ডেটা সঠিক নয়",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = pdf.data;
      link.download = pdf.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "সফল",
        description: "PDF ডাউনলোড শুরু হয়েছে",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "ত্রুটি",
        description: "PDF ডাউনলোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleViewPDF = (pdf: InvoicePdf) => {
    if (!pdf.data || !pdf.data.startsWith('data:application/pdf')) {
      toast({
        title: "ত্রুটি",
        description: "PDF ডেটা সঠিক নয়",
        variant: "destructive",
      });
      return;
    }

    try {
      // Open PDF in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${pdf.fileName}</title>
              <style>
                body { margin: 0; padding: 0; }
                embed { width: 100%; height: 100vh; }
              </style>
            </head>
            <body>
              <embed src="${pdf.data}" type="application/pdf" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error("View error:", error);
      toast({
        title: "ত্রুটি",
        description: "PDF দেখতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">সংরক্ষিত PDF ইনভয়েস</CardTitle>
                <p className="text-gray-600 text-sm">সমস্ত তৈরি করা ইনভয়েস PDF দেখুন এবং ডাউনলোড করুন</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ইনভয়েস নাম্বার, ক্লায়েন্ট নাম বা ফাইল নাম সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-pdfs"
                />
              </div>
              <Badge variant="outline" className="text-sm">
                মোট: {filteredPDFs.length} টি PDF
              </Badge>
            </div>

            {/* PDFs Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">লোড হচ্ছে...</div>
              </div>
            ) : filteredPDFs.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {savedPDFs.length === 0 ? "কোন PDF পাওয়া যায়নি" : "সার্চ ফলাফল খালি"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {savedPDFs.length === 0 
                    ? "এখনো কোন ইনভয়েস PDF তৈরি করা হয়নি। ইনভয়েস মেকার থেকে প্রথম PDF তৈরি করুন।"
                    : "অন্য কিওয়ার্ড দিয়ে সার্চ করুন।"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-testid="table-saved-pdfs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ইনভয়েস নাম্বার</TableHead>
                      <TableHead>ক্লায়েন্ট</TableHead>
                      <TableHead>ফাইল সাইজ</TableHead>
                      <TableHead>তৈরির তারিখ</TableHead>
                      <TableHead>অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPDFs.map((pdf) => (
                      <TableRow 
                        key={pdf.id}
                        data-testid={`row-pdf-${pdf.id}`}
                      >
                        <TableCell className="font-medium" data-testid={`text-invoice-no-${pdf.id}`}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            {pdf.invoiceNo}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-client-name-${pdf.id}`}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {clientMap[pdf.clientId] || "অজানা ক্লায়েন্ট"}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-file-size-${pdf.id}`}>
                          <span className="text-sm text-gray-600">
                            {(pdf.size / 1024).toFixed(1)} KB
                          </span>
                        </TableCell>
                        <TableCell data-testid={`text-created-date-${pdf.id}`}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(pdf.createdAt).toLocaleDateString('bn-BD')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPDF(pdf)}
                              className="flex items-center gap-1"
                              data-testid={`button-view-${pdf.id}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              দেখুন
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-1"
                              onClick={() => handleDownloadPDF(pdf)}
                              data-testid={`button-download-${pdf.id}`}
                            >
                              <Download className="h-3 w-3" />
                              ডাউনলোড
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}