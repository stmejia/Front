import { ImagenRecurso } from "src/app/@aguila/data/models/imagenRecurso";
import { ActivoOperaciones } from "./activoOperaciones";
import { TipoVehiculo } from "./tipoVehiculo";

export class Vehiculo {
    idActivo?: number;
    activoOperacion?: ActivoOperaciones;
    tipoVehiculos?: TipoVehiculo;
    idTipoVehiculo: number;
    motor: string; //noMotor
    ejes: number; //noEjes
    tarjetaCirculacion: string;
    placa: string;
    tamanoMotor: string;
    llantas: number; //----- -----
    distancia: number;
    potencia: string;
    tornamesaGraduable: number;
    capacidadCarga: number;
    carroceria: number;
    tipoCarga: string;
    capacidadMontacarga: number;
    tipoMotor: number;
    tipoMaquinaria: number;
    fechaCreacion?: Date;
    imagenTarjetaCirculacion?: ImagenRecurso;
}