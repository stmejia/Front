import { RecursoAtributo } from './recursoAtributo';

export class Recurso {
  id?: number;
  nombre: string;
  tipo: string;
  activo: boolean;
  opciones: string[];
  controlador: string;
  fechaCreacion: Date;
}
