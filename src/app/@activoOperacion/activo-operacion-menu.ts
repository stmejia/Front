import { Menu } from "../@page/models/menu";

export const ITEMS_MENU_ACTIVO_OPERACION: Menu[] = [
    //{ name: "Administración Activo De Operación", type: "link", icon: "queue_play_next", ruta: [] },
    /* Administración de Equipo */
    {
        name: "Administración De Equipo", type: "menu", icon: "rv_hookup",
        children: [
            //{ name: "I/S Equipo", icon: "flaky", ruta: ["/", "activoOperaciones", "IEEquipo"], add: false },
            { name: "Vehículos", icon: "directions_car", ruta: ["/", "activoOperaciones", "administracionVehiculos"], add: false },
            { name: "Equipo De Remolque", icon: "local_shipping", ruta: ["/", "activoOperaciones", "administracionEquipoRemolque"], add: false },
            { name: "Generador", icon: "microwave", ruta: ["/", "activoOperaciones", "administracionGeneradores"], add: false },
        ]
    },
    /* Condiciones  */
    {
        name: "Inspecciones", type: "menu", icon: "fact_check",
        children: [
            { name: "Cabezal", icon: "directions_bus", ruta: ["inspecciones", "cabezal"], add: true },
            { name: "Equipo", icon: "local_shipping", ruta: ["inspecciones", "equipo"], add: true },
            { name: "Furgón", icon: "local_shipping", ruta: ["inspecciones", "furgon"], add: true },
            { name: "Generador", icon: "microwave", ruta: ["inspecciones", "generador"], add: true },
            { name: "Contenedor", icon: "local_shipping", ruta: ["inspecciones", "contenedor"], add: true },
        ]
    },
    /* Condiciones Tecnicas */
    {
        name: "Inspecciones Técnicas", type: "menu", icon: "fact_check",
        children: [
            { name: "Generador", icon: "microwave", ruta: ["inspeccionesTecnicas", "generador"], add: true },
        ]
    },
    /*Reportes */
    {
        name: "Reporte De Inventario", type: "menu", icon: "receipt_long",
        children: [
            { name: "Vehículos", icon: "directions_bus", ruta: ["reporteInvenarioVehiculos"], add: false },
            { name: "Equipos De Remolques", icon: "local_shipping", ruta: ["reporteInvenarioEquipos"], add: false },
            { name: "Generadores", icon: "microwave", ruta: ["reporteGeneradores"], add: false },
        ]
    },
    {
        name: "Reporte De Movimientos", type: "menu", icon: "receipt_long",
        children: [
            { name: "Vehículos", icon: "directions_bus", ruta: ["reporteMovimientosVehiculos"], add: false },
            { name: "Equipos De Remolques", icon: "local_shipping", ruta: ["reporteMovimientosEquipos"], add: false },
            { name: "Generadores", icon: "microwave", ruta: ["reporteMovimientosGenerador"], add: false },
        ]
    },
    {
        name: "Reporte De Inspecciones", type: "menu", icon: "receipt_long",
        children: [
            { name: "Cabezales", icon: "directions_bus", ruta: ["reporteInspeccionesCabezal"], add: false },
            { name: "Equipos De Remolques", icon: "local_shipping", ruta: ["reporteInspeccionesEquipo"], add: false },
            { name: "Furgón", icon: "local_shipping", ruta: ["reporteInspeccionesFurgon"], add: false },
            { name: "Generadores", icon: "microwave", ruta: ["reporteInspeccionesGenerador"], add: false },
        ]
    },
    /* Catalogos  */
    {
        name: "Catálogos", type: "menu", icon: "fact_check",
        children: [
            { name: "Equipo de Remolque", icon: "local_shipping", ruta: ["/", "activoOperaciones", "equiposRemolque"], add: true },
            { name: "Vehículos", icon: "directions_car", ruta: ["/", "activoOperaciones", "vehiculos"], add: true },
            { name: "Generadores", icon: "microwave", ruta: ["/", "activoOperaciones", "generadores"], add: true },
        ]
    },
    // /*Equipo Remolque */
    // {
    //     name: "Catálogo Equipos de Remolque", type: "menu", icon: "local_shipping",
    //     children: [
    //         { name: "Equipo de Remolque", icon: "local_shipping", ruta: ["/", "activoOperaciones", "equiposRemolque"], add: true },
    //         { name: "Número de Ejes", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "21"] },
    //         { name: "Tandem Corredizo", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "22"] },
    //         { name: "Chasis Entendible", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "23"] },
    //         { name: "Tipo de Cuello", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "24"] },
    //         { name: "Acople para Genset", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "25"] },
    //         { name: "Acople para Dolly", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "26"] },
    //         { name: "Medida de Plataforma", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "27"] },
    //         { name: "Extendible", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "28"] },
    //         { name: "Perchera", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "29"] },
    //         { name: "Capacidad de Carga Low Boy", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "30"] },
    //         { name: "Altura de Contenedor", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "31"] },
    //         { name: "Tipo de Contenedor", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "32"] },
    //         { name: "Marca de UR", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "33"] },
    //         { name: "Eje Corredizo", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "34"] },
    //         { name: "Largo de Furgon", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "35"] },
    //         { name: "Medidas de Furgon", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "36"] },
    //         { name: "Rieles Horizontales", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "37"] },
    //         { name: "Rieles Verticales", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "38"] },
    //     ]
    // },
    /* Vehiculos */
    // {
    //     name: "Catálogo Vehículos", type: "menu", icon: "directions_car",
    //     children: [
    //         { name: "Vehículos", icon: "directions_car", ruta: ["/", "activoOperaciones", "vehiculos"], add: true },
    //         { name: "Distancias de Cabezal", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "10"] },
    //         { name: "Potencias de Cabezal", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "11"] },
    //         { name: "Tornamesas Graduables de Cabezal", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "12"] },
    //         { name: "Capacidad de Carga Camión", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "13"] },
    //         { name: "Carroceria de Camión", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "14"] },
    //         { name: "Tipo de Carga Camión", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "15"] },
    //         { name: "Tipo de Vehículos Livianos", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "16"] },
    //         { name: "Capacidad de Monta Carga", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "17"] },
    //         { name: "Tipo de Motor Monta Carga", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "18"] },
    //         { name: "Tipo de Maquinaria", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "19"] },
    //     ]
    // },
    /* Generadores*/
    // {
    //     name: "Catálogo Generadores", type: "menu", icon: "microwave",
    //     children: [
    //         { name: "Generadores", icon: "microwave", ruta: ["/", "activoOperaciones", "generadores"], add: true },
    //         { name: "Tipo Instalación", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "40"] },
    //         { name: "Marca Generador", icon: "checklist", ruta: ["/", "activoOperaciones", "listas", "41"] },
    //     ]
    // },

    /* Otros */
    { name: "Control De Eventos", type: "link", icon: "report_problem", ruta: ["controlEventosEquipos"] },
    { name: "Ajustes", type: "link", icon: "settings", ruta: ["/", "activoOperaciones", "ajustes"] },
];