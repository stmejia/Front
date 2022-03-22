export interface TitulosReporte {
    titulo: EstilosTitulos;
    subTitulos: EstilosTitulos[];
}

export interface EstilosTitulos {
    text: string;
    size?: number;
    bold?: true | false;
    
}