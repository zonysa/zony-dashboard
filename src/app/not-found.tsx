"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Animated 404 Number */}
        <div className="relative">
          <div className="text-9xl font-bold text-primary/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-primary animate-pulse">
              404
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="border-none shadow-lg">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {t("notFound.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("notFound.description")}
              </p>
            </div>

            {/* Search/Help Text */}
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Search className="h-4 w-4 mr-2" />
              {t("notFound.helpText")}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild variant="default" className="flex-1">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  {t("notFound.actions.home")}
                </Link>
              </Button>

              <Button asChild variant="outline" className="flex-1">
                <Link
                  href="javascript:history.back()"
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("notFound.actions.back")}
                </Link>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {t("notFound.contactSupport")}{" "}
                <Link
                  href="/support"
                  className="text-primary hover:underline font-medium"
                >
                  {t("notFound.actions.support")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <div className="flex justify-center space-x-2 opacity-50">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotFound;
