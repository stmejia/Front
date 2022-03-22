import { Cliente } from "./cliente";
import { Tarifa } from "./tarifa";

export interface DataClienteTarifa {
    tipo: 'tarifa' | 'cliente';
    objeto: any;
    //objeto: Cliente | Tarifa;
    titulo: string;
}