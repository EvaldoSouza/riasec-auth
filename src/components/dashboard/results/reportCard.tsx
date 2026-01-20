"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface ReportCardProps {
  title: string;
  date: string;
  name: string;
  email: string;
  children: React.ReactNode;
}

export function ReportCard({ title, date, name, email, children }: ReportCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Setup the print hook
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Relatorio-${title.replace(/\s+/g, "-")}-${date.replace(/\//g, "-")}`,
    // Optional: Callbacks for logging or UI feedback
    onAfterPrint: () => console.log("Print finished"), 
  });

  return (
    <div className="p-6 border rounded-xl shadow-md space-y-6 bg-white transition-all hover:shadow-lg">
      {/* 1. SCREEN HEADER: Visible on screen, hidden on paper */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Finalizado em: {date}
          </p>
        </div>
        
        <Button 
          onClick={() => handlePrint()} 
          variant="outline" 
          size="sm" 
          className="print:hidden gap-2" // Important: print:hidden hides this button on the PDF
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* 2. PRINTABLE CONTENT AREA */}
      <div ref={contentRef} className="print:p-8 print:w-full">
        
        {/* Print-Only Header: Adds context to the PDF that is otherwise handled by the UI structure */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">{title}</h1>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Relatório de Resultados RIASEC</span>
            <span>Data: {date}</span>
            <span>Usuário: {name}</span>
            <span>Email: {email}</span>
          </div>
        </div>

        {/* The actual charts and tables passed from the server */}
        {children}
        
        {/* Print-Only Footer */}
        <div className="hidden print:fixed print:bottom-4 print:w-full print:text-center print:text-xs print:text-gray-400">
          Gerado automaticamente pelo sistema.
        </div>
      </div>
    </div>
  );
}