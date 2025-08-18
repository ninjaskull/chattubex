import fs from 'fs';
import path from 'path';
import { storage } from '../storage';
import { encrypt } from './encryption';

/**
 * Utility to repair document file references in the database
 * This fixes the issue where database file references don't match actual files
 */
export async function repairDocumentReferences() {
  console.log('🔧 Starting document repair process...');
  
  // Get all files in uploads directory
  const uploadsDir = 'uploads';
  const uploadedFiles = fs.readdirSync(uploadsDir);
  console.log(`📁 Found ${uploadedFiles.length} files in uploads directory`);
  
  // Get all documents from database
  const documents = await storage.getDocuments();
  console.log(`📊 Found ${documents.length} documents in database`);
  
  let repairedCount = 0;
  let missingFiles = 0;
  
  for (const document of documents) {
    const expectedFilename = document.filename;
    const filePath = path.join(uploadsDir, expectedFilename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Missing file: ${expectedFilename} for document ${document.id} (${document.originalName})`);
      missingFiles++;
      
      // Try to find a file with similar size or same extension
      const originalExt = path.extname(document.originalName);
      const similarFiles = uploadedFiles.filter(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return stats.size === document.fileSize || path.extname(file) === originalExt;
      });
      
      if (similarFiles.length > 0) {
        console.log(`🔍 Found potential matches: ${similarFiles.join(', ')}`);
        // For now, just log potential matches
        // In a real scenario, we'd need user confirmation before updating
      }
    } else {
      console.log(`✅ File exists: ${expectedFilename}`);
      repairedCount++;
    }
  }
  
  console.log('\n📋 Repair Summary:');
  console.log(`✅ Files found: ${repairedCount}`);
  console.log(`❌ Missing files: ${missingFiles}`);
  console.log(`📁 Unused files in uploads: ${uploadedFiles.length - repairedCount}`);
  
  return {
    totalDocuments: documents.length,
    filesFound: repairedCount,
    missingFiles: missingFiles,
    unusedFiles: uploadedFiles.length - repairedCount
  };
}

/**
 * Create a mapping of available files to help with manual recovery
 */
export async function generateFileMapping() {
  const uploadsDir = 'uploads';
  const uploadedFiles = fs.readdirSync(uploadsDir);
  const documents = await storage.getDocuments();
  
  console.log('\n📋 File Mapping Report:');
  console.log('='.repeat(60));
  
  // Available files with their properties
  console.log('\n📁 Available Files in Uploads:');
  uploadedFiles.forEach((filename, index) => {
    const filePath = path.join(uploadsDir, filename);
    const stats = fs.statSync(filePath);
    console.log(`${index + 1}. ${filename}`);
    console.log(`   Size: ${stats.size} bytes`);
    console.log(`   Modified: ${stats.mtime.toISOString()}`);
    console.log('');
  });
  
  console.log('\n📊 Database Document References:');
  documents.forEach((doc, index) => {
    console.log(`${index + 1}. DB ID: ${doc.id}`);
    console.log(`   Original Name: ${doc.originalName}`);
    console.log(`   Expected File: ${doc.filename}`);
    console.log(`   Size: ${doc.fileSize} bytes`);
    console.log(`   Exists: ${fs.existsSync(path.join(uploadsDir, doc.filename)) ? '✅' : '❌'}`);
    console.log('');
  });
  
  return {
    availableFiles: uploadedFiles.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        modified: stats.mtime,
        path: filePath
      };
    }),
    databaseDocuments: documents.map(doc => ({
      id: doc.id,
      originalName: doc.originalName,
      expectedFilename: doc.filename,
      size: doc.fileSize,
      exists: fs.existsSync(path.join(uploadsDir, doc.filename))
    }))
  };
}