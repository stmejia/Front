import { CondicionActivo } from "./condicionActivo";
import { CondicionLlanta } from "./condicionLlanta";

export interface CondicionEquipo {
    lucesA: boolean;
    lucesB: boolean;
    lucesC: boolean;
    lucesD: boolean;
    lucesE: boolean;
    lucesF: boolean;

    pi: string;
    pd: string;
    si: string;
    sd: string;

    guardaFangosG: string;
    guardaFangosI: string;

    cintaReflectivaLat: string;
    cintaReflectivaFront: string;
    cintaReflectivaTra: string;

    fricciones: string;
    friccionesLlantas: [""];

    bumper: string;
    manitas1: string;
    manitas2: string;
    patas: string;
    ganchos: string;

    balancines: string;
    hojasResortes: string;

    placaPatin: boolean;

    condicionActivo: CondicionActivo;
    condicionesLlantas: CondicionLlanta[];
    condicionesLlantasRepuesto: CondicionLlanta[];
}