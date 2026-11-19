declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }

  export class StatementSync {
    run(...params: Array<string | number | null>): { changes: number };
    all(...params: Array<string | number | null>): unknown[];
  }
}
