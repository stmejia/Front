export interface ActivoMovimientos {
    id: number,
    idActivo: number,
    ubicacionId: number,
    idRuta: number,
    idEstado: number,
    idServicio: number,
    idEstacionTrabajo: number,
    idPiloto: number,
    idUsuario: number,
    documento: string,
    lugar: string,
    observaciones: string,
    fechaCreacion: Date
}