import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { PaymentRequest, Client } from '@shared/schema';

export interface NotificationData {
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

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (notification: NotificationData) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  role?: 'admin' | 'client';
  userId?: string;
}

export function NotificationProvider({ children, role = 'admin', userId = 'admin' }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = parseInt(window.location.port || '5000') + 1; // WebSocket on port 5001
    return `${protocol}//${host}:${port}?role=${role}&userId=${userId}`;
  };

  const connectWebSocket = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    const websocketUrl = getWebSocketUrl();
    
    try {
      const websocket = new WebSocket(websocketUrl);

      websocket.onopen = () => {
        console.log('[Notification] WebSocket connected');
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const notification: NotificationData = JSON.parse(event.data);
          console.log('[Notification] Received:', notification);

          // Skip welcome messages from being displayed as notifications
          if (notification.id === 'welcome') {
            return;
          }

          // Only show payment request notifications to admins
          if (role === 'admin' && notification.type === 'payment_request') {
            addNotification(notification);
          }
        } catch (error) {
          console.error('[Notification] Error parsing message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log('[Notification] WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        setWs(null);

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`[Notification] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`);
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, delay);
        }
      };

      websocket.onerror = (error) => {
        console.error('[Notification] WebSocket error:', error);
        setConnectionStatus('error');
      };

      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearInterval(pingInterval);
        }
      }, 25000);

      return () => {
        clearInterval(pingInterval);
        websocket.close();
      };

    } catch (error) {
      console.error('[Notification] Failed to create WebSocket:', error);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    // Only connect WebSocket for admin users
    if (role === 'admin') {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [role, userId]);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => {
      // Avoid duplicates
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;

      // Keep only the last 5 notifications
      const updated = [notification, ...prev].slice(0, 5);
      return updated;
    });

    // Auto-remove notification after 10 seconds if not manually dismissed
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    isConnected: connectionStatus === 'connected',
    connectionStatus,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Hook for managing notifications
export function useNotificationManager() {
  const { addNotification, removeNotification, clearAllNotifications } = useNotifications();

  const showPaymentRequestNotification = (paymentRequest: PaymentRequest, client: Client) => {
    const notification: NotificationData = {
      id: `payment_${paymentRequest.id}_${Date.now()}`,
      type: 'payment_request',
      title: 'নতুন পেমেন্ট রিকোয়েস্ট',
      message: `${client.name} একটি ${paymentRequest.amount / 100} টাকার পেমেন্ট রিকোয়েস্ট পাঠিয়েছেন`,
      timestamp: new Date().toISOString(),
      data: {
        paymentRequest,
        client
      }
    };

    addNotification(notification);
  };

  const showPaymentApprovedNotification = (paymentRequest: PaymentRequest, client: Client) => {
    const notification: NotificationData = {
      id: `approved_${paymentRequest.id}_${Date.now()}`,
      type: 'payment_approved',
      title: 'পেমেন্ট অনুমোদিত',
      message: `${client.name} এর পেমেন্ট রিকোয়েস্ট অনুমোদন করা হয়েছে`,
      timestamp: new Date().toISOString(),
      data: {
        paymentRequest,
        client
      }
    };

    addNotification(notification);
  };

  const showPaymentRejectedNotification = (paymentRequest: PaymentRequest, client: Client) => {
    const notification: NotificationData = {
      id: `rejected_${paymentRequest.id}_${Date.now()}`,
      type: 'payment_rejected',
      title: 'পেমেন্ট প্রত্যাখ্যাত',
      message: `${client.name} এর পেমেন্ট রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে`,
      timestamp: new Date().toISOString(),
      data: {
        paymentRequest,
        client
      }
    };

    addNotification(notification);
  };

  return {
    showPaymentRequestNotification,
    showPaymentApprovedNotification,
    showPaymentRejectedNotification,
    removeNotification,
    clearAllNotifications
  };
}