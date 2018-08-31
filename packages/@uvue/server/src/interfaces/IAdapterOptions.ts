/**
 *
 */
export interface IAdapterOptions {
  host?: string;
  port?: number;
  https?: {
    key: string;
    cert: string;
  };
}
