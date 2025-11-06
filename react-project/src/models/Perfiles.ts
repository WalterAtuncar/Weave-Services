export interface Perfil {
  perfilId: number;
  nombrePerfil: string;
  descripcion: string;
}

export interface PerfilesData {
  perfiles: Perfil[];
} 