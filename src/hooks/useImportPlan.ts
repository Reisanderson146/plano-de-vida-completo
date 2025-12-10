import * as XLSX from 'xlsx';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';

interface ImportedGoal {
  year: number;
  age: number;
  area: LifeArea;
  goalText: string;
}

interface ImportResult {
  success: boolean;
  goals: ImportedGoal[];
  errors: string[];
  warnings: string[];
}

// Mapping of area names (various formats) to our area IDs
const AREA_NAME_MAP: Record<string, LifeArea> = {
  'espiritual': 'espiritual',
  'espiritualidade': 'espiritual',
  'intelectual': 'intelectual',
  'intelecto': 'intelectual',
  'conhecimento': 'intelectual',
  'familiar': 'familiar',
  'família': 'familiar',
  'familia': 'familiar',
  'social': 'social',
  'amigos': 'social',
  'relacionamentos': 'social',
  'financeiro': 'financeiro',
  'finanças': 'financeiro',
  'financas': 'financeiro',
  'dinheiro': 'financeiro',
  'profissional': 'profissional',
  'carreira': 'profissional',
  'trabalho': 'profissional',
  'saúde': 'saude',
  'saude': 'saude',
  'health': 'saude',
  'saúde física': 'saude',
};

const normalizeAreaName = (name: string): LifeArea | null => {
  const normalized = name.toLowerCase().trim();
  return AREA_NAME_MAP[normalized] || null;
};

const parseYear = (value: any): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/\D/g, ''));
    if (!isNaN(parsed) && parsed > 1900 && parsed < 2200) return parsed;
  }
  return null;
};

const parseAge = (value: any): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/\D/g, ''));
    if (!isNaN(parsed) && parsed > 0 && parsed < 150) return parsed;
  }
  return null;
};

