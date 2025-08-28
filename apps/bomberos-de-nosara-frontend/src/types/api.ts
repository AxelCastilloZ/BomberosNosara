
export type ApiErrorPayload = {
  statusCode?: number;
  code?: string;     
  message?: string;
  path?: string;
  timestamp?: string;
  [k: string]: any;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
