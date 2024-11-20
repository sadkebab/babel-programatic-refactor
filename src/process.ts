import fs from "fs";

import parser from "@babel/parser";
import traverse from "@babel/traverse";
import generator from "@babel/generator";
import t from "@babel/types";

import prettier from "prettier";

export async function processFileAsync(filePath: string) {
  console.log(`Processing: ${filePath}`);
  const code = fs.readFileSync(filePath, "utf-8");

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const targetFunctionName = "useQuery";

  let toRefactor = false;

  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === "react-query-old") {
        toRefactor = true;
      }
    },
  });

  if (!toRefactor) return 0;

  let updated = 0;

  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === "react-query-old") {
        path.node.source.value = "react-query-new";
        updated++;
      }
    },
    CallExpression(path) {
      const { callee } = path.node;

      if (callee.type !== "Identifier" || callee.name !== targetFunctionName) {
        return;
      }

      if (path.node.arguments.length < 2) {
        return;
      }

      const [queryFnArg, optionsArg] = path.node.arguments;

      const newArg = t.objectExpression([
        t.objectProperty(t.identifier("queryFn"), queryFnArg as any),
        ...(optionsArg.type === "ObjectExpression"
          ? optionsArg.properties
          : []),
      ]);

      path.node.arguments = [newArg];
      updated++;
    },
  });

  if (updated !== 0) {
    const formatted = await prettier.format(
      generator(ast, { retainLines: true, compact: false }, code).code,
      { filepath: filePath },
    );
    fs.writeFileSync(filePath, formatted);

    console.log(`Made ${updated} changes to ${filePath}`);
  }

  return updated;
}
