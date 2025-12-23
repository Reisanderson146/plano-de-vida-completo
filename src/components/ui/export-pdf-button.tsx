import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportPdfButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  /** Show full label or abbreviated on mobile */
  compact?: boolean;
}

export function ExportPdfButton({
  onClick,
  loading = false,
  disabled = false,
  className,
  compact = false,
}: ExportPdfButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading || disabled}
      className={cn("h-11 rounded-xl gap-2", className)}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {compact ? (
        <span className="hidden sm:inline">Exportar PDF</span>
      ) : (
        "Exportar PDF"
      )}
    </Button>
  );
}
