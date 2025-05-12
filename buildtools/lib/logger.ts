const out = process.stdout;
const err = process.stderr;
import * as util from 'util';

/**
 * Source: https://nodejs.org/api/util.html#utilinspectobject-options
 * showHidden <boolean> If true, object's non-enumerable symbols and properties are included in the formatted result. WeakMap and WeakSet entries are also included as well as user defined prototype properties (excluding method properties). Default: false.
 * depth <number> Specifies the number of times to recurse while formatting object. This is useful for inspecting large objects. To recurse up to the maximum call stack size pass Infinity or null. Default: 2.
 * colors <boolean> If true, the output is styled with ANSI color codes. Colors are customizable. See Customizing util.inspect colors. Default: false.
 * customInspect <boolean> If false, [util.inspect.custom](depth, opts, inspect) functions are not invoked. Default: true.
 * showProxy <boolean> If true, Proxy inspection includes the target and handler objects. Default: false.
 * maxArrayLength <integer> Specifies the maximum number of Array, TypedArray, WeakMap, and WeakSet elements to include when formatting. Set to null or Infinity to show all elements. Set to 0 or negative to show no elements. Default: 100.
 * maxStringLength <integer> Specifies the maximum number of characters to include when formatting. Set to null or Infinity to show all elements. Set to 0 or negative to show no characters. Default: 10000.
 * breakLength <integer> The length at which input values are split across multiple lines. Set to Infinity to format the input as a single line (in combination with compact set to true or any number >= 1). Default: 80.
 * compact <boolean> | <integer> Setting this to false causes each object key to be displayed on a new line. It will break on new lines in text that is longer than breakLength. If set to a number, the most n inner elements are united on a single line as long as all properties fit into breakLength. Short array elements are also grouped together. For more information, see the example below. Default: 3.
 * sorted <boolean> | <Function> If set to true or a function, all properties of an object, and Set and Map entries are sorted in the resulting string. If set to true the default sort is used. If set to a function, it is used as a compare function.
 * getters <boolean> | <string> If set to true, getters are inspected. If set to 'get', only getters without a corresponding setter are inspected. If set to 'set', only getters with a corresponding setter are inspected. This might cause side effects depending on the getter function. Default: false.
 * numericSeparator <boolean> If set to true, an underscore is used to separate every three digits in all bigints and numbers. Default: false.
 */
function format(options: object, ...params: any[]) {
    return util.formatWithOptions(options, ...params)
}

export class Logger {
    public name: string;
    public options: object;

    constructor(name: string, options: object = { colors: true }) {
        this.name = name;
        this.options = options;
    }

    log(...params: any[]) {
        this.#logMessage('log', params, out);
    }

    warn(...params: any[]) {
        this.#logMessage('wrn', params, err);
    }

    err(...params: any[]) {
        this.#logMessage('err', params, err);
    }

    #logMessage(prefix: string, params: any[], fd: NodeJS.WriteStream) {
        fd.write(format(
            this.options,
            `[${prefix}](${this.name}): ${params[0]}`,
            ...params.slice(1),
            `\n`
        ));
    }
}
