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

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [100, 100, 100];
  };

  const getAreaColor = (areaId: LifeArea, configs: AreaConfig[]): [number, number, number] => {
    const config = configs.find(c => c.id === areaId);
    if (config?.color) {
      return hexToRgb(config.color);
    }
    const defaultColors: Record<LifeArea, [number, number, number]> = {
      espiritual: [139, 92, 246],
      intelectual: [59, 130, 246],
      familiar: [236, 72, 153],
      social: [249, 115, 22],
      financeiro: [34, 197, 94],
      profissional: [6, 182, 212],
      saude: [239, 68, 68],
    };
    return defaultColors[areaId];
  };

  // Function to load and create circular image with correct orientation using Canvas
  const loadCircularImage = async (imageUrl: string, size: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Use higher resolution for better quality (8x the display size)
        const canvasSize = size * 8;
        const shadowOffset = canvasSize * 0.03;
        const shadowBlur = canvasSize * 0.08;
        const paddingForShadow = canvasSize * 0.1;
        const totalCanvasSize = canvasSize + paddingForShadow * 2;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = totalCanvasSize;
        canvas.height = totalCanvasSize;
        
        // Draw shadow first
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffset;
        ctx.shadowOffsetY = shadowOffset;
        
        // Draw a circle for the shadow
        ctx.beginPath();
        ctx.arc(totalCanvasSize / 2, totalCanvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
        
        // Now draw the actual image with circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(totalCanvasSize / 2, totalCanvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Calculate cropping to center the image (cover mode)
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX = paddingForShadow, offsetY = paddingForShadow;
        
        if (aspectRatio > 1) {
          // Landscape image
          drawHeight = canvasSize;
          drawWidth = canvasSize * aspectRatio;
          offsetX = paddingForShadow - (drawWidth - canvasSize) / 2;
        } else {
          // Portrait or square image
          drawWidth = canvasSize;
          drawHeight = canvasSize / aspectRatio;
          offsetY = paddingForShadow - (drawHeight - canvasSize) / 2;
        }
        
        // Draw the image centered and cropped
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = canvasSize * 0.02;
        ctx.beginPath();
        ctx.arc(totalCanvasSize / 2, totalCanvasSize / 2, canvasSize / 2 - canvasSize * 0.01, 0, Math.PI * 2);
        ctx.stroke();
        
        // Convert to high quality PNG for better circular edges
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  };

  const exportToPDF = async (options: ExportOptions) => {
    const { plan, goals, areaConfigs, selectedYears } = options;
    const filteredGoals = filterGoalsByYears(goals, selectedYears);
    const years = getUniqueYears(filteredGoals);
    
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;

    // Primary color for accents
    const primaryColor: [number, number, number] = [42, 140, 104]; // #2A8C68

    // Draw header background
    doc.setFillColor(248, 250, 248);
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Draw accent line
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 3, 'F');

    // Add circular photo if available
    const photoSize = 38;
    const photoX = margin;
    const photoY = 8;
    
    if (plan.photo_url) {
      try {
        // Load and create circular image with shadow (returns larger canvas with shadow)
        const circularImgData = await loadCircularImage(plan.photo_url, photoSize);
        
        // Add the circular image with shadow (offset slightly to account for shadow padding)
        const shadowPadding = photoSize * 0.1;
        const totalSize = photoSize + shadowPadding * 2;
        doc.addImage(circularImgData, 'PNG', photoX - shadowPadding, photoY + 3 - shadowPadding, totalSize, totalSize);
      } catch (error) {
        console.error('Error loading photo for PDF:', error);
      }
    }

    // Title and motto - positioned next to photo or centered
    const textStartX = plan.photo_url ? photoX + photoSize + 15 : margin;
    const titleY = plan.photo_url ? photoY + 18 : 25;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(plan.title, textStartX, titleY);

    // Motto below title
    if (plan.motto) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`"${plan.motto}"`, textStartX, titleY + 8);
    }

    // Period and date info - right aligned
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    const periodText = selectedYears && selectedYears.length > 0 
      ? `Periodo: ${Math.min(...selectedYears)} - ${Math.max(...selectedYears)}`
      : `Periodo completo: ${years[0] || 'N/A'} - ${years[years.length - 1] || 'N/A'}`;
    doc.text(periodText, pageWidth - margin, 18, { align: 'right' });
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`, pageWidth - margin, 24, { align: 'right' });

    yPosition = 60;

    // Summary stats card
    const totalGoals = filteredGoals.filter(g => g.goal_text.trim()).length;
    const completedGoals = filteredGoals.filter(g => g.is_completed).length;
    const percentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Stats box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(margin, yPosition - 5, pageWidth - 2 * margin, 18, 3, 3, 'FD');
    
    // Stats content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('RESUMO', margin + 8, yPosition + 4);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const statsText = `Total de Metas: ${totalGoals}   |   Realizadas: ${completedGoals}   |   Progresso: ${percentage}%`;
    doc.text(statsText, margin + 50, yPosition + 4);

    // Progress bar
    const barX = pageWidth - margin - 80;
    const barY = yPosition + 1;
    const barWidth = 70;
    const barHeight = 6;
    
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    
    if (percentage > 0) {
      doc.setFillColor(...primaryColor);
      doc.roundedRect(barX, barY, (barWidth * percentage) / 100, barHeight, 2, 2, 'F');
    }

    yPosition += 20;

    // Color legend - horizontal with colored boxes
    doc.setFillColor(252, 252, 252);
    doc.setDrawColor(240, 240, 240);
    doc.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 2, 2, 'FD');
    
    const legendBoxSize = 6;
    const legendItemWidth = (pageWidth - 2 * margin - 20) / 7;
    let legendX = margin + 10;

    LIFE_AREAS.forEach((area) => {
      const color = getAreaColor(area.id, areaConfigs);
      
      // Draw rounded color box
      doc.setFillColor(...color);
      doc.roundedRect(legendX, yPosition + 1, legendBoxSize, legendBoxSize, 1, 1, 'F');
      
      // Draw label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(getAreaLabel(area.id, areaConfigs), legendX + legendBoxSize + 3, yPosition + 6);
      
      legendX += legendItemWidth;
    });

    yPosition += 18;

    // Create table for each year
    years.forEach((year) => {
      const yearGoals = filteredGoals.filter(g => g.period_year === year);
      const age = yearGoals[0]?.age || 0;

      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
        
        // Add header on new page
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 3, 'F');
      }

      // Year header with accent
      doc.setFillColor(...primaryColor);
      doc.roundedRect(margin, yPosition - 2, 4, 14, 1, 1, 'F');
      
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(`${year}`, margin + 10, yPosition + 7);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`(${age} anos)`, margin + 35, yPosition + 7);
      
      yPosition += 14;

      // Prepare table data
      const tableData = LIFE_AREAS.map(area => {
        const areaGoals = yearGoals.filter(g => g.area === area.id && g.goal_text.trim());
        if (areaGoals.length === 0) return '-';
        
        return areaGoals.map((goal, index) => {
          const status = goal.is_completed ? '[OK] ' : '';
          const number = areaGoals.length > 1 ? `${index + 1}. ` : '';
          return `${status}${number}${goal.goal_text}`.trim();
        }).join('\n\n');
      });

      // Create styled table
      autoTable(doc, {
        startY: yPosition,
        head: [LIFE_AREAS.map(a => getAreaLabel(a.id, areaConfigs))],
        body: [tableData],
        theme: 'plain',
        headStyles: {
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 4,
          halign: 'center',
          valign: 'middle',
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 5,
          valign: 'top',
          minCellHeight: 25,
          lineColor: [230, 230, 230],
          lineWidth: 0.3,
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252],
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
            const areaId = LIFE_AREAS[data.column.index]?.id;
            if (areaId) {
              data.cell.styles.fillColor = getAreaColor(areaId, areaConfigs);
            }
          }
        },
        didDrawCell: (data) => {
          // Add rounded corners effect to header cells
          if (data.section === 'head') {
            const { x, y, width, height } = data.cell;
            doc.setFillColor(255, 255, 255);
            // Small corner decorations
            if (data.column.index === 0) {
              doc.setFillColor(255, 255, 255);
            }
          }
        },
      });

      yPosition = (doc as any).lastAutoTable?.finalY + 12 || yPosition + 40;
    });

    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('Plano de Vida - Constancia que constroi resultados', pageWidth / 2, pageHeight - 10, { align: 'center' });

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
