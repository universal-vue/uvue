import { AstElement } from './AstElement';

export class ExprElement extends AstElement {
  public static getType() {
    return {
      type: 'ExpressionStatement',
      fromSelector(selector: string) {
        const results = /^expr$/.exec(selector);
        if (results) {
          return {
            ...this,
            is(node: any) {
              return node.type === this.type;
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new ExprElement(node, parents);
        }
      },
    };
  }
}
