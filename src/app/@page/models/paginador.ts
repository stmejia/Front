export class Paginador {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  nextPageUrl: null;
  previousPageUrl: null;
  paginas: number[];
}

export class EventoPaginador {
  noPagina: number;
  filtro: string;
}