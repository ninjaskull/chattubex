import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Database, Search, Plus, X, Download, Filter, 
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Loader2, Table as TableIcon, Settings, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ColumnMetadata {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  maxLength: number | null;
}

interface TableMetadata {
  tableName: string;
  columns: ColumnMetadata[];
  recordCount: number;
  sampleValues: Record<string, any[]>;
}

interface SearchFilter {
  column: string;
  operator: string;
  value: any;
  value2?: any;
}

interface SearchResult {
  data: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const operatorOptions = [
  { value: 'equals', label: 'Equals', types: ['text', 'integer', 'boolean'] },
  { value: 'not_equals', label: 'Not Equals', types: ['text', 'integer', 'boolean'] },
  { value: 'contains', label: 'Contains', types: ['text'] },
  { value: 'not_contains', label: 'Does Not Contain', types: ['text'] },
  { value: 'starts_with', label: 'Starts With', types: ['text'] },
  { value: 'ends_with', label: 'Ends With', types: ['text'] },
  { value: 'greater_than', label: 'Greater Than', types: ['integer', 'timestamp'] },
  { value: 'less_than', label: 'Less Than', types: ['integer', 'timestamp'] },
  { value: 'greater_or_equal', label: 'Greater or Equal', types: ['integer', 'timestamp'] },
  { value: 'less_or_equal', label: 'Less or Equal', types: ['integer', 'timestamp'] },
  { value: 'is_null', label: 'Is Null', types: ['text', 'integer', 'boolean', 'timestamp'] },
  { value: 'is_not_null', label: 'Is Not Null', types: ['text', 'integer', 'boolean', 'timestamp'] },
  { value: 'in', label: 'In List', types: ['text', 'integer'] },
  { value: 'between', label: 'Between', types: ['integer', 'timestamp'] },
];

export default function AdvancedSearch() {
  const [selectedDatabase, setSelectedDatabase] = useState<'main' | 'readonly'>('main');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  // Fetch all tables metadata
  const { data: metadataResponse, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['/api/advanced-search/metadata', selectedDatabase],
    enabled: true,
  });

