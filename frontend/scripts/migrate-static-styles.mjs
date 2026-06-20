import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

const traverse = traverseModule.default ?? traverseModule;
const generate = generateModule.default ?? generateModule;
const root = process.cwd();
const files = process.argv.slice(2).map(file => path.resolve(root, file));

const unitless = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexNegative',
  'flexOrder',
  'flexPositive',
  'flexShrink',
  'fontWeight',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
]);

const cssName = property => property
  .replace(/^ms/, '-ms')
  .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const readValue = (node, property) => {
  if (t.isStringLiteral(node)) return node.value;
  if (t.isNumericLiteral(node)) return `${node.value}${unitless.has(property) || node.value === 0 ? '' : 'px'}`;
  if (t.isUnaryExpression(node, { operator: '-' }) && t.isNumericLiteral(node.argument)) {
    return `${-node.argument.value}${unitless.has(property) || node.argument.value === 0 ? '' : 'px'}`;
  }
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) return node.quasis[0].value.cooked;
  return null;
};

const arbitraryClass = (property, value) => {
  const normalized = String(value)
    .replaceAll(' ', '_')
    .replaceAll('"', '\\"')
    .replaceAll("'", "\\'");
  return `[${cssName(property)}:${normalized}]`;
};

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx'],
  });
  let changed = false;
  let needsCn = false;

  traverse(ast, {
    JSXOpeningElement(nodePath) {
      const attributes = nodePath.node.attributes;
      const styleIndex = attributes.findIndex(attribute => (
        t.isJSXAttribute(attribute)
        && t.isJSXIdentifier(attribute.name, { name: 'style' })
        && t.isJSXExpressionContainer(attribute.value)
        && t.isObjectExpression(attribute.value.expression)
      ));
      if (styleIndex < 0) return;

      const styleAttribute = attributes[styleIndex];
      const properties = styleAttribute.value.expression.properties;
      if (properties.some(property => !t.isObjectProperty(property) || property.computed)) return;

      const classes = [];
      for (const property of properties) {
        const key = t.isIdentifier(property.key) ? property.key.name : property.key.value;
        const value = readValue(property.value, key);
        if (value === null) return;
        classes.push(arbitraryClass(key, value));
      }

      const classValue = classes.join(' ');
      const classIndex = attributes.findIndex(attribute => (
        t.isJSXAttribute(attribute) && t.isJSXIdentifier(attribute.name, { name: 'className' })
      ));

      if (classIndex < 0) {
        attributes.push(t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(classValue)));
      } else {
        const classAttribute = attributes[classIndex];
        if (t.isStringLiteral(classAttribute.value)) {
          classAttribute.value.value = `${classAttribute.value.value} ${classValue}`.trim();
        } else if (t.isJSXExpressionContainer(classAttribute.value)) {
          classAttribute.value.expression = t.callExpression(t.identifier('cn'), [
            classAttribute.value.expression,
            t.stringLiteral(classValue),
          ]);
          needsCn = true;
        }
      }

      attributes.splice(styleIndex, 1);
      changed = true;
    },
  });

  if (!changed) continue;

  if (needsCn) {
    const hasCnImport = ast.program.body.some(node => (
      t.isImportDeclaration(node)
      && node.specifiers.some(specifier => t.isImportSpecifier(specifier) && specifier.imported.name === 'cn')
    ));
    if (!hasCnImport) {
      let importPath = path.relative(path.dirname(file), path.join(root, 'src/lib/utils.js')).replaceAll('\\', '/');
      if (!importPath.startsWith('.')) importPath = `./${importPath}`;
      importPath = importPath.replace(/\.js$/, '');
      ast.program.body.unshift(
        t.importDeclaration(
          [t.importSpecifier(t.identifier('cn'), t.identifier('cn'))],
          t.stringLiteral(importPath),
        ),
      );
    }
  }

  const output = generate(ast, { retainLines: true }, source).code;
  fs.writeFileSync(file, `${output}\n`);
  console.log(path.relative(root, file));
}
