import { Menu } from "../@page/models/menu";

export const ITEMS_MENUPRUMOD: Menu[] = [
  {
    name: "Modulo de Pruebas",
    type: "link",
    icon: "science",
    ruta: []
  },
  {
    name: "Componente1",
    type: "link",
    icon: "face",
    ruta: ["prumod", "comp1"]
  },
  {
    name: "Tabla Grid",
    type: "link",
    icon: "table_chart",
    ruta: ["/","prumod", "tableGrid"]
  },
  {
    name: "Ajustes",
    type: "link",
    icon: "settings",
    ruta: ["prumod", "ajustes"]
  },
];
