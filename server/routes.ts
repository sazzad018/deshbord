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

  // Deleted clients route - must come before :id route
  app.get("/api/clients/deleted", async (req, res) => {
    try {
      const deletedClients = await storage.getDeletedClients();
      res.json(deletedClients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deleted clients" });
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

      const pdfMake = await import('pdfmake/build/pdfmake');
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      
      // Set up fonts - try different import structures
      try {
        if (pdfFonts.default && pdfFonts.default.pdfMake && pdfFonts.default.pdfMake.vfs) {
          pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs;
        } else if (pdfFonts.default && pdfFonts.default.vfs) {
          pdfMake.default.vfs = pdfFonts.default.vfs;
        } else if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
          pdfMake.default.vfs = pdfFonts.pdfMake.vfs;
        } else {
          // Fallback: create empty vfs
          pdfMake.default.vfs = {};
        }
      } catch (fontError) {
        console.warn('Font setup warning:', fontError);
        pdfMake.default.vfs = {};
      }

      // Calculate discount and VAT amounts
      const discountAmount = Math.round((invoice.subtotal * invoice.discount) / 100);
      const vatAmount = Math.round(((invoice.subtotal - discountAmount) * invoice.vat) / 100);

      // Create line items table body
      const lineItemsBody = [
        [
          { text: 'Description', style: 'tableHeader' },
          { text: 'Qty', style: 'tableHeader', alignment: 'right' },
          { text: 'Rate', style: 'tableHeader', alignment: 'right' },
          { text: 'Amount', style: 'tableHeader', alignment: 'right' }
        ],
        ...invoice.lineItems.map(item => [
          { text: item.description, style: 'tableBody' },
          { text: item.quantity.toString(), style: 'tableBody', alignment: 'right' },
          { text: `৳${item.rate.toLocaleString()}`, style: 'tableBody', alignment: 'right' },
          { text: `৳${item.amount.toLocaleString()}`, style: 'tableBody', alignment: 'right' }
        ])
      ];

      // Create totals table
      const totalsBody = [
        [{ text: 'Subtotal:', style: 'totalsLabel' }, { text: `৳${invoice.subtotal.toLocaleString()}`, style: 'totalsValue' }]
      ];

      if (invoice.discount > 0) {
        totalsBody.push([
          { text: `Discount (${invoice.discount}%):`, style: 'totalsLabel' },
          { text: `-৳${discountAmount.toLocaleString()}`, style: 'totalsValue' }
        ]);
      }

      if (invoice.vat > 0) {
        totalsBody.push([
          { text: `VAT (${invoice.vat}%):`, style: 'totalsLabel' },
          { text: `+৳${vatAmount.toLocaleString()}`, style: 'totalsValue' }
        ]);
      }

      totalsBody.push([
        { text: 'Total Amount:', style: 'totalLabel' },
        { text: `৳${invoice.totalAmount.toLocaleString()}`, style: 'totalValue' }
      ]);

      // PDF document definition
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
          // Header with company info
          {
            table: {
              widths: ['*'],
              body: [[
                {
                  text: [
                    { text: company.companyName, style: 'companyName' },
                    { text: '\nProfessional Business Solutions', style: 'companyTagline' },
                    company.companyEmail ? { text: `\n📧 ${company.companyEmail}`, style: 'companyDetails' } : '',
                    company.companyPhone ? { text: `\n📱 ${company.companyPhone}`, style: 'companyDetails' } : '',
                    company.companyWebsite ? { text: `\n🌐 ${company.companyWebsite}`, style: 'companyDetails' } : '',
                    company.companyAddress ? { text: `\n📍 ${company.companyAddress}`, style: 'companyDetails' } : ''
                  ],
                  fillColor: company.brandColor,
                  color: '#ffffff',
                  margin: [20, 20, 20, 20]
                }
              ]]
            },
            layout: 'noBorders'
          },
          
          // Invoice banner
          {
            table: {
              widths: ['*'],
              body: [[
                {
                  text: [
                    { text: 'INVOICE\n', style: 'invoiceTitle' },
                    { text: invoice.invoiceNumber, style: 'invoiceNumber' }
                  ],
                  alignment: 'center',
                  fillColor: '#f8fafc',
                  margin: [20, 20, 20, 20]
                }
              ]]
            },
            layout: 'noBorders',
            margin: [0, 20, 0, 20]
          },

          // Bill to and Invoice details
          {
            columns: [
              {
                width: '48%',
                table: {
                  widths: ['*'],
                  body: [[
                    {
                      text: [
                        { text: 'BILL TO\n', style: 'sectionTitle' },
                        { text: `${invoice.client.name}\n`, style: 'clientName' },
                        { text: `📱 ${invoice.client.phone}`, style: 'clientInfo' }
                      ],
                      fillColor: '#fafbfc',
                      margin: [15, 15, 15, 15]
                    }
                  ]]
                },
                layout: 'noBorders'
              },
              { width: '4%', text: '' },
              {
                width: '48%',
                table: {
                  widths: ['*'],
                  body: [[
                    {
                      text: [
                        { text: 'INVOICE DETAILS\n', style: 'sectionTitle' },
                        { text: `Invoice #: ${invoice.invoiceNumber}\n`, style: 'invoiceDetailsText' },
                        { text: `Date: ${new Date(invoice.createdAt).toLocaleDateString()}\n`, style: 'invoiceDetailsText' },
                        invoice.dueDate ? { text: `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n`, style: 'invoiceDetailsText' } : '',
                        { text: `Status: ${invoice.status}`, style: 'invoiceDetailsText' }
                      ],
                      fillColor: '#fafbfc',
                      margin: [15, 15, 15, 15]
                    }
                  ]]
                },
                layout: 'noBorders'
              }
            ],
            margin: [0, 0, 0, 30]
          },

          // Service details header
          { text: 'Service Details', style: 'itemsTitle', margin: [0, 20, 0, 10] },

          // Line items table
          {
            table: {
              headerRows: 1,
              widths: ['*', 60, 80, 80],
              body: lineItemsBody
            },
            layout: {
              fillColor: function (rowIndex) {
                return (rowIndex === 0) ? company.brandColor : (rowIndex % 2 === 0 ? '#f9fafb' : null);
              }
            },
            margin: [0, 0, 0, 30]
          },

          // Totals section
          {
            columns: [
              { width: '60%', text: '' },
              {
                width: '40%',
                table: {
                  widths: ['*', 'auto'],
                  body: totalsBody
                },
                layout: 'noBorders'
              }
            ]
          },

          // Notes section
          invoice.notes ? {
            table: {
              widths: ['*'],
              body: [[
                {
                  text: [
                    { text: 'Additional Notes\n', style: 'notesTitle' },
                    { text: invoice.notes, style: 'notesContent' }
                  ],
                  fillColor: '#f8fafc',
                  margin: [15, 15, 15, 15]
                }
              ]]
            },
            layout: 'noBorders',
            margin: [0, 30, 0, 0]
          } : null,

          // Footer
          {
            text: [
              { text: 'Thank you for your business!\n', style: 'footerMessage' },
              { text: `Invoice generated on ${new Date().toLocaleDateString()}\n`, style: 'footerText' },
              { text: 'This is a computer-generated invoice. No signature required.', style: 'footerSmall' }
            ],
            alignment: 'center',
            margin: [0, 40, 0, 0]
          }
        ].filter(Boolean),

        styles: {
          companyName: { fontSize: 24, bold: true, color: '#ffffff' },
          companyTagline: { fontSize: 12, color: '#ffffff', opacity: 0.9 },
          companyDetails: { fontSize: 10, color: '#ffffff', opacity: 0.95 },
          invoiceTitle: { fontSize: 20, bold: true, color: company.brandColor },
          invoiceNumber: { fontSize: 16, bold: true, color: '#374151' },
          sectionTitle: { fontSize: 12, bold: true, color: company.brandColor },
          clientName: { fontSize: 14, bold: true, color: '#111827' },
          clientInfo: { fontSize: 12, color: '#4b5563' },
          invoiceDetailsText: { fontSize: 11, color: '#4b5563' },
          itemsTitle: { fontSize: 16, bold: true, color: '#111827' },
          tableHeader: { fontSize: 10, bold: true, color: '#ffffff' },
          tableBody: { fontSize: 11, color: '#374151' },
          totalsLabel: { fontSize: 12, color: '#6b7280' },
          totalsValue: { fontSize: 12, bold: true, alignment: 'right' },
          totalLabel: { fontSize: 14, bold: true, color: company.brandColor },
          totalValue: { fontSize: 14, bold: true, color: company.brandColor, alignment: 'right' },
          notesTitle: { fontSize: 12, bold: true, color: company.brandColor },
          notesContent: { fontSize: 11, color: '#4b5563' },
          footerMessage: { fontSize: 12, bold: true, color: company.brandColor },
          footerText: { fontSize: 10, color: '#6b7280' },
          footerSmall: { fontSize: 8, color: '#6b7280' }
        }
      };

      const pdf = await new Promise((resolve, reject) => {
        pdfMake.default.createPdf(docDefinition).getBuffer((buffer: Buffer) => {
          if (buffer) {
            resolve(buffer);
          } else {
            reject(new Error('Failed to generate PDF buffer'));
          }
        });
      });

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
