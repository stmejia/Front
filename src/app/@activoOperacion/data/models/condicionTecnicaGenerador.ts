import { CondicionActivo } from "./condicionActivo";

export interface CondicionTecnicaGenerador {
    bateriaCodigo: string;
    bateriaNivelAcido: boolean;
    bateriaArnes: boolean;
    bateriaTerminales: boolean;
    bateriaGolpes: boolean;
    bateriaCarga: boolean;
    
    combustibleDiesel: boolean;
    combustibleAgua: boolean;
    combustibleAceite: boolean;
    combustibleFugas: boolean;

    filtroAceite: boolean;
    filtroDiesel: boolean;

    bombaAguaEstado: boolean;

    escapeAgujeros: boolean;
    escapeDañado: boolean;

    cojinetesEstado: boolean;

    arranqueFuncionamiento: boolean;

    fajaAlternador: boolean;

    enfriamientoAire: boolean;
    enfriamientoAgua: boolean;
    
    cantidadGeneradaVolts: boolean;

    condicionActivo: CondicionActivo;
}