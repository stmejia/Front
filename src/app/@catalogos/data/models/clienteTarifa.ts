export interface ClienteTarifa {
    id: number;
    idCliente: number;
    idTarifa: number;
    precio: number;
    vigenciaHasta: Date;
    fechaCreacion: Date;
}