import { AstElement } from './AstElement';

export class IdElement extends AstElement {
  public static getType() {
    return {
      type: 'Identifier',
      fromSelector(selector: string) {
        const results = /^id#(.*)$/.exec(selector);
        if (results) {
          return {
            ...this,
            name: results[1],
            is(node: any) {
              if (node.type === this.type) {
                return this.name === node.name;
              }
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new IdElement(node, parents);
        }
      },
    };
  }
}
