import createFromNode from '../utils/createFromNode';
import { AstElement } from './AstElement';

export class ArrayElement extends AstElement {
  public static getType() {
    return {
      type: 'ArrayExpression',
      fromSelector(selector: string) {
        const results = /^\[\]([0-9]*|\$|\^)$/.exec(selector);
        if (results) {
          return {
            ...this,
            index: results[1],
            is(node: any) {
              return node.type === this.type;
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new ArrayElement(node, parents);
        }
      },
    };
  }

  public getAt(index: number): AstElement {
    return createFromNode(this.node.elements[index], [...this.parents, this.node]);
  }

  public append(value: any) {
    if (value instanceof AstElement) {
      value = value.node;
    }
    this.node.elements.push(value);
    return this;
  }

  public prepend(value: any) {
    if (value instanceof AstElement) {
      value = value.node;
    }
    this.node.elements.unshift(value);
    return this;
  }

  public insertAt(value: any, index: number) {
    if (value instanceof AstElement) {
      value = value.node;
    }
    this.node.elements.splice(index, 0, value);
    return this;
  }

  public removeAt(index: number) {
    this.node.elements.splice(index, 1);
    return this;
  }
}
