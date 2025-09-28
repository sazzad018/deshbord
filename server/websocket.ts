import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
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

interface ClientConnection extends WebSocket {
  isAlive?: boolean;
  userId?: string;
  role?: 'admin' | 'client';
}

class NotificationService {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, ClientConnection[]> = new Map();

  initialize(port: number) {
    this.wss = new WebSocketServer({ 
      port,
      clientTracking: true 
    });

    console.log(`[WebSocket] Notification server running on port ${port}`);

    this.wss.on('connection', (ws: ClientConnection, request: IncomingMessage) => {
      console.log('[WebSocket] New client connected');
      
      ws.isAlive = true;
      
      // Parse query parameters for user identification
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const role = url.searchParams.get('role') as 'admin' | 'client';
      const userId = url.searchParams.get('userId');
      
      ws.role = role || 'admin';
      ws.userId = userId || 'anonymous';

      // Add to connections map
      if (!this.connections.has(ws.role)) {
        this.connections.set(ws.role, []);
      }
      this.connections.get(ws.role)?.push(ws);

      // Send welcome message
      this.sendToClient(ws, {
        id: 'welcome',
        type: 'payment_request',
        title: 'Connection Established',
        message: `Connected as ${ws.role}`,
        timestamp: new Date().toISOString(),
        data: {}
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[WebSocket] Received:', message);
          
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      });

      // Handle pong responses for heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle connection close
      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        this.removeConnection(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('[WebSocket] Connection error:', error);
        this.removeConnection(ws);
      });
    });

    // Start heartbeat to keep connections alive
    this.startHeartbeat();
  }

  private removeConnection(ws: ClientConnection) {
    Array.from(this.connections.entries()).forEach(([role, connections]) => {
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
      }
    });
  }

  private startHeartbeat() {
    const interval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws: ClientConnection) => {
        if (ws.isAlive === false) {
          console.log('[WebSocket] Terminating dead connection');
          this.removeConnection(ws);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds

    this.wss?.on('close', () => {
      clearInterval(interval);
    });
  }

  private sendToClient(ws: ClientConnection, notification: NotificationData) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  }

  // Send notification to all admin clients
  notifyAdmins(notification: NotificationData) {
    const adminConnections = this.connections.get('admin') || [];
    let sentCount = 0;

    adminConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, notification);
        sentCount++;
      } else {
        this.removeConnection(ws);
      }
    });

    console.log(`[WebSocket] Notification sent to ${sentCount} admin(s):`, notification.title);
    return sentCount;
  }

  // Send notification to specific client
  notifyClient(clientId: string, notification: NotificationData) {
    const clientConnections = this.connections.get('client') || [];
    let sentCount = 0;

    clientConnections.forEach((ws) => {
      if (ws.userId === clientId && ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, notification);
        sentCount++;
      }
    });

    console.log(`[WebSocket] Notification sent to client ${clientId}:`, notification.title);
    return sentCount;
  }

  // Broadcast to all connected clients
  broadcast(notification: NotificationData) {
    if (!this.wss) return 0;

    let sentCount = 0;
    this.wss.clients.forEach((ws: ClientConnection) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, notification);
        sentCount++;
      }
    });

    console.log(`[WebSocket] Broadcast sent to ${sentCount} client(s):`, notification.title);
    return sentCount;
  }

  // Create notification for new payment request
  createPaymentRequestNotification(paymentRequest: PaymentRequest, client: Client): NotificationData {
    return {
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
  }

  // Get connection stats
  getStats() {
    const stats = {
      totalConnections: 0,
      adminConnections: 0,
      clientConnections: 0,
      connectionsByRole: {} as Record<string, number>
    };

    Array.from(this.connections.entries()).forEach(([role, connections]) => {
      const activeConnections = connections.filter((ws: ClientConnection) => ws.readyState === WebSocket.OPEN);
      stats.connectionsByRole[role] = activeConnections.length;
      stats.totalConnections += activeConnections.length;

      if (role === 'admin') stats.adminConnections = activeConnections.length;
      if (role === 'client') stats.clientConnections = activeConnections.length;
    });

    return stats;
  }

  // Close all connections and stop server
  close() {
    if (this.wss) {
      this.wss.close();
      this.connections.clear();
      console.log('[WebSocket] Server closed');
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;