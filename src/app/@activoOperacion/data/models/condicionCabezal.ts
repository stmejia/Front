import { CondicionActivo } from "./condicionActivo";
import { CondicionLlanta } from "./condicionLlanta";

export interface CondicionCabezal {
    windShield: string;
    plumillas: number; //numero
    viscera: string;
    rompeVientos: string;
    persiana: string;
    bumper: string;
    capo: string;
    retrovisor: number; //numero
    ojoBuey: number; //numero
    pataGallo: number; //numero
    portaLlanta: string;
    spoilers: number; //numero
    salpicadera: number; //numero
    guardaFango: number; //numero
    taponCombustible: number; //numero
    baterias: number; //numero 4
    lucesDelanteras: string;
    lucesTraseras: string;
    pintura: string;
    condicionActivo: CondicionActivo;
    condicionesLlantas: CondicionLlanta[];
    condicionesLlantasRepuesto: CondicionLlanta[];
}