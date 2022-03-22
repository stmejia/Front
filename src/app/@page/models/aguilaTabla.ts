export interface ColumnaTabla {
    titulo: string; // Enviar icono cuando el tipo sea imagen
    target: string[];
    targetConcatenar?: string[][];
    aligment: 'center' | 'left' | 'right' | 'justify';
    tipo?: 'texto' | 'imagen' | 'boolean' | 'fecha' | 'opcion' | 'concatenar';
    caracterConcatenar?: string;
    visible: boolean;
    orden?: boolean;
    formatoFecha?: string;
    imgError?: string;
}

export interface ColumnaTablaSelect {
    titulo: string; // Enviar icono cuando el tipo sea imagen
    target: string[];
    targetConcatenar?: string[][];
    aligment: 'center' | 'left' | 'right' | 'justify';
    tipo?: 'texto' | 'imagen' | 'boolean' | 'fecha' | 'opcion' | 'concatenar';
    caracterConcatenar?: string;
    formatoFecha?: string;
}