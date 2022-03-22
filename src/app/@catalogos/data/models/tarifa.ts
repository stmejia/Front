export interface Tarifa {
    id: number,
    idServicio: number,
    tipoCarga: string, //Lista
    tipoMovimiento: string, //Lista
    tipoViaje: string, //Lista
    codigo: string,
    segmento: string,
    combustibleGls: number,
    precio: number,
    idUbicacionOrigen: number,
    idUbicacionDestino: number,
    idTipoEquipoRemolque: number,
    idRuta: number,
    idEmpresa: number,
    kmRecorridosCargado: number,
    kmRecorridosVacio: number,
    esEspecializado: true,
    fechaVigencia: Date,
    fechaCreacion: Date
}