import React from "react";
import { Clock, Rocket, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: "clock" | "rocket" | "sparkles";
  variant?: "default" | "minimal" | "card";
  className?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "This feature is currently under development. Stay tuned!",
  icon = "rocket",
  variant = "default",
  className = "",
}) => {
  const icons = {
    clock: Clock,
    rocket: Rocket,
    sparkles: Sparkles,
  };

  const Icon = icons[icon];

  // Minimal variant - just text
  if (variant === "minimal") {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 text-sm">{title}</p>
      </div>
    );
  }

  // Card variant - in a card container
  if (variant === "card") {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <Icon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-center max-w-md">{description}</p>
        </CardContent>
      </Card>
    );
  }

  // Default variant - centered with icon
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      <div className="bg-purple-100 p-6 rounded-full mb-6 animate-pulse">
        <Icon className="w-12 h-12 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      <div className="flex gap-2">
        <div
          className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
};
