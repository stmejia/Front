import { Empresa } from './empresa';

export class Sucursal {
  id?: number; //No se tiene que enviar el campo
  empresaId: number; //Tiene que existir el código de empresa
  codigo: string; //No es obligatorio ingresarlo
  nombre: string; //No es obligatorio ingresarlo
  direccion: string; //No es obligatorio ingresarlo
  activa: boolean; 
  fchCreacion: Date;
  empresa: Empresa;
}
