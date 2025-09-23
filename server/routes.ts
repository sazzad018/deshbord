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
      if (error instanceof Error && error.message.includes("Cannot permanently delete client")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete client" });
      }
    }
  });

  app.patch("/api/clients/:id/trash", async (req, res) => {
    try {
      const success = await storage.softDeleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to trash client" });
    }
  });

  app.patch("/api/clients/:id/restore", async (req, res) => {
    try {
      const success = await storage.restoreClient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to restore client" });
    }
  });

  app.get("/api/clients/deleted", async (req, res) => {
    try {
      const deletedClients = await storage.getDeletedClients();
      res.json(deletedClients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deleted clients" });
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

  app.get("/api/spend-logs/all", async (req, res) => {
    try {
      const allLogs = await storage.getAllSpendLogs();
      res.json(allLogs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all spend logs" });
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

      // Get company settings
      const companySettings = await storage.getCompanySettings();
      const company = companySettings || {
        companyName: "Agent CRM + Ops",
        companyEmail: "info@agentcrm.com",
        companyPhone: "01798205143",
        companyWebsite: "www.agentcrm.com",
        companyAddress: "ঢাকা, বাংলাদেশ",
        brandColor: "#A576FF",
        logoUrl: null
      };

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
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=VizDisplayCompositor'],
        timeout: 30000
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              background: #ffffff;
              padding: 0;
              margin: 0;
            }
            
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px;
              min-height: 100vh;
            }
            
            .header { 
              background: linear-gradient(135deg, ${company.brandColor} 0%, ${company.brandColor}dd 100%);
              color: white; 
              padding: 40px;
              border-radius: 12px;
              margin-bottom: 40px;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -20%;
              width: 200px;
              height: 200px;
              background: rgba(255,255,255,0.1);
              border-radius: 50%;
            }
            
            .company-info {
              position: relative;
              z-index: 2;
            }
            
            .company-name { 
              font-size: 32px; 
              font-weight: 700; 
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            
            .company-tagline { 
              font-size: 16px; 
              opacity: 0.9;
              margin-bottom: 20px;
            }
            
            .company-details {
              font-size: 14px;
              opacity: 0.95;
              line-height: 1.8;
            }
            
            .invoice-banner {
              background: #f8fafc;
              border: 2px solid ${company.brandColor}22;
              border-radius: 8px;
              padding: 24px;
              margin: 30px 0;
              text-align: center;
            }
            
            .invoice-title {
              font-size: 28px;
              font-weight: 600;
              color: ${company.brandColor};
              margin-bottom: 8px;
            }
            
            .invoice-number {
              font-size: 20px;
              font-weight: 500;
              color: #374151;
            }
            
            .invoice-meta {
              display: flex;
              justify-content: space-between;
              margin: 40px 0;
              gap: 40px;
            }
            
            .bill-to, .invoice-details {
              flex: 1;
              background: #fafbfc;
              padding: 24px;
              border-radius: 8px;
              border-left: 4px solid ${company.brandColor};
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: ${company.brandColor};
              margin-bottom: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .client-info {
              font-size: 16px;
              line-height: 1.8;
            }
            
            .client-name {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 8px;
            }
            
            .invoice-details-content {
              font-size: 15px;
              line-height: 1.8;
            }
            
            .status-badge { 
              display: inline-block;
              padding: 6px 16px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 8px;
            }
            
            .status-paid { 
              background: linear-gradient(135deg, #10b981, #059669); 
              color: white; 
            }
            
            .status-due { 
              background: linear-gradient(135deg, #ef4444, #dc2626); 
              color: white; 
            }
            
            .items-section {
              margin: 40px 0;
            }
            
            .items-title {
              font-size: 20px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid ${company.brandColor}22;
            }
            
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .items-table th { 
              background: ${company.brandColor}; 
              color: white; 
              padding: 16px; 
              text-align: left; 
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .items-table td { 
              padding: 16px; 
              border-bottom: 1px solid #e5e7eb;
              font-size: 15px;
            }
            
            .items-table tr:last-child td {
              border-bottom: none;
            }
            
            .items-table tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .text-right { text-align: right; font-weight: 500; }
            
            .totals-section {
              margin-top: 40px;
              display: flex;
              justify-content: flex-end;
            }
            
            .totals-card {
              background: #fafbfc;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 24px;
              min-width: 350px;
            }
            
            .totals-table { 
              width: 100%; 
              border-collapse: collapse;
            }
            
            .totals-table td { 
              padding: 8px 0; 
              font-size: 15px;
            }
            
            .totals-table td:first-child {
              color: #6b7280;
            }
            
            .totals-table td:last-child {
              text-align: right;
              font-weight: 500;
            }
            
            .total-row { 
              border-top: 2px solid ${company.brandColor};
              padding-top: 12px !important;
              margin-top: 8px;
            }
            
            .total-row td {
              font-weight: 700 !important; 
              font-size: 18px !important;
              color: ${company.brandColor} !important;
              padding-top: 16px !important;
            }
            
            .notes-section { 
              margin-top: 40px;
              background: #f8fafc;
              padding: 24px;
              border-radius: 8px;
              border-left: 4px solid ${company.brandColor};
            }
            
            .notes-title {
              font-size: 16px;
              font-weight: 600;
              color: ${company.brandColor};
              margin-bottom: 12px;
            }
            
            .notes-content {
              color: #4b5563;
              line-height: 1.7;
            }
            
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 14px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer-message {
              font-size: 16px;
              color: ${company.brandColor};
              font-weight: 500;
              margin-bottom: 8px;
            }
            
            .currency { color: ${company.brandColor}; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-info">
                <div class="company-name">${escapeHtml(company.companyName)}</div>
                <div class="company-tagline">Professional Business Solutions</div>
                <div class="company-details">
                  ${company.companyEmail ? `📧 ${escapeHtml(company.companyEmail)}<br>` : ''}
                  ${company.companyPhone ? `📱 ${escapeHtml(company.companyPhone)}<br>` : ''}
                  ${company.companyWebsite ? `🌐 ${escapeHtml(company.companyWebsite)}<br>` : ''}
                  ${company.companyAddress ? `📍 ${escapeHtml(company.companyAddress)}` : ''}
                </div>
              </div>
            </div>

            <div class="invoice-banner">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoice.invoiceNumber}</div>
            </div>

            <div class="invoice-meta">
              <div class="bill-to">
                <div class="section-title">Bill To</div>
                <div class="client-info">
                  <div class="client-name">${escapeHtml(invoice.client.name)}</div>
                  <div>📱 ${escapeHtml(invoice.client.phone)}</div>
                </div>
              </div>
              <div class="invoice-details">
                <div class="section-title">Invoice Details</div>
                <div class="invoice-details-content">
                  <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
                  <div><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</div>
                  ${invoice.dueDate ? `<div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>` : ''}
                  <div class="status-badge ${invoice.status === 'Paid' ? 'status-paid' : 'status-due'}">
                    ${invoice.status === 'Paid' ? 'PAID' : 'DUE'}
                  </div>
                </div>
              </div>
            </div>

            <div class="items-section">
              <div class="items-title">Service Details</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Rate</th>
                    <th class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.lineItems.map(item => `
                    <tr>
                      <td>${escapeHtml(item.description)}</td>
                      <td class="text-right">${item.quantity}</td>
                      <td class="text-right"><span class="currency">৳</span>${item.rate.toLocaleString()}</td>
                      <td class="text-right"><span class="currency">৳</span>${item.amount.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="totals-section">
              <div class="totals-card">
                <table class="totals-table">
                  <tr>
                    <td>Subtotal:</td>
                    <td><span class="currency">৳</span>${invoice.subtotal.toLocaleString()}</td>
                  </tr>
                  ${invoice.discount > 0 ? `
                    <tr>
                      <td>Discount (${invoice.discount}%):</td>
                      <td>-<span class="currency">৳</span>${discountAmount.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${invoice.vat > 0 ? `
                    <tr>
                      <td>VAT (${invoice.vat}%):</td>
                      <td>+<span class="currency">৳</span>${vatAmount.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  <tr class="total-row">
                    <td>Total Amount:</td>
                    <td><span class="currency">৳</span>${invoice.totalAmount.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>

            ${invoice.notes ? `
              <div class="notes-section">
                <div class="notes-title">Additional Notes</div>
                <div class="notes-content">${escapeHtml(invoice.notes)}</div>
              </div>
            ` : ''}

            <div class="footer">
              <div class="footer-message">Thank you for your business!</div>
              <div>Invoice generated on ${new Date().toLocaleDateString()}</div>
              <div style="margin-top: 12px; font-size: 12px;">
                This is a computer-generated invoice. No signature required.
              </div>
            </div>
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

      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }

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

  // Company settings routes
  app.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company settings" });
    }
  });

  app.post("/api/company-settings", async (req, res) => {
    try {
      const { insertCompanySettingsSchema } = await import("@shared/schema");
      const validatedSettings = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.createCompanySettings(validatedSettings);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Company settings creation error:", error);
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  app.patch("/api/company-settings/:id", async (req, res) => {
    try {
      const settings = await storage.updateCompanySettings(req.params.id, req.body);
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Service scope routes
  app.get("/api/clients/:id/service-scopes", async (req, res) => {
    try {
      const serviceScopes = await storage.getServiceScopes(req.params.id);
      res.json(serviceScopes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service scopes" });
    }
  });

  app.post("/api/service-scopes", async (req, res) => {
    try {
      const { insertServiceScopeSchema } = await import("@shared/schema");
      const validatedScope = insertServiceScopeSchema.parse(req.body);
      const serviceScope = await storage.createServiceScope(validatedScope);
      res.status(201).json(serviceScope);
    } catch (error) {
      console.error("Service scope creation error:", error);
      res.status(400).json({ error: "Invalid service scope data" });
    }
  });

  app.patch("/api/service-scopes/:id", async (req, res) => {
    try {
      const serviceScope = await storage.updateServiceScope(req.params.id, req.body);
      if (!serviceScope) {
        return res.status(404).json({ error: "Service scope not found" });
      }
      res.json(serviceScope);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service scope" });
    }
  });

  app.delete("/api/service-scopes/:id", async (req, res) => {
    try {
      const success = await storage.deleteServiceScope(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Service scope not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service scope" });
    }
  });

  // Service analytics routes
  app.get("/api/service-analytics/:serviceName", async (req, res) => {
    try {
      const analytics = await storage.getServiceAnalytics(req.params.serviceName);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service analytics" });
    }
  });

  // Enhanced client details with service scopes
  app.get("/api/clients/:id/details", async (req, res) => {
    try {
      const clientDetails = await storage.getClientWithDetails(req.params.id);
      if (!clientDetails) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(clientDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client details" });
    }
  });

  // Client portal route - fetch client by portal key
  app.get("/api/clients/portal/:portalKey", async (req, res) => {
    try {
      const clients = await storage.getClients();
      const client = clients.find(c => c.portalKey === req.params.portalKey);
      
      if (!client) {
        return res.status(404).json({ error: "Client portal not found" });
      }

      const clientDetails = await storage.getClientWithDetails(client.id);
      if (!clientDetails) {
        return res.status(404).json({ error: "Client details not found" });
      }
      
      res.json(clientDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client portal data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
