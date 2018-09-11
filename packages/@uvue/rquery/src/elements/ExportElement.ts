import { AstElement } from './AstElement';

export class ExportElement extends AstElement {
  public static getType() {
    return {
      fromSelector(selector: string) {
        const results = /^export(Default)?$/.exec(selector);
        if (results) {
          const type = results[1] ? 'ExportDefaultDeclaration' : 'ExportNamedDeclaration';
          return {
            ...this,
            type,
            is(node: any) {
              return node.type === this.type;
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') {
          return new ExportElement(node, parents);
        }
      },
    };
  }
}
