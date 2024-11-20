import { z } from "zod";

const ArgsSchema = z
  .tuple(
    [
      z.string({
        message: "Runner path is required",
      }),
      z.string({
        message: "Script path is required",
      }),
      z.string({
        message: "Target file or folder is required",
      }),
    ],
    {
      errorMap: (issue, ctx) => {
        if (issue.code === "too_small") {
          return {
            message: `
              Usage:
                bun run src/index.ts <file-or-folder>
            `,
          };
        }

        return { message: ctx.defaultError };
      },
    }
  )
  .rest(z.string())
  .transform(([runnerPath, scriptPath, target]) => ({
    runnerPath,
    scriptPath,
    target,
  }));

export function args() {
  const safeParse = ArgsSchema.safeParse(process.argv);
  if (!safeParse.success) {
    throw new Error(safeParse.error.errors.map((e) => e.message).join("\n"));
  }
  return safeParse.data;
}
