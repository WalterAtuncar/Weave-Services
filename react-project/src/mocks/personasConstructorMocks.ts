// Mock data simplificado para el Constructor de Organigrama
export interface PersonaConstructor {
  personaId: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDoc: string;
  tipoDoc: string;
  emailPersonal: string;
  celular: string;
  codEmpleado: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

const personasConstructor: PersonaConstructor[] = [
  {
    personaId: 1,
    nombres: 'Bruno',
    apellidoPaterno: 'García',
    apellidoMaterno: 'Silva',
    nroDoc: '12345678',
    tipoDoc: 'DNI',
    emailPersonal: 'bruno.garcia@email.com',
    celular: '987654321',
    codEmpleado: 'EMP001',
    estado: 'ACTIVO'
  },
  {
    personaId: 2,
    nombres: 'Susana',
    apellidoPaterno: 'Paredes',
    apellidoMaterno: 'López',
    nroDoc: '87654321',
    tipoDoc: 'DNI',
    emailPersonal: 'susana.paredes@email.com',
    celular: '987654322',
    codEmpleado: 'EMP002',
    estado: 'ACTIVO'
  },
  {
    personaId: 3,
    nombres: 'Ana Lucía',
    apellidoPaterno: 'Bazalar',
    apellidoMaterno: 'Torres',
    nroDoc: '11223344',
    tipoDoc: 'DNI',
    emailPersonal: 'ana.bazalar@email.com',
    celular: '987654323',
    codEmpleado: 'EMP003',
    estado: 'ACTIVO'
  },
  {
    personaId: 4,
    nombres: 'Lucía',
    apellidoPaterno: 'González',
    apellidoMaterno: 'Mendoza',
    nroDoc: '44332211',
    tipoDoc: 'DNI',
    emailPersonal: 'lucia.gonzales@email.com',
    celular: '987654324',
    codEmpleado: 'EMP004',
    estado: 'ACTIVO'
  },
  {
    personaId: 5,
    nombres: 'Rosa',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'Vargas',
    nroDoc: '55667788',
    tipoDoc: 'DNI',
    emailPersonal: 'rosa.perez@email.com',
    celular: '987654325',
    codEmpleado: 'EMP005',
    estado: 'ACTIVO'
  },
  {
    personaId: 6,
    nombres: 'Carlos',
    apellidoPaterno: 'Ramírez',
    apellidoMaterno: 'Castro',
    nroDoc: '66778899',
    tipoDoc: 'DNI',
    emailPersonal: 'carlos.ramirez@email.com',
    celular: '987654326',
    codEmpleado: 'EMP006',
    estado: 'ACTIVO'
  },
  {
    personaId: 7,
    nombres: 'María Carmen',
    apellidoPaterno: 'Flores',
    apellidoMaterno: 'Díaz',
    nroDoc: '77889900',
    tipoDoc: 'DNI',
    emailPersonal: 'maria.flores@email.com',
    celular: '987654327',
    codEmpleado: 'EMP007',
    estado: 'ACTIVO'
  },
  {
    personaId: 8,
    nombres: 'Diego',
    apellidoPaterno: 'Morales',
    apellidoMaterno: 'Vega',
    nroDoc: '88990011',
    tipoDoc: 'DNI',
    emailPersonal: 'diego.morales@email.com',
    celular: '987654328',
    codEmpleado: 'EMP008',
    estado: 'ACTIVO'
  },
  {
    personaId: 9,
    nombres: 'Andrea',
    apellidoPaterno: 'Jiménez',
    apellidoMaterno: 'Herrera',
    nroDoc: '99001122',
    tipoDoc: 'DNI',
    emailPersonal: 'andrea.jimenez@email.com',
    celular: '987654329',
    codEmpleado: 'EMP009',
    estado: 'ACTIVO'
  },
  {
    personaId: 10,
    nombres: 'Roberto',
    apellidoPaterno: 'Silva',
    apellidoMaterno: 'Mendez',
    nroDoc: '00112233',
    tipoDoc: 'DNI',
    emailPersonal: 'roberto.silva@email.com',
    celular: '987654330',
    codEmpleado: 'EMP010',
    estado: 'ACTIVO'
  },
  {
    personaId: 11,
    nombres: 'Gabriela',
    apellidoPaterno: 'Torres',
    apellidoMaterno: 'Quispe',
    nroDoc: '11223355',
    tipoDoc: 'DNI',
    emailPersonal: 'gabriela.torres@email.com',
    celular: '987654331',
    codEmpleado: 'EMP011',
    estado: 'ACTIVO'
  },
  {
    personaId: 12,
    nombres: 'Alejandro',
    apellidoPaterno: 'Vargas',
    apellidoMaterno: 'León',
    nroDoc: '22334466',
    tipoDoc: 'DNI',
    emailPersonal: 'alejandro.vargas@email.com',
    celular: '987654332',
    codEmpleado: 'EMP012',
    estado: 'ACTIVO'
  },
  {
    personaId: 13,
    nombres: 'Patricia',
    apellidoPaterno: 'Rojas',
    apellidoMaterno: 'Campos',
    nroDoc: '33445577',
    tipoDoc: 'DNI',
    emailPersonal: 'patricia.rojas@email.com',
    celular: '987654333',
    codEmpleado: 'EMP013',
    estado: 'ACTIVO'
  },
  {
    personaId: 14,
    nombres: 'Fernando',
    apellidoPaterno: 'Aguirre',
    apellidoMaterno: 'Soto',
    nroDoc: '44556688',
    tipoDoc: 'DNI',
    emailPersonal: 'fernando.aguirre@email.com',
    celular: '987654334',
    codEmpleado: 'EMP014',
    estado: 'ACTIVO'
  },
  {
    personaId: 15,
    nombres: 'Cristina',
    apellidoPaterno: 'Medina',
    apellidoMaterno: 'Ruiz',
    nroDoc: '55667799',
    tipoDoc: 'DNI',
    emailPersonal: 'cristina.medina@email.com',
    celular: '987654335',
    codEmpleado: 'EMP015',
    estado: 'ACTIVO'
  }
];

export const personasConstructorMockData = {
  personas: personasConstructor
}; 