export function useImportPlan() {
  const parseExcel = async (file: File): Promise<ImportResult> => {
    const result: ImportResult = {
      success: false,
      goals: [],
      errors: [],
      warnings: [],
    };

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Try to find goals in the workbook
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) continue;
        
        // Try to detect the format
        const headers = jsonData[0].map((h: any) => String(h || '').toLowerCase().trim());
        
        // Format 1: Table with columns [Ano/Período, Idade, Área, Meta/Objetivo]
        const yearColIdx = headers.findIndex(h => 
          h.includes('ano') || h.includes('período') || h.includes('periodo') || h.includes('year')
        );
        const ageColIdx = headers.findIndex(h => 
          h.includes('idade') || h.includes('age')
        );
        const areaColIdx = headers.findIndex(h => 
          h.includes('área') || h.includes('area')
        );
        const goalColIdx = headers.findIndex(h => 
          h.includes('meta') || h.includes('objetivo') || h.includes('goal') || h.includes('descrição')
        );

        if (yearColIdx !== -1 && areaColIdx !== -1 && goalColIdx !== -1) {
          // Standard table format
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const year = parseYear(row[yearColIdx]);
            const age = ageColIdx !== -1 ? parseAge(row[ageColIdx]) : null;
            const areaRaw = String(row[areaColIdx] || '');
            const area = normalizeAreaName(areaRaw);
            const goalText = String(row[goalColIdx] || '').trim();

            if (year && area && goalText) {
              result.goals.push({
                year,
                age: age || (year - new Date().getFullYear() + 30), // Default age calculation
                area,
                goalText,
              });
            } else if (goalText) {
              result.warnings.push(`Linha ${i + 1}: Meta ignorada - ano ou área inválidos`);
            }
          }
        } else {
          // Format 2: Matrix format where columns are areas and rows are years
          // Check if first column might be years and other columns are areas
          const potentialAreas = headers.slice(1).map((h, idx) => ({
            colIdx: idx + 1,
            area: normalizeAreaName(h),
            header: h,
          })).filter(a => a.area !== null);

          if (potentialAreas.length > 0) {
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (!row || row.length === 0) continue;

              const yearOrAge = parseYear(row[0]) || parseAge(row[0]);
              if (!yearOrAge) continue;

              // Determine if it's a year or age
              const isYear = yearOrAge > 1900;
              const year = isYear ? yearOrAge : new Date().getFullYear() + (yearOrAge - 30);
              const age = isYear ? yearOrAge - new Date().getFullYear() + 30 : yearOrAge;

              for (const { colIdx, area } of potentialAreas) {
                const goalText = String(row[colIdx] || '').trim();
                if (goalText && area) {
                  result.goals.push({
                    year,
                    age,
                    area,
                    goalText,
                  });
                }
              }
            }
          }
        }
      }

      if (result.goals.length > 0) {
        result.success = true;
      } else {
        result.errors.push('Nenhuma meta válida encontrada no arquivo. Verifique se o formato está correto.');
      }
    } catch (error: any) {
      result.errors.push(`Erro ao processar arquivo: ${error.message}`);
    }

    return result;
  };

  const parsePDF = async (file: File): Promise<ImportResult> => {
    const result: ImportResult = {
      success: false,
      goals: [],
      errors: [],
      warnings: [],
    };

    try {
      // Dynamically import pdfjs
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      // Try to parse the text content
      const lines = fullText.split('\n').filter(l => l.trim());
      
      let currentArea: LifeArea | null = null;
      let currentYear: number | null = null;
      let currentAge: number | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if line is an area header
        const areaMatch = normalizeAreaName(trimmed);
        if (areaMatch) {
          currentArea = areaMatch;
          continue;
        }

        // Check if line contains year/age pattern like "2024 (30 anos)" or "Ano: 2024"
        const yearAgeMatch = trimmed.match(/(\d{4})\s*(?:\((\d+)\s*anos?\))?/i);
        if (yearAgeMatch) {
          currentYear = parseInt(yearAgeMatch[1]);
          if (yearAgeMatch[2]) {
            currentAge = parseInt(yearAgeMatch[2]);
          }
          continue;
        }

        const yearOnlyMatch = trimmed.match(/^(?:ano[:\s]*)?(\d{4})$/i);
        if (yearOnlyMatch) {
          currentYear = parseInt(yearOnlyMatch[1]);
          continue;
        }

        const ageOnlyMatch = trimmed.match(/^(?:idade[:\s]*)?(\d+)\s*anos?$/i);
        if (ageOnlyMatch) {
          currentAge = parseInt(ageOnlyMatch[1]);
          continue;
        }

        // If we have context and the line looks like a goal
        if (currentArea && currentYear && trimmed.length > 3) {
          // Skip if it's just a number or very short
          if (!/^\d+$/.test(trimmed)) {
            result.goals.push({
              year: currentYear,
              age: currentAge || (currentYear - new Date().getFullYear() + 30),
              area: currentArea,
              goalText: trimmed,
            });
          }
        }
      }

      // If structured parsing didn't work well, try line-by-line pattern matching
      if (result.goals.length === 0) {
        // Pattern: "Área: Meta para ano X"
        for (const line of lines) {
          for (const areaInfo of LIFE_AREAS) {
            const pattern = new RegExp(`${areaInfo.label}[:\\s]+(.+)`, 'i');
            const match = line.match(pattern);
            if (match) {
              const goalText = match[1].trim();
              const yearMatch = goalText.match(/(\d{4})/);
              result.goals.push({
                year: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear(),
                age: 30,
                area: areaInfo.id,
                goalText: goalText.replace(/\d{4}/, '').trim() || goalText,
              });
            }
          }
        }
      }

      if (result.goals.length > 0) {
        result.success = true;
        result.warnings.push('PDFs podem ter limitações na extração de dados. Revise as metas importadas.');
      } else {
        result.errors.push('Não foi possível extrair metas do PDF. Tente usar um arquivo Excel para melhores resultados.');
      }
    } catch (error: any) {
      result.errors.push(`Erro ao processar PDF: ${error.message}`);
    }

    return result;
  };

  const importFile = async (file: File): Promise<ImportResult> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'xlsx' || extension === 'xls') {
      return parseExcel(file);
    } else if (extension === 'pdf') {
      return parsePDF(file);
    } else {
      return {
        success: false,
        goals: [],
        errors: [`Formato de arquivo não suportado: .${extension}. Use .xlsx, .xls ou .pdf`],
        warnings: [],
      };
    }
  };

  return { importFile };
}
