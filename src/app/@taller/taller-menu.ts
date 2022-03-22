import { Menu } from "../@page/models/menu";

export const ITEMS_MENU_TALLER: Menu[] = [
    /* Inspecciones De Ingreso */
    {
        name: "Inspecciones De Ingreso", type: "menu", icon: "checklist",
        children: [
            { name: "Vehículos", icon: "directions_bus", ruta: ["inspeccionesIngreso", "vehiculos"], add: true },
            //{ name: "Equipos De Remolque", icon: "local_shipping", ruta: ["inspeccionesIngreso", "equiposRemolque"], add: true },
            //{ name: "Generadores", icon: "microwave", ruta: ["inspeccionesIngreso", "generadores"], add: true },
        ]
    },
    {
        name: "Catalogos", type: "menu", icon: "schema",
        children: [
            { name: "Categorias De Reparaciones", icon: "handyman", ruta: ["catalogos","listas", "1"], add: true },
            { name: "Tipos De Reparaciones", icon: "book", ruta: ["catalogos", "tipoReparaciones"], add: true },
            { name: "Reparaciones", icon: "home_repair_service", ruta: ["catalogos", "reparaciones"], add: true },
        ]
    },
    /* Otros */
    { name: "Ajustes", type: "link", icon: "settings", ruta: ["ajustes"] }
];