  const tables: TableMetadata[] = (metadataResponse as any)?.tables || [];
  const currentTableMetadata = tables.find((t: TableMetadata) => t.tableName === selectedTable);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: any) => {
      const response = await apiRequest('POST', '/api/advanced-search/search', searchQuery);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResult(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.totalCount} results`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to execute search",
        variant: "destructive"
      });
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (searchQuery: any) => {
      const response = await fetch('/api/advanced-search/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${selectedTable}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!selectedTable) {
      toast({
        title: "Table Required",
        description: "Please select a table to search",
        variant: "destructive"
      });
      return;
    }

    const searchQuery = {
      table: selectedTable,
      filters,
      sortBy,
      sortOrder,
      page,
      pageSize,
      database: selectedDatabase
    };

    searchMutation.mutate(searchQuery);
  };

  const handleExport = () => {
    if (!selectedTable) {
      toast({
        title: "Table Required",
        description: "Please select a table to export",
        variant: "destructive"
      });
      return;
    }

    const searchQuery = {
      table: selectedTable,
      filters,
      sortBy,
      sortOrder,
      database: selectedDatabase
    };

    exportMutation.mutate(searchQuery);
  };

  const addFilter = () => {
    if (!currentTableMetadata || currentTableMetadata.columns.length === 0) return;
    
    setFilters([...filters, {
      column: currentTableMetadata.columns[0].columnName,
      operator: 'equals',
      value: ''
    }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof SearchFilter, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const getOperatorsForColumn = (columnName: string) => {
    const column = currentTableMetadata?.columns.find((c: ColumnMetadata) => c.columnName === columnName);
    if (!column) return operatorOptions;

    const dataType = column.dataType.toLowerCase();
    return operatorOptions.filter(op => {
      if (dataType.includes('text') || dataType.includes('char')) return op.types.includes('text');
      if (dataType.includes('int') || dataType.includes('numeric')) return op.types.includes('integer');
      if (dataType.includes('bool')) return op.types.includes('boolean');
      if (dataType.includes('timestamp') || dataType.includes('date')) return op.types.includes('timestamp');
      return true;
    });
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    setSearchResult(null);
    setFilters([]);
    setSortBy('');
    setPage(1);
  }, [selectedTable, selectedDatabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              Advanced Data Search
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Search and filter data across your databases with advanced criteria
            </p>
          </div>
        </div>

        {/* Database and Table Selection */}
        <Card data-testid="card-database-selection">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Search Configuration
            </CardTitle>
            <CardDescription>Select database and table to search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="database-select">Database</Label>
                <Select value={selectedDatabase} onValueChange={(value: any) => setSelectedDatabase(value)}>
                  <SelectTrigger id="database-select" data-testid="select-database">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main" data-testid="option-database-main">Main Database (NEON_DATABASE_URL_WITH_BRANCH)</SelectItem>
                    <SelectItem value="readonly" data-testid="option-database-readonly">Read-Only Database (NEON_DATABASE_URL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="table-select">Table</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable} disabled={isLoadingMetadata}>
                  <SelectTrigger id="table-select" data-testid="select-table">
                    <SelectValue placeholder={isLoadingMetadata ? "Loading tables..." : "Select a table"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table: TableMetadata) => (
                      <SelectItem key={table.tableName} value={table.tableName} data-testid={`option-table-${table.tableName}`}>
                        {table.tableName} ({table.recordCount.toLocaleString()} records)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentTableMetadata && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <TableIcon className="h-4 w-4 text-slate-600" />
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                    Table Information
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" data-testid="badge-record-count">
                    {currentTableMetadata.recordCount.toLocaleString()} Records
                  </Badge>
                  <Badge variant="secondary" data-testid="badge-column-count">
                    {currentTableMetadata.columns.length} Columns
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        {selectedTable && currentTableMetadata && (
          <Card data-testid="card-filters">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Search Filters
                  </CardTitle>
                  <CardDescription>Add conditions to narrow down your search</CardDescription>
                </div>
                <Button onClick={addFilter} size="sm" data-testid="button-add-filter">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filters.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No filters added. Click "Add Filter" to start building your search.
                </div>
              )}

              {filters.map((filter, index) => (
                <div key={index} className="flex gap-2 items-start p-4 bg-slate-50 dark:bg-slate-800 rounded-lg" data-testid={`filter-${index}`}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    {/* Column Select */}
                    <Select
                      value={filter.column}
                      onValueChange={(value) => updateFilter(index, 'column', value)}
                    >
                      <SelectTrigger data-testid={`select-filter-column-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentTableMetadata.columns.map((col: ColumnMetadata) => (
                          <SelectItem key={col.columnName} value={col.columnName} data-testid={`option-column-${col.columnName}`}>
                            {col.columnName}
                            <span className="text-xs text-slate-500 ml-2">({col.dataType})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operator Select */}
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, 'operator', value)}
                    >
                      <SelectTrigger data-testid={`select-filter-operator-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorsForColumn(filter.column).map((op) => (
                          <SelectItem key={op.value} value={op.value} data-testid={`option-operator-${op.value}`}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value Input(s) */}
                    {!['is_null', 'is_not_null'].includes(filter.operator) && (
                      <>
                        {filter.operator === 'in' || filter.operator === 'not_in' ? (
                          <Input
                            placeholder="Comma-separated values"
                            value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                            onChange={(e) => updateFilter(index, 'value', e.target.value.split(',').map(v => v.trim()))}
                            data-testid={`input-filter-value-${index}`}
                          />
                        ) : filter.operator === 'between' ? (
                          <>
                            <Input
                              placeholder="From"
                              value={filter.value || ''}
                              onChange={(e) => updateFilter(index, 'value', e.target.value)}
                              data-testid={`input-filter-value-${index}`}
                            />
                            <Input
                              placeholder="To"
                              value={filter.value2 || ''}
                              onChange={(e) => updateFilter(index, 'value2', e.target.value)}
                              data-testid={`input-filter-value2-${index}`}
                            />
                          </>
                        ) : currentTableMetadata.sampleValues[filter.column]?.length > 0 ? (
                          <Select
                            value={filter.value}
                            onValueChange={(value) => updateFilter(index, 'value', value)}
                          >
                            <SelectTrigger data-testid={`select-filter-value-${index}`}>
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              {currentTableMetadata.sampleValues[filter.column].map((val: any, i: number) => (
                                <SelectItem key={i} value={String(val)} data-testid={`option-value-${val}`}>
                                  {String(val)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Value"
                            value={filter.value || ''}
                            onChange={(e) => updateFilter(index, 'value', e.target.value)}
                            data-testid={`input-filter-value-${index}`}
                          />
                        )}
                      </>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter(index)}
                    data-testid={`button-remove-filter-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSearch} 
                  disabled={searchMutation.isPending}
                  data-testid="button-search"
                >
                  {searchMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  disabled={!searchResult || exportMutation.isPending}
                  data-testid="button-export"
                >
                  {exportMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {searchResult && (
          <Card data-testid="card-results">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    Showing {searchResult.data.length} of {searchResult.totalCount.toLocaleString()} results
                  </CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-600">Page {searchResult.page} of {searchResult.totalPages}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {searchResult.data.length > 0 && Object.keys(searchResult.data[0]).map((key) => (
                          <TableHead key={key} className="bg-slate-100 dark:bg-slate-800">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort(key)}
                              className="h-8 px-2 hover:bg-slate-200 dark:hover:bg-slate-700"
                              data-testid={`button-sort-${key}`}
                            >
                              {key}
                              {sortBy === key && (
                                sortOrder === 'asc' ? 
                                  <ArrowUp className="ml-1 h-3 w-3" /> : 
                                  <ArrowDown className="ml-1 h-3 w-3" />
                              )}
                              {sortBy !== key && <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />}
                            </Button>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResult.data.map((row, rowIndex) => (
                        <TableRow key={rowIndex} data-testid={`row-result-${rowIndex}`}>
                          {Object.entries(row).map(([key, value], colIndex) => (
                            <TableCell key={colIndex} className="font-mono text-sm" data-testid={`cell-${rowIndex}-${key}`}>
                              {value === null ? (
                                <span className="text-slate-400 italic">null</span>
                              ) : typeof value === 'boolean' ? (
                                <Badge variant={value ? 'default' : 'secondary'}>
                                  {String(value)}
                                </Badge>
                              ) : typeof value === 'object' ? (
                                <span className="text-xs">{JSON.stringify(value)}</span>
                              ) : (
                                String(value)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(parseInt(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-page-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(searchResult.totalPages, page + 1))}
                    disabled={page === searchResult.totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
