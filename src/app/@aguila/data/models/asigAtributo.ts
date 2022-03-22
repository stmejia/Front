import { Estaciontrabajo } from './estaciontrabajo';
import { Recurso } from './recurso';
export class AtributoAsig{
    id?: number;
    estacionTrabajo_id:number;
    recurso_id: number;
    usuario_id:number;
    opcionesAsignadas:string[];
    estacion?:Estaciontrabajo;
    recurso: Recurso;
}

export class RecursoAsignado {
    id?: number;
    estacionTrabajo_id: number;
    recurso_id: number;
    usuario_id: number;
    opcionesAsignadas: string [];
    
}