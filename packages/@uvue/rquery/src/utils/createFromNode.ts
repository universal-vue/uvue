import { AstElement } from '../elements';

export default (node: any, parents: any = []): AstElement => {
  const elementsTypes = require('../elements/index');
  for (const typeName in elementsTypes) {
    if (elementsTypes[typeName]) {
      const type = elementsTypes[typeName].getType();
      const el = type.fromNode(node, parents);
      if (el) {
        return el;
      }
    }
  }
};
