import { CondicionActivo } from "./condicionActivo";

export interface InspeccionContenedor {
    tipoContenedor: string;
    exteriorMarcos: boolean;
    exteriorMarcosObs: string;
    puertasInteriorExterior: boolean;
    puertasInteriorExteriorObs: string;
    pisoInterior: boolean;
    pisoInteriorObs: string;
    techoCubierta: boolean;
    techoCubiertaObs: string;
    ladosIzquierdoDerecho: boolean;
    ladosIzquierdoDerechoObs: string;
    paredFrontal: boolean;
    paredFrontalObs: string;
    condicionActivo: CondicionActivo;

    //Area Refrigerado
    areaCondesadorCompresor: boolean;
    areaCondesadorCompresorObs: string;
    areaEvaporador: boolean;
    areaEvaporadorObs: string;
    areaBateria: boolean;
    areaBateriaObs: string;
    cajaControlElectricoAutomatico: boolean;
    cajaControlElectricoAutomaticoObs: string;
    cablesConexionElectrica: boolean;
    cablesConexionElectricaObs: string;
}