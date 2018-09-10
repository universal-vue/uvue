import memberExpr from '../utils/memberExpr';
import { AstElement } from './AstElement';

export class MemberExprElement extends AstElement {
  public static getType() {
    return {
      type: 'MemberExpression',
      fromSelector(selector: string) {
        const results = /^[a-z]+[a-z0-9\.]*[a-z]+/i.exec(selector);
        if (results) {
          return {
            ...this,
            name: results[0],
            is(node: any) {
              if (node.type === this.type) {
                return memberExpr(node) === this.name;
              }
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new MemberExprElement(node, parents);
        }
      },
    };
  }
}
