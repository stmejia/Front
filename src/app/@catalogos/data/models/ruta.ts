export class Ruta {
    id?: number;
    idUbicacionOrigen: number;
    idUbicacionDestino: number;
    nombre:string;
    existeRutaAlterna: boolean;
    distanciaKms: number;
    gradoPeligrosidad: string;
    estadoCarretera: string;
    fechaCreacion?: Date;
    vUbicacionDestino: string;
    vUbicacionOrigen: string;
}