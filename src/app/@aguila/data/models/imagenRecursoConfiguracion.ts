import { ImagenRecurso } from './imagenRecurso';

export class ImagenRecursoConfiguracion {
    id: number;
    recurso_Id: number;
    propiedad: string;
    fchCreacion: string;
    servidor: string;
    carpeta: string;
    pesoMaxMb: number;
    eliminacionFisica: boolean;
    defaultImagen: string;
    multiplesImagenes: boolean;
    imagenesRecursos: ImagenRecurso[];
    urlImagenDefaul: string;
    noMaxImagenes: number;
    subirImagenBase64: any;

}