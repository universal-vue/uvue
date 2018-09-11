import createFromNode from '../utils/createFromNode';
import { AstElement } from './AstElement';

export class FuncElement extends AstElement {
  public static getType() {
    return {
      type: 'FunctionDeclaration',
      fromSelector(selector: string) {
        const results = /^func#?(.*)/.exec(selector);
        if (results) {
          return {
            ...this,
            name: results[1],
            is(node: any) {
              if (node.type === this.type) {
                if (this.name) {
                  return node.id.name === this.name;
                }
                return true;
              }
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new FuncElement(node, parents);
        }
      },
    };
  }

  public getBody() {
    return createFromNode(this.node.body);
  }
}
