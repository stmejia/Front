export interface QueryFilter {
    filtro: string;
    parametro: string | number | boolean | any;
}

/* 
    ***** ***** Uso de Filtros C ***** *****   
*/
export interface FiltrosC {
    nombre: string; //Texto que se mostrara en el Input
    tipo: "lista" | "rangoFechas" | "input" | "checkbox" | "fecha"; //Tipo de Input a Utilizar
    tipoInput?: "string" | "number" | "time"; //Tipo de dato que admitira el Input
    valores?: ValoresFiltrosC[]; // Si el tipo es una lista se deberan enviar los valores a mostrar en dicha lista
    filters: QueryFilter[]; //Dependiendo del Tipo el componente puede devolver 1 oh mas filters para enviar al end point
    activo: boolean; //Indica al componente si este campo se puede modificar
    requerido: boolean; //Indica si el filtro es obligatorio
}

export interface ValoresFiltrosC {
    nombre: string; //Nombre a mostrar
    valor: any; //Valor a devolver 
}