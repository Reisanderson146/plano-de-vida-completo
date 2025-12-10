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

  const exportToPDF = (options: ExportOptions) => {
    const { plan, goals, areaConfigs, selectedYears } = options;
    const filteredGoals = filterGoalsByYears(goals, selectedYears);
    const years = getUniqueYears(filteredGoals);
    
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 15;

    // Title
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

      // Prepare table data - one row with all areas
      const tableData = LIFE_AREAS.map(area => {
        const goal = yearGoals.find(g => g.area === area.id);
        const text = goal?.goal_text || '-';
        const status = goal?.is_completed ? '[OK]' : '';
        return `${status} ${text}`.trim();
      });

      // Create table with areas as columns
      autoTable(doc, {
        startY: yPosition,
        head: [LIFE_AREAS.map(a => getAreaLabel(a.id, areaConfigs))],
        body: [tableData],
        theme: 'grid',
        headStyles: {
          fillColor: [34, 139, 34],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2,
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 3,
          valign: 'top',
          minCellHeight: 15,
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
      ['Plano de Vida: ' + plan.title],
      [plan.motto ? `"${plan.motto}"` : ''],
      [''],
      ['Resumo'],
      ['Total de Metas', totalGoals],
      ['Metas Concluidas', completedGoals],
      ['Progresso', `${percentage}%`],
      [''],
      ['Periodo', selectedYears && selectedYears.length > 0 
        ? `${Math.min(...selectedYears)} - ${Math.max(...selectedYears)}`
        : `${years[0] || 'N/A'} - ${years[years.length - 1] || 'N/A'}`],
      ['Gerado em', format(new Date(), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

    // Goals sheet - matrix format (years as rows, areas as columns)
    const areaLabels = LIFE_AREAS.map(a => getAreaLabel(a.id, areaConfigs));
    const goalsHeader = ['Ano', 'Idade', ...areaLabels];
    
    const goalsData = years.map(year => {
      const yearGoals = filteredGoals.filter(g => g.period_year === year);
      const age = yearGoals[0]?.age || 0;
      
      const areaValues = LIFE_AREAS.map(area => {
        const goal = yearGoals.find(g => g.area === area.id);
        if (!goal) return '';
        const status = goal.is_completed ? '[CONCLUIDA] ' : '';
        return `${status}${goal.goal_text}`;
      });

      return [year, age, ...areaValues];
    });

    const wsGoals = XLSX.utils.aoa_to_sheet([goalsHeader, ...goalsData]);
    wsGoals['!cols'] = [
      { wch: 8 },  // Ano
      { wch: 8 },  // Idade
      { wch: 35 }, // Espiritual
      { wch: 35 }, // Intelectual
      { wch: 35 }, // Familiar
      { wch: 35 }, // Social
      { wch: 35 }, // Financeiro
      { wch: 35 }, // Profissional
      { wch: 35 }, // Saúde
    ];
    XLSX.utils.book_append_sheet(wb, wsGoals, 'Metas');

    // Status sheet - completion by area
    const statusHeader = ['Area', 'Total', 'Concluidas', 'Progresso'];
    const statusData = LIFE_AREAS.map(area => {
      const areaGoals = filteredGoals.filter(g => g.area === area.id && g.goal_text.trim());
      const completed = areaGoals.filter(g => g.is_completed).length;
      const total = areaGoals.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return [getAreaLabel(area.id, areaConfigs), total, completed, `${pct}%`];
    });

    const wsStatus = XLSX.utils.aoa_to_sheet([statusHeader, ...statusData]);
    wsStatus['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsStatus, 'Status por Area');

    // Save
    const yearsText = selectedYears && selectedYears.length > 0 
      ? `${Math.min(...selectedYears)}-${Math.max(...selectedYears)}`
      : 'completo';
    const fileName = `plano-vida-${yearsText}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return { exportToPDF, exportToExcel, getUniqueYears };
}
