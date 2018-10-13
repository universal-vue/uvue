import { AstElement } from './AstElement';

export class VariableElement extends AstElement {
  public static getType() {
    return {
      type: 'VariableDeclaration',
      fromSelector(selector: string) {
        const results = /^(var(\*)?|let|const)#(.*)/.exec(selector);
        if (results) {
          return {
            ...this,
            kind: results[1],
            name: results[3],
            wildcard: results[2] ? true : false,
            is(node: any) {
              if (node.type === this.type) {
                if (!this.whilcard || (this.whilcard && node.type === this.type)) {
                  return node.declarations.findIndex(item => item.id.name === this.name) >= 0;
                }
              }
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new VariableElement(node, parents);
        }
      },
    };
  }
}
