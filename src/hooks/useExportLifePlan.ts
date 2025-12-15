import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Goal {
  id: string;
  period_year: number;
  age: number;
  area: LifeArea;
  goal_text: string;
  is_completed: boolean;
}

interface LifePlan {
  id: string;
  title: string;
  motto: string | null;
  photo_url?: string | null;
}

interface AreaConfig {
  id: LifeArea;
  label: string;
  color: string;
}

interface ExportOptions {
  plan: LifePlan;
  goals: Goal[];
  areaConfigs: AreaConfig[];
  selectedYears?: number[]; // If empty or undefined, export all
}

export function useExportLifePlan() {
  const getAreaLabel = (areaId: LifeArea, configs: AreaConfig[]) => {
    const config = configs.find(c => c.id === areaId);
    return config?.label || LIFE_AREAS.find(a => a.id === areaId)?.label || areaId;
  };

  const filterGoalsByYears = (goals: Goal[], years?: number[]) => {
    if (!years || years.length === 0) return goals;
    return goals.filter(g => years.includes(g.period_year));
  };

  const getUniqueYears = (goals: Goal[]) => {
    return [...new Set(goals.map(g => g.period_year))].sort((a, b) => a - b);
  };

  const exportToPDF = async (options: ExportOptions) => {
    const { plan, goals, areaConfigs, selectedYears } = options;
    const filteredGoals = filterGoalsByYears(goals, selectedYears);
    const years = getUniqueYears(filteredGoals);
    
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 15;

    // Add photo if available
    if (plan.photo_url) {
      try {
        const response = await fetch(plan.photo_url);
        const blob = await response.blob();
        const reader = new FileReader();
        
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            const imgData = reader.result as string;
            const imgSize = 25;
            doc.addImage(imgData, 'JPEG', margin, yPosition, imgSize, imgSize);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
        
        // Title next to photo
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(plan.title, margin + 30, yPosition + 10);
        
        // Motto next to photo
        if (plan.motto) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100);
          doc.text(`"${plan.motto}"`, margin + 30, yPosition + 17);
        }
        
        yPosition += 30;
      } catch (error) {
        console.error('Error loading photo for PDF:', error);
        // Fallback to title without photo
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(plan.title, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;
        
        if (plan.motto) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100);
          doc.text(`"${plan.motto}"`, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 5;
        }
      }
    } else {
      // Title without photo
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(plan.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;

      // Motto
      if (plan.motto) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text(`"${plan.motto}"`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 5;
      }
    }

    // Date and period info
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'normal');
    const periodText = selectedYears && selectedYears.length > 0 
      ? `Periodo: ${Math.min(...selectedYears)} - ${Math.max(...selectedYears)}`
      : `Periodo completo: ${years[0] || 'N/A'} - ${years[years.length - 1] || 'N/A'}`;
    doc.text(`${periodText} | Gerado em: ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Summary stats
    doc.setTextColor(0);
    const totalGoals = filteredGoals.filter(g => g.goal_text.trim()).length;
    const completedGoals = filteredGoals.filter(g => g.is_completed).length;
    const percentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    doc.setFontSize(10);
    doc.text(`Total de Metas: ${totalGoals} | Concluidas: ${completedGoals} | Progresso: ${percentage}%`, margin, yPosition);
    yPosition += 8;

    // Create table for each year
    years.forEach((year, yearIndex) => {
      const yearGoals = filteredGoals.filter(g => g.period_year === year);
      const age = yearGoals[0]?.age || 0;

      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = 15;
      }

      // Year header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(`${year} (${age} anos)`, margin, yPosition);
      yPosition += 3;

      // Prepare table data - one row with all areas (supporting multiple goals per area)
      const tableData = LIFE_AREAS.map(area => {
        const areaGoals = yearGoals.filter(g => g.area === area.id);
        if (areaGoals.length === 0) return '-';
        
        // Format each goal with its status and number
        return areaGoals.map((goal, index) => {
          const status = goal.is_completed ? '[OK]' : '';
          const number = areaGoals.length > 1 ? `${index + 1}. ` : '';
          return `${status} ${number}${goal.goal_text}`.trim();
        }).join('\n');
      });

      // Create table with areas as columns - each with its own color
      autoTable(doc, {
        startY: yPosition,
        head: [LIFE_AREAS.map(a => getAreaLabel(a.id, areaConfigs))],
        body: [tableData],
        theme: 'grid',
        headStyles: {
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2,
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 4,
          valign: 'top',
          minCellHeight: 28,
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 'auto' },
          6: { cellWidth: 'auto' },
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto',
        didParseCell: (data) => {
          if (data.section === 'head') {
            const areaColors: [number, number, number][] = [
              [139, 92, 246],   // espiritual - purple
              [59, 130, 246],   // intelectual - blue
              [236, 72, 153],   // familiar - pink
              [249, 115, 22],   // social - orange
              [34, 197, 94],    // financeiro - green
              [6, 182, 212],    // profissional - cyan
              [239, 68, 68],    // saude - red
            ];
            if (data.column.index < areaColors.length) {
              data.cell.styles.fillColor = areaColors[data.column.index];
            }
          }
        },
      });

      yPosition = (doc as any).lastAutoTable?.finalY + 8 || yPosition + 30;
    });

    // Save
    const yearsText = selectedYears && selectedYears.length > 0 
      ? `${Math.min(...selectedYears)}-${Math.max(...selectedYears)}`
      : 'completo';
    const fileName = `plano-vida-${yearsText}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = (options: ExportOptions) => {
    const { plan, goals, areaConfigs, selectedYears } = options;
    const filteredGoals = filterGoalsByYears(goals, selectedYears);
    const years = getUniqueYears(filteredGoals);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const totalGoals = filteredGoals.filter(g => g.goal_text.trim()).length;
    const completedGoals = filteredGoals.filter(g => g.is_completed).length;
    const percentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const summaryData = [
      ['PLANO DE VIDA'],
      [plan.title],
      [plan.motto ? `"${plan.motto}"` : ''],
      [''],
      ['RESUMO GERAL'],
      ['Total de Metas', totalGoals],
      ['Metas Concluídas', completedGoals],
      ['Progresso', `${percentage}%`],
      [''],
      ['Período', selectedYears && selectedYears.length > 0 
        ? `${Math.min(...selectedYears)} - ${Math.max(...selectedYears)}`
        : `${years[0] || 'N/A'} - ${years[years.length - 1] || 'N/A'}`],
      ['Gerado em', format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

    // Main Goals sheet - identical structure to the system table
    const areaLabels = LIFE_AREAS.map(a => getAreaLabel(a.id, areaConfigs));
    
    // Build sheet data - each year gets a header row + goals row
    const sheetData: (string | number)[][] = [];
    
    years.forEach((year, index) => {
      const yearGoals = filteredGoals.filter(g => g.period_year === year);
      const age = yearGoals[0]?.age || 0;
      
      // Add spacing between years (except first)
      if (index > 0) {
        sheetData.push([]);
      }
      
      // Year header row
      sheetData.push([`ANO: ${year} | IDADE: ${age} anos`]);
      
      // Area headers row (7 columns for 7 areas)
      sheetData.push(areaLabels);
      
      // Goals row - one cell per area with the goal text
      const goalsRow = LIFE_AREAS.map(area => {
        const goal = yearGoals.find(g => g.area === area.id);
        if (!goal || !goal.goal_text.trim()) return '(sem meta)';
        return goal.goal_text;
      });
      sheetData.push(goalsRow);
      
      // Status row - shows if completed or not
      const statusRow = LIFE_AREAS.map(area => {
        const goal = yearGoals.find(g => g.area === area.id);
        if (!goal || !goal.goal_text.trim()) return '-';
        return goal.is_completed ? '✓ Concluída' : '○ Pendente';
      });
      sheetData.push(statusRow);
    });

    const wsGoals = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Set column widths (all 7 area columns same width)
    wsGoals['!cols'] = LIFE_AREAS.map(() => ({ wch: 30 }));
    
    // Add merge cells for year headers (merge across all 7 columns)
    wsGoals['!merges'] = [];
    let currentRow = 0;
    years.forEach((_, index) => {
      if (index > 0) currentRow++; // empty row
      wsGoals['!merges']!.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 6 } });
      currentRow += 4; // year header + area headers + goals + status
    });
    
    XLSX.utils.book_append_sheet(wb, wsGoals, 'Plano de Vida');

    // Status by Area sheet
    const statusHeader = ['Área', 'Total de Metas', 'Concluídas', 'Pendentes', 'Progresso'];
    const statusData = LIFE_AREAS.map(area => {
      const areaGoals = filteredGoals.filter(g => g.area === area.id && g.goal_text.trim());
      const completed = areaGoals.filter(g => g.is_completed).length;
      const total = areaGoals.length;
      const pending = total - completed;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return [getAreaLabel(area.id, areaConfigs), total, completed, pending, `${pct}%`];
    });

    const wsStatus = XLSX.utils.aoa_to_sheet([statusHeader, ...statusData]);
    wsStatus['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsStatus, 'Status por Área');

    // Save
    const yearsText = selectedYears && selectedYears.length > 0 
      ? `${Math.min(...selectedYears)}-${Math.max(...selectedYears)}`
      : 'completo';
    const fileName = `plano-vida-${yearsText}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return { exportToPDF, exportToExcel, getUniqueYears };
}
