import { useState } from "react";
import { TestCase } from "@/lib/brailleDictionary";
import { SuggestionResult, AutocorrectEngine } from "@/lib/autocorrectAlgorithms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  suggestions: SuggestionResult[];
  responseTime: number;
  topSuggestion?: string;
}

interface TestCaseRunnerProps {
  testCases: TestCase[];
  autocorrectEngine: AutocorrectEngine;
  onTestComplete: (results: TestResult[]) => void;
  className?: string;
}

export default function TestCaseRunner({ 
  testCases, 
  autocorrectEngine, 
  onTestComplete,
  className 
}: TestCaseRunnerProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [customInput, setCustomInput] = useState("");
  const [customExpected, setCustomExpected] = useState("");
  const [allTestsRunning, setAllTestsRunning] = useState(false);

  const runSingleTest = async (testCase: TestCase): Promise<TestResult> => {
    const startTime = performance.now();
    
    // Simulate some processing time for visual effect
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    const suggestions = autocorrectEngine.getSuggestions(testCase.input, 2);
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    const topSuggestion = suggestions.length > 0 ? suggestions[0].word : '';
    const passed = topSuggestion.toLowerCase() === testCase.expected.toLowerCase();
    
    return {
      testCase,
      passed,
      suggestions,
      responseTime,
      topSuggestion
    };
  };

  const handleRunSingleTest = async (testCase: TestCase) => {
    setRunningTests(prev => new Set(prev).add(testCase.id));
    
    try {
      const result = await runSingleTest(testCase);
      setTestResults(prev => {
        const filtered = prev.filter(r => r.testCase.id !== testCase.id);
        return [...filtered, result];
      });
    } finally {
      setRunningTests(prev => {
        const updated = new Set(prev);
        updated.delete(testCase.id);
        return updated;
      });
    }
  };

  const handleRunAllTests = async () => {
    setAllTestsRunning(true);
    setTestResults([]);
    
    try {
      const results: TestResult[] = [];
      
      for (const testCase of testCases) {
        setRunningTests(prev => new Set(prev).add(testCase.id));
        const result = await runSingleTest(testCase);
        results.push(result);
        setTestResults([...results]);
        setRunningTests(prev => {
          const updated = new Set(prev);
          updated.delete(testCase.id);
          return updated;
        });
      }
      
      onTestComplete(results);
    } finally {
      setAllTestsRunning(false);
    }
  };

  const handleAddCustomTest = () => {
    if (!customInput.trim() || !customExpected.trim()) return;
    
    const customTest: TestCase = {
      id: `custom_${Date.now()}`,
      name: "Custom Test Case",
      input: customInput.trim(),
      expected: customExpected.trim(),
      type: "substitution", // Default type
      description: `Custom test: "${customInput}" → "${customExpected}"`
    };
    
    handleRunSingleTest(customTest);
    setCustomInput("");
    setCustomExpected("");
  };

  const getTestResultStatus = (testCase: TestCase) => {
    const result = testResults.find(r => r.testCase.id === testCase.id);
    const isRunning = runningTests.has(testCase.id);
    
    if (isRunning) return { status: "RUNNING", color: "bg-yellow-500" };
    if (result?.passed) return { status: "PASS", color: "bg-green-500" };
    if (result && !result.passed) return { status: "FAIL", color: "bg-red-500" };
    return { status: "PENDING", color: "bg-gray-400" };
  };

  const overallStats = {
    total: testCases.length,
    passed: testResults.filter(r => r.passed).length,
    failed: testResults.filter(r => !r.passed).length,
    avgResponseTime: testResults.length > 0 
      ? testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length 
      : 0
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Cases List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Test Cases</h3>
            <Button 
              onClick={handleRunAllTests}
              disabled={allTestsRunning}
              className="bg-primary text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {allTestsRunning ? "Running..." : "Run All Tests"}
            </Button>
          </div>
          
          <div className="space-y-3">
            {testCases.map((testCase) => {
              const { status, color } = getTestResultStatus(testCase);
              
              return (
                <Card
                  key={testCase.id}
                  className="border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => !runningTests.has(testCase.id) && handleRunSingleTest(testCase)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{testCase.name}</div>
                        <div className="text-sm text-gray-500">
                          Input: "{testCase.input}" → Expected: "{testCase.expected}"
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn("text-white text-xs", color)}>
                          {status}
                        </Badge>
                        {!runningTests.has(testCase.id) && (
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Custom Test Input */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">
                Add Custom Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter test input pattern..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              />
              <Input
                placeholder="Expected output..."
                value={customExpected}
                onChange={(e) => setCustomExpected(e.target.value)}
              />
              <Button 
                onClick={handleAddCustomTest}
                disabled={!customInput.trim() || !customExpected.trim()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Test
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results Summary */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results Summary</h3>
          
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{overallStats.passed}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{overallStats.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-500">{overallStats.total - testResults.length}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
              
              {testResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Accuracy</span>
                    <span className="font-semibold text-green-500">
                      {((overallStats.passed / testResults.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-semibold">
                      {overallStats.avgResponseTime.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Coverage</span>
                    <span className="font-semibold">
                      {((testResults.length / overallStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {testResults.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Test Progress</span>
                    <span>{testResults.length}/{overallStats.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(testResults.length / overallStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Test Results */}
          {testResults.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-700">
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testResults.slice(-5).reverse().map((result) => (
                    <div 
                      key={result.testCase.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{result.testCase.input}</span>
                        <span className="text-gray-500"> → </span>
                        <span className={cn(
                          "font-medium",
                          result.passed ? "text-green-600" : "text-red-600"
                        )}>
                          {result.topSuggestion || "No suggestion"}
                        </span>
                      </div>
                      <Badge className={cn(
                        "text-xs",
                        result.passed ? "bg-green-500" : "bg-red-500"
                      )}>
                        {result.passed ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
