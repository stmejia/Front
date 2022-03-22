export class ItemHeaderComponent {
    titulo: string;
    opciones?: OpcionesHeaderComponent[];
}

export class OpcionesHeaderComponent {
    nombre: string;
    icono: 'refresh' | 'add_circle_outline' | 'clear' | 'save_alt' | 'navigate_next' | 'assignment_ind' | 'logout';
    toolTip: string;
    disponible: boolean;
    color: 'primary' | 'warn' | 'accent';
    idEvento: number;
}