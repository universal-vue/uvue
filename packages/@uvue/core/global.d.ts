declare namespace NodeJS {
  export interface Process {
    env: {
      [name: string]: string;
    };
    ssr: boolean;
    spa: boolean;
    client: boolean;
    server: boolean;
    prod: boolean;
    test: boolean;
    dev: boolean;
  }
}
