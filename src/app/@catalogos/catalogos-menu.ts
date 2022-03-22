import { Menu } from "../@page/models/menu";

export const ITEMS_MENU_CATALOGOS: Menu[] = [
  {
    name: "Generales", type: "menu", icon: "extension",
    children: [
      { name: "Paises", icon: "map", ruta: ["/", "catalogos", "paises"], add: true },
      { name: "Departamentos", icon: "navigations", ruta: ["/", "catalogos", "departamentos"], add: true },
      { name: "Municipios", icon: "my_location", ruta: ["/", "catalogos", "municipios"], add: true },
      { name: "Ubicación", icon: "location_on", ruta: ["/", "catalogos", "ubicaciones"], add: true },
      { name: "Tipos de Listas", icon: "book", ruta: ["/", "catalogos", "tiposListas"], add: true },
      { name: "Vehículos", icon: "directions_car", ruta: ["/", "catalogos", "vehiculos"], add: true },
      { name: "Equipo de Remolque", icon: "local_shipping", ruta: ["/", "catalogos", "equiposRemolque"], add: true },
      { name: "Generadores", icon: "microwave", ruta: ["/", "catalogos", "generadores"], add: true },
      { name: "Estados de Activo", icon: "microwave", ruta: ["/", "catalogos", "estados", "activoEstados"], add: true },
      { name: "Estados de Llantas", icon: "microwave", ruta: ["/", "catalogos", "estados", "llantaEstados"], add: true },
      { name: "Ubicaciones Lista", icon: "location_on", ruta: ["/", "catalogos", "listas", "1006"] },
    ],
  },

  /* Lista Equipo Remolque */
  {
    name: "Listas Equipo de Remolque", type: "menu", icon: "fact_check",
    children: [
      { name: "Número de Ejes", icon: "checklist", ruta: ["/", "catalogos", "listas", "17"] },
      { name: "Tandem Corredizo", icon: "checklist", ruta: ["/", "catalogos", "listas", "18"] },
      { name: "Chasis Extensible", icon: "checklist", ruta: ["/", "catalogos", "listas", "19"] },
      { name: "Tipo de Cuello", icon: "checklist", ruta: ["/", "catalogos", "listas", "20"] },
      { name: "Acople para Genset", icon: "checklist", ruta: ["/", "catalogos", "listas", "21"] },
      { name: "Acople para Dolly", icon: "checklist", ruta: ["/", "catalogos", "listas", "22"] },
      { name: "Medida de Plataforma", icon: "checklist", ruta: ["/", "catalogos", "listas", "23"] },
      { name: "Plataforma Extendible", icon: "checklist", ruta: ["/", "catalogos", "listas", "24"] },
      { name: "Pechera", icon: "checklist", ruta: ["/", "catalogos", "listas", "25"] },
      { name: "Capacidad de Carga Low Boy", icon: "checklist", ruta: ["/", "catalogos", "listas", "26"] },
      { name: "Altura de Contenedor", icon: "checklist", ruta: ["/", "catalogos", "listas", "27"] },
      { name: "Tipo de Contenedor", icon: "checklist", ruta: ["/", "catalogos", "listas", "28"] },
      { name: "Marca de UR", icon: "checklist", ruta: ["/", "catalogos", "listas", "29"] },
      { name: "Eje Corredizo", icon: "checklist", ruta: ["/", "catalogos", "listas", "30"] },
      { name: "Largo de Furgon", icon: "checklist", ruta: ["/", "catalogos", "listas", "31"] },
      { name: "Medidas de Furgon", icon: "checklist", ruta: ["/", "catalogos", "listas", "32"] },
      { name: "Rieles Horizontales", icon: "checklist", ruta: ["/", "catalogos", "listas", "33"] },
      { name: "Rieles Verticales", icon: "checklist", ruta: ["/", "catalogos", "listas", "34"] },
    ]
  },

  /* Lista Generadores*/
  {
    name: "Listas Generadores", type: "menu", icon: "fact_check",
    children: [
      { name: "Tipo Instalación", icon: "checklist", ruta: ["/", "catalogos", "listas", "36"] },
      { name: "Marca Generador", icon: "checklist", ruta: ["/", "catalogos", "listas", "37"] },
    ]
  },
  /* Listas de Vehiculos */
  {
    name: "Listas", type: "menu", icon: "fact_check",
    children: [
      { name: "Distancias de Cabezal", icon: "checklist", ruta: ["/", "catalogos", "listas", "6"] },
      { name: "Potencias de Cabezal", icon: "checklist", ruta: ["/", "catalogos", "listas", "7"] },
      { name: "Tornamesas Graduables de Cabezal", icon: "checklist", ruta: ["/", "catalogos", "listas", "8"] },
      { name: "Capacidad de Carga Camión", icon: "checklist", ruta: ["/", "catalogos", "listas", "9"] },
      { name: "Carroceria de Camión", icon: "checklist", ruta: ["/", "catalogos", "listas", "10"] },
      { name: "Tipo de Carga Camión", icon: "checklist", ruta: ["/", "catalogos", "listas", "11"] },
      { name: "Tipo de Vehículos Livianos", icon: "checklist", ruta: ["/", "catalogos", "listas", "12"] },
      { name: "Capacidad de Monta Carga", icon: "checklist", ruta: ["/", "catalogos", "listas", "13"] },
      { name: "Tipo de Motor Monta Carga", icon: "checklist", ruta: ["/", "catalogos", "listas", "14"] },
      { name: "Tipo de Maquinaria", icon: "checklist", ruta: ["/", "catalogos", "listas", "15"] },
      { name: "Flota", icon: "checklist", ruta: ["/", "catalogos", "listas", "16"] },
    ]
  },
  /* Llantas */
  {
    name: "Llantas", type: "menu", icon: "extension",
    children: [
      { name: "Tipos de Llantas", icon: "map", ruta: ['/', 'catalogos', 'llantasTipos'], add: true },
      { name: "Reencauche de Llantas", icon: "checklist", ruta: ["/", "catalogos", "listas", "39"] },
      { name: "Proveedores de Llantas", icon: "checklist", ruta: ["/", "catalogos", "listas", "40"] },
      { name: "Propositos de Llantas", icon: "checklist", ruta: ["/", "catalogos", "listas", "44"] },
      { name: "Llantas", icon: "map", ruta: ['/', 'catalogos', 'llantas'], add: true },
    ],
  },
  /* Comercializacion */
  {
    name: "Comercialización y Logistica", type: "menu", icon: "extension",
    children: [
      { name: "Tipos de Identificación", icon: "book", ruta: ['/', 'catalogos', 'listas', '2'], add: true },
      { name: "Corporaciones", icon: "apartment", ruta: ["/", "catalogos", "corporaciones"], add: true },
      { name: "Tipos de Clientes", icon: "book", ruta: ["/", "catalogos", "tipoClientes"], add: true },
      { name: "Clientes", icon: "groups", ruta: ["/", "catalogos", "clientes"], add: true },
      { name: "Tipos de Activos", icon: "book", ruta: ["/", "catalogos", "tipoActivos"], add: true },
      { name: "Tipos de Proveedores", icon: "book", ruta: ["/", "catalogos", "tipoProveedores"], add: true },
      { name: "Proveedores", icon: "groups", ruta: ["/", "catalogos", "proveedores"], add: true },
      { name: "Transportes", icon: "local_shipping", ruta: ["/", "catalogos", "transportes"], add: true },
      { name: "Grado de Peligrosidad Rutas", icon: "bus_alert", ruta: ['/', 'catalogos', 'listas', '4'], add: true },
      { name: "Estado de Carreteras", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '5'], add: true },
      { name: "Rutas", icon: "alt_route", ruta: ["/", "catalogos", "rutas"], add: true },
      { name: "Servicios", icon: "support_agent", ruta: ["/", "catalogos", "servicios"], add: true },
      { name: "Empleados", icon: "badge", ruta: ["/", "catalogos", "empleados"], add: true },
      { name: "Asesores", icon: "support_agent", ruta: ["/", "catalogos", "asesores"], add: true },
      { name: "Tipo de Carga", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '41'], add: true },
      { name: "Tipo de Movimiento", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '42'], add: true },
      { name: "Tipo de Viaje", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '43'], add: true },
      { name: "Segmento", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '45'], add: true },
      { name: "Tarifas", icon: "support_agent", ruta: ["/", "catalogos", "tarifas"], add: true },
    ],
  },
  /* Taller */
  {
    name: "Taller", type: "menu", icon: "extension",
    children: [
      { name: "Categorias Reparaciones", icon: "handyman", ruta: ['/', 'catalogos', 'listas', '1'], add: true },
      { name: "Tipos de Reparación", icon: "book", ruta: ["/", "catalogos", "tipoReparaciones"], add: true },
      { name: "Reparaciones", icon: "home_repair_service", ruta: ["/", "catalogos", "reparaciones"], add: true },
      { name: "Tipos de Pilotos", icon: "book", ruta: ["/", "catalogos", "pilotosTipos"], add: true },
      { name: "Tipos de Equipos de Remolques", icon: "book", ruta: ["/", "catalogos", "tiposEquiposRemolques"], add: true },
      { name: "Tipos de Vehiculos", icon: "book", ruta: ["/", "catalogos", "tiposVehiculos"], add: true },
      { name: "Tipos de Generadores", icon: "book", ruta: ["/", "catalogos", "tiposGeneradores"], add: true },
      { name: "Especialidad de Mecánico", icon: "stars", ruta: ['/', 'catalogos', 'listas', '3'], add: true },
      { name: "Tipos de Mecánicos", icon: "book", ruta: ["/", "catalogos", "tiposMecanicos"], add: true },
      { name: "Pilotos", icon: "support_agent", ruta: ["/", "catalogos", "pilotos"], add: true },
      { name: "Mecánicos", icon: "support_agent", ruta: ["/", "catalogos", "mecanicos"], add: true },
    ],
  },

  /* Bodega */
  {
    name: "Bodega", type: "menu", icon: "archive",
    children: [
      { name: "Categorias", icon: "checklist", "ruta": ["/", "catalogos", "invCategorias"], add: true },
      { name: "Sub Categorias", icon: "checklist", "ruta": ["/", "catalogos", "invSubCategorias"], add: true },
      { name: "Medidas", icon: "checklist", "ruta": ["/", "catalogos", "medidas"], add: true },
      { name: "Tipo de Producto", icon: "checklist", ruta: ["/", "catalogos", "listas", "38"] },
      { name: "Productos", icon: "checklist", "ruta": ["/", "catalogos", "productos"], add: true },
    ]
  },

  { name: "Ajustes", type: "link", icon: "settings", ruta: ["/", "catalogos", "ajustes"] },

];

