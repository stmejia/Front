export interface Estados {
    id: number;
    idEmpresa: number;
    codigo: string;
    tipo: string;
    nombre: string;
    numeroOrden: number;
    disponible: boolean;
    evento?: string;
    fechaCreacion: Date;
}