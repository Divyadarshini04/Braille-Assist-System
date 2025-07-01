import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
  responseTime: number;
  timestamp: number;
}

interface PerformanceChartProps {
  metrics: PerformanceMetrics[];
  className?: string;
}

export default function PerformanceChart({ metrics, className }: PerformanceChartProps) {
  const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);

  useEffect(() => {
    // Animate the chart bars
    const timer = setTimeout(() => {
      const heights = metrics.map(metric => 
        Math.min(90, (metric.responseTime / 50) * 100) // Normalize to 0-90% height
      );
      setAnimatedHeights(heights);
    }, 100);

    return () => clearTimeout(timer);
  }, [metrics]);

  const maxResponseTime = Math.max(...metrics.map(m => m.responseTime), 10);
  const avgResponseTime = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length 
    : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-end justify-between">
        {metrics.length === 0 ? (
          <div className="w-full flex items-center justify-center text-gray-500 text-sm">
            No performance data yet
          </div>
        ) : (
          metrics.slice(-10).map((metric, index) => {
            const height = animatedHeights[index] || 0;
            const isRecent = index >= metrics.length - 3;
            
            return (
              <div
                key={metric.timestamp}
                className={cn(
                  "w-2 rounded-t transition-all duration-500 ease-out",
                  isRecent ? "bg-green-500" : "bg-primary"
                )}
                style={{ height: `${height}%` }}
                title={`${metric.responseTime}ms at ${new Date(metric.timestamp).toLocaleTimeString()}`}
              />
            );
          })
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Last {Math.min(metrics.length, 10)} operations</span>
        <span>
          {metrics.length > 0 && (
            <>Avg: {avgResponseTime.toFixed(1)}ms</>
          )}
        </span>
      </div>
      
      {metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="font-semibold text-green-600">{metrics[metrics.length - 1]?.responseTime || 0}ms</div>
            <div className="text-gray-500">Latest</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{avgResponseTime.toFixed(1)}ms</div>
            <div className="text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">{maxResponseTime}ms</div>
            <div className="text-gray-500">Peak</div>
          </div>
        </div>
      )}
    </div>
  );
}
