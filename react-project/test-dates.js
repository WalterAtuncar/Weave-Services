// Script de prueba para verificar funciones de fecha

// Simular las funciones
function dateToLocalString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDateString(dateString) {
  if (!dateString || typeof dateString !== 'string') return undefined;
  
  try {
    const match = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return undefined;
    
    const [, yearStr, monthStr, dayStr] = match;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    
    if (year < 1900 || year > 2100) return undefined;
    if (month < 0 || month > 11) return undefined;
    if (day < 1 || day > 31) return undefined;
    
    const date = new Date(year, month, day, 12, 0, 0, 0);
    
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return undefined;
    }
    
    return date;
  } catch (error) {
    return undefined;
  }
}

// Pruebas
// === PRUEBAS DE FUNCIONES DE FECHA ===

// Prueba 1: Convertir fecha a string
const testDate = new Date(2024, 6, 19, 12, 0, 0); // 19 de julio 2024
// Fecha original: testDate.toString()
// dateToLocalString: dateToLocalString(testDate)

// Prueba 2: Parsear string de fecha
const testString = '2024-07-19';
// String original: testString
const parsedDate = parseLocalDateString(testString);
// parseLocalDateString: parsedDate ? parsedDate.toString() : 'undefined'
// Día: parsedDate ? parsedDate.getDate() : 'undefined'
// Mes: parsedDate ? parsedDate.getMonth() + 1 : 'undefined'
// Año: parsedDate ? parsedDate.getFullYear() : 'undefined'

// Prueba 3: Ida y vuelta
const roundTripString = parsedDate ? dateToLocalString(parsedDate) : 'undefined';
// Ida y vuelta: roundTripString
// ¿Es igual al original? roundTripString === testString

// Prueba 4: Problemas conocidos con new Date()
// === COMPARACIÓN CON MÉTODO PROBLEMÁTICO ===
const problematicDate = new Date('2024-07-19');
// new Date("2024-07-19"): problematicDate.toString()
// Día con new Date(): problematicDate.getDate()
// Día con parseLocalDateString(): parsedDate ? parsedDate.getDate() : 'undefined'

// Prueba de zona horaria
// Zona horaria actual: Intl.DateTimeFormat().resolvedOptions().timeZone
// Offset UTC: new Date().getTimezoneOffset() minutos