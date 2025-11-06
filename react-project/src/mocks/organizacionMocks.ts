// Mock data para Organización
export interface OrganizacionMock {
  organizacionId: number;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  sitioWeb: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

const organizacionMock: OrganizacionMock = {
  organizacionId: 1,
  razonSocial: 'Empresa Tecnológica SAC',
  nombreComercial: 'TechCorp',
  ruc: '20123456789',
  direccion: 'Av. Tecnología 123, San Isidro, Lima',
  telefono: '01-234-5678',
  email: 'contacto@techcorp.com.pe',
  sitioWeb: 'https://www.techcorp.com.pe',
  estado: 'ACTIVO'
};

export const organizacionMockData = {
  organizacion: organizacionMock
}; 