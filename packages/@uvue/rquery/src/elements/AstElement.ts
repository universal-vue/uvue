import { Recast } from '../Recast';
import createFromNode from '../utils/createFromNode';
import findNodes, { getTraversableProps } from '../utils/findNodes';
import parseSelector from '../utils/parseSelector';

export class AstElement {
  public static getType() {
    return {
      fromNode(node: any, parents: any[]) {
        return new AstElement(node, parents);
      },
    };
  }

  constructor(public node: any, public parents: any[] = []) {}

  public find(selector: string) {
    const elements = parseSelector(selector);
    const results = findNodes(this.node.program ? this.node.program : this.node, elements);
    const { AstElements } = require('./AstElements');
    return new AstElements(results);
  }

  public findOne(selector: string) {
    return this.find(selector).get(0);
  }

  public parent(index: number = 1) {
    if (this.parents.length) {
      const node = this.parents[this.parents.length - index];
      const parents = this.parents.slice(0, this.parents.length - index);
      return createFromNode(node, parents);
    }
  }

  public parentType(type: string) {
    if (this.parents.length) {
      for (let i = this.parents.length - 1; i >= 0; i--) {
        const node = this.parents[i];
        if (node.type === type) {
          return createFromNode(node, this.parents.slice(0, i));
        }
      }
    }
  }

  public nodeProp(name: string) {
    return createFromNode(this.node[name], [...this.parents, this]);
  }

  public print() {
    return Recast.print(this.node);
  }

  public remove() {
    if (!this.parents.length) {
      return this;
    }

    const parent = this.parent();
    const parentNode = this.parent().node;
    const props = getTraversableProps(parent.node);

    for (const prop of props) {
      if (Array.isArray(parentNode[prop])) {
        const index = parentNode[prop].findIndex(item => {
          return item === this.node;
        });
        if (index >= 0) {
          parentNode[prop].splice(index, 1);
          break;
        }
      } else {
        if (parentNode[prop] === this.node) {
          delete parentNode[prop];
          break;
        }
      }
    }
    return this;
  }

  public replace(node) {
    if (typeof node === 'string') {
      node = Recast.parse(node).program.body[0];
    } else if (node instanceof AstElement) {
      node = node.node;
    }

    if (!this.parents.length) {
      return this;
    }

    const parent = this.parent();
    const parentNode = this.parent().node;
    const props = getTraversableProps(parent.node);

    for (const prop of props) {
      if (Array.isArray(parentNode[prop])) {
        const index = parentNode[prop].findIndex(item => {
          return item === this.node;
        });
        if (index >= 0) {
          this.node = node;
          parentNode[prop][index] = node;
          break;
        }
      } else {
        if (parentNode[prop] === this.node) {
          this.node = node;
          parentNode[prop] = node;
          break;
        }
      }
    }
    return this;
  }
}
