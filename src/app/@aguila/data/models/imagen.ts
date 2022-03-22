export class Imagen {
    id: string;
    imagenRecurso_Id: string;
    fileName:string;
    nombre: string;
    descripcion: string;
    fchCreacion: Date;
    fchBorrada?: Date;
    archivoEliminado: boolean;
    subirImagenBase64: string|ArrayBuffer;
    urlImagen: string;
}