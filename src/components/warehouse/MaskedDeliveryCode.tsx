"use client";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * The plaintext delivery code, masked until someone taps "Show code".
 *
 * The code is the customer's proof of delivery, so it stays off the screen
 * unless a person deliberately reveals it — not on display for whoever walks
 * past the receiving desk. `revealed` is controlled by the parent so it can
 * gate things like printing on it.
 */
export function MaskedDeliveryCode({
  code,
  revealed,
  onRevealedChange,
}: {
  code: string;
  revealed: boolean;
  onRevealedChange: (revealed: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-lg border-2 border-amber-500 bg-amber-50 py-6 text-center dark:bg-amber-950/30">
      <div
        dir="ltr"
        className="font-mono text-5xl font-bold tracking-[0.3em] text-amber-700 dark:text-amber-400"
        aria-label={revealed ? code : t("warehouseDeliveryCode.masked")}
      >
        {revealed ? code : "•".repeat(code.length)}
      </div>
      {!revealed && (
        <p className="px-4 text-xs text-muted-foreground">
          {t("warehouseDeliveryCode.masked")}
        </p>
      )}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onRevealedChange(!revealed)}
      >
        {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {revealed
          ? t("warehouseDeliveryCode.hide")
          : t("warehouseDeliveryCode.show")}
      </Button>
    </div>
  );
}

/** Shown in place of the code when the server withheld it from a clerk. */
export function HiddenDeliveryCodeNotice({ messageSent }: { messageSent: boolean }) {
  const { t } = useTranslation();

  return messageSent ? (
    <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
      {t("warehouseDeliveryCode.hiddenSent")}
    </div>
  ) : (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
      {t("warehouseDeliveryCode.hiddenNotSent")}
    </div>
  );
}
