import MagicString from "magic-string";

export default function browserPolyfillPlugin(
  platform: string,
  importName: string
) {
  return {
    name: "vite-plugin-browser-polyfill",
    transform(code: string, id: string) {
      const s = new MagicString(code);
      if (platform !== "firefox") {
        if (id.includes("background/main.ts")) {
          s.prepend(`import '${importName}';\n`)
          return {
            code: s.toString(),
            map: s.generateMap()
          }
        }
        if (id.includes("popup.html")) {
          const moduleIndex = code.indexOf('<script type="module"')
          s.prependLeft(moduleIndex, `<script src="${importName}"></script>\n`)
          return {
            code: s.toString(),
            map: s.generateMap()
          }
        }
      }
      return {
        code: s.toString(),
        map: s.generateMap(),
      };
    },
  };
}
