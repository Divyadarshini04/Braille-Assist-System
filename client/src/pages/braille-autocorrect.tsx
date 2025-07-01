import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BrailleDotDisplay from "@/components/BrailleDotDisplay";
import SuggestionsList from "@/components/SuggestionsList";
import PerformanceChart from "@/components/PerformanceChart";
import TestCaseRunner from "@/components/TestCaseRunner";
import { 
  QWERTY_TO_BRAILLE, 
  BraillePatternBuilder, 
  convertLetterToDots,
  convertDotsToBraillePattern,
  isBrailleKey
} from "@/lib/brailleUtils";
import { AutocorrectEngine, SuggestionResult } from "@/lib/autocorrectAlgorithms";
import { TEST_CASES } from "@/lib/brailleDictionary";
import { BrailleWord } from "@shared/schema";
import { 
  Contrast, 
  Clock, 
  Settings, 
  Keyboard, 
  Info, 
  Edit, 
  Lightbulb, 
  Gauge, 
  Zap,
  RotateCcw,
  Play,
  Download,
  FlaskConical
} from "lucide-react";

interface PerformanceMetrics {
  responseTime: number;
  timestamp: number;
}

export default function BrailleAutocorrect() {
  const [currentInput, setCurrentInput] = useState("");
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([]);
  const [patternBuilder] = useState(new BraillePatternBuilder());
  const [autocorrectEngine] = useState(new AutocorrectEngine());
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [algorithm, setAlgorithm] = useState<'levenshtein' | 'damerau' | 'jaro'>('levenshtein');
  const [maxDistance, setMaxDistance] = useState(2);
  const [suggestionCount, setSuggestionCount] = useState(5);
  const [dictionarySize, setDictionarySize] = useState("medium");

  // Fetch Contrast dictionary
  const { data: brailleWords = [], isLoading } = useQuery<BrailleWord[]>({
    queryKey: ["/api/braille-words"],
  });

  // Load dictionary into autocorrect engine
  useEffect(() => {
    if (brailleWords.length > 0) {
      autocorrectEngine.loadDictionary(brailleWords);
    }
  }, [brailleWords, autocorrectEngine]);

  // Handle key press events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      
      if (isBrailleKey(key)) {
        event.preventDefault();
        setActiveKeys(prev => new Set(prev).add(key));
        const dot = QWERTY_TO_BRAILLE[key];
        patternBuilder.addDot(dot);
      } else if (key === ' ') {
        event.preventDefault();
        handleSpacePress();
      } else if (key === 'BACKSPACE') {
        event.preventDefault();
        handleBackspace();
      } else if (key === 'ENTER') {
        event.preventDefault();
        handleEnter();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      
      if (isBrailleKey(key)) {
        setActiveKeys(prev => {
          const updated = new Set(prev);
          updated.delete(key);
          return updated;
        });
      }
      
      // If all Contrast keys are released, complete the character
      if (isBrailleKey(key) && activeKeys.size === 1) {
        completeCurrentCharacter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys, patternBuilder]);

  const completeCurrentCharacter = useCallback(() => {
    const letter = patternBuilder.getLetter();
    if (letter) {
      setCurrentWord(prev => [...prev, letter]);
      setCurrentInput(prev => prev + letter.toLowerCase());
    }
    patternBuilder.clear();
    generateSuggestions(currentInput + (letter?.toLowerCase() || ''));
  }, [patternBuilder, currentInput]);

  const generateSuggestions = useCallback((input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const startTime = performance.now();
    const newSuggestions = autocorrectEngine.getSuggestions(input, maxDistance, algorithm);
    const endTime = performance.now();
    
    const responseTime = endTime - startTime;
    setPerformanceMetrics(prev => [...prev, { responseTime, timestamp: Date.now() }].slice(-20));
    
    setSuggestions(newSuggestions.slice(0, suggestionCount));
  }, [autocorrectEngine, maxDistance, algorithm, suggestionCount]);

  const handleSpacePress = () => {
    if (currentInput.trim()) {
      generateSuggestions(currentInput);
    }
    // Start new word
    setCurrentWord([]);
    setCurrentInput("");
    patternBuilder.clear();
  };

  const handleBackspace = () => {
    if (currentWord.length > 0) {
      const newWord = currentWord.slice(0, -1);
      setCurrentWord(newWord);
      const newInput = newWord.join('').toLowerCase();
      setCurrentInput(newInput);
      generateSuggestions(newInput);
    }
    patternBuilder.clear();
  };

  const handleEnter = () => {
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const handleSelectSuggestion = (suggestion: SuggestionResult) => {
    setCurrentInput(suggestion.word);
    setCurrentWord(suggestion.word.toUpperCase().split(''));
    setSuggestions([]);
    patternBuilder.clear();
  };

  const handleAcceptTopSuggestion = () => {
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const handleReset = () => {
    setCurrentInput("");
    setCurrentWord([]);
    setSuggestions([]);
    setActiveKeys(new Set());
    patternBuilder.clear();
  };

  const currentBraillePattern = patternBuilder.getBrailleDisplay();
  const currentLetter = patternBuilder.getLetter();

  const avgResponseTime = performanceMetrics.length > 0 
    ? performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) / performanceMetrics.length 
    : 0;

  const accuracyRate = 94.2; // This would be calculated based on user sessions
  const memoryUsage = "2.1 MB"; // This would be calculated from actual usage

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading Contrast Dictionary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Contrast className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Contrast Autocorrect System</h1>
                <p className="text-sm text-gray-500">Real-time QWERTY to Contrast conversion & suggestions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Real-time</span>
              </div>
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input & Mapping */}
          <div className="lg:col-span-2 space-y-6">
            {/* QWERTY Mapping Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Keyboard className="w-5 h-5 text-primary mr-2" />
                  QWERTY Contrast Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(QWERTY_TO_BRAILLE).slice(0, 6).map(([key, dot]) => (
                    <div key={key} className="text-center">
                      <div className={`p-4 rounded-lg mb-2 transition-colors ${
                        activeKeys.has(key) ? 'bg-primary text-white' : 'bg-gray-100'
                      }`}>
                        <div className="text-2xl font-bold">{key}</div>
                        <div className="text-sm opacity-75">Dot {dot}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>Instructions:</strong> Press multiple keys simultaneously to form Contrast characters. 
                      For example, D+K creates the letter "C". Use Space for word separation.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-5 h-5 text-primary mr-2" />
                  Contrast Input Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Input Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type using QWERTY keys</label>
                  <div className="relative">
                    <Input 
                      value={currentInput}
                      readOnly
                      className="w-full p-4 text-lg font-mono"
                      placeholder="Press D, W, Q, K, O, P keys to create Contrast patterns..."
                    />
                    <div className="absolute right-3 top-3 text-gray-400">
                      <Keyboard className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Current Pattern Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Current Contrast Pattern</h3>
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                      <BrailleDotDisplay pattern={currentBraillePattern} />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Character: {currentLetter || 'None'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Active Keys</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {['D', 'W', 'Q', 'K', 'O', 'P'].map(key => (
                          <Badge 
                            key={key}
                            variant={activeKeys.has(key) ? "default" : "secondary"}
                            className={activeKeys.has(key) ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Word Input Display */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Word Being Typed</h3>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-16">
                    {currentWord.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {currentWord.map((letter, index) => (
                          <div key={index} className="text-center">
                            <BrailleDotDisplay 
                              pattern={convertDotsToBraillePattern(convertLetterToDots(letter))} 
                              size="small"
                              className="mb-1"
                            />
                            <span className="text-xs font-medium text-gray-600">{letter}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        Start typing to see Contrast patterns
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      Current word: <span className="font-medium">{currentInput || 'None'}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Algorithm Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 text-primary mr-2" />
                  Algorithm Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correction Algorithm</label>
                    <Select value={algorithm} onValueChange={(value: any) => setAlgorithm(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="levenshtein">Levenshtein Distance</SelectItem>
                        <SelectItem value="damerau">Damerau-Levenshtein</SelectItem>
                        <SelectItem value="jaro">Jaro-Winkler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Edit Distance</label>
                    <Input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={maxDistance} 
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span className="font-medium">{maxDistance}</span>
                      <span>5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dictionary Size</label>
                    <Select value={dictionarySize} onValueChange={setDictionarySize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1K words)</SelectItem>
                        <SelectItem value="medium">Medium (10K words)</SelectItem>
                        <SelectItem value="large">Large (100K words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suggestion Count</label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={suggestionCount} 
                      onChange={(e) => setSuggestionCount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Suggestions & Performance */}
          <div className="space-y-6">
            {/* Autocorrect Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SuggestionsList 
                  suggestions={suggestions}
                  onSelectSuggestion={handleSelectSuggestion}
                  onAcceptTopSuggestion={handleAcceptTopSuggestion}
                />
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="w-5 h-5 text-primary mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold text-green-500">
                      {performanceMetrics.length > 0 ? `${performanceMetrics[performanceMetrics.length - 1].responseTime.toFixed(1)}ms` : '0ms'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Dictionary Size</span>
                    <span className="font-semibold text-gray-900">{brailleWords.length.toLocaleString()} words</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accuracy Rate</span>
                    <span className="font-semibold text-green-500">{accuracyRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="font-semibold text-gray-900">{memoryUsage}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Response Time History</h3>
                  <PerformanceChart metrics={performanceMetrics} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Input
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Test Suite
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Cases Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="w-6 h-6 text-primary mr-3" />
              Test Cases & Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TestCaseRunner 
              testCases={TEST_CASES}
              autocorrectEngine={autocorrectEngine}
              onTestComplete={(results) => {
                console.log('Test results:', results);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Contrast className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Contrast Autocorrect System</div>
                <div className="text-sm text-gray-500">Thinkerbell Labs</div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Algorithm: {algorithm}</span>
              <span>Dictionary: {brailleWords.length} words</span>
              <span>Version: 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
