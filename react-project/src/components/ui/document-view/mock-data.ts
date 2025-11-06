import { Documento } from './types';

export const documentosMock: Documento[] = [
  {
    id: 1,
    titulo: '02.jpg',
    categoria: 'Pictures',
    propietario: 'yo',
    fecha: '2025-05-22',
    tipo: 'otro',
    estado: 'reciente',
    extension: 'jpg',
    ubicacion: 'Pictures',
    sugeridoMotivo: 'Lo has abierto · 22 may 2025',
    ultimaApertura: '2025-05-22',
    // Tamaño aproximado ~2.3 MB
    sizeBytes: 2411725,
    // Usar thumbnail público y estable para mock
    miniaturaUrl: 'https://picsum.photos/seed/doc-1/320/200'
  },
  {
    id: 2,
    titulo: 'Logotipo versiones_Clinica Canales.pdf',
    categoria: 'Logotipo',
    propietario: 'pandeegraph',
    fecha: '2025-05-22',
    tipo: 'otro',
    estado: 'reciente',
    extension: 'pdf',
    ubicacion: 'Logotipo',
    sugeridoMotivo: 'Lo has abierto · 22 may 2025',
    ultimaApertura: '2025-05-22',
    // Tamaño aproximado ~5.8 MB
    sizeBytes: 6081741,
    // PDF público para generar miniatura en cliente con pdf.js
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  },
  {
    id: 3,
    titulo: 'TR1.jpg',
    categoria: 'Pictures',
    propietario: 'yo',
    fecha: '2025-04-06',
    tipo: 'otro',
    estado: 'reciente',
    extension: 'jpg',
    ubicacion: 'Pictures',
    sugeridoMotivo: 'Lo has abierto · 6 abr 2025',
    ultimaApertura: '2025-04-06',
    // Tamaño aproximado ~3.1 MB
    sizeBytes: 3250586,
    // Usar thumbnail público y estable para mock
    miniaturaUrl: 'https://picsum.photos/seed/doc-3/320/200'
  },
  {
    id: 4,
    titulo: 'CV_Walter_Alancar_Shunters.pdf',
    categoria: 'Documentos',
    propietario: 'infologproject',
    fecha: '2025-03-11',
    tipo: 'manual',
    estado: 'favorito',
    extension: 'pdf',
    ubicacion: 'Compartido',
    sugeridoMotivo: 'Lo has abierto · 11 feb 2025',
    ultimaApertura: '2025-02-11',
    // Tamaño aproximado ~0.9 MB
    sizeBytes: 943718,
    // PDF público para miniatura en cliente con pdf.js (CORS-friendly)
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  },
  {
    id: 5,
    titulo: 'Contrato Word - Ejemplo',
    extension: 'docx',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    // Tamaño aproximado ~0.4 MB
    sizeBytes: 419430,
    // Eliminar Cloudinary demo que retorna 401; usar miniatura estable (opcional) o permitir generación cliente si se convierte
    miniaturaUrl: "/images/forgot01.svg",
  }
];