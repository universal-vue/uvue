import * as prettier from 'prettier';
import * as recast from 'recast';
import { AstElement } from './elements';
import { Recast } from './Recast';

export interface IPrintOptions {
  prettier?: string | null;
  prettierConfig?: any;
}

export class RQuery {
  public static parse(source: string): AstElement {
    return new AstElement(Recast.parse(source));
  }

  public static print(element: AstElement, options: IPrintOptions = {}): string {
    let code = Recast.print(element.node);

    options = Object.assign({ resolveFrom: process.cwd(), prettier: 'babylon' }, options);

    if (options.prettier) {
      code = prettier.format(code, {
        ...(options.prettierConfig || {}),
        parser: options.prettier,
      });
    }
    return code;
  }

  public static createIdentifier(name: string) {
    const builder = recast.types.builders;
    return builder.identifier(name);
  }

  public static createProperty(key: string, value: any) {
    const builder = recast.types.builders;
    return builder.objectProperty(this.createIdentifier(key), value);
  }
}
