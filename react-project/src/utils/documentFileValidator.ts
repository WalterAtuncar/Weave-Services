export const validateDocumentFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) return { isValid: false, error: 'No se seleccionó ningún archivo' };

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  const isPDF = type.includes('pdf') || name.endsWith('.pdf');
  const isDOCX = type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx');
  const isPPTX = type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || name.endsWith('.pptx');
  const isPPT = type === 'application/vnd.ms-powerpoint' || name.endsWith('.ppt');
  const isXLSX = type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || name.endsWith('.xlsx');
  const isXLS = type === 'application/vnd.ms-excel' || name.endsWith('.xls');

  if (!isPDF && !isDOCX && !isPPTX && !isPPT && !isXLSX && !isXLS) {
    return { isValid: false, error: 'El archivo debe ser PDF, Word (DOCX), PowerPoint (PPT/PPTX) o Excel (XLS/XLSX)' };
  }

  // Tamaño máximo 10MB
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: 'El archivo es demasiado grande (máximo 10MB)' };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'El archivo está vacío' };
  }

  return { isValid: true };
};

export const getDocumentKind = (file: File): 'pdf' | 'docx' | 'doc' | 'pptx' | 'ppt' | 'xlsx' | 'xls' | 'desconocido' => {
  if (!file) return 'desconocido';
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) return 'docx';
  if (type === 'application/msword' || name.endsWith('.doc')) return 'doc';
  if (type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || name.endsWith('.pptx')) return 'pptx';
  if (type === 'application/vnd.ms-powerpoint' || name.endsWith('.ppt')) return 'ppt';
  if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || name.endsWith('.xlsx')) return 'xlsx';
  if (type === 'application/vnd.ms-excel' || name.endsWith('.xls')) return 'xls';
  return 'desconocido';
};