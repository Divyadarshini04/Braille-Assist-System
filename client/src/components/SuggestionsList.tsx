import { SuggestionResult } from "@/lib/autocorrectAlgorithms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionsListProps {
  suggestions: SuggestionResult[];
  onSelectSuggestion: (suggestion: SuggestionResult) => void;
  onAcceptTopSuggestion: () => void;
  className?: string;
}

export default function SuggestionsList({ 
  suggestions, 
  onSelectSuggestion, 
  onAcceptTopSuggestion,
  className 
}: SuggestionsListProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 70) return "bg-yellow-500";
    if (confidence >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-green-500";
    return "bg-gray-400";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No suggestions available</p>
          <p className="text-sm mt-1">Try typing a word using the Braille keys</p>
        </div>
      ) : (
        <>
          {suggestions.map((suggestion, index) => (
            <Card
              key={`${suggestion.word}-${index}`}
              className="p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold",
                    getRankColor(index)
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {suggestion.word.toUpperCase()}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Confidence: {suggestion.confidence}%</span>
                      <span>•</span>
                      <span>Distance: {suggestion.distance}</span>
                      <span>•</span>
                      <span className="capitalize">{suggestion.algorithm}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getConfidenceColor(suggestion.confidence)
                  )} />
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
          
          {suggestions.length > 0 && (
            <Button 
              onClick={onAcceptTopSuggestion}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept Top Suggestion
            </Button>
          )}
        </>
      )}
    </div>
  );
}
