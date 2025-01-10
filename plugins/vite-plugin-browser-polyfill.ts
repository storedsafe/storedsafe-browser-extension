export default function browserPolyfillPlugin(
  platform: string,
  importName: string
) {
  return {
    name: "vite-plugin-browser-polyfill",
    transform(code: string, id: string) {
      if (platform !== "firefox") {
        if (id.includes("background/main.ts")) {
          return `import '${importName}';\n` + code;
        }
        if (id.includes("popup.html")) {
          const moduleIndex = code.indexOf('<script type="module"')
          code = [code.slice(0, moduleIndex), `<script src="${importName}"></script>\n`, code.slice(moduleIndex)].join("")
        }
      }
      return code;
    },
  };
}
