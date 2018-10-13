const traversableProps = [
  'init',
  'body',
  'argument',
  'declaration',
  'declarations',
  'expression',
  'callee',
  'value',
  'object',
  'consequent',
  'test',
  'left',
  'right',
];

export const getTraversableProps = (node: any) => {
  const props = [...traversableProps];
  for (const prop in node) {
    if (Array.isArray(node[prop])) {
      props.push(prop);
    }
  }
  return props;
};

const getNodeChildren = (node: any) => {
  const children: any[] = [];
  for (const prop in node) {
    if (Array.isArray(node[prop])) {
      for (const child of node[prop]) {
        children.push(child);
      }
    } else if (traversableProps.findIndex(item => item === prop) >= 0) {
      if (typeof node[prop] === 'object') {
        children.push(node[prop]);
      }
    }
  }
  return children;
};

const findNodes = (
  node: any,
  items: any[],
  index: number = 0,
  nodes: any[] = [],
  parents: any[] = [],
) => {
  if (index > items.length - 1) {
    return nodes;
  }

  let deep = true;
  let item = items[index];

  if (item === '>') {
    deep = false;
    index++;
    item = items[index];
  }

  if (item.is(node)) {
    if (index < items.length - 1) {
      const children = getNodeChildren(node);
      for (const child of children) {
        findNodes(child, items, index + 1, nodes, [...parents, node]);
      }
    } else {
      nodes.push(item.fromNode(node, parents));
    }
  } else {
    if (deep) {
      const children = getNodeChildren(node);
      for (const child of children) {
        findNodes(child, items, index, nodes, [...parents, node]);
      }
    }
  }

  return nodes;
};

export default findNodes;
