import * as prettier from 'prettier';
import * as recast from 'recast';
import { AstElement } from './elements';
import { Recast } from './Recast';
import createFromNode from './utils/createFromNode';

export interface IPrintOptions {
  prettier?: string | null;
  prettierConfig?: any;
}

export class RQuery {
  public static parse(source: string): AstElement {
    return new AstElement(Recast.parse(source));
  }

  public static fromNode(node: any): AstElement {
    return createFromNode(node);
  }

  public static print(element: AstElement, options: IPrintOptions = {}): string {
    let code = Recast.print(element.node);
    options = Object.assign({ resolveFrom: process.cwd(), prettier: 'babylon' }, options);
    if (options.prettier) {
      code = this.prettify(code, options);
    }
    return code;
  }

  public static prettify(code, options) {
    options = Object.assign({ resolveFrom: process.cwd(), prettier: 'babylon' }, options);
    return prettier.format(code, {
      ...(options.prettierConfig || {}),
      parser: options.prettier,
    });
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
