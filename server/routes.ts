import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { storage } from "./storage.js";
import { encrypt, decrypt } from "./utils/encryption.js";
import { deriveTimezone } from "./utils/timezone.js";
import { sendContactFormEmail } from "./utils/email.js";
import { mockOpenAI } from "./services/mockOpenAI.js";
import { createRealOpenAIService } from "./services/realOpenAI.js";

// Configure multer for file uploads with increased limits
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - fieldname:', file.fieldname, 'mimetype:', file.mimetype, 'originalname:', file.originalname);
    
    // Only allow CSV files for the csv field
    if (file.fieldname === 'csv') {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed for CSV uploads'));
      }
    } else if (file.fieldname === 'document') {
      // Allow wide variety of file types
      const allowedTypes = [
        // Documents
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'text/plain',
        'text/csv',
        'application/rtf',
        
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/svg+xml',
        'image/tiff',
        
        // Videos
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/ogg',
        'video/3gpp',
        
        // Audio
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/webm',
        
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
        
        // Code and data
        'application/json',
        'text/javascript',
        'text/html',
        'text/css',
        'application/xml',
        'text/xml'
      ];
      
      // Check by MIME type or file extension for broader compatibility
      const fileExtension = file.originalname.toLowerCase().split('.').pop();
      const allowedExtensions = [
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'rtf',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif',
        'mp4', 'mpeg', 'mpg', 'mov', 'avi', 'webm', 'ogg', '3gp',
        'mp3', 'wav', 'ogg', 'aac', 'webm',
        'zip', 'rar', '7z', 'tar', 'gz',
        'json', 'js', 'html', 'css', 'xml'
      ];
      
      if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension || '')) {
        cb(null, true);
      } else {
        console.log('File type not allowed:', file.mimetype, 'Extension:', fileExtension);
        cb(new Error(`File type not allowed: ${file.originalname}`));
      }
    } else {
      cb(new Error('Invalid file field'));
    }
  }
});

// Password for dashboard access
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'admin123';

