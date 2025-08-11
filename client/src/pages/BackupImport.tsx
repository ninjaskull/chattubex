import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Database, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface ImportResult {
  success: boolean;
  message: string;
  table: string;
  imported: number;
  total: number;
  errors: string[];
}

interface BackupStatus {
  success: boolean;
  tableCounts: Record<string, number>;
  totalRecords: number;
}

export default function BackupImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const { toast } = useToast();

  const { data: backupStatus, refetch: refetchStatus } = useQuery<BackupStatus>({
    queryKey: ['/api/backup/status'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && !file.name.endsWith('.sql')) {
      toast({
        title: "Invalid File",
        description: "Please select a JSON or SQL backup file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('backup', file);

      const response = await fetch('/api/backup/import', {
        method: 'POST',
        body: formData,
      });
      
      const result: ImportResult = await response.json();

      setImportResults(prev => [...prev, result]);
      
      toast({
        title: "Import Completed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      // Refresh status after import
      refetchStatus();
      
      // Reset file input
      event.target.value = '';

    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Failed to import backup file',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearResults = () => {
    setImportResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Database className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Database Backup Import</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import Backup Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileJson className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Select JSON or SQL backup files from your old database
                </p>
                <input
                  type="file"
                  accept=".json,.sql"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="backup-upload"
                />
                <label htmlFor="backup-upload">
                  <Button 
                    variant="outline" 
                    disabled={isUploading}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      {isUploading ? 'Importing...' : 'Choose Backup File'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Supported formats: JSON backup files, SQL dump files</p>
              <p>• JSON files should contain one table's data</p>
              <p>• SQL files can contain full database dumps</p>
              <p>• Files are automatically validated before import</p>
              <p>• Duplicate records are safely ignored</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Current Database Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backupStatus ? (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">
                  Total Records: {backupStatus.totalRecords}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(backupStatus.tableCounts).map(([table, count]) => (
                    <div key={table} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="capitalize">{table}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">Loading database status...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      {importResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Import Results</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearResults}>
              Clear Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Table: {result.table}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Imported: {result.imported}/{result.total} records
                      </div>
                      {result.errors.length > 0 && (
                        <div className="mt-2 text-xs text-red-600">
                          <div className="font-medium">Errors:</div>
                          {result.errors.map((error, errorIndex) => (
                            <div key={errorIndex}>• {error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium text-gray-900">To migrate your old database:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Run backup tool on your local machine with your old database</li>
              <li>Use: <code className="bg-gray-100 px-1 rounded">tsx scripts/backup-options.ts backup "postgresql://sunil:sunil123@localhost:5432/campaign_db" json</code></li>
              <li>Upload the generated JSON files using the form above</li>
              <li>Each table will be imported separately</li>
              <li>Monitor the results and database status</li>
            </ol>
            
            <h4 className="font-medium text-gray-900 mt-4">Alternative methods:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use pg_dump to create SQL backups</li>
              <li>Export tables as CSV files</li>
              <li>Manual SQL export and import</li>
            </ul>
            
            <p className="text-xs text-gray-500 mt-4">
              See DATABASE_MIGRATION_GUIDE.md for detailed instructions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}