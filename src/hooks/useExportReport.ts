import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { LIFE_AREAS } from '@/lib/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AreaData {
  area: string;
  label: string;
  total: number;
  completed: number;
  percentage: number;
}

interface ExportData {
  title: string;
  subtitle?: string;
  areas: AreaData[];
  totalGoals: number;
  completedGoals: number;
  overallPercentage: number;
  notes?: { title: string; content: string; date: string }[];
}

export function useExportReport() {
  const exportToPDF = (data: ExportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Subtitle
    if (data.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(data.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
    }

    // Date
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Summary section
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Geral', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Metas: ${data.totalGoals}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Metas Concluídas: ${data.completedGoals}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Progresso Geral: ${data.overallPercentage}%`, margin, yPosition);
    yPosition += 15;

    // Areas table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Progresso por Área', margin, yPosition);
    yPosition += 5;

    const tableData = data.areas.map(area => {
      let status = 'Melhorar';
      if (area.percentage >= 70) status = 'Bom';
      else if (area.percentage >= 40) status = 'Atencao';

      return [
        area.label,
        area.total.toString(),
        area.completed.toString(),
        `${area.percentage}%`,
        status,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Área', 'Total', 'Concluídas', 'Progresso', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 35 },
      },
    });

    // Notes section (if any)
    if (data.notes && data.notes.length > 0) {
      // Get the final Y position after the table
      const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50;
      yPosition = finalY + 15;

      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Anotações', margin, yPosition);
      yPosition += 10;

      data.notes.forEach(note => {
        if (yPosition > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(note.title, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(note.date, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 6;

        doc.setTextColor(0);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(note.content, pageWidth - margin * 2);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 10;
      });
    }

    // Save
    const fileName = `relatorio-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = (data: ExportData) => {
    // Summary sheet
    const summaryData = [
      ['Relatório: ' + data.title],
      [data.subtitle || ''],
      [''],
      ['Resumo Geral'],
      ['Total de Metas', data.totalGoals],
      ['Metas Concluídas', data.completedGoals],
      ['Progresso Geral', `${data.overallPercentage}%`],
      [''],
      ['Gerado em', format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })],
    ];

    // Areas sheet
    const areasHeader = ['Área', 'Total de Metas', 'Concluídas', 'Progresso (%)', 'Status'];
    const areasData = data.areas.map(area => {
      let status = 'Precisa Melhorar';
      if (area.percentage >= 70) status = 'Bom';
      else if (area.percentage >= 40) status = 'Atenção';

      return [
        area.label,
        area.total,
        area.completed,
        area.percentage,
        status,
      ];
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add Summary sheet
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

    // Add Areas sheet
    const wsAreas = XLSX.utils.aoa_to_sheet([areasHeader, ...areasData]);
    wsAreas['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAreas, 'Áreas');

    // Add Notes sheet (if any)
    if (data.notes && data.notes.length > 0) {
      const notesHeader = ['Título', 'Conteúdo', 'Data'];
      const notesData = data.notes.map(note => [
        note.title,
        note.content,
        note.date,
      ]);

      const wsNotes = XLSX.utils.aoa_to_sheet([notesHeader, ...notesData]);
      wsNotes['!cols'] = [
        { wch: 30 },
        { wch: 60 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, wsNotes, 'Anotações');
    }

    // Save
    const fileName = `relatorio-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return { exportToPDF, exportToExcel };
}
