import { Menu } from "../@page/models/menu";

export const ITEMS_MENU_RRHH: Menu[] = [
    {
        name: "Reportes", type: "menu", icon: "receipt_long",
        children: [
            { name: "Ingreso / Egreso Colaboradores", icon: "face", ruta: ["reportes", "iecolaboradores"], add: false },
            { name: "Ausencia De Colaboradores", icon: "face", ruta: ["reportes", "ausenciaColaboradores"], add: false }
        ]
    },
    {
        name: "Catálogos", type: "menu", icon: "fact_check",
        children: [
            { name: "Empleados", icon: "badge", ruta: ["empleados"], add: true }
        ]
    },
    { name: "Ajustes", type: "link", icon: "settings", ruta: ["ajustes"] }
];
