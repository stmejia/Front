export interface AguilaResponse<T> {
    aguilaData: T;
    meta: AguilaMeta;
}

interface AguilaMeta {
    totalCount: number,
    pageSize: number,
    currentPage: number,
    totalPages: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    nextPageUrl: string,
    previousPageUrl: string
}