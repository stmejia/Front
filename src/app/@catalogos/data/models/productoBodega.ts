export interface ProductoBodega {
    id: number;
    idBodega: number;
    idProducto: number;
    estante: number;
    pasillo: number;
    nivel: number;
    lugar: number;
    maximo: number;
    minimo: number;
    fechaCreacion: Date;
}