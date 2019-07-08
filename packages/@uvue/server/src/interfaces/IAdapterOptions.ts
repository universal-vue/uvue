/**
 * Options for HTTP Server adapter
 */
export interface IAdapterOptions {
  host?: string;
  port?: number;
  https?: {
    key: string;
    cert: string;
  };
  http2?: boolean;
}
