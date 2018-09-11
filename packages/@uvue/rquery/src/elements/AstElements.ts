import { ArrayElement } from './ArrayElement';
import { AstElement } from './AstElement';
import { FuncElement } from './FuncElement';
import { ObjectElement } from './ObjectElement';

export class AstElements {
  constructor(public elements: AstElement[] = []) {}

  public print() {
    let result = '';
    for (const el of this.elements) {
      result += el.print();
    }
    return result;
  }

  public size() {
    return this.elements.length;
  }

  public get(index) {
    return this.elements[index];
  }

  public forEach(callback) {
    this.elements.forEach(callback);
    return this;
  }

  public find(selector: string) {
    let results = [];
    for (const el of this.elements) {
      results = [...results, ...el.find(selector).elements];
    }
    return new AstElements(results);
  }

  public findOne(selector: string) {
    return this.find(selector).get(0);
  }

  public remove() {
    if (!this.elements.length) {
      return this;
    }
    for (const el of this.elements) {
      el.remove();
    }
    return this;
  }

  public replace(node) {
    if (!this.elements.length) {
      return this;
    }
    for (const el of this.elements) {
      el.replace(node);
    }
    return this;
  }

  public getType() {
    return null;
  }

  public parent(index: number = 1) {
    let results = [];
    for (const el of this.elements) {
      results = [...results, el.parent(index)];
    }
    return new AstElements(results);
  }

  public parentType(type: string) {
    let results = [];
    for (const el of this.elements) {
      results = [...results, el.parentType(type)];
    }
    return new AstElements(results);
  }

  public getAt(index: number) {
    let results = [];
    for (const el of this.elements) {
      if (el instanceof ArrayElement) {
        results = [...results, el.getAt(index)];
      }
    }
    return new AstElements(results);
  }

  public append(value: any) {
    for (const el of this.elements) {
      if (el instanceof ArrayElement) {
        el.append(value);
      }
    }
    return this;
  }

  public prepend(value: any) {
    for (const el of this.elements) {
      if (el instanceof ArrayElement) {
        el.prepend(value);
      }
    }
    return this;
  }

  public insertAt(value: any, index: number) {
    for (const el of this.elements) {
      if (el instanceof ArrayElement) {
        el.insertAt(value, index);
      }
    }
    return this;
  }

  public removeAt(index: number) {
    for (const el of this.elements) {
      if (el instanceof ArrayElement) {
        el.prepend(index);
      }
    }
    return this;
  }

  public getProp(key: string) {
    let results = [];
    for (const el of this.elements) {
      if (el instanceof ObjectElement) {
        results = [...results, el.getProp(key)];
      }
    }
    return new AstElements(results);
  }

  public setProp(key: string, value: any, index: number = -1) {
    for (const el of this.elements) {
      if (el instanceof ObjectElement) {
        el.setProp(key, value, index);
      }
    }
    return this;
  }

  public removeProp(key: string) {
    for (const el of this.elements) {
      if (el instanceof ObjectElement) {
        el.removeProp(key);
      }
    }
    return this;
  }

  public getBody() {
    let results = [];
    for (const el of this.elements) {
      if (el instanceof FuncElement) {
        results = [...results, el.getBody()];
      }
    }
    return new AstElements(results);
  }
}
