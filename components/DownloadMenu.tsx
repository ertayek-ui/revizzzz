import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, ChevronDown } from "lucide-react";
import { downloadPdf, downloadTxt } from "@/lib/pdf";
import type { Flashcard, Subject } from "@/types";

type Props = {
  card: Flashcard;
  subject: Subject;
  variant?: "solid" | "outline";
  className?: string;
};

export function DownloadMenu({ card, subject, variant = "outline", className = "" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant={variant === "outline" ? "outline" : "default"}
        onClick={() => setOpen((o) => !o)}
        className={
          variant === "outline"
            ? "w-full h-12 text-base font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            : "w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
        }
      >
        <Download className="h-4 w-4 mr-2" /> Télécharger
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute z-20 right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg p-1.5">
            <button
              onClick={() => {
                downloadTxt(card, subject);
                setOpen(false);
              }}
              className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-emerald-50 transition"
            >
              <FileText className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Fichier texte (.txt)
                </span>
                <span className="block text-xs text-muted-foreground">
                  Téléchargement direct
                </span>
              </span>
            </button>
            <button
              onClick={() => {
                downloadPdf(card, subject);
                setOpen(false);
              }}
              className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-emerald-50 transition"
            >
              <Printer className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  PDF (via impression)
                </span>
                <span className="block text-xs text-muted-foreground">
                  Choisis « Enregistrer au format PDF »
                </span>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}