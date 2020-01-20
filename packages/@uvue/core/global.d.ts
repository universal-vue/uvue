declare namespace NodeJS {
  export interface Process {
    ssr: boolean;
    spa: boolean;
    client: boolean;
    server: boolean;
    prod: boolean;
    test: boolean;
    dev: boolean;
  }
}
