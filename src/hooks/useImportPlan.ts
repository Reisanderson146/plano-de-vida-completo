import * as XLSX from 'xlsx';
import { LifeArea } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

interface ImportedGoal {
  year: number;
  age: number | null;
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

const extractTextFromExcel = async (file: File): Promise<string> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  
  let textContent = '';
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    textContent += `=== Planilha: ${sheetName} ===\n`;
    
    // Convert to JSON for structured output
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    for (const row of jsonData) {
      if (row && row.length > 0) {
        textContent += row.map(cell => String(cell || '')).join(' | ') + '\n';
      }
    }
    
    textContent += '\n';
  }
  
  return textContent;
};

const extractTextFromFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'xlsx' || extension === 'xls') {
    return extractTextFromExcel(file);
  } else if (extension === 'txt' || extension === 'csv') {
    return file.text();
  } else if (extension === 'pdf') {
    // For PDF, we'll send a message asking the AI to understand the structure
    return `[Arquivo PDF: ${file.name}]\n\nConteúdo binário não pode ser lido diretamente. Por favor, tente converter para Excel ou TXT.`;
  } else {
    // Try to read as text
    try {
      return await file.text();
    } catch {
      return `[Arquivo ${extension}: ${file.name}]`;
    }
  }
};

const parseWithAI = async (content: string, fileName: string, fileType: string): Promise<ImportResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('parse-plan-import', {
      body: { content, fileName, fileType }
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: false,
        goals: [],
        errors: [`Erro ao processar arquivo: ${error.message}`],
        warnings: [],
      };
    }

    if (!data.success) {
      return {
        success: false,
        goals: [],
        errors: data.errors || ['Não foi possível extrair metas do arquivo.'],
        warnings: data.warnings || [],
      };
    }

    // Validate and normalize the goals
    const validGoals: ImportedGoal[] = [];
    const warnings: string[] = data.warnings || [];

    for (const goal of data.goals || []) {
      // Validate area
      const area = normalizeAreaName(goal.area) || goal.area as LifeArea;
      const validAreas = ['espiritual', 'intelectual', 'familiar', 'social', 'financeiro', 'profissional', 'saude'];
      
      if (!validAreas.includes(area)) {
        warnings.push(`Área "${goal.area}" não reconhecida, pulada.`);
        continue;
      }

      // Validate year
      const year = parseInt(String(goal.year));
      if (isNaN(year) || year < 1900 || year > 2200) {
        warnings.push(`Ano inválido para meta: "${goal.goalText?.substring(0, 30)}..."`);
        continue;
      }

      // Age can be null
      const age = goal.age ? parseInt(String(goal.age)) : null;

      if (goal.goalText && goal.goalText.trim()) {
        validGoals.push({
          year,
          age: age || (year - new Date().getFullYear() + 30),
          area: area as LifeArea,
          goalText: goal.goalText.trim(),
        });
      }
    }

    return {
      success: validGoals.length > 0,
      goals: validGoals,
      errors: validGoals.length === 0 ? ['Nenhuma meta válida encontrada no arquivo.'] : [],
      warnings,
    };
  } catch (error: any) {
    console.error('AI parsing error:', error);
    return {
      success: false,
      goals: [],
      errors: [`Erro ao processar arquivo: ${error.message}`],
      warnings: [],
    };
  }
};

// Fallback local parsing for Excel
const parseExcelLocally = async (file: File): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    goals: [],
    errors: [],
    warnings: [],
  };

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      
      if (jsonData.length < 2) continue;
      
      const headers = jsonData[0].map((h: any) => String(h || '').toLowerCase().trim());
      
      // Try to find column indices
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
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const year = parseInt(String(row[yearColIdx] || '').replace(/\D/g, ''));
          const age = ageColIdx !== -1 ? parseInt(String(row[ageColIdx] || '').replace(/\D/g, '')) : null;
          const areaRaw = String(row[areaColIdx] || '');
          const area = normalizeAreaName(areaRaw);
          const goalText = String(row[goalColIdx] || '').trim();

          if (year > 1900 && year < 2200 && area && goalText) {
            result.goals.push({
              year,
              age: age || (year - new Date().getFullYear() + 30),
              area,
              goalText,
            });
          }
        }
      } else {
        // Try matrix format
        const potentialAreas = headers.slice(1).map((h, idx) => ({
          colIdx: idx + 1,
          area: normalizeAreaName(h),
          header: h,
        })).filter(a => a.area !== null);

        if (potentialAreas.length > 0) {
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const firstCol = parseInt(String(row[0] || '').replace(/\D/g, ''));
            if (!firstCol) continue;

            const isYear = firstCol > 1900;
            const year = isYear ? firstCol : new Date().getFullYear() + (firstCol - 30);
            const age = isYear ? firstCol - new Date().getFullYear() + 30 : firstCol;

            for (const { colIdx, area } of potentialAreas) {
              const goalText = String(row[colIdx] || '').trim();
              if (goalText && area) {
                result.goals.push({ year, age, area, goalText });
              }
            }
          }
        }
      }
    }

    result.success = result.goals.length > 0;
    if (!result.success) {
      result.errors.push('Formato do arquivo não reconhecido.');
    }
  } catch (error: any) {
    result.errors.push(`Erro ao processar arquivo: ${error.message}`);
  }

  return result;
};

export function useImportPlan() {
  const importFile = async (file: File): Promise<ImportResult> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const supportedExtensions = ['xlsx', 'xls', 'csv', 'txt', 'pdf'];
    
    if (!extension || !supportedExtensions.includes(extension)) {
      return {
        success: false,
        goals: [],
        errors: [`Formato de arquivo não suportado: .${extension}. Use .xlsx, .xls, .csv, .txt ou .pdf`],
        warnings: [],
      };
    }

    // PDF não é suportado para leitura direta
    if (extension === 'pdf') {
      return {
        success: false,
        goals: [],
        errors: ['A importação de PDF não está disponível. Por favor, converta seu arquivo para Excel (.xlsx) ou texto (.txt) para importar seu plano de vida.'],
        warnings: [],
      };
    }

    try {
      // Extract text content
      const content = await extractTextFromFile(file);
      
      if (!content || content.length < 10) {
        return {
          success: false,
          goals: [],
          errors: ['Arquivo vazio ou não foi possível extrair conteúdo.'],
          warnings: [],
        };
      }

      // Try AI parsing first
      const aiResult = await parseWithAI(content, file.name, extension);
      
      // If AI fails, try local parsing for Excel files
      if (!aiResult.success && (extension === 'xlsx' || extension === 'xls')) {
        console.log('AI parsing failed, trying local parsing...');
        return parseExcelLocally(file);
      }

      return aiResult;
    } catch (error: any) {
      console.error('Import error:', error);
      return {
        success: false,
        goals: [],
        errors: [`Erro ao processar arquivo: ${error.message}`],
        warnings: [],
      };
    }
  };

  return { importFile };
}
