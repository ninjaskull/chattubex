import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, Send, CheckCircle, XCircle, AlertCircle, 
  Loader2, ThumbsUp, ThumbsDown, Copy, Download, Code,
  Sparkles, Table as TableIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryIntent {
  intent: string;
  confidence: number;
  suggestedSQL: string;
  explanation: string;
  tablesInvolved: string[];
  isReadOnly: boolean;
  isAmbiguous?: boolean;
  clarifyingQuestions?: string[];
  userFriendlyIntent?: string;
}

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
  insights?: string[];
}

export default function NLQueryInterface() {
  const [userQuery, setUserQuery] = useState("");
  const [queryIntent, setQueryIntent] = useState<QueryIntent | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const { toast } = useToast();

  // Load suggestions on mount
  useState(() => {
    loadSuggestions();
  });

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/duggu/nl/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleAnalyzeQuery = async () => {
    if (!userQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a query to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setQueryIntent(null);
    setQueryResult(null);
    setShowConfirmation(false);

    try {
      const response = await fetch('/api/duggu/nl/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });

      if (response.ok) {
        const intent: QueryIntent = await response.json();
        setQueryIntent(intent);
        
        if (intent.isReadOnly) {
          setShowConfirmation(true);
        } else {
          toast({
            title: "Query Not Allowed",
            description: "Only read-only SELECT queries are permitted.",
            variant: "destructive"
          });
        }
      } else {
        const error = await response.json();
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze query",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!queryIntent?.suggestedSQL) return;

    setIsExecuting(true);

    try {
      const response = await fetch('/api/duggu/nl/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sql: queryIntent.suggestedSQL,
          userQuery: userQuery 
        })
      });

      if (response.ok) {
        const result: QueryResult = await response.json();
        setQueryResult(result);
        setShowConfirmation(false);
        
        if (result.success) {
          toast({
            title: "Query Executed",
            description: `Retrieved ${result.rowCount} rows in ${result.executionTime}ms`,
          });
        } else {
          toast({
            title: "Execution Failed",
            description: result.error || "Query execution failed",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to execute query",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFeedback = async (wasAccurate: boolean) => {
    if (!queryIntent || !userQuery) return;

    try {
      await fetch('/api/duggu/nl/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery,
          generatedSQL: queryIntent.suggestedSQL,
          wasAccurate,
          userFeedback: wasAccurate ? 'Query was accurate' : 'Query needs improvement'
        })
      });

      toast({
        title: "Thank You!",
        description: "Your feedback helps improve query accuracy.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const downloadResults = () => {
    if (!queryResult?.data) return;

    const csvContent = convertToCSV(queryResult.data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl" data-testid="nl-query-interface">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-2xl">Natural Language Database Query</CardTitle>
          </div>
          <CardDescription>
            Ask questions in plain English and Duggu will generate and execute SQL queries for you
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Query Input Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Ask a Question</label>
            <Textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g., Show me all pets with vaccinations due this month, or Find contacts from companies in the healthcare industry"
              className="min-h-24 resize-none"
              data-testid="input-query"
            />
            
            {/* Suggestions */}
            {suggestions.length > 0 && !userQuery && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 5).map((suggestion, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                      onClick={() => setUserQuery(suggestion)}
                      data-testid={`suggestion-${idx}`}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              onClick={handleAnalyzeQuery}
              disabled={isAnalyzing || !userQuery.trim()}
              className="w-full sm:w-auto"
              data-testid="button-analyze"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Query
                </>
              )}
            </Button>
          </div>

          {/* Query Intent Confirmation */}
          {queryIntent && showConfirmation && (
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  {queryIntent.isAmbiguous ? "I need more information" : "Query Understanding"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User-friendly Intent */}
                {queryIntent.userFriendlyIntent && (
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 dark:text-blue-100">
                      {queryIntent.userFriendlyIntent}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Clarifying Questions if Ambiguous */}
                {queryIntent.isAmbiguous && queryIntent.clarifyingQuestions && queryIntent.clarifyingQuestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">To help you better, please clarify:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {queryIntent.clarifyingQuestions.map((question, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {question}
                        </li>
                      ))}
                    </ul>
                    <Alert variant="default" className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please refine your question with more details and try again.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {/* Show SQL only if not ambiguous */}
                {!queryIntent.isAmbiguous && (
                  <>
                    <div>
                      <p className="text-sm font-medium mb-1">Technical explanation:</p>
                      <p className="text-sm text-muted-foreground">{queryIntent.explanation}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Generated SQL:</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(queryIntent.suggestedSQL)}
                          data-testid="button-copy-sql"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded text-xs overflow-x-auto">
                        <code>{queryIntent.suggestedSQL}</code>
                      </pre>
                    </div>
                  </>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Confidence: {queryIntent.confidence}%
                  </Badge>
                  <Badge variant="secondary">
                    Tables: {queryIntent.tablesInvolved.join(', ')}
                  </Badge>
                  {queryIntent.isReadOnly && (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Read-Only
                    </Badge>
                  )}
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This query will only read data from your database. No modifications will be made.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleExecuteQuery}
                    disabled={isExecuting}
                    className="flex-1"
                    data-testid="button-execute"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Execute Query
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Query Results */}
          {queryResult && (
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {queryResult.success ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Query Results
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        Query Failed
                      </>
                    )}
                  </CardTitle>
                  
                  {queryResult.success && queryResult.data && queryResult.data.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadResults}
                        data-testid="button-download"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download CSV
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {queryResult.success ? (
                  <>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Rows: {queryResult.rowCount}</span>
                      <span>Time: {queryResult.executionTime}ms</span>
                    </div>
                    
                    {queryResult.data && queryResult.data.length > 0 ? (
                      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'json')}>
                        <TabsList>
                          <TabsTrigger value="table" data-testid="tab-table">
                            <TableIcon className="w-4 h-4 mr-1" />
                            Table
                          </TabsTrigger>
                          <TabsTrigger value="json" data-testid="tab-json">
                            <Code className="w-4 h-4 mr-1" />
                            JSON
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="table">
                          <ScrollArea className="h-96 w-full border rounded">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm" data-testid="results-table">
                                <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0">
                                  <tr>
                                    {Object.keys(queryResult.data[0]).map((key) => (
                                      <th key={key} className="px-4 py-2 text-left font-medium border-b">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {queryResult.data.map((row, idx) => (
                                    <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                                      {Object.values(row).map((value: any, cellIdx) => (
                                        <td key={cellIdx} className="px-4 py-2">
                                          {value === null || value === undefined 
                                            ? <span className="text-muted-foreground italic">null</span>
                                            : typeof value === 'object'
                                            ? JSON.stringify(value)
                                            : String(value)
                                          }
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                        
                        <TabsContent value="json">
                          <ScrollArea className="h-96">
                            <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs">
                              <code>{JSON.stringify(queryResult.data, null, 2)}</code>
                            </pre>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <Alert>
                        <AlertDescription>No results found.</AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Feedback Section */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Was this query accurate?</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(true)}
                          data-testid="button-feedback-yes"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(false)}
                          data-testid="button-feedback-no"
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          No
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {queryResult.error || 'An error occurred while executing the query'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
