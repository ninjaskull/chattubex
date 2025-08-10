import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onExport: (options: ExportOptions) => void;
  isExporting: boolean;
}

interface ExportOptions {
  query: string;
  searchType: 'all' | 'contacts' | 'campaign-data';
  customFileName: string;
  includeHeaders: boolean;
}

export function CsvExportModal({ isOpen, onClose, searchQuery, onExport, isExporting }: CsvExportModalProps) {
  const [customFileName, setCustomFileName] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'contacts' | 'campaign-data'>('all');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const { toast } = useToast();

  const handleExport = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Export Error",
        description: "Please enter a search query first",
        variant: "destructive"
      });
      return;
    }

    const options: ExportOptions = {
      query: searchQuery,
      searchType,
      customFileName: customFileName.trim(),
      includeHeaders
    };

    onExport(options);
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
      setCustomFileName('');
      setSearchType('all');
      setIncludeHeaders(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="csv-export-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export & Save Search Results
          </DialogTitle>
          <DialogDescription>
            Export your search results and save them directly to records with a custom campaign name.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search-query" className="text-right">
              Query
            </Label>
            <Input
              id="search-query"
              value={searchQuery}
              readOnly
              className="col-span-3 bg-gray-50 dark:bg-gray-800"
              data-testid="input-search-query"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search-type" className="text-right">
              Data Type
            </Label>
            <Select value={searchType} onValueChange={(value: 'all' | 'contacts' | 'campaign-data') => setSearchType(value)}>
              <SelectTrigger className="col-span-3" data-testid="select-search-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="contacts">Contacts Only</SelectItem>
                <SelectItem value="campaign-data">Campaign Data Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-filename" className="text-right">
              Campaign Name
            </Label>
            <Input
              id="custom-filename"
              placeholder="Optional custom campaign name"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="col-span-3"
              data-testid="input-custom-filename"
            />
          </div>

          <div className="flex items-center space-x-2 justify-center">
            <Checkbox
              id="include-headers"
              checked={includeHeaders}
              onCheckedChange={(checked) => setIncludeHeaders(Boolean(checked))}
              data-testid="checkbox-include-headers"
            />
            <Label htmlFor="include-headers">Include column headers in saved data</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || !searchQuery.trim()}
            data-testid="button-export"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Save to Records
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}