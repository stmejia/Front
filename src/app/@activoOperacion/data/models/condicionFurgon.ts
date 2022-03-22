import { CondicionActivo } from "./condicionActivo";
import { CondicionLlanta } from "./condicionLlanta";

export interface CondicionFurgon {
    //Revision Externa
    revExtGolpe: boolean;
    revExtSeparacion: boolean;
    revExtRoturas: boolean;

    //Revision Interna
    revIntGolpes: boolean;
    revIntSeparacion: boolean;
    revIntFiltra: boolean;
    revIntRotura: boolean;
    revIntPisoH: boolean;
    revIntManchas: boolean;
    revIntOlores: boolean;

    //Revision de Puertas
    revPuertaCerrado: string;
    revPuertaEmpaque: string;
    revPuertaCinta: string;

    //Limpieza
    limpPiso: boolean;
    limpTecho: boolean;
    limpLateral: boolean;
    limpExt: boolean;
    limpPuerta: boolean;
    limpMancha: boolean;
    limpOlor: boolean;
    limpRefuerzo: boolean;

    //Luces
    lucesA: boolean;
    lucesB: boolean;
    lucesC: boolean;
    lucesD: boolean;
    lucesE: boolean;
    lucesF: boolean;
    lucesG: boolean;
    lucesH: boolean;
    lucesI: boolean;
    lucesJ: boolean;
    lucesK: boolean;
    lucesL: boolean;
    lucesM: boolean;
    lucesN: boolean;
    lucesO: boolean;

    //Guardafangos
    guardaFangosI: boolean;
    guardaFangosD: boolean;

    fricciones: string;
    placaPatin: boolean;
    senalizacion: string;

    condicionActivo: CondicionActivo;
    condicionesLlantas: CondicionLlanta[];
    condicionesLlantasRepuesto: CondicionLlanta[];
}