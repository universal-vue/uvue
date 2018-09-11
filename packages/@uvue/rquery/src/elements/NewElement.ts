import memberExpr from '../utils/memberExpr';
import { AstElement } from './AstElement';

export class NewElement extends AstElement {
  public static getType() {
    return {
      type: 'NewExpression',
      fromSelector(selector: string) {
        const results = /^new(#?(.*))$/.exec(selector);
        if (results) {
          const className = results[2];

          return {
            ...this,
            className,
            is(node: any) {
              if (this.type === node.type) {
                if (this.className) {
                  if (/\./.test(this.className)) {
                    return memberExpr(node.callee) === this.className;
                  } else {
                    return node.callee.name === this.className;
                  }
                } else {
                  return true;
                }
              }
              return false;
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new NewElement(node, parents);
        }
      },
    };
  }
}
