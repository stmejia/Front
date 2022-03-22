export interface COP {
    empresa: string;
    departamentos: DepartamentoCOP[];
    areas: AreaCOP[];
    sub_areas: SubAreaCOP[];
    puestos: PuestoCOP[];
    categorias: CategoriaCOP[];
    localidades: LocalidadCOP[];
    empleadores: EmpleadorCOP[];
    estados: EstadoCOP[];
}

export interface DepartamentoCOP {
    nombre: string;
    codigo: string;
}

export interface AreaCOP {
    cod_departamento: string;
    nombre: string;
    codigo: string;
}

export interface SubAreaCOP {
    cod_departamento: string;
    nombre: string;
    codigo: string;
}

export interface PuestoCOP {
    cod_departamento: string;
    nombre: string;
    codigo: string;
}

export interface CategoriaCOP {
    nombre: string;
    codigo: string;
}

export interface LocalidadCOP {
    nombre: string;
    codigo: string;
}

export interface EmpleadorCOP {
    nombre: string;
    codigo: string;
}

export interface EstadoCOP {
    nombre: string;
    codigo: string;
}