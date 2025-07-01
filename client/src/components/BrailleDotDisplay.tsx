import { cn } from "@/lib/utils";

interface BrailleDotDisplayProps {
  pattern: boolean[];
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function BrailleDotDisplay({ pattern, className, size = 'medium' }: BrailleDotDisplayProps) {
  const sizeClasses = {
    small: 'w-3 h-3 gap-1',
    medium: 'w-6 h-6 gap-2', 
    large: 'w-8 h-8 gap-3'
  };
  
  const dotSizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={cn("grid grid-cols-2", sizeClasses[size], className)}>
      {pattern.map((filled, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full border-2 transition-colors",
            dotSizeClasses[size],
            filled 
              ? "border-primary bg-primary" 
              : "border-gray-300 bg-white"
          )}
        />
      ))}
    </div>
  );
}
