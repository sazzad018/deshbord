import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bot, CheckCircle2 } from "lucide-react";
import { runAgentQuery } from "@/lib/utils-dashboard";
import type { Client, AIQueryResult } from "@shared/schema";

export default function AIQuerySystem() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AIQueryResult | null>(null);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const handleQuery = () => {
    if (!query.trim()) return;
    
    const queryResults = runAgentQuery(query.trim(), clients);
    setResults(queryResults);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQuery();
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI ক্যোয়ারি সিস্টেম
        </CardTitle>
        <p className="text-sm text-muted-foreground">প্রাকৃতিক ভাষায় ক্লায়েন্ট তথ্য খুঁজুন</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2 mb-4">
          <Input
            data-testid="input-ai-query"
            placeholder="যেমন: 'ফেসবুক স্কোপ আছে এমন ক্লায়েন্টদের হোয়াটসঅ্যাপ নাম্বার দাও'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleQuery} data-testid="button-run-ai-query">
            খুঁজুন
          </Button>
        </div>
        
        {results && (
          <div className="bg-muted p-4 rounded-lg" data-testid="div-ai-results">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium" data-testid="text-ai-summary">
                {results.summary}
              </span>
            </div>
            
            {results.results.length > 0 ? (
              <div className="overflow-x-auto">
                <Table data-testid="table-ai-results">
                  <TableHeader>
                    <TableRow>
                      {results.columns.map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.results.map((result, index) => (
                      <TableRow key={index} data-testid={`row-ai-result-${index}`}>
                        {results.columns.map((col) => (
                          <TableCell key={col.key} className="text-sm" data-testid={`cell-ai-result-${index}-${col.key}`}>
                            {result[col.key] || "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-ai-results">
                কোন ফলাফল পাওয়া যায়নি
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