export const ITEMS_CATALOGOS_PROD: Menu[] = [

  //{ name: "Modulo de Catálogos", type: "link", icon: "dynamic_feed", ruta: [] },
  /* Generales */
  {
    name: "Generales", type: "menu", icon: "extension",
    children: [
      { name: "Paises", icon: "map", ruta: ["/", "catalogos", "paises"], add: true },
      { name: "Departamentos", icon: "navigations", ruta: ["/", "catalogos", "departamentos"], add: true },
      { name: "Municipios", icon: "my_location", ruta: ["/", "catalogos", "municipios"], add: true },
      { name: "Ubicación", icon: "location_on", ruta: ["/", "catalogos", "ubicaciones"], add: true },
      { name: "Tipos de Listas", icon: "book", ruta: ["/", "catalogos", "tiposListas"], add: true },
      { name: "Vehículos", icon: "directions_car", ruta: ["/", "catalogos", "vehiculos"], add: true },
      { name: "Equipo de Remolque", icon: "local_shipping", ruta: ["/", "catalogos", "equiposRemolque"], add: true },
      { name: "Generadores", icon: "microwave", ruta: ["/", "catalogos", "generadores"], add: true },
      { name: "Estados de Activo", icon: "microwave", ruta: ["/", "catalogos", "estados", "activoEstados"], add: true },
      { name: "Estados de Llantas", icon: "microwave", ruta: ["/", "catalogos", "estados", "llantaEstados"], add: true },
      { name: "Ubicaciones Lista", icon: "location_on", ruta: ["/", "catalogos", "listas", "1006"] },
    ],
  },

  /* Lista Equipo Remolque */
  {
    name: "Listas Equipo de Remolque", type: "menu", icon: "fact_check",
    children: [
      { name: "Número de Ejes", icon: "checklist", ruta: ["/", "catalogos", "listas", "17"] },
      { name: "Tandem Corredizo", icon: "checklist", ruta: ["/", "catalogos", "listas", "18"] },
      { name: "Chasis Extensible", icon: "checklist", ruta: ["/", "catalogos", "listas", "19"] },
      { name: "Tipo de Cuello", icon: "checklist", ruta: ["/", "catalogos", "listas", "20"] },
      { name: "Acople para Genset", icon: "checklist", ruta: ["/", "catalogos", "listas", "21"] },
      { name: "Acople para Dolly", icon: "checklist", ruta: ["/", "catalogos", "listas", "22"] },
      { name: "Medida de Plataforma", icon: "checklist", ruta: ["/", "catalogos", "listas", "23"] },
      { name: "Plataforma Extendible", icon: "checklist", ruta: ["/", "catalogos", "listas", "24"] },
      { name: "Pechera", icon: "checklist", ruta: ["/", "catalogos", "listas", "25"] },
      { name: "Capacidad de Carga Low Boy", icon: "checklist", ruta: ["/", "catalogos", "listas", "26"] },
      { name: "Altura de Contenedor", icon: "checklist", ruta: ["/", "catalogos", "listas", "27"] },
      { name: "Tipo de Contenedor", icon: "checklist", ruta: ["/", "catalogos", "listas", "28"] },
      { name: "Marca de UR", icon: "checklist", ruta: ["/", "catalogos", "listas", "29"] },
      { name: "Eje Corredizo", icon: "checklist", ruta: ["/", "catalogos", "listas", "30"] },
      { name: "Largo de Furgon", icon: "checklist", ruta: ["/", "catalogos", "listas", "31"] },
      { name: "Medidas de Furgon", icon: "checklist", ruta: ["/", "catalogos", "listas", "32"] },
      { name: "Rieles Horizontales", icon: "checklist", ruta: ["/", "catalogos", "listas", "33"] },
      { name: "Rieles Verticales", icon: "checklist", ruta: ["/", "catalogos", "listas", "34"] },
    ]
  },

  /* Lista Generadores*/
  {
    name: "Listas Generadores", type: "menu", icon: "fact_check",
    children: [
      { name: "Tipo Instalación", icon: "checklist", ruta: ["/", "catalogos", "listas", "36"] },
      { name: "Marca Generador", icon: "checklist", ruta: ["/", "catalogos", "listas", "37"] },
    ]
  },
  /* Listas de Vehiculos */
  {
    name: "Listas", type: "menu", icon: "fact_check",
    children: [
      { name: "Distancias de Cabezal", icon: "checklist", ruta: ["/", "catalogos", "listas", "6"] },
      { name: "Potencias de Cabezal", icon: "checklist", ruta: ["/", "catalogos", "listas", "7"] },
      { name: "Tornamesas Graduables de Cabezal", icon: "checklist", ruta: ["/", "catalogos", "listas", "8"] },
      { name: "Capacidad de Carga Camión", icon: "checklist", ruta: ["/", "catalogos", "listas", "9"] },
      { name: "Carroceria de Camión", icon: "checklist", ruta: ["/", "catalogos", "listas", "10"] },
      { name: "Tipo de Carga Camión", icon: "checklist", ruta: ["/", "catalogos", "listas", "11"] },
      { name: "Tipo de Vehículos Livianos", icon: "checklist", ruta: ["/", "catalogos", "listas", "12"] },
      { name: "Capacidad de Monta Carga", icon: "checklist", ruta: ["/", "catalogos", "listas", "13"] },
      { name: "Tipo de Motor Monta Carga", icon: "checklist", ruta: ["/", "catalogos", "listas", "14"] },
      { name: "Tipo de Maquinaria", icon: "checklist", ruta: ["/", "catalogos", "listas", "15"] },
      { name: "Flota", icon: "checklist", ruta: ["/", "catalogos", "listas", "16"] },
    ]
  },
  /* Llantas */
  {
    name: "Llantas", type: "menu", icon: "extension",
    children: [
      { name: "Tipos de Llantas", icon: "map", ruta: ['/', 'catalogos', 'llantasTipos'], add: true },
      { name: "Reencauche de Llantas", icon: "checklist", ruta: ["/", "catalogos", "listas", "39"] },
      { name: "Proveedores de Llantas", icon: "checklist", ruta: ["/", "catalogos", "listas", "40"] },
      { name: "Propositos de Llantas", icon: "checklist", ruta: ["/", "catalogos", "listas", "44"] },
      { name: "Llantas", icon: "map", ruta: ['/', 'catalogos', 'llantas'], add: true },
    ],
  },
  /* Comercializacion */
  {
    name: "Comercialización y Logistica", type: "menu", icon: "extension",
    children: [
      { name: "Tipos de Identificación", icon: "book", ruta: ['/', 'catalogos', 'listas', '2'], add: true },
      { name: "Corporaciones", icon: "apartment", ruta: ["/", "catalogos", "corporaciones"], add: true },
      { name: "Tipos de Clientes", icon: "book", ruta: ["/", "catalogos", "tipoClientes"], add: true },
      { name: "Clientes", icon: "groups", ruta: ["/", "catalogos", "clientes"], add: true },
      { name: "Tipos de Activos", icon: "book", ruta: ["/", "catalogos", "tipoActivos"], add: true },
      { name: "Tipos de Proveedores", icon: "book", ruta: ["/", "catalogos", "tipoProveedores"], add: true },
      { name: "Proveedores", icon: "groups", ruta: ["/", "catalogos", "proveedores"], add: true },
      { name: "Transportes", icon: "local_shipping", ruta: ["/", "catalogos", "transportes"], add: true },
      { name: "Grado de Peligrosidad Rutas", icon: "bus_alert", ruta: ['/', 'catalogos', 'listas', '4'], add: true },
      { name: "Estado de Carreteras", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '5'], add: true },
      { name: "Rutas", icon: "alt_route", ruta: ["/", "catalogos", "rutas"], add: true },
      { name: "Servicios", icon: "support_agent", ruta: ["/", "catalogos", "servicios"], add: true },
      { name: "Empleados", icon: "support_agent", ruta: ["/", "catalogos", "empleados"], add: true },
      { name: "Asesores", icon: "support_agent", ruta: ["/", "catalogos", "asesores"], add: true },
      { name: "Tipo de Carga", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '41'], add: true },
      { name: "Tipo de Movimiento", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '42'], add: true },
      { name: "Tipo de Viaje", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '43'], add: true },
      { name: "Segmento", icon: "report_gmailerrorred", ruta: ['/', 'catalogos', 'listas', '45'], add: true },
      { name: "Tarifas", icon: "support_agent", ruta: ["/", "catalogos", "tarifas"], add: true },
    ],
  },
  /* Taller */
  {
    name: "Taller", type: "menu", icon: "extension",
    children: [
      { name: "Categorias Reparaciones", icon: "handyman", ruta: ['/', 'catalogos', 'listas', '1'], add: true },
      { name: "Tipos de Reparación", icon: "book", ruta: ["/", "catalogos", "tipoReparaciones"], add: true },
      { name: "Reparaciones", icon: "home_repair_service", ruta: ["/", "catalogos", "reparaciones"], add: true },
      { name: "Tipos de Pilotos", icon: "book", ruta: ["/", "catalogos", "pilotosTipos"], add: true },
      { name: "Tipos de Equipos de Remolques", icon: "book", ruta: ["/", "catalogos", "tiposEquiposRemolques"], add: true },
      { name: "Tipos de Vehiculos", icon: "book", ruta: ["/", "catalogos", "tiposVehiculos"], add: true },
      { name: "Tipos de Generadores", icon: "book", ruta: ["/", "catalogos", "tiposGeneradores"], add: true },
      { name: "Especialidad de Mecánico", icon: "stars", ruta: ['/', 'catalogos', 'listas', '3'], add: true },
      { name: "Tipos de Mecánicos", icon: "book", ruta: ["/", "catalogos", "tiposMecanicos"], add: true },
      { name: "Pilotos", icon: "support_agent", ruta: ["/", "catalogos", "pilotos"], add: true },
      { name: "Mecánicos", icon: "support_agent", ruta: ["/", "catalogos", "mecanicos"], add: true },
    ],
  },

  /* Bodega */
  {
    name: "Bodega", type: "menu", icon: "archive",
    children: [
      { name: "Categorias", icon: "checklist", "ruta": ["/", "catalogos", "invCategorias"], add: true },
      { name: "Sub Categorias", icon: "checklist", "ruta": ["/", "catalogos", "invSubCategorias"], add: true },
      { name: "Medidas", icon: "checklist", "ruta": ["/", "catalogos", "medidas"], add: true },
      { name: "Tipo de Producto", icon: "checklist", ruta: ["/", "catalogos", "listas", "38"] },
      { name: "Productos", icon: "checklist", "ruta": ["/", "catalogos", "productos"], add: true },
    ]
  },

  { name: "Ajustes", type: "link", icon: "settings", ruta: ["/", "catalogos", "ajustes"] },
];