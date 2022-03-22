import { Menu } from "../@page/models/menu";

//name: Nombre a mostrar, type: Tipo de elemento(link o menu), icon: Icono a mostrar 
//urlp: Url raiz del modulo, url: Url del componente, add: Abilita un boton para registro nuevo
export const ITEMS_MENU_PRIVATE: Menu[] = [
  //{ name: "Modulo de Sistemas", type: "link", icon: "dns", ruta: [] },
  { name: "Welcome", type: "link", icon: "cake", ruta: ["/", "aguila", "welcome"] },
  { name: "Empresas", type: "link", icon: "apartment", ruta: ["/", "aguila", "empresas"], add: true },
  { name: "Sucursales", type: "link", icon: "home_work", ruta: ["/", "aguila", "sucursales"], add: true },
  { name: "Estaciones", type: "link", icon: "store", ruta: ["/", "aguila", "estaciones"], add: true },
  { name: "Recursos", type: "link", icon: "pending_actions", ruta: ["/", "aguila", "recursos"], add: true },
  { name: "Imagenes Recursos Configuracion", type: "link", icon: "wallpaper", ruta: ["/", "aguila", "imagenesrecursosconfiguracion"], add: true },
  { name: "Modulos", type: "link", icon: "view_module", ruta: ["/", "aguila", "modulos"], add: true },
  { name: "Roles", type: "link", icon: "group", ruta: ["/", "aguila", "roles"], add: true },
  { name: "Usuarios", type: "link", icon: "account_circle", ruta: ["/", "aguila", "usuarios"], add: true },
  /*
  {
    name: "Otros", type: "menu", icon: "linear_scale", 
    children: [
      { name: "Ajustes", icon: "settings", urlp: "aguila", url: "ajustes" },
      { name: "Home", icon: "face", urlp: "aguila", url: "home" },
      { name: "Welcome", icon: "face", urlp: "aguila", url: "welcome" },
      { name: "Empresa", icon: "face", urlp: "aguila", url: "empresa" },
    ],
  },*/
  { name: "Perfil", type: "link", icon: "perm_identity", ruta: ["/", "aguila", "ajustes"] }
];