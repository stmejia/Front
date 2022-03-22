export interface Columna {
  nombre: string;
  targetId?: string;
  targetOpt?: string[];
  texto?: boolean;
  aligment: 'center' | 'left' | 'right' | 'justify';
  tipo?: 'texto' | 'imagen' | 'estado' | 'boolean' | 'fecha' | 'objeto' | 'opcion';
  visible?: boolean;
  orden?: boolean;
  //img?: boolean;
  //estado?: boolean;
  //boolean?: boolean;
  //fecha?: boolean;
  width?: number;
  //opt?: boolean;
}
