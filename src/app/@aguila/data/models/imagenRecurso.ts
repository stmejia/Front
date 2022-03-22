import { Imagen } from './imagen';

export class ImagenRecurso {
    id?: string;
    imagenRecursoConfig_Id?: number;
    imagen_IdDefault?: string;
    imagenDefault?: Imagen;
    imagenes?: Imagen[];
    imagenesEliminar?: string[];
}