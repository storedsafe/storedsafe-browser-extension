import MagicString from "magic-string";

export default function browserIncludeExternalPlugin(
  platform: string,
  ...importNames: string[]
) {
  return {
    name: "vite-include-external",
    transform(code: string, id: string) {
      const s = new MagicString(code);
      if (platform !== "firefox") {
        if (id.includes("background/main.ts")) {
          for (let importName of importNames) {
            s.prepend(`import '${importName}';\n`);
          }
          return {
            code: s.toString(),
            map: s.generateMap(),
          };
        }
        if (id.includes(".html")) {
          const moduleIndex = code.indexOf('<script type="module"');
          for (let importName of importNames) {
            s.prependLeft(moduleIndex, `<script src="${importName}"></script>\n`);
          }
          return {
            code: s.toString(),
            map: s.generateMap(),
          };
        }
      }
      return {
        code: s.toString(),
        map: s.generateMap(),
      };
    },
  };
}
