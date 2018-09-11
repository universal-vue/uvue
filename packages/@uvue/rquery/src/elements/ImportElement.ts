import { AstElement } from './AstElement';

export class ImportElement extends AstElement {
  public static getType() {
    return {
      type: 'ImportDeclaration',
      fromSelector(selector: string) {
        const results = /^import(#([^@]*))?(@(.*))?$/.exec(selector);
        if (results) {
          return {
            ...this,
            from: results[4],
            name: results[2],
            is(node: any) {
              if (node.type !== this.type) {
                return false;
              }
              if (this.from) {
                if (this.from !== node.source.value) {
                  return false;
                }
              }
              if (this.name) {
                let found = false;
                for (const specifier of node.specifiers) {
                  if (specifier.local.name === this.name) {
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  return false;
                }
              }
              return true;
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (node.type === this.type) {
          return new ImportElement(node, parents);
        }
      },
    };
  }
}
