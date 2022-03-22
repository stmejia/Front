import { AsigEstacion } from './asigEstacion';
import { Modulo } from './modulo';
import { Rol } from './rol';
import { ImagenRecurso } from './imagenRecurso';

export class Usuario {
  id: number;
  username: string; //Creacion
  nombre: string; //Creacion
  activo?: boolean;
  email: string; //Creacion
  fchCreacion?: string;
  password: string; //Creacion
  fchPassword?: string;
  fchNacimiento: string; //Creacion
  fchBloqueado: string;
  cambiarClave: boolean;
  moduloId: number; //Creacion
  estacionTrabajoId: number; //Creacion
  sucursalId: number; //Creacion
  estacionesTrabajoAsignadas?: AsigEstacion[];
  roles?: Rol[]; //Creacion
  modulos?: Modulo [];
  imagenPerfil: ImagenRecurso;

}
