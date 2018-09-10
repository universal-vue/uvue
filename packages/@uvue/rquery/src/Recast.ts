import * as babelParser from '@babel/parser';
import * as recast from 'recast';

export class Recast {
  public static parser = {
    parse: source =>
      babelParser.parse(source, {
        plugins: [
          'classProperties',
          'decorators-legacy',
          'dynamicImport',
          'objectRestSpread',
          'typescript',
        ],
        sourceType: 'module',
      }),
  };

  public static parse(source: string): any {
    return recast.parse(source, {
      parser: Recast.parser,
    });
  }

  public static print(ast: any): string {
    return recast.print(ast).code;
  }
}
