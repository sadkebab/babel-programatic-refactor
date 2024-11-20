import path from "path";
import fs from "fs";

import { run } from "./lib/runner";
import { args } from "./lib/args";
import { processFileAsync } from "./process";

const filter = /.*\.(tsx|jsx|ts|js)/;

run(
  async () => {
    console.time("execution");

    const { target } = args();
    const targetPath = path.resolve(process.cwd(), target);

    const stats = fs.statSync(targetPath);

    const filePaths = stats.isDirectory()
      ? getFilesInDirectory(targetPath)
      : [targetPath];

    const updates = await Promise.all(filePaths.map(processFileAsync));
    const updated = updates.filter((n) => n > 0);

    console.log(
      `Finished! Made ${updated.reduce((a, c) => a + c, 0)} changes to ${updated.length} files.`,
    );
    console.timeEnd("execution");
    process.exit(0);
  },
  {
    onError: (e) => {
      console.error(e.message);
      process.exit(1);
    },
  },
);

function getFilesInDirectory(source: string): string[] {
  const paths = fs.readdirSync(source);

  return paths
    .map((child) => {
      const fullPath = path.resolve(source, child);

      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        return getFilesInDirectory(fullPath);
      }

      return filter.test(child) ? fullPath : undefined;
    })
    .flat()
    .filter((s) => s !== undefined);
}
