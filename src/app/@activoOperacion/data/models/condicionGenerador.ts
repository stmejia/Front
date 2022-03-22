import { CondicionActivo } from "./condicionActivo";
import { CondicionLlanta } from "./condicionLlanta";

export interface CondicionGenerador {
    //Estructura  Exterior
    estExPuertasGolpeadas: boolean;
    estExPuertasQuebradas: boolean;
    estExPuertasFaltantes: boolean;
    estExPuertasSueltas: boolean;
    estExBisagrasQuebradas: boolean;

    //Panel Electrico
    panelGolpes: boolean;
    panelTornillosFaltantes: boolean;
    panelOtros: boolean;

    //Soporte Del Marco
    soporteGolpes: boolean;
    soporteTornillosFaltantes: boolean;
    soporteMarcoQuebrado: boolean;
    soporteMarcoFlojo: boolean;
    soporteBisagrasQuebradas: boolean;
    soporteSoldaduraEstado: boolean;

    //Revision Interna
    revIntCablesQuemados: boolean;
    revIntCablesSueltos: boolean;
    revIntReparacionesImpropias: boolean;

    //Tanque de combustible
    tanqueAgujeros: boolean;
    tanqueSoporteDanado: boolean;
    tanqueMedidorDiesel: boolean;
    tanqueCodoQuebrado: boolean;
    tanqueTapon: boolean;
    tanqueTuberia: boolean;
    horometro: number;
    dieselEntradaSalida: number;

    //Piezas Faltantes
    pFaltMedidorAceite: boolean;
    pFaltTapaAceite: boolean;
    pFaltTaponRadiador: boolean;

    condicionActivo: CondicionActivo;
    condicionesLlantas: CondicionLlanta[];
    condicionesLlantasRepuesto: CondicionLlanta[];
}