import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, FileText, Download, Plus, Trash2, Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  status: "Paid" | "Due";
  discount: number;
  vat: number;
  subtotal: number;
  totalAmount: number;
  dueDate: Date | null;
  notes: string | null;
  createdAt: Date;
}

interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceWithLineItems extends Invoice {
  lineItems: InvoiceLineItem[];
  client: {
    id: string;
    name: string;
    phone: string;
  };
}

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "ক্লায়েন্ট নির্বাচন করুন"),
  discount: z.number().min(0).max(100).default(0),
  vat: z.number().min(0).max(100).default(5),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
});

const lineItemSchema = z.object({
  description: z.string().min(1, "সার্ভিস বর্ণনা লিখুন"),
  quantity: z.number().min(1, "পরিমাণ ১ বা তার বেশি হতে হবে"),
  rate: z.number().min(1, "রেট ১ বা তার বেশি হতে হবে"),
});

export default function InvoiceMaker() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithLineItems | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, rate: 0 }]);

  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: "",
      discount: 0,
      vat: 5,
    },
  });

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "সফল", description: "ইনভয়েস তৈরি হয়েছে!" });
      setIsCreateDialogOpen(false);
      form.reset();
      setLineItems([{ description: "", quantity: 1, rate: 0 }]);
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "ইনভয়েস তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    },
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Paid" | "Due" }) => {
      const response = await apiRequest("PATCH", `/api/invoices/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "সফল", description: "স্ট্যাটাস আপডেট হয়েছে!" });
    },
  });

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const onSubmit = (values: z.infer<typeof invoiceFormSchema>) => {
    const validLineItems = lineItems.filter(item => 
      item.description && item.quantity > 0 && item.rate > 0
    );

    if (validLineItems.length === 0) {
      toast({ title: "ত্রুটি", description: "অন্তত একটি সার্ভিস যোগ করুন", variant: "destructive" });
      return;
    }

    createInvoiceMutation.mutate({
      ...values,
      lineItems: validLineItems,
    });
  };

  const viewInvoice = async (invoiceId: string) => {
    try {
      const response = await apiRequest("GET", `/api/invoices/${invoiceId}`);
      const invoice = await response.json();
      setSelectedInvoice(invoice);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast({ title: "ত্রুটি", description: "ইনভয়েস লোড করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const downloadPDF = (invoiceId: string) => {
    // Open the PDF endpoint in a new window to trigger download
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ইনভয়েস মেকার</h1>
          <p className="text-muted-foreground">কাজভিত্তিক পেমেন্টের ইনভয়েস তৈরি ও পরিচালনা করুন</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-invoice">
              <Plus className="h-4 w-4 mr-2" />
              নতুন ইনভয়েস
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>নতুন ইনভয়েস তৈরি করুন</DialogTitle>
              <DialogDescription>
                ক্লায়েন্ট নির্বাচন করুন এবং সার্ভিসের বিবরণ যোগ করুন
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ক্লায়েন্ট নির্বাচন</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-client">
                              <SelectValue placeholder="ক্লায়েন্ট নির্বাচন করুন" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client: any) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>পেমেন্ট ডেট</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-due-date"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>ডেট নির্বাচন করুন</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold">সার্ভিস/কাজের বিবরণ</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addLineItem}
                      data-testid="button-add-line-item"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      সার্ভিস যোগ করুন
                    </Button>
                  </div>

                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-end p-4 border rounded-lg">
                      <div>
                        <Label>সার্ভিস বিবরণ</Label>
                        <Input
                          placeholder="যেমন: Facebook Ad Campaign"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, "description", e.target.value)}
                          data-testid={`input-description-${index}`}
                        />
                      </div>
                      <div>
                        <Label>পরিমাণ</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                          data-testid={`input-quantity-${index}`}
                        />
                      </div>
                      <div>
                        <Label>রেট (৳)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, "rate", parseInt(e.target.value) || 0)}
                          data-testid={`input-rate-${index}`}
                        />
                      </div>
                      <div>
                        <Label>মোট (৳)</Label>
                        <Input
                          value={item.quantity * item.rate}
                          disabled
                          data-testid={`text-amount-${index}`}
                        />
                      </div>
                      <div>
                        {lineItems.length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            data-testid={`button-remove-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Summary */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>সাবটোটাল:</span>
                    <span data-testid="text-subtotal">৳{calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span>ডিসকাউন্ট:</span>
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 h-8"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-discount"
                          />
                        )}
                      />
                      <span>%</span>
                    </div>
                    <span data-testid="text-discount-amount">
                      -৳{Math.round((calculateSubtotal() * (form.watch("discount") || 0)) / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span>ভ্যাট:</span>
                      <FormField
                        control={form.control}
                        name="vat"
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 h-8"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-vat"
                          />
                        )}
                      />
                      <span>%</span>
                    </div>
                    <span data-testid="text-vat-amount">
                      +৳{Math.round(((calculateSubtotal() - Math.round((calculateSubtotal() * (form.watch("discount") || 0)) / 100)) * (form.watch("vat") || 0)) / 100)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>মোট:</span>
                    <span data-testid="text-total-amount">
                      ৳{calculateSubtotal() 
                        - Math.round((calculateSubtotal() * (form.watch("discount") || 0)) / 100) 
                        + Math.round(((calculateSubtotal() - Math.round((calculateSubtotal() * (form.watch("discount") || 0)) / 100)) * (form.watch("vat") || 0)) / 100)}
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>নোট (ঐচ্ছিক)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="অতিরিক্ত তথ্য বা শর্তাবলী"
                          {...field}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    বাতিল
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createInvoiceMutation.isPending}
                    data-testid="button-submit-invoice"
                  >
                    {createInvoiceMutation.isPending ? "তৈরি হচ্ছে..." : "ইনভয়েস তৈরি করুন"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">এখনো কোনো ইনভয়েস তৈরি হয়নি</p>
              <p className="text-sm text-muted-foreground">উপরের বাটনে ক্লিক করে নতুন ইনভয়েস তৈরি করুন</p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice: Invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xl" data-testid={`text-invoice-number-${invoice.id}`}>
                    {invoice.invoiceNumber}
                  </CardTitle>
                  <CardDescription>
                    তৈরি: {format(new Date(invoice.createdAt), "PPP")}
                    {invoice.dueDate && (
                      <span className="ml-4">
                        মেয়াদ: {format(new Date(invoice.dueDate), "PPP")}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={invoice.status === "Paid" ? "default" : "destructive"}
                    data-testid={`badge-status-${invoice.id}`}
                  >
                    {invoice.status === "Paid" ? "পেইড" : "বাকি"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewInvoice(invoice.id)}
                    data-testid={`button-view-${invoice.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    দেখুন
                  </Button>
                  {invoice.status === "Due" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: "Paid" })}
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-mark-paid-${invoice.id}`}
                    >
                      পেইড মার্ক করুন
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      সাবটোটাল: ৳{invoice.subtotal}
                      {invoice.discount > 0 && ` | ডিসকাউন্ট: ${invoice.discount}%`}
                      {invoice.vat > 0 && ` | ভ্যাট: ${invoice.vat}%`}
                    </p>
                    {invoice.notes && (
                      <p className="text-sm text-muted-foreground">নোট: {invoice.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" data-testid={`text-total-${invoice.id}`}>
                      ৳{invoice.totalAmount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>ইনভয়েস {selectedInvoice.invoiceNumber}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadPDF(selectedInvoice.id)}
                    data-testid="button-download-pdf"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF ডাউনলোড
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">বিল টু:</h3>
                    <p className="font-medium">{selectedInvoice.client.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.client.phone}</p>
                  </div>
                  <div className="text-right">
                    <p><strong>ইনভয়েস নম্বর:</strong> {selectedInvoice.invoiceNumber}</p>
                    <p><strong>তারিখ:</strong> {format(new Date(selectedInvoice.createdAt), "PPP")}</p>
                    {selectedInvoice.dueDate && (
                      <p><strong>মেয়াদ:</strong> {format(new Date(selectedInvoice.dueDate), "PPP")}</p>
                    )}
                    <Badge variant={selectedInvoice.status === "Paid" ? "default" : "destructive"}>
                      {selectedInvoice.status === "Paid" ? "পেইড" : "বাকি"}
                    </Badge>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">সার্ভিসের বিবরণ</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">বিবরণ</th>
                          <th className="text-center p-3">পরিমাণ</th>
                          <th className="text-right p-3">রেট</th>
                          <th className="text-right p-3">মোট</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3">{item.description}</td>
                            <td className="text-center p-3">{item.quantity}</td>
                            <td className="text-right p-3">৳{item.rate}</td>
                            <td className="text-right p-3">৳{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>সাবটোটাল:</span>
                      <span>৳{selectedInvoice.subtotal}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between">
                        <span>ডিসকাউন্ট ({selectedInvoice.discount}%):</span>
                        <span>-৳{Math.round((selectedInvoice.subtotal * selectedInvoice.discount) / 100)}</span>
                      </div>
                    )}
                    {selectedInvoice.vat > 0 && (
                      <div className="flex justify-between">
                        <span>ভ্যাট ({selectedInvoice.vat}%):</span>
                        <span>+৳{Math.round(((selectedInvoice.subtotal - Math.round((selectedInvoice.subtotal * selectedInvoice.discount) / 100)) * selectedInvoice.vat) / 100)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>মোট:</span>
                      <span>৳{selectedInvoice.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">নোট:</h3>
                    <p className="text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}