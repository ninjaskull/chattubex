import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, options: ImportOptions) => void;
  isImporting: boolean;
}

interface ImportOptions {
  customName: string;
  overwrite: boolean;
}

export function CsvImportModal({ isOpen, onClose, onImport, isImporting }: CsvImportModalProps) {
  const [customName, setCustomName] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "Import Error",
        description: "Please select a CSV file first",
        variant: "destructive"
      });
      return;
    }

    const options: ImportOptions = {
      customName: customName.trim(),
      overwrite
    };

    onImport(selectedFile, options);
  };

  const handleClose = () => {
    if (!isImporting) {
      onClose();
      setCustomName('');
      setOverwrite(false);
      setSelectedFile(null);
      setDragActive(false);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="csv-import-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import CSV Data
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to create a new campaign with your contact data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            data-testid="file-drop-zone"
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-600">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your CSV file here, or{' '}
                  <button
                    type="button"
                    onClick={handleFileInputClick}
                    className="text-primary hover:underline"
                    data-testid="button-browse-files"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            data-testid="file-input-hidden"
          />

          {/* Custom Campaign Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-name" className="text-right">
              Campaign Name
            </Label>
            <Input
              id="custom-name"
              placeholder="Optional custom name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="col-span-3"
              data-testid="input-custom-name"
            />
          </div>

          {/* Overwrite Option */}
          <div className="flex items-center space-x-2 justify-center">
            <Checkbox
              id="overwrite"
              checked={overwrite}
              onCheckedChange={(checked) => setOverwrite(Boolean(checked))}
              data-testid="checkbox-overwrite"
            />
            <Label htmlFor="overwrite">Overwrite if campaign name exists</Label>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The first row of your CSV file should contain column headers. 
              All data will be automatically encrypted and stored securely.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting || !selectedFile}
            data-testid="button-import"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}