import * as path from "node:path";
import { Logger } from "../buildtools/lib/logger";

const logger = new Logger("vite");

export default function viteCustomLogging() {
  return {
    name: "vite-custom-logging",

    generateBundle(options, bundle) {
      const root = process.cwd();
      for (const [fileName, assetInfo] of Object.entries(bundle)) {
        const outputPath = path.relative(
          root,
          path.join(options.dir || "", fileName)
        );
        logger.log("File generated: %s", outputPath);
      }
    },

    buildEnd(error) {
      if (error) {
        logger.err(error)
      }
    },

    handleHotUpdate(ctx) {
      const filePath = path.relative(process.cwd(), ctx.file);
      switch (ctx.type) {
        case "create":
          logger.log("Created file: %s", filePath)
          break;
        case "update":
          logger.log("Updated file: %s", filePath)
          break;
        case "delete":
          logger.log("Deleted file: %s", filePath)
          break;
      }
    }
  };
}
