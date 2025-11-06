import { apiService } from './api.service'

// Convierte un archivo a PDF usando el endpoint del backend (/api/Conversion/pdf)
export async function convertToPdfServer(file: File): Promise<ArrayBuffer> {
  const form = new FormData()
  form.append('file', file)

  const blob = await apiService.post<Blob>('/Conversion/pdf', form, {
    responseType: 'blob',
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return await blob.arrayBuffer()
}