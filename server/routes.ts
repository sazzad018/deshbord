import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { notificationService } from "./websocket";
import { insertClientSchema, insertSpendLogSchema, insertMeetingSchema, insertTodoSchema, insertWhatsappTemplateSchema, insertCustomButtonSchema, insertUploadSchema, insertInvoicePdfSchema, insertQuickMessageSchema, insertWebsiteProjectSchema, insertPaymentRequestSchema, insertProjectTypeSchema, insertProjectSchema, insertEmployeeSchema, insertProjectAssignmentSchema, insertProjectPaymentSchema, insertSalaryPaymentSchema } from "@shared/schema";

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

  app.patch("/api/clients/:id/toggle-active", async (req, res) => {
    try {
      const currentClient = await storage.getClient(req.params.id);
      if (!currentClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      const updatedClient = await storage.updateClient(req.params.id, { 
        status: currentClient.status === "Active" ? "Inactive" : "Active"
      });
      
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle client status" });
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

  // Quick Message routes
  app.get("/api/quick-messages", async (req, res) => {
    try {
      const quickMessages = await storage.getQuickMessages();
      res.json(quickMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quick messages" });
    }
  });

  app.post("/api/quick-messages", async (req, res) => {
    try {
      const validatedData = insertQuickMessageSchema.parse(req.body);
      const quickMessage = await storage.createQuickMessage(validatedData);
      res.status(201).json(quickMessage);
    } catch (error) {
      console.error("Quick message creation error:", error);
      res.status(400).json({ error: "Invalid quick message data" });
    }
  });

  app.patch("/api/quick-messages/:id", async (req, res) => {
    try {
      const quickMessage = await storage.updateQuickMessage(req.params.id, req.body);
      if (!quickMessage) {
        return res.status(404).json({ error: "Quick message not found" });
      }
      res.json(quickMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quick message" });
    }
  });

  app.delete("/api/quick-messages/:id", async (req, res) => {
    try {
      const success = await storage.deleteQuickMessage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Quick message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quick message" });
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

  // Custom Button routes
  app.get("/api/custom-buttons", async (req, res) => {
    try {
      const buttons = await storage.getCustomButtons();
      res.json(buttons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch custom buttons" });
    }
  });

  app.post("/api/custom-buttons", async (req, res) => {
    try {
      const validatedData = insertCustomButtonSchema.parse(req.body);
      const button = await storage.createCustomButton(validatedData);
      res.status(201).json(button);
    } catch (error) {
      console.error("Custom button creation error:", error);
      res.status(400).json({ error: "Invalid custom button data" });
    }
  });

  app.patch("/api/custom-buttons/:id", async (req, res) => {
    try {
      const button = await storage.updateCustomButton(req.params.id, req.body);
      if (!button) {
        return res.status(404).json({ error: "Custom button not found" });
      }
      res.json(button);
    } catch (error) {
      res.status(500).json({ error: "Failed to update custom button" });
    }
  });

  app.delete("/api/custom-buttons/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomButton(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Custom button not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete custom button" });
    }
  });

  app.patch("/api/custom-buttons/reorder", async (req, res) => {
    try {
      const { buttonIds } = req.body;
      if (!Array.isArray(buttonIds)) {
        return res.status(400).json({ error: "buttonIds must be an array" });
      }
      
      const success = await storage.reorderCustomButtons(buttonIds);
      if (!success) {
        return res.status(500).json({ error: "Failed to reorder buttons" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder custom buttons" });
    }
  });

  // File upload routes
  app.post("/api/uploads", async (req, res) => {
    try {
      const { dataUrl, fileName, uploadedBy } = req.body;
      
      if (!dataUrl || !fileName) {
        return res.status(400).json({ error: "dataUrl and fileName are required" });
      }

      // Validate file size (2MB limit)
      const sizeInBytes = (dataUrl.length * 3) / 4; // Base64 size approximation
      if (sizeInBytes > 2 * 1024 * 1024) {
        return res.status(400).json({ error: "File size too large (max 2MB)" });
      }

      // Extract mime type from data URL
      const mimeMatch = dataUrl.match(/^data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      
      // Validate image types
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }

      const uploadData = {
        fileName,
        mimeType,
        size: Math.round(sizeInBytes),
        data: dataUrl,
        uploadedBy: uploadedBy || null,
      };

      const validatedData = insertUploadSchema.parse(uploadData);
      const upload = await storage.saveUpload(validatedData);
      
      res.status(201).json({
        id: upload.id,
        url: `/api/uploads/${upload.id}`,
        fileName: upload.fileName,
        mimeType: upload.mimeType,
        size: upload.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ error: "Invalid upload data" });
    }
  });

  // List uploads endpoint - returns empty array since individual files are accessed by ID
  app.get("/api/uploads", async (req, res) => {
    res.json([]);
  });

  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      // Convert data URL to buffer
      const base64Data = upload.data.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      res.set({
        'Content-Type': upload.mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // 24 hours cache
      });

      res.send(buffer);
    } catch (error) {
      console.error("Get upload error:", error);
      res.status(500).json({ error: "Failed to retrieve upload" });
    }
  });

  app.delete("/api/uploads/:id", async (req, res) => {
    try {
      const success = await storage.deleteUpload(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Upload not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete upload" });
    }
  });

  // Invoice PDF routes
  app.post("/api/invoice-pdfs", async (req, res) => {
    try {
      const { invoiceNo, clientId, fileName, dataBase64 } = req.body;
      
      if (!invoiceNo || !clientId || !fileName || !dataBase64) {
        return res.status(400).json({ error: "invoiceNo, clientId, fileName, and dataBase64 are required" });
      }

      const sizeInBytes = (dataBase64.length * 3) / 4;
      
      const pdfData = {
        invoiceNo,
        clientId,
        fileName,
        mimeType: "application/pdf",
        size: sizeInBytes,
        data: `data:application/pdf;base64,${dataBase64}`,
      };

      const validatedData = insertInvoicePdfSchema.parse(pdfData);
      const invoicePdf = await storage.saveInvoicePdf(validatedData);
      
      res.status(201).json({
        id: invoicePdf.id,
        invoiceNo: invoicePdf.invoiceNo,
        fileName: invoicePdf.fileName,
        url: `/api/invoice-pdfs/${invoicePdf.id}`,
        createdAt: invoicePdf.createdAt
      });
    } catch (error) {
      console.error("Save invoice PDF error:", error);
      res.status(400).json({ error: "Invalid PDF data" });
    }
  });

  app.get("/api/invoice-pdfs", async (req, res) => {
    try {
      const invoicePdfs = await storage.getInvoicePdfs();
      
      // Return metadata without the large data field
      const pdfsMetadata = invoicePdfs.map(pdf => ({
        id: pdf.id,
        invoiceNo: pdf.invoiceNo,
        clientId: pdf.clientId,
        fileName: pdf.fileName,
        size: pdf.size,
        url: `/api/invoice-pdfs/${pdf.id}`,
        createdAt: pdf.createdAt
      }));
      
      res.json(pdfsMetadata);
    } catch (error) {
      console.error("Get invoice PDFs error:", error);
      res.status(500).json({ error: "Failed to retrieve invoice PDFs" });
    }
  });

  app.get("/api/invoice-pdfs/:id", async (req, res) => {
    try {
      const invoicePdf = await storage.getInvoicePdf(req.params.id);
      if (!invoicePdf) {
        return res.status(404).json({ error: "Invoice PDF not found" });
      }

      // Convert data URL to buffer
      const base64Data = invoicePdf.data.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoicePdf.fileName}"`,
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      console.error("Get invoice PDF error:", error);
      res.status(500).json({ error: "Failed to retrieve invoice PDF" });
    }
  });

  app.delete("/api/invoice-pdfs/:id", async (req, res) => {
    try {
      const success = await storage.deleteInvoicePdf(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Invoice PDF not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete invoice PDF" });
    }
  });

  // Website Project routes
  app.get("/api/website-projects", async (req, res) => {
    try {
      const projects = await storage.getAllWebsiteProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website projects" });
    }
  });

  app.get("/api/website-projects/client/:clientId", async (req, res) => {
    try {
      const projects = await storage.getWebsiteProjects(req.params.clientId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client website projects" });
    }
  });

  app.get("/api/website-projects/:id", async (req, res) => {
    try {
      const project = await storage.getWebsiteProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Website project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website project" });
    }
  });

  app.post("/api/website-projects", async (req, res) => {
    try {
      const validatedData = insertWebsiteProjectSchema.parse(req.body);
      const project = await storage.createWebsiteProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid website project data" });
    }
  });

  app.patch("/api/website-projects/:id", async (req, res) => {
    try {
      const project = await storage.updateWebsiteProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Website project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update website project" });
    }
  });

  app.delete("/api/website-projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteWebsiteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Website project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete website project" });
    }
  });

  // Payment Request routes
  app.get("/api/payment-requests", async (req, res) => {
    try {
      const paymentRequests = await storage.getPaymentRequests();
      res.json(paymentRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  });

  app.get("/api/payment-requests/:id", async (req, res) => {
    try {
      const paymentRequest = await storage.getPaymentRequest(req.params.id);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found" });
      }
      res.json(paymentRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment request" });
    }
  });

  app.get("/api/clients/:clientId/payment-requests", async (req, res) => {
    try {
      const paymentRequests = await storage.getClientPaymentRequests(req.params.clientId);
      res.json(paymentRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client payment requests" });
    }
  });

  app.post("/api/payment-requests", async (req, res) => {
    try {
      const validatedData = insertPaymentRequestSchema.parse(req.body);
      const paymentRequest = await storage.createPaymentRequest(validatedData);
      
      // Send real-time notification to admins
      try {
        const client = await storage.getClient(paymentRequest.clientId);
        if (client) {
          const notification = notificationService.createPaymentRequestNotification(paymentRequest, client);
          const sentCount = notificationService.notifyAdmins(notification);
          console.log(`[Notification] Payment request notification sent to ${sentCount} admin(s)`);
        }
      } catch (notificationError) {
        console.error("Failed to send payment request notification:", notificationError);
        // Don't fail the request if notification fails
      }
      
      res.status(201).json(paymentRequest);
    } catch (error) {
      console.error("Payment request creation error:", error);
      res.status(400).json({ error: "Invalid payment request data" });
    }
  });

  app.patch("/api/payment-requests/:id", async (req, res) => {
    try {
      const paymentRequest = await storage.updatePaymentRequest(req.params.id, req.body);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found" });
      }
      res.json(paymentRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment request" });
    }
  });

  app.patch("/api/payment-requests/:id/approve", async (req, res) => {
    try {
      const { adminNote, processedBy } = req.body;
      const paymentRequest = await storage.approvePaymentRequest(req.params.id, adminNote, processedBy);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found or already processed" });
      }
      res.json(paymentRequest);
    } catch (error) {
      console.error("Payment approval error:", error);
      res.status(500).json({ error: "Failed to approve payment request" });
    }
  });

  app.patch("/api/payment-requests/:id/reject", async (req, res) => {
    try {
      const { adminNote, processedBy } = req.body;
      const paymentRequest = await storage.rejectPaymentRequest(req.params.id, adminNote, processedBy);
      if (!paymentRequest) {
        return res.status(404).json({ error: "Payment request not found or already processed" });
      }
      res.json(paymentRequest);
    } catch (error) {
      console.error("Payment rejection error:", error);
      res.status(500).json({ error: "Failed to reject payment request" });
    }
  });

  // Project Management Routes
  // Project Types
  app.get("/api/project-types", async (req, res) => {
    try {
      const projectTypes = await storage.getProjectTypes();
      res.json(projectTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project types" });
    }
  });

  app.get("/api/project-types/:id", async (req, res) => {
    try {
      const projectType = await storage.getProjectType(req.params.id);
      if (!projectType) {
        return res.status(404).json({ error: "Project type not found" });
      }
      res.json(projectType);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project type" });
    }
  });

  app.post("/api/project-types", async (req, res) => {
    try {
      const validatedData = insertProjectTypeSchema.parse(req.body);
      const projectType = await storage.createProjectType(validatedData);
      res.status(201).json(projectType);
    } catch (error) {
      console.error("Project type creation error:", error);
      res.status(400).json({ error: "Invalid project type data" });
    }
  });

  app.patch("/api/project-types/:id", async (req, res) => {
    try {
      const validatedData = insertProjectTypeSchema.partial().parse(req.body);
      const projectType = await storage.updateProjectType(req.params.id, validatedData);
      if (!projectType) {
        return res.status(404).json({ error: "Project type not found" });
      }
      res.json(projectType);
    } catch (error) {
      console.error("Project type update error:", error);
      res.status(400).json({ error: "Invalid project type data" });
    }
  });

  app.delete("/api/project-types/:id", async (req, res) => {
    try {
      const success = await storage.deleteProjectType(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project type not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Project type deletion error:", error);
      res.status(500).json({ error: "Failed to delete project type" });
    }
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectWithDetails(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.get("/api/clients/:clientId/projects", async (req, res) => {
    try {
      const projects = await storage.getClientProjects(req.params.clientId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      console.log('Creating project with data:', req.body);
      
      // Preprocess array fields
      const preprocessedData = { ...req.body };
      if (preprocessedData.features) {
        preprocessedData.features = Array.from(preprocessedData.features).map(String);
      }
      if (preprocessedData.completedFeatures) {
        preprocessedData.completedFeatures = Array.from(preprocessedData.completedFeatures).map(String);
      }
      
      const validatedData = insertProjectSchema.parse(preprocessedData);
      console.log('Validated data:', validatedData);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error: any) {
      console.error('Project creation error:', error);
      res.status(400).json({ error: "Invalid project data", details: error?.message || "Unknown error" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      console.log('Updating project with data:', JSON.stringify(req.body, null, 2));
      
      // Ensure features is properly formatted as string array
      const updateData = { ...req.body };
      if (updateData.features) {
        // Convert array-like object to proper array
        updateData.features = Array.from(updateData.features).map(String);
        console.log('Features array processed:', updateData.features);
      }
      
      // Handle endDate properly
      if (updateData.endDate && typeof updateData.endDate === 'string') {
        updateData.endDate = new Date(updateData.endDate);
        console.log('EndDate processed:', updateData.endDate);
      }
      
      console.log('Final update data:', JSON.stringify(updateData, null, 2));
      const project = await storage.updateProject(req.params.id, updateData);
      console.log('Update result:', project ? 'Success' : 'Not found');
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error('Project update error details:');
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error details:', error);
      res.status(500).json({ 
        error: "Failed to update project", 
        details: error?.message || "Unknown error",
        stack: error?.stack 
      });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Employees
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployeeWithDetails(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.get("/api/employees/portal/:portalKey", async (req, res) => {
    try {
      const employee = await storage.getEmployeeByPortalKey(req.params.portalKey);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee by portal key" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const success = await storage.deleteEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Project Assignments
  app.get("/api/projects/:projectId/assignments", async (req, res) => {
    try {
      const assignments = await storage.getProjectAssignments(req.params.projectId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project assignments" });
    }
  });

  app.get("/api/employees/:employeeId/assignments", async (req, res) => {
    try {
      const assignments = await storage.getEmployeeAssignments(req.params.employeeId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee assignments" });
    }
  });

  app.get("/api/project-assignments", async (req, res) => {
    try {
      const assignments = await storage.getAllProjectAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project assignments" });
    }
  });

  app.post("/api/project-assignments", async (req, res) => {
    try {
      // Preprocess array fields
      const preprocessedData = { ...req.body };
      if (preprocessedData.assignedFeatures) {
        preprocessedData.assignedFeatures = Array.from(preprocessedData.assignedFeatures).map(String);
      }
      if (preprocessedData.completedFeatures) {
        preprocessedData.completedFeatures = Array.from(preprocessedData.completedFeatures).map(String);
      }
      
      const validatedData = insertProjectAssignmentSchema.parse(preprocessedData);
      const assignment = await storage.createProjectAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assignment data" });
    }
  });

  app.patch("/api/project-assignments/:id", async (req, res) => {
    try {
      const assignment = await storage.updateProjectAssignment(req.params.id, req.body);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  app.delete("/api/project-assignments/:id", async (req, res) => {
    try {
      const success = await storage.deleteProjectAssignment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });

  // Project Payments
  app.get("/api/projects/:projectId/payments", async (req, res) => {
    try {
      const payments = await storage.getProjectPayments(req.params.projectId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project payments" });
    }
  });

  app.post("/api/project-payments", async (req, res) => {
    try {
      const validatedData = insertProjectPaymentSchema.parse(req.body);
      const payment = await storage.createProjectPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  app.patch("/api/project-payments/:id", async (req, res) => {
    try {
      const payment = await storage.updateProjectPayment(req.params.id, req.body);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  app.delete("/api/project-payments/:id", async (req, res) => {
    try {
      const success = await storage.deleteProjectPayment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });

  // Salary Payments
  app.get("/api/employees/:employeeId/salary-payments", async (req, res) => {
    try {
      const payments = await storage.getSalaryPayments(req.params.employeeId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary payments" });
    }
  });

  app.get("/api/salary-payments", async (req, res) => {
    try {
      const payments = await storage.getAllSalaryPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all salary payments" });
    }
  });

  app.post("/api/salary-payments", async (req, res) => {
    try {
      const validatedData = insertSalaryPaymentSchema.parse(req.body);
      const payment = await storage.createSalaryPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid salary payment data" });
    }
  });

  app.patch("/api/salary-payments/:id", async (req, res) => {
    try {
      const payment = await storage.updateSalaryPayment(req.params.id, req.body);
      if (!payment) {
        return res.status(404).json({ error: "Salary payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update salary payment" });
    }
  });

  app.delete("/api/salary-payments/:id", async (req, res) => {
    try {
      const success = await storage.deleteSalaryPayment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Salary payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete salary payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
