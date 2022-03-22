import { ActivoOperaciones } from "./activoOperaciones";
import { TipoGenerador } from "./tipoGenerador";

export interface Generador {
    idActivo: number;
    idTipoGenerador: number;
    capacidadGalones: string;
    tipoEnfriamiento: string;
    numeroCilindros: string;
    marcaGenerador: string;
    tipoInstalacion: string;
    activoOperacion?: ActivoOperaciones;

    tipoGenerador?: TipoGenerador;

    aptoParaCA: boolean;
    codigoAnterior: string;
    tipoMotor: string;
    noMotor: string;
    velocidad: string;
    potenciaMotor: string;
    modeloGenerador: string;
    serieGenerador: string;
    potenciaGenerador: string;
    tensionGenerador: string;
    tipoTanque: string;
    tipoAceite: string;
    tipoGeneradorGen: string;

    fechaCreacion: Date;
}