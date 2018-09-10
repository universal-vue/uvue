import { RQuery } from '../RQuery';
import createFromNode from '../utils/createFromNode';
import { AstElement } from './AstElement';

export class ObjectElement extends AstElement {
  public static getType() {
    return {
      type: 'ObjectExpression',
      fromSelector(selector: string) {
        const results = /^\{\}(.*)$/.exec(selector);
        if (results) {
          return {
            ...this,
            propPath: results[1],
            is(node: any) {
              return node.type === this.type;
            },
          };
        }
      },
      fromNode(node: any, parents: any[]) {
        if (this.type === node.type) {
          return new ObjectElement(node, parents);
        }
      },
    };
  }

  public getProp(key: string): AstElement {
    const prop = this.node.properties.find(item => item.key.name === key);
    if (prop) {
      return createFromNode(prop.value, [...this.parents, this.node, prop]);
    }
  }

  public setProp(key: string, value: any, index: number = -1) {
    const el = this.getProp(key);

    if (value instanceof AstElement) {
      value = value.node;
    }

    if (el) {
      el.replace(value);
    } else {
      const prop = RQuery.createProperty(key, value);
      if (index < 0) {
        this.node.properties.push(prop);
      } else {
        this.node.properties.splice(index, 0, prop);
      }
    }
    return this;
  }

  public removeProp(key: string) {
    const propIndex = this.node.properties.findIndex(item => item.key.name === key);
    if (propIndex >= 0) {
      this.node.properties.splice(propIndex, 1);
    }
    return this;
  }
}
