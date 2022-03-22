import { Menu } from "../@page/models/menu";

export const ITEMS_MENU_ACTIVO_OPERACION: Menu[] = [
    { name: "Colaboradores", type: "link", icon: "face", ruta: ["colaboradores"], add: true },
    { name: "Equipo Intermodal", type: "link", icon: "local_shipping", ruta: ["ieEquipos"], add: true },
    { name: "Visitas", type: "link", icon: "tour", ruta: ["visitas"], add: true },
    { name: "Contratistas", type: "link", icon: "engineering", ruta: ["contratistas"], add: true },
    { name: "Ajustes", type: "link", icon: "settings", ruta: ["ajustes"] }
];
