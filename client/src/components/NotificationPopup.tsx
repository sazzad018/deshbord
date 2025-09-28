import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, DollarSign, User, Calendar, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils-dashboard";
import type { PaymentRequest, Client } from "@shared/schema";

interface NotificationData {
  id: string;
  type: 'payment_request' | 'payment_approved' | 'payment_rejected';
  title: string;
  message: string;
  timestamp: string;
  data: {
    paymentRequest?: PaymentRequest;
    client?: Client;
  };
}

interface NotificationPopupProps {
  notification: NotificationData;
  onDismiss: (id: string) => void;
  onViewDetails?: (paymentRequest: PaymentRequest) => void;
}

export default function NotificationPopup({ notification, onDismiss, onViewDetails }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const handleViewDetails = () => {
    if (onViewDetails && paymentRequest) {
      onViewDetails(paymentRequest);
    }
    handleDismiss();
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return '📱';
      case 'nagad':
        return '💳';
      case 'rocket':
        return '🚀';
      case 'bank':
        return '🏦';
      default:
        return '💰';
    }
  };

  if (!isVisible) {
    return null;
  }

  const { paymentRequest, client } = notification.data;
  
  // Return null if required data is missing
  if (!paymentRequest || !client) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 fade-in-0 duration-500">
      <Card className="w-96 shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-800">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 shadow-md animate-pulse">
                <Bell className="h-5 w-5 text-white" />
              </div>
              নতুন পেমেন্ট রিকোয়েস্ট
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 hover:bg-red-100 rounded-full"
              data-testid="button-dismiss-notification"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Client Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 shadow-sm">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{client.name}</p>
              <p className="text-sm text-gray-600">{client.phone}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/60">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-800">Amount:</span>
              </div>
              <span className="font-bold text-lg text-emerald-700">
                {formatCurrency(paymentRequest.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50/80 rounded-xl border border-purple-200/60">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">Method:</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">
                {getPaymentMethodIcon(paymentRequest.paymentMethod)} {paymentRequest.paymentMethod}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/80 rounded-xl border border-amber-200/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-800">Time:</span>
              </div>
              <span className="text-sm font-medium text-amber-700">
                {new Date(paymentRequest.requestDate).toLocaleString('bn-BD')}
              </span>
            </div>

            {paymentRequest.transactionId && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/60">
                <p className="text-sm font-medium text-blue-800 mb-1">Transaction ID:</p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono">
                  {paymentRequest.transactionId}
                </code>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleViewDetails}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              data-testid="button-view-payment-details"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1 border-gray-300 hover:bg-gray-50"
              data-testid="button-dismiss-notification-secondary"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}