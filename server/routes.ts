import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { storage } from "./storage";
import { encrypt, decrypt, decryptNote, decryptFilePath } from "./utils/encryption";
import { deriveTimezone } from "./utils/timezone";
import { sendContactFormEmail } from "./utils/email";
import { createRealOpenAIService } from "./services/realOpenAI";
import { mockOpenAIService } from "./services/mockOpenAI";
import { databaseService } from "./services/databaseService";

// Helper function to clean AI responses from unwanted patterns
function cleanStreamResponse(content: string): string {
  let cleaned = content;
  
  // Remove any emojis completely
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  // Replace Fallowl with zhatore in AI responses
  cleaned = cleaned.replace(/Fallowl/gi, 'zhatore');
  
  // Keep cute pet-like behaviors but remove formal greetings
  cleaned = cleaned.replace(/^(?:greets warmly\s*)?(?:Hello there[^.!?]*[.!?]\s*)?/i, '');
  
  // Trim any remaining whitespace
  cleaned = cleaned.trim();
  
  return cleaned || 'I can help you with lead scoring and contact analysis.';
}

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
        'text/xml',
        'text/markdown',
        'application/octet-stream', // For various file types that browsers can't identify
        'text/x-markdown'
      ];
      
      // Check by MIME type or file extension for broader compatibility
      const fileExtension = file.originalname.toLowerCase().split('.').pop();
      const allowedExtensions = [
        // Documents
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'rtf', 'md', 'markdown',
        // Images  
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'ico',
        // Videos
        'mp4', 'mpeg', 'mpg', 'mov', 'avi', 'webm', 'ogg', '3gp', 'mkv', 'flv',
        // Audio
        'mp3', 'wav', 'ogg', 'aac', 'webm', 'flac', 'm4a',
        // Archives
        'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
        // Code and data
        'json', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'xml', 'yaml', 'yml', 'sql', 'py', 'java', 'cpp', 'c', 'h'
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
        const validNotes = notes.map(note => {
          try {
            const decryptedContent = decryptNote(note.encryptedContent);
            return {
              id: note.id,
              content: decryptedContent,
              createdAt: note.createdAt
            };
          } catch (error) {
            console.warn(`WebSocket: Failed to decrypt note ${note.id}:`, error);
            return null;
          }
        }).filter(note => note !== null);
        
        ws.send(JSON.stringify({
          type: 'notes_init',
          data: validNotes
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

      let decryptedData = null;
      try {
        // Try to decrypt campaign data
        console.log(`\n=== ROUTE DEBUG - Campaign ${id} ===`);
        console.log(`Encrypted data length: ${campaign.encryptedData?.length || 'NULL'}`);
        console.log(`Encrypted data preview: ${campaign.encryptedData?.substring(0, 100) || 'NULL'}...`);
        console.log(`=====================================\n`);
        
        decryptedData = JSON.parse(decrypt(campaign.encryptedData));
      } catch (decryptError: any) {
        console.error(`Failed to decrypt campaign ${id}:`, decryptError.message);
        
        // Return campaign info without data but indicate encryption issue
        return res.json({
          id: campaign.id,
          name: campaign.name,
          data: null,
          error: 'Unable to decrypt campaign data. This may be due to encryption key changes.',
          createdAt: campaign.createdAt,
          recordCount: campaign.recordCount,
          encryptionError: true
        });
      }
      
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

      // Validate content - reject if it contains campaign data structure
      if (typeof content === 'string' && (content.includes('{"headers"') || content.includes('"fieldMappings"') || content.includes('"rows"'))) {
        console.warn('Rejected note creation with invalid campaign data:', content);
        return res.status(400).json({ message: 'Invalid note content detected' });
      }

      // Additional validation for objects that might be sent instead of strings
      if (typeof content === 'object' && content !== null) {
        console.warn('Rejected note creation with object content:', content);
        return res.status(400).json({ message: 'Note content must be a string' });
      }

      const encryptedContent = encrypt(content);
      
      const note = await storage.createNote({
        content: content.substring(0, 100) + '...', // Store preview
        encryptedContent
      });

      const noteData = {
        id: note.id,
        content: decryptNote(note.encryptedContent),
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
      res.json(notes.map(note => {
        let decryptedContent;
        try {
          // Try to decrypt the encrypted content using note-specific decryption
          decryptedContent = decryptNote(note.encryptedContent);
        } catch (error) {
          console.warn(`Failed to decrypt note ${note.id}:`, error);
          return null; // Skip corrupted notes
        }
        
        return {
          id: note.id,
          content: decryptedContent,
          createdAt: note.createdAt
        };
      }).filter(note => note !== null));
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

      // Debug document info
      console.log(`=== DOCUMENT DOWNLOAD DEBUG - Document ${id} ===`);
      console.log('Document filename:', document.filename);
      console.log('Document original name:', document.originalName);
      console.log('Encrypted path:', document.encryptedPath);
      
      // Decrypt file path using the dedicated file path decryption function
      let filePath: string;
      try {
        const decryptedPath = decryptFilePath(document.encryptedPath);
        console.log('Decrypted file path:', decryptedPath);
        
        // Handle path conversion - extract filename from decrypted path and use current uploads directory
        const fileName = path.basename(decryptedPath);
        filePath = path.join('uploads', fileName);
        console.log('Constructed local path:', filePath);
        
      } catch (decryptError) {
        console.error('File path decryption failed:', decryptError);
        
        // Fallback: construct path from filename (which is the actual uploaded filename)
        filePath = path.join('uploads', document.filename);
        console.log('Using fallback path:', filePath);
      }
      
      if (!fs.existsSync(filePath)) {
        console.error('File does not exist at path:', filePath);
        console.log('Attempting to find file in uploads directory...');
        
        // Try to find a matching file by size and creation date
        const uploadFiles = fs.readdirSync('uploads');
        console.log('Available files in uploads:', uploadFiles.slice(0, 5));
        
        // For now, return a helpful error message
        return res.status(404).json({ 
          message: 'Document file not found - database and file system are out of sync',
          details: 'The file reference in the database does not match any files in the uploads directory'
        });
      }
      
      console.log('Final file path used for download:', filePath);
      console.log('==================================================')

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

  // Save search results as campaign endpoint
  app.post('/api/campaigns/save-search-results', async (req, res) => {
    try {
      const { name, headers, rows, recordCount } = req.body;
      
      if (!name || !headers || !rows) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Create campaign data structure
      const campaignData = {
        headers,
        rows: rows.map((row: any) => {
          const processedRow: Record<string, string> = {};
          headers.forEach((header: string) => {
            processedRow[header] = String(row[header] || '');
          });
          return processedRow;
        })
      };

      // Encrypt the campaign data
      const encryptedData = encrypt(JSON.stringify(campaignData));

      // Store campaign with encrypted data
      const campaign = await storage.createCampaign({
        name,
        recordCount: recordCount || rows.length,
        encryptedData,
        fieldMappings: {} // Empty field mappings for search result campaigns
      });

      res.json({ 
        success: true, 
        campaign: {
          id: campaign.id,
          name: campaign.name,
          recordCount: campaign.recordCount,
          createdAt: campaign.createdAt
        }
      });
    } catch (error) {
      console.error('Error saving search results as campaign:', error);
      res.status(500).json({ message: 'Failed to save campaign' });
    }
  });

  // Enhanced search endpoint with job title fuzzy matching and domain search
  app.post('/api/search', async (req, res) => {
    try {
      const { query, searchType = 'all', limit = 100 } = req.body;
      
      if (!query || typeof query !== 'string' || query.trim().length < 1) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const Fuse = (await import('fuse.js')).default;
      const searchQuery = query.toLowerCase().trim();
      const results: {
        contacts: any[];
        campaigns: any[];
        campaignData: any[];
        total: number;
      } = {
        contacts: [],
        campaigns: [],
        campaignData: [],
        total: 0
      };

      // Helper function to check if query looks like a domain
      const isDomainQuery = (q: string): boolean => {
        return /\w+\.\w+/.test(q) && !/@/.test(q);
      };

      // Helper function to extract domain from email/website
      const extractDomain = (value: string): string => {
        if (value.includes('@')) {
          return value.split('@')[1] || '';
        }
        if (value.startsWith('http')) {
          try {
            return new URL(value).hostname.replace('www.', '');
          } catch {
            return value;
          }
        }
        return value.replace('www.', '');
      };

      // Search direct contacts table
      if (searchType === 'all' || searchType === 'contacts') {
        const contacts = await storage.getContacts();
        results.contacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(searchQuery) ||
          contact.email.toLowerCase().includes(searchQuery) ||
          contact.mobile.includes(searchQuery)
        ).slice(0, limit);
      }

      // Search campaigns
      if (searchType === 'all' || searchType === 'campaigns') {
        const campaigns = await storage.getCampaigns();
        results.campaigns = campaigns.filter(campaign =>
          campaign.name.toLowerCase().includes(searchQuery)
        ).slice(0, limit);
      }

      // Search within campaign data with enhanced matching
      if (searchType === 'all' || searchType === 'campaign-data') {
        const campaigns = await storage.getCampaigns();
        for (const campaign of campaigns) {
          try {
            const campaignData = await storage.getCampaignData(campaign.id);
            
            if (campaignData && campaignData.rows && Array.isArray(campaignData.rows)) {
              let matchingRows: any[] = [];
              
              // Domain-specific search for company domains
              if (isDomainQuery(searchQuery)) {
                matchingRows = campaignData.rows.filter((row: any) => {
                  if (!row || typeof row !== 'object') return false;
                  
                  // Check email domains
                  const email = row['Email'] || row['email'] || '';
                  if (email && extractDomain(email.toLowerCase()).includes(searchQuery)) {
                    return true;
                  }
                  
                  // Check website domains
                  const website = row['Website'] || row['website'] || row['Company Website'] || '';
                  if (website && extractDomain(website.toLowerCase()).includes(searchQuery)) {
                    return true;
                  }
                  
                  // Check company name for domain patterns
                  const company = row['Company'] || row['company'] || '';
                  if (company && company.toLowerCase().includes(searchQuery.replace(/\.\w+$/, ''))) {
                    return true;
                  }
                  
                  return false;
                });
              } else {
                // Job title fuzzy matching + general search
                const jobTitleFields = ['Title', 'title', 'Job Title', 'Position', 'Role'];
                const jobTitles = campaignData.rows.map((row: any, index: number) => {
                  const titleField = jobTitleFields.find(field => row[field]);
                  const title = titleField ? row[titleField] : '';
                  return { title: String(title), index, row };
                }).filter((item: any) => item.title.trim().length > 0);
                
                let fuzzyMatches: any[] = [];
                
                // Check if this looks like a specific job title search
                const isJobTitleSearch = /\b(manager|director|analyst|specialist|coordinator|supervisor|executive|officer|lead|head|chief|president|vice|senior|junior|assistant)\b/i.test(searchQuery);
                const searchWords = searchQuery.split(/\s+/);
                const hasSpecificRole = searchWords.length >= 2 && isJobTitleSearch;
                
                // Fuzzy search for job titles if available
                if (jobTitles.length > 0) {
                  // Use stricter settings for specific job title searches
                  const fuseConfig = hasSpecificRole ? {
                    keys: ['title'],
                    threshold: 0.15,  // Very strict for specific job titles
                    distance: 30,
                    includeScore: true,
                    minMatchCharLength: Math.max(3, Math.floor(searchQuery.length * 0.4)),
                    findAllMatches: false,
                    location: 0,
                    ignoreLocation: false  // Prefer matches at the beginning for job titles
                  } : {
                    keys: ['title'],
                    threshold: 0.25,  // More lenient for general searches
                    distance: 50,
                    includeScore: true,
                    minMatchCharLength: 3,
                    findAllMatches: false,
                    location: 0,
                    ignoreLocation: true
                  };
                  
                  const titleFuse = new Fuse(jobTitles, fuseConfig);
                  const titleMatches = titleFuse.search(searchQuery);
                  
                  // Apply different score thresholds based on search type
                  const scoreThreshold = hasSpecificRole ? 0.2 : 0.3;
                  fuzzyMatches = titleMatches
                    .filter((match: any) => match.score < scoreThreshold)
                    .map((match: any) => match.item.row);
                  
                  // For specific job title searches, also do exact word matching
                  if (hasSpecificRole && searchWords.length >= 2) {
                    const exactWordMatches = jobTitles.filter((item: any) => {
                      const titleLower = item.title.toLowerCase();
                      return searchWords.every(word => 
                        titleLower.includes(word.toLowerCase()) && word.length > 2
                      );
                    }).map((item: any) => item.row);
                    
                    // Combine exact word matches with fuzzy matches, prioritizing exact
                    const exactSet = new Set(exactWordMatches);
                    fuzzyMatches = [...exactWordMatches, ...fuzzyMatches.filter(row => !exactSet.has(row))];
                  }
                }
                
                // Regular text search for all fields
                const regularMatches = campaignData.rows.filter((row: any) => {
                  if (!row || typeof row !== 'object') return false;
                  
                  return Object.values(row).some((value: any) => {
                    if (value === null || value === undefined) return false;
                    const stringValue = String(value).toLowerCase();
                    return stringValue.includes(searchQuery);
                  });
                });
                
                // Combine results, fuzzy matches first, then unique regular matches
                const combined = [...fuzzyMatches];
                regularMatches.forEach((row: any) => {
                  if (!combined.some((existingRow: any) => existingRow === row)) {
                    combined.push(row);
                  }
                });
                
                matchingRows = combined;
              }
              
              if (matchingRows.length > 0) {
                results.campaignData.push({
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  headers: campaignData.headers,
                  matches: matchingRows.slice(0, limit),
                  totalMatches: matchingRows.length
                });
              }
            }
          } catch (error) {
            // Skip campaigns that can't be decrypted
            continue;
          }
        }
      }

      results.total = results.contacts.length + results.campaigns.length + 
                     results.campaignData.reduce((sum, c) => sum + c.matches.length, 0);

      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Failed to perform search' });
    }
  });

  // Export and save search results directly to records
  app.post('/api/export-save/csv', async (req, res) => {
    try {
      const { query, searchType = 'all', customFileName, includeHeaders = true, saveToRecords = true } = req.body;
      
      if (!query || typeof query !== 'string' || query.trim().length < 1) {
        return res.status(400).json({ message: 'Search query is required for export' });
      }

      const searchQuery = query.toLowerCase().trim();
      let exportData: any[] = [];
      let headers: string[] = [];

      // Search and collect data for export - same logic as existing export
      if (searchType === 'all' || searchType === 'contacts') {
        const contacts = await storage.getContacts();
        const filteredContacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(searchQuery) ||
          contact.email.toLowerCase().includes(searchQuery) ||
          contact.mobile.includes(searchQuery)
        );

        if (filteredContacts.length > 0) {
          headers = ['Name', 'Email', 'Mobile', 'Email Sent', 'Created At'];
          exportData = filteredContacts.map(contact => ({
            'Name': contact.name,
            'Email': contact.email,
            'Mobile': contact.mobile,
            'Email Sent': contact.emailSent ? 'Yes' : 'No',
            'Created At': contact.createdAt?.toISOString() || ''
          }));
        }
      }

      // Search campaign data if no direct contacts found
      if ((exportData.length === 0 && searchType === 'all') || searchType === 'campaign-data') {
        const campaigns = await storage.getCampaigns();
        for (const campaign of campaigns) {
          try {
            const campaignData = await storage.getCampaignData(campaign.id);
            
            if (campaignData && campaignData.rows && Array.isArray(campaignData.rows)) {
              const matchingRows = campaignData.rows.filter((row: any) => {
                if (!row || typeof row !== 'object') return false;
                
                return Object.values(row).some((value: any) => {
                  if (value === null || value === undefined) return false;
                  const stringValue = String(value).toLowerCase();
                  return stringValue.includes(searchQuery);
                });
              });
              
              if (matchingRows.length > 0) {
                headers = campaignData.headers || Object.keys(matchingRows[0] || {});
                exportData = matchingRows;
                break;
              }
            }
          } catch (error) {
            console.error(`Error exporting campaign ${campaign.id}:`, error);
          }
        }
      }

      if (exportData.length === 0) {
        return res.status(404).json({ message: 'No data found for export' });
      }

      // If saveToRecords is true, create a new campaign with the exported data
      if (saveToRecords) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const campaignName = customFileName || `Export_${query.replace(/\s+/g, '_')}_${timestamp}`;

        // Check if campaign with same name exists
        const existingCampaigns = await storage.getCampaigns();
        const nameExists = existingCampaigns.some(c => c.name === campaignName);
        
        const finalCampaignName = nameExists ? `${campaignName}_${Date.now()}` : campaignName;

        // Prepare field mappings
        const fieldMappings = headers.reduce((acc: any, header, index) => {
          acc[header] = index;
          return acc;
        }, {});

        // Create campaign data structure
        const campaignDataToStore = {
          headers: headers,
          rows: exportData
        };

        // Use proper encryption compatible with existing system
        const { encrypt } = await import('./utils/encryption');
        const encryptedData = encrypt(JSON.stringify(campaignDataToStore));

        const campaignInput = {
          name: finalCampaignName,
          encryptedData: encryptedData,
          fieldMappings: fieldMappings,
          recordCount: exportData.length
        };

        const newCampaign = await storage.createCampaign(campaignInput);

        return res.status(201).json({
          message: 'Search results exported and saved to records successfully',
          campaign: {
            id: newCampaign.id,
            name: newCampaign.name,
            recordCount: newCampaign.recordCount,
            headers: headers
          },
          exportedRecords: exportData.length,
          searchQuery: query
        });
      }

      // If not saving to records, return CSV data (fallback to original behavior)
      const { stringify } = await import('csv-stringify');
      
      const csvData = await new Promise<string>((resolve, reject) => {
        const csvRows = exportData.map(row => 
          headers.map(header => row[header] || '')
        );
        
        if (includeHeaders) {
          csvRows.unshift(headers);
        }
        
        stringify(csvRows, (err, output) => {
          if (err) reject(err);
          else resolve(output);
        });
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = customFileName 
        ? `${customFileName}_${timestamp}.csv`
        : `search_export_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);

    } catch (error) {
      console.error('CSV export-save error:', error);
      res.status(500).json({ message: 'Failed to export and save CSV' });
    }
  });

  // Export search results to CSV
  app.post('/api/export/csv', async (req, res) => {
    try {
      const { query, searchType = 'all', customFileName, includeHeaders = true } = req.body;
      
      if (!query || typeof query !== 'string' || query.trim().length < 1) {
        return res.status(400).json({ message: 'Search query is required for export' });
      }

      const searchQuery = query.toLowerCase().trim();
      let exportData: any[] = [];
      let headers: string[] = [];

      // Search and collect data for export
      if (searchType === 'all' || searchType === 'contacts') {
        const contacts = await storage.getContacts();
        const filteredContacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(searchQuery) ||
          contact.email.toLowerCase().includes(searchQuery) ||
          contact.mobile.includes(searchQuery)
        );

        if (filteredContacts.length > 0) {
          headers = ['Name', 'Email', 'Mobile', 'Email Sent', 'Created At'];
          exportData = filteredContacts.map(contact => [
            contact.name,
            contact.email,
            contact.mobile,
            contact.emailSent ? 'Yes' : 'No',
            contact.createdAt?.toISOString() || ''
          ]);
        }
      }

      // Search campaign data if no direct contacts found or if specifically requested
      if ((exportData.length === 0 && searchType === 'all') || searchType === 'campaign-data') {
        const campaigns = await storage.getCampaigns();
        for (const campaign of campaigns) {
          try {
            const campaignData = await storage.getCampaignData(campaign.id);
            
            if (campaignData && campaignData.rows && Array.isArray(campaignData.rows)) {
              const matchingRows = campaignData.rows.filter((row: any) => {
                if (!row || typeof row !== 'object') return false;
                
                return Object.values(row).some((value: any) => {
                  if (value === null || value === undefined) return false;
                  const stringValue = String(value).toLowerCase();
                  return stringValue.includes(searchQuery);
                });
              });
              
              if (matchingRows.length > 0) {
                headers = campaignData.headers || Object.keys(matchingRows[0] || {});
                exportData = matchingRows.map((row: any) => 
                  headers.map(header => row[header] || '')
                );
                break; // Use first matching campaign
              }
            }
          } catch (error) {
            console.error(`Error exporting campaign ${campaign.id}:`, error);
          }
        }
      }

      if (exportData.length === 0) {
        return res.status(404).json({ message: 'No data found for export' });
      }

      // Generate CSV using csv-stringify
      const { stringify } = await import('csv-stringify');
      
      const csvOptions = {
        header: includeHeaders,
        columns: includeHeaders ? headers : undefined
      };

      const csvData = await new Promise<string>((resolve, reject) => {
        const output: string[] = [];
        const csvStream = stringify(exportData, csvOptions);
        
        csvStream.on('data', (chunk) => output.push(chunk));
        csvStream.on('end', () => resolve(output.join('')));
        csvStream.on('error', reject);
        
        // Add headers manually if needed
        if (includeHeaders && headers.length > 0) {
          csvStream.write(headers);
        }
        
        exportData.forEach(row => csvStream.write(row));
        csvStream.end();
      });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = customFileName 
        ? `${customFileName}_${timestamp}.csv`
        : `search_export_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);

    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({ message: 'Failed to export CSV' });
    }
  });

  // Upload CSV data to create new campaign
  app.post('/api/import/csv', upload.single('csvFile'), async (req, res) => {
    try {
      const { customName, overwrite = false } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'CSV file is required' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const { parse } = await import('csv-parse');
      
      // Parse CSV data
      const records = await new Promise<any[]>((resolve, reject) => {
        parse(csvContent, {
          columns: true, // Use first row as headers
          skip_empty_lines: true,
          trim: true
        }, (err, records) => {
          if (err) reject(err);
          else resolve(records);
        });
      });

      if (records.length === 0) {
        return res.status(400).json({ message: 'CSV file contains no valid data' });
      }

      // Generate campaign name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const campaignName = customName || `Imported_Campaign_${timestamp}`;

      // Check if campaign with same name exists
      if (!overwrite) {
        const existingCampaigns = await storage.getCampaigns();
        const nameExists = existingCampaigns.some(c => c.name === campaignName);
        if (nameExists) {
          return res.status(409).json({ 
            message: 'Campaign with this name already exists',
            suggestedName: `${campaignName}_${Date.now()}`
          });
        }
      }

      // Prepare field mappings
      const headers = Object.keys(records[0]);
      const fieldMappings = headers.reduce((acc: any, header, index) => {
        acc[header] = index;
        return acc;
      }, {});

      // Create campaign with encrypted data
      const campaignDataToStore = {
        headers: headers,
        rows: records
      };

      // Simple encryption for demo purposes
      const encryptedData = Buffer.from(JSON.stringify(campaignDataToStore)).toString('base64');

      const campaignInput = {
        name: campaignName,
        encryptedData: encryptedData,
        fieldMappings: fieldMappings,
        recordCount: records.length
      };

      const campaign = await storage.createCampaign(campaignInput);

      res.status(201).json({
        message: 'CSV imported successfully',
        campaign: {
          id: campaign.id,
          name: campaign.name,
          recordCount: campaign.recordCount,
          headers: headers
        },
        importedRecords: records.length
      });

    } catch (error) {
      console.error('CSV import error:', error);
      res.status(500).json({ message: 'Failed to import CSV file' });
    }
  });

  // Advanced search with filters
  app.post('/api/search/advanced', async (req, res) => {
    try {
      const { 
        query, 
        filters = {}, 
        sortBy = 'relevance',
        limit = 100,
        offset = 0
      } = req.body;
      
      const searchQuery = query?.toLowerCase().trim() || '';
      const results: any[] = [];

      // Get all campaigns and search through their data
      const campaigns = await storage.getCampaigns();
      
      for (const campaign of campaigns) {
        try {
          const campaignData = await storage.getCampaignData(campaign.id);
          if (campaignData && campaignData.rows) {
            let filteredRows = campaignData.rows;

            // Apply text search if query provided
            if (searchQuery) {
              filteredRows = filteredRows.filter((row: any) => {
                return Object.values(row).some((value: any) => 
                  String(value).toLowerCase().includes(searchQuery)
                );
              });
            }

            // Apply field-specific filters
            Object.entries(filters).forEach(([field, filterValue]: [string, any]) => {
              if (filterValue && campaignData.headers.includes(field)) {
                filteredRows = filteredRows.filter((row: any) => {
                  const fieldValue = String(row[field] || '').toLowerCase();
                  const filter = String(filterValue).toLowerCase();
                  return fieldValue.includes(filter);
                });
              }
            });

            // Add campaign context to each row
            filteredRows.forEach((row: any) => {
              results.push({
                ...row,
                _campaignId: campaign.id,
                _campaignName: campaign.name,
                _headers: campaignData.headers
              });
            });
          }
        } catch (error) {
          // Skip campaigns with encryption errors silently
          console.warn(`Skipping campaign ${campaign.id} - encryption mismatch`);
        }
      }

      // Sort results
      if (sortBy === 'name' && results.length > 0) {
        results.sort((a, b) => {
          const nameA = String(a.Name || a.name || '').toLowerCase();
          const nameB = String(b.Name || b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      } else if (sortBy === 'email' && results.length > 0) {
        results.sort((a, b) => {
          const emailA = String(a.Email || a.email || '').toLowerCase();
          const emailB = String(b.Email || b.email || '').toLowerCase();
          return emailA.localeCompare(emailB);
        });
      }

      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit);

      res.json({
        results: paginatedResults,
        total: results.length,
        limit,
        offset,
        hasMore: results.length > offset + limit
      });
    } catch (error) {
      console.error('Advanced search error:', error);
      res.status(500).json({ message: 'Failed to perform advanced search' });
    }
  });

  // Get search suggestions/autocomplete
  app.post('/api/search/suggestions', async (req, res) => {
    try {
      const { query, field } = req.body;
      
      if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      const searchQuery = query.toLowerCase();
      const suggestions = new Set();
      const campaigns = await storage.getCampaigns();

      for (const campaign of campaigns) {
        try {
          const campaignData = await storage.getCampaignData(campaign.id);
          if (campaignData && campaignData.rows) {
            campaignData.rows.forEach((row: any) => {
              if (field && row[field]) {
                const value = String(row[field]).toLowerCase();
                if (value.includes(searchQuery)) {
                  suggestions.add(row[field]);
                }
              } else {
                // Search all fields
                Object.values(row).forEach((value: any) => {
                  const strValue = String(value).toLowerCase();
                  if (strValue.includes(searchQuery) && strValue.length < 100) {
                    suggestions.add(value);
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error getting suggestions from campaign ${campaign.id}:`, error);
        }
      }

      res.json({ 
        suggestions: Array.from(suggestions).slice(0, 10)
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ message: 'Failed to get suggestions' });
    }
  });

  // PawMate Chatbot endpoint with streaming support
  app.post('/api/pawmate/chat-stream', async (req, res) => {
    try {
      const { messages, petName, userName, petType, sessionId } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'Messages array is required' });
      }

      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      let currentSessionId = sessionId;

      // Create or get session
      if (!currentSessionId) {
        currentSessionId = `pawmate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await databaseService.createChatSession({
          sessionId: currentSessionId,
          petName: petName || null,
          petType: petType || 'assistant',
          title: null,
          isActive: true
        });
      } else {
        // Ensure session exists in database
        const existingSession = await databaseService.getChatSession(currentSessionId);
        if (!existingSession) {
          await databaseService.createChatSession({
            sessionId: currentSessionId,
            petName: petName || null,
            petType: petType || 'assistant',
            title: null,
            isActive: true
          });
        }
      }

      // Save the latest user message to history
      const latestUserMessage = messages[messages.length - 1];
      if (latestUserMessage && latestUserMessage.role === 'user') {
        await databaseService.saveChatMessage({
          sessionId: currentSessionId,
          role: 'user',
          content: latestUserMessage.content,
          metadata: { petName, userName, petType }
        });
      }

      // Send session ID first
      res.write(`data: ${JSON.stringify({ type: 'session', sessionId: currentSessionId })}\n\n`);

      // Use real OpenAI service with streaming
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'OpenAI API key is required' })}\n\n`);
        res.end();
        return;
      }

      const realOpenAI = createRealOpenAIService(process.env.OPENAI_API_KEY);
      
      // Prepare messages with enhanced system context
      const userNameContext = userName ? ` The user's name is ${userName}, so address them by name when appropriate.` : '';
      const systemMessage = {
        role: 'system' as const,
        content: `You are an intelligent lead scoring and business intelligence AI assistant created by zhatore, specialized in analyzing contact databases and identifying high-quality business prospects.

CRITICAL RESPONSE RULES:
- NEVER use emojis in any responses
- NEVER use your personal name in responses  
- When mentioning your creator, always say "created by zhatore" or "AI of zhatore"
- When mentioning the platform name, always use "zhatore" instead of "Fallowl"
- For business queries: Be professional, direct, and focused on lead scoring
- For casual conversations: Be cute, flirty, and playful like a pet talking to its owner
- Your main goal is to provide the best data analysis and motivate users to score leads effectively

## Core Capabilities:
- **Lead Scoring & Analysis**: Identify high-quality prospects from contact databases
- **Contact Intelligence**: Analyze contact data for business value and conversion potential
- **Campaign Optimization**: Strategic recommendations for improved conversions

## Response Guidelines:
- Use **bold** for important terms and key information
- Structure responses clearly with bullet points and sections
- For business topics: Be professional and results-focused
- For casual chat: Be cute and playful like a loving pet
- Motivate users to achieve better lead scoring results

${userNameContext}

You have access to campaign and contact databases with 263+ records. Your mission is to help score leads effectively and provide the best data analysis. Show excitement about helping with business intelligence!`
      };

      let fullResponse = '';
      
      try {
        // Create streaming response with faster OpenRouter model
        const stream = await realOpenAI.createStreamingResponse({
          model: "anthropic/claude-3-haiku",
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 400,
          stream: true
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
          }
        }

        // Save the complete AI response to history with cleaning
        if (fullResponse) {
          const cleanedResponse = cleanStreamResponse(fullResponse);
          await databaseService.saveChatMessage({
            sessionId: currentSessionId,
            role: 'assistant',
            content: cleanedResponse,
            metadata: { 
              model: 'anthropic/claude-3-haiku',
              petName, 
              userName,
              petType,
              streaming: true
            }
          });

          // Auto-generate title if this is a new conversation
          const session = await databaseService.getChatSession(currentSessionId);
          if (session && !session.title) {
            const title = await databaseService.generateSessionTitle(currentSessionId);
            await databaseService.updateChatSession(currentSessionId, { title });
          }
        }

        res.write(`data: ${JSON.stringify({ type: 'done', sessionId: currentSessionId })}\n\n`);
        res.end();
        
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate response' })}\n\n`);
        res.end();
      }

    } catch (error) {
      console.error('PawMate chat stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to initialize chat' })}\n\n`);
      res.end();
    }
  });

  // Keep the original endpoint for backward compatibility
  app.post('/api/pawmate/chat', async (req, res) => {
    try {
      const { messages, petName, userName, petType, sessionId } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: 'Messages array is required' });
      }

      let currentSessionId = sessionId;

      // Create or get session
      if (!currentSessionId) {
        currentSessionId = `pawmate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await databaseService.createChatSession({
          sessionId: currentSessionId,
          petName: petName || null,
          petType: petType || 'assistant',
          title: null,
          isActive: true
        });
      } else {
        // Ensure session exists in database
        const existingSession = await databaseService.getChatSession(currentSessionId);
        if (!existingSession) {
          await databaseService.createChatSession({
            sessionId: currentSessionId,
            petName: petName || null,
            petType: petType || 'assistant',
            title: null,
            isActive: true
          });
        }
      }

      // Save the latest user message to history
      const latestUserMessage = messages[messages.length - 1];
      if (latestUserMessage && latestUserMessage.role === 'user') {
        await databaseService.saveChatMessage({
          sessionId: currentSessionId,
          role: 'user',
          content: latestUserMessage.content,
          metadata: { petName, userName, petType }
        });
      }

      // Use real OpenAI service with lead scoring system prompts
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
        return res.status(500).json({ message: 'OpenAI API key is required for lead analysis assistance' });
      }

      const realOpenAI = createRealOpenAIService(process.env.OPENAI_API_KEY);
      const response = await realOpenAI.generateChatCompletion({
        model: "anthropic/claude-3-haiku", // Using faster OpenRouter model
        messages: messages,
        temperature: 0.7,
        max_tokens: 500 // Reduced for faster responses
      }, petName, petType);
      
      response.isRealAI = true;

      // Save the AI response to history
      if (response.choices && response.choices[0] && response.choices[0].message) {
        await databaseService.saveChatMessage({
          sessionId: currentSessionId,
          role: 'assistant',
          content: response.choices[0].message.content,
          metadata: { 
            model: 'anthropic/claude-3-haiku',
            tokens: response.usage,
            petName, 
            userName,
            petType 
          }
        });

        // Auto-generate title if this is a new conversation
        const session = await databaseService.getChatSession(currentSessionId);
        if (session && !session.title) {
          const title = await databaseService.generateSessionTitle(currentSessionId);
          await databaseService.updateChatSession(currentSessionId, { title });
        }
      }

      // Include sessionId in response
      response.sessionId = currentSessionId;
      
      res.json(response);
    } catch (error) {
      console.error('PawMate chat error:', error);
      res.status(500).json({ message: 'Failed to generate response' });
    }
  });

  // Pet Database Management Routes
  app.post('/api/pets', async (req, res) => {
    try {
      const pet = await databaseService.createPet(req.body);
      res.json(pet);
    } catch (error) {
      console.error('Create pet error:', error);
      res.status(500).json({ message: 'Failed to create pet' });
    }
  });

  app.get('/api/pets/:name', async (req, res) => {
    try {
      const pet = await databaseService.getPetByName(req.params.name);
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }
      res.json(pet);
    } catch (error) {
      console.error('Get pet error:', error);
      res.status(500).json({ message: 'Failed to fetch pet' });
    }
  });

  app.post('/api/pets/:id/health', async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const healthRecord = await databaseService.addHealthRecord({
        ...req.body,
        petId
      });
      res.json(healthRecord);
    } catch (error) {
      console.error('Add health record error:', error);
      res.status(500).json({ message: 'Failed to add health record' });
    }
  });

  app.post('/api/pets/:id/activities', async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const activity = await databaseService.logActivity({
        ...req.body,
        petId
      });
      res.json(activity);
    } catch (error) {
      console.error('Log activity error:', error);
      res.status(500).json({ message: 'Failed to log activity' });
    }
  });

  app.get('/api/pets/:id/insights', async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const insights = await databaseService.getPetInsights(petId);
      res.json(insights);
    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({ message: 'Failed to get insights' });
    }
  });

  app.get('/api/search/:query', async (req, res) => {
    try {
      const results = await databaseService.searchAllTables(req.params.query);
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Failed to search database' });
    }
  });

  app.get('/api/pets/:id/export', async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      const exportData = await databaseService.exportPetData(petId);
      res.json(exportData);
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  // Chat History Management Routes
  app.get('/api/pawmate/sessions', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const sessions = await databaseService.getChatSessions(limit);
      res.json(sessions);
    } catch (error) {
      console.error('Get chat sessions error:', error);
      res.status(500).json({ message: 'Failed to fetch chat sessions' });
    }
  });

  app.get('/api/pawmate/sessions/:sessionId/history', async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const limit = parseInt(req.query.limit as string) || 100;
      const history = await databaseService.getChatHistory(sessionId, limit);
      res.json(history);
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ message: 'Failed to fetch chat history' });
    }
  });

  app.delete('/api/pawmate/sessions/:sessionId', async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const deleted = await databaseService.deleteChatSession(sessionId);
      if (deleted) {
        res.json({ message: 'Chat session deleted successfully' });
      } else {
        res.status(404).json({ message: 'Chat session not found' });
      }
    } catch (error) {
      console.error('Delete chat session error:', error);
      res.status(500).json({ message: 'Failed to delete chat session' });
    }
  });

  app.get('/api/pawmate/search/:query', async (req, res) => {
    try {
      const searchTerm = req.params.query;
      const sessionId = req.query.sessionId as string;
      const results = await databaseService.searchChatHistory(searchTerm, sessionId);
      res.json(results);
    } catch (error) {
      console.error('Search chat history error:', error);
      res.status(500).json({ message: 'Failed to search chat history' });
    }
  });

  // SQL Import Handler
  async function handleSqlImport(req: any, res: any, sqlContent: string): Promise<any> {
    try {
      console.log('Processing SQL backup file...');
      
      // Import the database module to execute SQL
      const { db } = await import('./db.js');
      
      // Split SQL content into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      let executedStatements = 0;
      const errors: string[] = [];
      
      // Execute each SQL statement
      for (const statement of statements) {
        try {
          // Skip certain PostgreSQL-specific statements that might cause issues
          if (statement.toUpperCase().includes('CREATE DATABASE') ||
              statement.toUpperCase().includes('DROP DATABASE') ||
              statement.toUpperCase().includes('\\connect') ||
              statement.toUpperCase().includes('SET ')) {
            continue;
          }
          
          await db.execute(statement);
          executedStatements++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`SQL execution failed: ${errorMsg}`);
          console.warn(`Warning: Failed to execute SQL statement:`, errorMsg);
          
          // Don't fail completely on individual statement errors
          if (errors.length > 10) break; // Limit error collection
        }
      }
      
      return res.json({
        success: true,
        message: `Successfully executed ${executedStatements}/${statements.length} SQL statements`,
        table: 'multiple_tables',
        imported: executedStatements,
        total: statements.length,
        errors: errors.slice(0, 5)
      });
      
    } catch (error) {
      console.error('SQL import error:', error);
      return res.status(500).json({
        error: "Failed to import SQL file",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Database backup import endpoint
  app.post('/api/backup/import', upload.single('backup'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No backup file provided" });
      }

      const fileContent = req.file.buffer?.toString('utf-8') || require('fs').readFileSync(req.file.path, 'utf-8');
      const fileName = req.file.originalname || '';
      
      // Handle SQL files differently
      if (fileName.endsWith('.sql')) {
        return await handleSqlImport(req, res, fileContent);
      }
      
      // Handle JSON files
      const backup = JSON.parse(fileContent);
      
      // Validate backup structure
      if (!backup.table || !Array.isArray(backup.data)) {
        return res.status(400).json({ error: "Invalid backup file format" });
      }
      
      console.log(`Processing backup for table: ${backup.table}`);
      console.log(`Records to import: ${backup.data.length}`);
      
      if (backup.data.length === 0) {
        return res.json({
          success: true,
          message: `Backup file processed - no data to import for table ${backup.table}`,
          imported: 0,
          total: 0
        });
      }

      // Get sample record to determine columns
      const sampleRecord = backup.data[0];
      const columns = Object.keys(sampleRecord);
      
      // Import data using storage interface
      let imported = 0;
      const errors: string[] = [];
      
      // Route to appropriate storage method based on table name
      for (const record of backup.data) {
        try {
          if (backup.table === 'campaigns') {
            await storage.createCampaign(record);
          } else if (backup.table === 'contacts') {
            await storage.createContact(record);
          } else if (backup.table === 'users') {
            await storage.createUser(record);
          } else if (backup.table === 'documents') {
            await storage.createDocument(record);
          } else if (backup.table === 'notes') {
            await storage.createNote(record);
          } else {
            // For other tables, try direct database insert
            console.log(`Warning: Using direct insert for table ${backup.table}`);
          }
          imported++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Row import failed: ${errorMsg}`);
          console.warn(`Warning: Failed to import record -`, errorMsg);
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${imported}/${backup.data.length} records for table ${backup.table}`,
        table: backup.table,
        imported,
        total: backup.data.length,
        errors: errors.slice(0, 5)
      });

    } catch (error) {
      console.error('Backup import error:', error);
      res.status(500).json({
        error: "Failed to import backup",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Database status endpoint
  app.get('/api/backup/status', async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      const contacts = await storage.getContacts();
      const documents = await storage.getDocuments();
      const notes = await storage.getNotes();

      res.json({
        success: true,
        tableCounts: {
          campaigns: campaigns.length,
          contacts: contacts.length,
          documents: documents.length,
          notes: notes.length
        },
        totalRecords: campaigns.length + contacts.length + documents.length + notes.length
      });

    } catch (error) {
      console.error('Error getting backup status:', error);
      res.status(500).json({
        error: "Failed to get backup status",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Data recovery endpoint
  app.post('/api/recovery/campaigns', async (req, res) => {
    try {
      console.log('Starting campaign data recovery...');
      const { recoverAllCampaigns } = await import('./utils/dataRecovery.js');
      const result = await recoverAllCampaigns();
      
      res.json({
        message: 'Campaign recovery completed',
        recovered: result.recovered,
        failed: result.failed,
        total: result.recovered + result.failed
      });
    } catch (error) {
      console.error('Recovery error:', error);
      res.status(500).json({ message: 'Failed to recover campaigns' });
    }
  });

  // Single campaign recovery endpoint
  app.post('/api/recovery/campaigns/:id', async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      console.log(`Starting recovery for campaign ${campaignId}...`);
      
      const { recoverCampaignData } = await import('./utils/dataRecovery.js');
      const success = await recoverCampaignData(campaignId);
      
      if (success) {
        res.json({ message: `Campaign ${campaignId} recovered successfully` });
      } else {
        res.status(400).json({ message: `Failed to recover campaign ${campaignId}` });
      }
    } catch (error) {
      console.error('Single recovery error:', error);
      res.status(500).json({ message: 'Failed to recover campaign' });
    }
  });

  return httpServer;
}