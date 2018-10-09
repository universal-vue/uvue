import createFromNode from '../utils/createFromNode';
import { AstElement } from './AstElement';

export class FuncElement extends AstElement {
  public static getType() {
    return {
      type: 'FunctionDeclaration',
      fromSelector(selector: string) {
        const results = /^func(Arrow)?#?(.*)/.exec(selector);
        if (results) {
          const type = results[1] ? 'ArrowFunctionExpression' : 'FunctionDeclaration';
          return {
            ...this,
            name: results[2],
            type,
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
        if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
          return new FuncElement(node, parents);
        }
      },
    };
  }

  public getBody() {
    return createFromNode(this.node.body);
  }
}