// Function to parse CSV line with proper handling of quoted fields
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator found outside quotes
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Create WebSocket server for real-time notes updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Store connected WebSocket clients
  const wsClients = new Set<WebSocket>();
  const typingUsers = new Map<string, NodeJS.Timeout>();

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    wsClients.add(ws);

    // Send initial notes data to newly connected client
    storage.getNotes().then(notes => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'notes_init',
          data: notes.map(note => ({
            id: note.id,
            content: decrypt(note.encryptedContent),
            createdAt: note.createdAt
          }))
        }));
      }
    }).catch(console.error);

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'typing':
            // Clear existing timeout for this user
            if (typingUsers.has(message.data.userId)) {
              clearTimeout(typingUsers.get(message.data.userId)!);
            }
            
            // Broadcast typing indicator to other clients
            broadcastToOthers(ws, {
              type: 'user_typing',
              data: message.data
            });
            
            // Set timeout to automatically stop typing after 3 seconds
            const timeout = setTimeout(() => {
              broadcastToOthers(ws, {
                type: 'user_stopped_typing',
                data: message.data
              });
              typingUsers.delete(message.data.userId);
            }, 3000);
            
            typingUsers.set(message.data.userId, timeout);
            break;
            
          case 'stopped_typing':
            // Clear timeout and broadcast stop typing
            if (typingUsers.has(message.data.userId)) {
              clearTimeout(typingUsers.get(message.data.userId)!);
              typingUsers.delete(message.data.userId);
            }
            
            broadcastToOthers(ws, {
              type: 'user_stopped_typing',
              data: message.data
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });

  // Function to broadcast notes updates to all connected clients
  function broadcastNotesUpdate(type: 'created' | 'updated' | 'deleted', noteData: any) {
    const message = JSON.stringify({
      type: `note_${type}`,
      data: noteData
    });

    wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        wsClients.delete(client);
      }
    });
  }

  // Function to broadcast to all clients except sender
  function broadcastToOthers(sender: WebSocket, data: any) {
    const message = JSON.stringify(data);
    
    wsClients.forEach(client => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else if (client.readyState !== WebSocket.OPEN) {
        wsClients.delete(client);
      }
    });
  }
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
  });
  
  // Authentication route
  app.post('/api/auth', async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }
      
      // Hash the provided password and compare with stored hash
      // For simplicity, we're doing a direct comparison here
      // In production, you'd store a hashed password and compare hashes
      if (password === DASHBOARD_PASSWORD) {
        // Generate a simple session token (in production, use proper JWT or session management)
        const token = Buffer.from(`authenticated:${Date.now()}`).toString('base64');
        res.json({ success: true, token });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  // CSV preview endpoint for field mapping
  app.post('/api/campaigns/preview', upload.single('csv'), async (req, res) => {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
      }

      // Read and parse CSV headers only
      const csvContent = fs.readFileSync(file.path, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        return res.status(400).json({ message: 'CSV file is empty' });
      }

      // Parse headers
      const headers = parseCSVLine(lines[0]);
      
      // Clean up uploaded file
      fs.unlinkSync(file.path);

      res.json({ 
        headers,
        fileName: file.originalname
      });
    } catch (error) {
      console.error('CSV preview error:', error);
      res.status(500).json({ message: 'Failed to preview CSV file' });
    }
  });

  // Campaign CSV upload
  app.post('/api/campaigns/upload', upload.single('csv'), async (req, res) => {
    try {
      console.log('CSV upload request received');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      
      const file = req.file as Express.Multer.File;
      if (!file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
      }

      // Get field mappings from request
      const fieldMappingsJson = req.body.fieldMappings;
      if (!fieldMappingsJson) {
        return res.status(400).json({ message: 'Field mappings are required' });
      }

      const fieldMappings: Record<string, string> = JSON.parse(fieldMappingsJson);

      // Read and parse CSV
      const csvContent = fs.readFileSync(file.path, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        return res.status(400).json({ message: 'CSV file is empty' });
      }

      // Parse headers
      const headers = parseCSVLine(lines[0]);

      // Parse data rows and add timezone
      const dataRows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        
        // Map original headers to values
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Create mapped row with standard field names
        const mappedRow: Record<string, string> = {};
        Object.entries(fieldMappings).forEach(([standardField, csvHeader]) => {
          mappedRow[standardField] = row[csvHeader] || '';
        });

        // Derive timezone based on mapped State and Country fields
        const state = mappedRow['State'] || '';
        const country = mappedRow['Country'] || '';
        mappedRow['Time Zone'] = deriveTimezone(state, country);

        dataRows.push(mappedRow);
      }

      // Create final headers array with mapped fields plus timezone
      const finalHeaders = [...Object.keys(fieldMappings), 'Time Zone'];

      // Encrypt the campaign data
      const campaignData = {
        headers: finalHeaders,
        rows: dataRows,
        fieldMappings: { ...fieldMappings, 'Time Zone': 'Time Zone' }
      };

      const encryptedData = encrypt(JSON.stringify(campaignData));

      // Save to database
      const campaign = await storage.createCampaign({
        name: file.originalname.replace('.csv', ''),
        encryptedData,
        fieldMappings: campaignData.fieldMappings,
        recordCount: dataRows.length
      });

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      res.json({ 
        campaign: {
          id: campaign.id,
          name: campaign.name,
          recordCount: campaign.recordCount,
          fieldMappings: campaign.fieldMappings
        }
      });
    } catch (error) {
      console.error('Campaign upload error:', error);
      res.status(500).json({ message: 'Failed to process campaign upload' });
    }
  });

  // Get campaigns
  app.get('/api/campaigns', async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns.map(c => ({
        id: c.id,
        name: c.name,
        recordCount: c.recordCount,
        fieldMappings: c.fieldMappings,
        createdAt: c.createdAt
      })));
    } catch (error) {
      console.error('Get campaigns error:', error);
      res.status(500).json({ message: 'Failed to fetch campaigns' });
    }
  });

  // Get campaign data (decrypted)
  app.get('/api/campaigns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Decrypt campaign data
      const decryptedData = JSON.parse(decrypt(campaign.encryptedData));
      
      res.json({
        id: campaign.id,
        name: campaign.name,
        data: decryptedData,
        createdAt: campaign.createdAt,
        recordCount: campaign.recordCount
      });
    } catch (error) {
      console.error('Get campaign error:', error);
      res.status(500).json({ message: 'Failed to fetch campaign data' });
    }
  });

  // Delete campaign
  app.delete('/api/campaigns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      await storage.deleteCampaign(id);
      
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Delete campaign error:', error);
      res.status(500).json({ message: 'Failed to delete campaign' });
    }
  });

  // Create note
  app.post('/api/notes', async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: 'Note content is required' });
      }

      const encryptedContent = encrypt(content);
      
      const note = await storage.createNote({
        content: content.substring(0, 100) + '...', // Store preview
        encryptedContent
      });

      const noteData = {
        id: note.id,
        content: decrypt(note.encryptedContent),
        createdAt: note.createdAt
      };

      // Broadcast the new note to all connected WebSocket clients
      broadcastNotesUpdate('created', noteData);

      res.json(noteData);
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({ message: 'Failed to create note' });
    }
  });

  // Get notes
  app.get('/api/notes', async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes.map(note => ({
        id: note.id,
        content: decrypt(note.encryptedContent),
        createdAt: note.createdAt
      })));
    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({ message: 'Failed to fetch notes' });
    }
  });

  // Delete note
  app.delete('/api/notes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      await storage.deleteNote(id);
      
      // Broadcast the deletion to all connected WebSocket clients
      broadcastNotesUpdate('deleted', { id });
      
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({ message: 'Failed to delete note' });
    }
  });

  // Upload documents
  app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        return res.status(400).json({ message: 'No document uploaded' });
      }

      // Encrypt file path
      const encryptedPath = encrypt(file.path);
      
      const document = await storage.createDocument({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        encryptedPath
      });

      res.json({
        id: document.id,
        name: document.originalName,
        type: document.mimeType,
        size: document.fileSize,
        createdAt: document.createdAt
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ message: 'Failed to upload document' });
    }
  });

  // Get documents
  app.get('/api/documents', async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents.map(doc => ({
        id: doc.id,
        name: doc.originalName,
        type: doc.mimeType,
        size: doc.fileSize,
        createdAt: doc.createdAt
      })));
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  // Download document
  app.get('/api/documents/:id/download', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Decrypt file path
      const filePath = decrypt(document.encryptedPath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Document file not found' });
      }

      res.download(filePath, document.originalName);
    } catch (error) {
      console.error('Document download error:', error);
      res.status(500).json({ message: 'Failed to download document' });
    }
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, mobile } = req.body;
      
      // Validate required fields
      if (!name || !email || !mobile) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Store contact in database first
      const contact = await storage.createContact({
        name,
        email,
        mobile,
        emailSent: false
      });
      
      // Attempt to send email
      const emailSent = await sendContactFormEmail({ name, email, mobile });
      
      // Update email status in database
      if (emailSent) {
        await storage.updateContactEmailStatus(contact.id, true);
      }
      
      // Always return success to user since we stored their information
      res.json({ 
        success: true, 
        message: 'Thank you for your interest! We have received your information and will get back to you soon.' 
      });
      
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ message: 'Failed to submit contact form. Please try again.' });
    }
  });

  // Get contact submissions (for admin use)
  app.get('/api/contacts', async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        mobile: contact.mobile,
        emailSent: contact.emailSent,
        createdAt: contact.createdAt
      })));
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ message: 'Failed to fetch contacts' });
    }
  });

  // PawMate Chatbot endpoint
  app.post('/api/pawmate/chat', async (req, res) => {
    try {
      const { messages, petName, petType } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'Messages array is required' });
      }

      // Check if we have OpenAI API key, if yes, use real OpenAI, otherwise use mock
      const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
      
      if (hasOpenAIKey) {
        // Use real OpenAI service
        const realOpenAI = createRealOpenAIService(process.env.OPENAI_API_KEY!);
        const response = await realOpenAI.generateChatCompletion({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        }, petName, petType);
        
        res.json({ ...response, isRealAI: true });
      } else {
        // Use mock OpenAI service
        const response = await mockOpenAI.generateChatCompletion({
          model: "gpt-4o-mock", // Indicate this is mock
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        }, petName, petType);
        
        res.json({ ...response, isRealAI: false });
      }
    } catch (error) {
      console.error('PawMate chat error:', error);
      res.status(500).json({ message: 'Failed to generate response' });
    }
  });

  return httpServer;
}