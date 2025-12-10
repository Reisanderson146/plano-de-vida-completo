import * as XLSX from 'xlsx';
import { LifeArea } from '@/lib/constants';

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

  const parsePDF = async (_file: File): Promise<ImportResult> => {
    // PDF parsing requires complex libraries that have compatibility issues
    // Recommend Excel format for best results
    return {
      success: false,
      goals: [],
      errors: [
        'A importação de PDF não está disponível no momento. Por favor, use um arquivo Excel (.xlsx ou .xls) para importar seu plano de vida. O formato Excel oferece melhor precisão na extração de dados.',
      ],
      warnings: [],
    };
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
