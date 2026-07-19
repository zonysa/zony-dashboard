"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface Code128BarcodeProps {
  value: string;
  height?: number;
  className?: string;
}

// Renders a scannable CODE128 barcode as an SVG. jsbarcode has no React
// dependency of its own — it draws directly into the ref'd <svg> element.
export function Code128Barcode({
  value,
  height = 48,
  className,
}: Code128BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        displayValue: true,
        height,
        margin: 0,
        fontSize: 12,
      });
    } catch {
      // Invalid value for CODE128 (shouldn't happen — barcode is server
      // generated) — leave the svg empty rather than crash the page.
    }
  }, [value, height]);

  if (!value) return null;

  return (
    <div dir="ltr">
      {/* jsbarcode sets a matching viewBox, so scaling the svg via CSS
          (rather than the width/height attributes it also sets) keeps
          the barcode crisp at any container width. */}
      <svg ref={svgRef} className={className} style={{ width: "100%", height: "auto" }} />
    </div>
  );
}
