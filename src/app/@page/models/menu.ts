export interface Children {
    name: string;
    icon: string;
    //urlp?: string;
    //url: string;
    add?: boolean;
    ruta: string[];
}

// add: permite agregar un boton rapido para redireccionar al formulario para un nuevo elemento
// tomar en cuenta que la ruta del form en el routin debe de ser la misma que el listado

export interface Menu {
    name: string;
    type: "link" | "menu"; //Link: redireciona a un componente, Menu: Permite agrupar Links
    icon: string; //Iconos de Material https://material.io/resources/icons/?icon=favorite&style=baseline
    //urlp?: string;
    //url?: string;
    add?: boolean;
    ruta?: string[];
    children?: Children[];
}

export class MenuOpciones {
    icono: string;
    nombre: string;
    disponible: boolean;
    idEvento: number;
    toolTip?:string;
}

export class EventoMenuOpciones<T=any> {
    idEvento: number;
    objeto: T;
}