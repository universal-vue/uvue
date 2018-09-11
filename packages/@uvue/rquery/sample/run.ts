import * as fs from 'fs';
import { Recast, RQuery } from '../src';

const source = fs.readFileSync('source.js', 'utf-8');
const doc = RQuery.parse(source);

// ---------------------------------------------

// Get import
const importFoo = doc.find('import#foo').get(0);

// Change imported variable name
importFoo.node.specifiers[0].local.name = 'bar';

// Change from
importFoo.node.source.value = './bar';

// ---------------------------------------------

let router = doc.find('export new#Router');

// Replace router instanciation to an arrow function
router = router.replace(`() => { return ${router.print()} }`);

// Get Router constructor options
const routerOptions = router.find('{}');

// Get routes array property
const routes = routerOptions.getProp('routes');

// Create new route definition
const newRoute = RQuery.parse(
  `({
    path: '/about',
    name: 'about',
    component: () => import('./About.vue'),
  })`,
)
  .find('{}')
  .get(0);

// Add route
routes.append(newRoute);

// ---------------------------------------------

// Find new Vue() options
const vueOptions = doc.find('new#Vue {}');

// Build our new property
const propValue = RQuery.parse('true')
  .find('expr')
  .get(0);

// Inject to options
vueOptions.setProp('test', propValue.node.expression, 2);

// ---------------------------------------------

// Find Vuex options
const vuexOptions = doc.find('export const#store new#Vuex.Store {}');

// Get modules prop
let modules = vuexOptions.getProp('modules');

if (!modules.length) {
  modules = vuexOptions
    .setProp(
      'modules',
      RQuery.parse('({})')
        .find('{}')
        .get(0),
    )
    .getProp('modules');
}

// Module value
const moduleValue = RQuery.parse('({ namespaced: true, state: {} })')
  .find('{}')
  .get(0);

modules.setProp('newModule', moduleValue);

// ---------------------------------------------
// ---------------------------------------------

const classNew = doc.find('new#Class');
classNew.forEach(el => {
  if (!el.parentType('ExportDefaultDeclaration')) {
    const options = el.find('{}').get(0);

    el.replace(`() => {
      return ${options.print()} 
    }`);
  }
});

const testFunc = doc.find('func#test2');

if (testFunc.size()) {
  const testBody = testFunc.getBody().get(0);
  const addVar = RQuery.parse('const toto = true;')
    .find('const#toto')
    .get(0).node;

  testBody.node.body.push(addVar);
}

// console.log(testFunc.get(0).node);

// ---------------------------------------------

console.log(RQuery.print(doc));
