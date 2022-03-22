export interface ListaGeneral {
    tipoLista: string;
    campo: string;
    valores: ValoresListaGeneral[]
}

export interface ValoresListaGeneral {
    nombre: string;
    valor: string;
}