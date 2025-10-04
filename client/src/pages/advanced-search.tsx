import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, Search, ChevronDown, ChevronRight, X, Download, 
  Save, RotateCcw, Filter, Database, ArrowUpDown, ArrowUp, ArrowDown,
  Loader2, Settings2, Eye, EyeOff, Table as TableIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

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

interface FilterGroup {
  name: string;
  columns: ColumnMetadata[];
  type: 'text' | 'number' | 'date' | 'boolean' | 'json';
  isOpen: boolean;
}

const operatorsByType = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_or_equal', label: 'Greater or Equal' },
    { value: 'less_or_equal', label: 'Less or Equal' },
    { value: 'between', label: 'Between' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'After' },
    { value: 'less_than', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' },
  ],
  boolean: [
    { value: 'equals', label: 'Equals' },
  ],
  json: [
    { value: 'contains', label: 'Contains' },
    { value: 'is_null', label: 'Is Null' },
    { value: 'is_not_null', label: 'Is Not Null' },
  ]
};

export default function AdvancedSearch() {
  const [, setLocation] = useLocation();
  const [selectedDatabase, setSelectedDatabase] = useState<'main' | 'readonly'>('main');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [filterGroups, setFilterGroups] = useState<Record<string, boolean>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Fetch metadata
  const { data: metadataResponse, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['/api/advanced-search/metadata', selectedDatabase],
    enabled: true,
  });

  const tables: TableMetadata[] = (metadataResponse as any)?.tables || [];
  const currentTableMetadata = tables.find((t: TableMetadata) => t.tableName === selectedTable);

  // Group columns by type for organized sidebar
  const groupedColumns = useMemo(() => {
    if (!currentTableMetadata) return [];

    const groups: FilterGroup[] = [];
    const textCols: ColumnMetadata[] = [];
    const numberCols: ColumnMetadata[] = [];
    const dateCols: ColumnMetadata[] = [];
    const booleanCols: ColumnMetadata[] = [];
    const jsonCols: ColumnMetadata[] = [];

    currentTableMetadata.columns.forEach(col => {
      const dataType = col.dataType.toLowerCase();
      if (dataType.includes('text') || dataType.includes('char') || dataType.includes('varchar')) {
        textCols.push(col);
      } else if (dataType.includes('int') || dataType.includes('numeric') || dataType.includes('decimal')) {
        numberCols.push(col);
      } else if (dataType.includes('timestamp') || dataType.includes('date')) {
        dateCols.push(col);
      } else if (dataType.includes('bool')) {
        booleanCols.push(col);
      } else if (dataType.includes('json')) {
        jsonCols.push(col);
      }
    });

    if (textCols.length > 0) groups.push({ name: 'Text Fields', columns: textCols, type: 'text', isOpen: true });
    if (numberCols.length > 0) groups.push({ name: 'Numeric Fields', columns: numberCols, type: 'number', isOpen: false });
    if (dateCols.length > 0) groups.push({ name: 'Date Fields', columns: dateCols, type: 'date', isOpen: false });
    if (booleanCols.length > 0) groups.push({ name: 'Boolean Fields', columns: booleanCols, type: 'boolean', isOpen: false });
    if (jsonCols.length > 0) groups.push({ name: 'JSON Fields', columns: jsonCols, type: 'json', isOpen: false });

    return groups;
  }, [currentTableMetadata]);

  // Initialize filter groups state
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    groupedColumns.forEach((group, index) => {
      initialState[group.name] = index === 0; // First group open by default
    });
    setFilterGroups(initialState);
  }, [groupedColumns]);

  // Auto-search when filters change (debounced)
  useEffect(() => {
    if (!selectedTable || filters.length === 0) return;
    
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, selectedTable, sortBy, sortOrder, page, pageSize]);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: any) => {
      const response = await apiRequest('POST', '/api/advanced-search/search', searchQuery);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResult(data);
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
      
      if (!response.ok) throw new Error('Export failed');
      
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
    }
  });

  const handleSearch = () => {
    if (!selectedTable) return;

    const query = {
      table: selectedTable,
      filters,
      sortBy,
      sortOrder,
      page,
      pageSize,
      database: selectedDatabase
    };

    searchMutation.mutate(query);
  };

  const handleExport = () => {
    if (!selectedTable || !searchResult) return;
    exportMutation.mutate({
      table: selectedTable,
      filters,
      sortBy,
      sortOrder,
      database: selectedDatabase
    });
  };

  const addFilter = (column: string, type: string) => {
    const operators = operatorsByType[type as keyof typeof operatorsByType] || operatorsByType.text;
    setFilters([...filters, {
      column,
      operator: operators[0].value,
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

  const resetFilters = () => {
    setFilters([]);
    setSearchResult(null);
    setSortBy('');
    setPage(1);
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
    });
  };

  const saveSearch = () => {
    const searchConfig = {
      database: selectedDatabase,
      table: selectedTable,
      filters,
      sortBy,
      sortOrder
    };
    
    localStorage.setItem('saved_search', JSON.stringify(searchConfig));
    toast({
      title: "Search Saved",
      description: "Your search configuration has been saved",
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

  const toggleColumnVisibility = (columnName: string) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(columnName)) {
      newHidden.delete(columnName);
    } else {
      newHidden.add(columnName);
    }
    setHiddenColumns(newHidden);
  };

  const visibleColumns = useMemo(() => {
    if (!searchResult?.data.length) return [];
    return Object.keys(searchResult.data[0]).filter(key => !hiddenColumns.has(key));
  }, [searchResult, hiddenColumns]);

  useEffect(() => {
    setSearchResult(null);
    setFilters([]);
    setSortBy('');
    setPage(1);
  }, [selectedTable, selectedDatabase]);

  const getOperatorsForType = (type: string) => {
    return operatorsByType[type as keyof typeof operatorsByType] || operatorsByType.text;
  };

  const getColumnType = (column: ColumnMetadata): keyof typeof operatorsByType => {
    const dataType = column.dataType.toLowerCase();
    if (dataType.includes('text') || dataType.includes('char')) return 'text';
    if (dataType.includes('int') || dataType.includes('numeric')) return 'number';
    if (dataType.includes('timestamp') || dataType.includes('date')) return 'date';
    if (dataType.includes('bool')) return 'boolean';
    if (dataType.includes('json')) return 'json';
    return 'text';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  Advanced Search
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Search across {tables.length} tables with powerful filters
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={filters.length === 0}
                data-testid="button-reset-filters"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveSearch}
                disabled={!selectedTable || filters.length === 0}
                data-testid="button-save-search"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </Button>
              <Button
                variant="default"
                size="sm"
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
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sticky Sidebar */}
        <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Database & Table Selection */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="database-select" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Database
                </Label>
                <Select value={selectedDatabase} onValueChange={(value: any) => setSelectedDatabase(value)}>
                  <SelectTrigger id="database-select" className="mt-1" data-testid="select-database">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Database</SelectItem>
                    <SelectItem value="readonly">Read-Only Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="table-select" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Table
                </Label>
                <Select value={selectedTable} onValueChange={setSelectedTable} disabled={isLoadingMetadata}>
                  <SelectTrigger id="table-select" className="mt-1" data-testid="select-table">
                    <SelectValue placeholder={isLoadingMetadata ? "Loading..." : "Select a table"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table: TableMetadata) => (
                      <SelectItem key={table.tableName} value={table.tableName} data-testid={`option-table-${table.tableName}`}>
                        <div className="flex items-center justify-between w-full">
                          <span>{table.tableName}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {table.recordCount.toLocaleString()}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters - Edit Mode */}
            {filters.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Active Filters ({filters.length})
                  </span>
                </div>
                {filters.map((filter, index) => {
                  const column = currentTableMetadata?.columns.find(c => c.columnName === filter.column);
                  const columnType = column ? getColumnType(column) : 'text';
                  const operators = getOperatorsForType(columnType);
                  const needsValue = !['is_null', 'is_not_null'].includes(filter.operator);
                  const needsSecondValue = filter.operator === 'between';
                  
                  return (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2" data-testid={`filter-${index}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {filter.column}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeFilter(index)}
                          data-testid={`button-remove-filter-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(index, 'operator', value)}
                      >
                        <SelectTrigger className="h-8 text-xs" data-testid={`select-filter-operator-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {needsValue && (
                        <>
                          {(currentTableMetadata?.sampleValues[filter.column]?.length ?? 0) > 0 ? (
                            <Select
                              value={filter.value}
                              onValueChange={(value) => updateFilter(index, 'value', value)}
                            >
                              <SelectTrigger className="h-8 text-xs" data-testid={`select-filter-value-${index}`}>
                                <SelectValue placeholder="Select value" />
                              </SelectTrigger>
                              <SelectContent>
                                {currentTableMetadata?.sampleValues[filter.column]?.map((val: any, i: number) => (
                                  <SelectItem key={i} value={String(val)}>{String(val)}</SelectItem>
                                )) ?? []}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder={needsSecondValue ? "From value" : "Value"}
                              value={filter.value || ''}
                              onChange={(e) => updateFilter(index, 'value', e.target.value)}
                              className="h-8 text-xs"
                              data-testid={`input-filter-value-${index}`}
                            />
                          )}
                          
                          {needsSecondValue && (
                            <Input
                              placeholder="To value"
                              value={filter.value2 || ''}
                              onChange={(e) => updateFilter(index, 'value2', e.target.value)}
                              className="h-8 text-xs"
                              data-testid={`input-filter-value2-${index}`}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Filter Groups */}
            {selectedTable && currentTableMetadata && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Add Filters
                  </span>
                </div>

                {groupedColumns.map((group) => (
                  <Collapsible
                    key={group.name}
                    open={filterGroups[group.name]}
                    onOpenChange={(open) => setFilterGroups({ ...filterGroups, [group.name]: open })}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {group.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {group.columns.length}
                        </Badge>
                        {filterGroups[group.name] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 space-y-1">
                      {group.columns.map((column) => (
                        <Button
                          key={column.columnName}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-sm font-normal"
                          onClick={() => addFilter(column.columnName, group.type)}
                          data-testid={`button-add-filter-${column.columnName}`}
                        >
                          <span className="truncate">{column.columnName}</span>
                          <span className="ml-auto text-xs text-slate-500">
                            {column.dataType}
                          </span>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}

            {!selectedTable && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <TableIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a table to start building filters</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-4">
            {/* Search executing indicator */}
            {searchMutation.isPending && (
              <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 dark:text-blue-300">Searching...</span>
              </div>
            )}

            {/* Results */}
            {searchResult && (
              <Card data-testid="card-results">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Results</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {searchResult.data.length} of {searchResult.totalCount.toLocaleString()} records
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Page {searchResult.page} of {searchResult.totalPages}
                      </span>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {visibleColumns.map((key) => (
                            <TableHead key={key} className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                              <div className="flex items-center justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSort(key)}
                                  className="h-8 px-2 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleColumnVisibility(key)}
                                >
                                  <EyeOff className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResult.data.map((row, rowIndex) => (
                          <TableRow key={rowIndex} data-testid={`row-result-${rowIndex}`}>
                            {visibleColumns.map((key) => (
                              <TableCell key={key} className="font-mono text-sm" data-testid={`cell-${rowIndex}-${key}`}>
                                {row[key] === null ? (
                                  <span className="text-slate-400 italic">null</span>
                                ) : typeof row[key] === 'boolean' ? (
                                  <Badge variant={row[key] ? 'default' : 'secondary'}>
                                    {String(row[key])}
                                  </Badge>
                                ) : typeof row[key] === 'object' ? (
                                  <span className="text-xs">{JSON.stringify(row[key])}</span>
                                ) : (
                                  String(row[key])
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Pagination */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Rows per page:</Label>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                          setPageSize(parseInt(value));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-20" data-testid="select-page-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="250">250</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        data-testid="button-prev-page"
                      >
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
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!searchResult && selectedTable && filters.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Add filters to search
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Use the sidebar to add filter conditions and refine your search
                </p>
              </div>
            )}

            {!selectedTable && (
              <div className="text-center py-16">
                <Database className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Select a table to begin
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose a table from the sidebar to start your advanced search
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
