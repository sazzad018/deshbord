import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertSpendLogSchema, insertMeetingSchema, insertInvoiceSchema, insertInvoiceLineItemSchema, insertTodoSchema, insertWhatsappTemplateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClientWithLogs(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const success = await storage.deleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Spend log routes
  app.get("/api/clients/:id/spend-logs", async (req, res) => {
    try {
      const logs = await storage.getSpendLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spend logs" });
    }
  });

  app.post("/api/spend-logs", async (req, res) => {
    try {
      // Convert amount to integer if it's a string
      const requestData = {
        ...req.body,
        amount: parseInt(req.body.amount)
      };
      
      const validatedData = insertSpendLogSchema.parse(requestData);
      const spendLog = await storage.createSpendLog(validatedData);
      res.status(201).json(spendLog);
    } catch (error) {
      console.error("Spend log validation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid spend log data" });
      }
    }
  });

  // Meeting routes
  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getMeetings();
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.parse({
        ...req.body,
        datetime: new Date(req.body.datetime),
      });
      const meeting = await storage.createMeeting(validatedData);
      res.status(201).json(meeting);
    } catch (error) {
      res.status(400).json({ error: "Invalid meeting data" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Add funds endpoint
  app.post("/api/clients/:id/add-funds", async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const updatedClient = await storage.updateClient(req.params.id, {
        walletDeposited: client.walletDeposited + amount,
      });

      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: "Failed to add funds" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { lineItems, ...invoiceData } = req.body;
      
      // Convert dueDate string to Date object if provided
      if (invoiceData.dueDate) {
        invoiceData.dueDate = new Date(invoiceData.dueDate);
      }
      
      // Validate invoice data
      const validatedInvoice = insertInvoiceSchema.parse(invoiceData);
      
      // Validate line items
      const validatedLineItems = lineItems.map((item: any) => ({
        ...insertInvoiceLineItemSchema.parse(item),
        amount: item.quantity * item.rate,
      }));

      const invoice = await storage.createInvoice(validatedInvoice, validatedLineItems);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Invoice creation error:", error);
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.patch("/api/invoices/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["Paid", "Due"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const invoice = await storage.updateInvoiceStatus(req.params.id, status);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice status" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const success = await storage.deleteInvoice(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // Invoice PDF generation
  app.get("/api/invoices/:id/pdf", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Helper function to escape HTML
      const escapeHtml = (text: string) => {
        if (!text) return '';
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      // Calculate discount and VAT amounts
      const discountAmount = Math.round((invoice.subtotal * invoice.discount) / 100);
      const vatAmount = Math.round(((invoice.subtotal - discountAmount) * invoice.vat) / 100);

      // Generate HTML for the invoice
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .invoice-title { font-size: 20px; margin: 20px 0; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .bill-to { flex: 1; }
            .invoice-details { flex: 1; text-align: right; }
            .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; }
            .items-table .text-right { text-align: right; }
            .totals { margin-top: 30px; }
            .totals-table { width: 300px; margin-left: auto; }
            .totals-table td { padding: 8px; border: none; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
            .notes { margin-top: 40px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status-paid { background-color: #10b981; color: white; }
            .status-due { background-color: #ef4444; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Agent CRM + Ops</div>
            <div>Professional Invoice</div>
          </div>

          <div class="invoice-info">
            <div class="bill-to">
              <h3>Bill To:</h3>
              <strong>${escapeHtml(invoice.client.name)}</strong><br>
              Phone: ${escapeHtml(invoice.client.phone)}
            </div>
            <div class="invoice-details">
              <h3>Invoice Details:</h3>
              <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}<br>
              ${invoice.dueDate ? `<strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>` : ''}
              <span class="status-badge ${invoice.status === 'Paid' ? 'status-paid' : 'status-due'}">
                ${invoice.status === 'Paid' ? 'Paid' : 'Due'}
              </span>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate (৳)</th>
                <th class="text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map(item => `
                <tr>
                  <td>${escapeHtml(item.description)}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">৳${item.rate.toLocaleString()}</td>
                  <td class="text-right">৳${item.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <table class="totals-table">
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">৳${invoice.subtotal.toLocaleString()}</td>
              </tr>
              ${invoice.discount > 0 ? `
                <tr>
                  <td>Discount (${invoice.discount}%):</td>
                  <td class="text-right">-৳${discountAmount.toLocaleString()}</td>
                </tr>
              ` : ''}
              ${invoice.vat > 0 ? `
                <tr>
                  <td>VAT (${invoice.vat}%):</td>
                  <td class="text-right">+৳${vatAmount.toLocaleString()}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td>Total:</td>
                <td class="text-right">৳${invoice.totalAmount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${invoice.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <p>${escapeHtml(invoice.notes)}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      await page.setContent(invoiceHTML);
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdf);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Todo routes
  app.get("/api/todos", async (req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      };
      
      const validatedData = insertTodoSchema.parse(requestData);
      const todo = await storage.createTodo(validatedData);
      res.status(201).json(todo);
    } catch (error) {
      console.error("Todo creation error:", error);
      res.status(400).json({ error: "Invalid todo data" });
    }
  });

  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : req.body.dueDate,
      };
      
      const todo = await storage.updateTodo(req.params.id, updateData);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: "Failed to update todo" });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const success = await storage.deleteTodo(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete todo" });
    }
  });

  // WhatsApp template routes  
  app.get("/api/whatsapp-templates", async (req, res) => {
    try {
      const templates = await storage.getWhatsappTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/whatsapp-templates", async (req, res) => {
    try {
      const validatedData = insertWhatsappTemplateSchema.parse(req.body);
      const template = await storage.createWhatsappTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Template creation error:", error);
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  app.patch("/api/whatsapp-templates/:id", async (req, res) => {
    try {
      const template = await storage.updateWhatsappTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/whatsapp-templates/:id", async (req, res) => {
    try {
      const success = await storage.deleteWhatsappTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // WhatsApp link generation
  app.post("/api/whatsapp/generate-link", (req, res) => {
    try {
      const { clientPhone, message, templateId } = req.body;
      
      if (!clientPhone || !message) {
        return res.status(400).json({ error: "Client phone and message are required" });
      }

      // Admin WhatsApp number in proper international format
      const ADMIN_WHATSAPP = "8801798205143";
      
      // Clean and format client phone number
      let cleanClientPhone = clientPhone.replace(/[^\d]/g, ""); // Remove all non-digits
      
      // Add Bangladesh country code if missing
      if (cleanClientPhone.startsWith("01")) {
        cleanClientPhone = "88" + cleanClientPhone;
      } else if (!cleanClientPhone.startsWith("88")) {
        cleanClientPhone = "88" + cleanClientPhone;
      }
      
      // Ensure message is properly URL encoded
      const encodedMessage = encodeURIComponent(message);
      
      // Generate WhatsApp link - messages go to admin, mention client
      const finalMessage = `Client: ${cleanClientPhone}\n\n${message}`;
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(finalMessage)}`;
      
      res.json({
        link: whatsappUrl,
        clientPhone: cleanClientPhone,
        adminPhone: ADMIN_WHATSAPP,
        message: finalMessage
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate WhatsApp link" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
