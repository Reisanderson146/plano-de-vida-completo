import * as XLSX from 'xlsx';

export function downloadImportTemplate() {
  // Create sample data
  const templateData = [
    ['Ano', 'Idade', 'Área', 'Meta'],
    [2025, 30, 'Espiritual', 'Ler a Bíblia diariamente'],
    [2025, 30, 'Intelectual', 'Fazer um curso de especialização'],
    [2025, 30, 'Familiar', 'Passar mais tempo com a família aos finais de semana'],
    [2025, 30, 'Social', 'Participar de eventos comunitários'],
    [2025, 30, 'Financeiro', 'Economizar 20% do salário mensal'],
    [2025, 30, 'Profissional', 'Conseguir uma promoção no trabalho'],
    [2025, 30, 'Saúde', 'Praticar exercícios 3 vezes por semana'],
    [2026, 31, 'Espiritual', 'Participar de um retiro espiritual'],
    [2026, 31, 'Intelectual', 'Ler 12 livros no ano'],
    [2026, 31, 'Familiar', 'Organizar uma viagem em família'],
    [2026, 31, 'Social', 'Fazer trabalho voluntário mensalmente'],
    [2026, 31, 'Financeiro', 'Criar uma reserva de emergência'],
    [2026, 31, 'Profissional', 'Desenvolver uma nova habilidade profissional'],
    [2026, 31, 'Saúde', 'Fazer check-up médico completo'],
  ];

  // Instructions sheet
  const instructionsData = [
    ['INSTRUÇÕES PARA IMPORTAÇÃO DO PLANO DE VIDA'],
    [''],
    ['1. Use a aba "Template" como modelo para preencher suas metas'],
    ['2. Mantenha os cabeçalhos na primeira linha: Ano, Idade, Área, Meta'],
    ['3. Áreas válidas:'],
    ['   - Espiritual'],
    ['   - Intelectual'],
    ['   - Familiar'],
    ['   - Social'],
    ['   - Financeiro'],
    ['   - Profissional'],
    ['   - Saúde'],
    [''],
    ['4. O campo Ano deve ser um número válido (ex: 2025)'],
    ['5. O campo Idade é calculado automaticamente se não preenchido'],
    ['6. Cada linha representa uma meta diferente'],
    [''],
    ['DICA: Você pode copiar e colar de outro documento ou planilha.'],
  ];

  // Create workbook with multiple sheets
  const workbook = XLSX.utils.book_new();
  
  // Add instructions sheet
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');
  
  // Add template sheet
  const templateSheet = XLSX.utils.aoa_to_sheet(templateData);
  templateSheet['!cols'] = [
    { wch: 8 },  // Ano
    { wch: 8 },  // Idade
    { wch: 15 }, // Área
    { wch: 50 }, // Meta
  ];
  XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template');

  // Generate and download
  XLSX.writeFile(workbook, 'modelo-plano-de-vida.xlsx');
}
