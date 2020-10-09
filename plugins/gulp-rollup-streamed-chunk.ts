import {
  rollup,
  OutputOptions,
  RollupOptions,
  RollupBuild,
  RollupOutput
} from 'rollup'
import { Readable } from 'stream'
const Vinyl = require('vinyl')

export default function (options: RollupOptions | RollupOptions[]) {
  return new Readable({
    objectMode: true,
    read () {
      const entries = Array.isArray(options) ? options : [options]
      const bundles: Promise<RollupBuild>[] = []
      const outputs: Promise<RollupOutput>[] = []

      for (const entry of entries) {
        // Set up bundles
        const bundlePromise = rollup(entry)
        bundles.push(bundlePromise)

        // Generate output
        const outputPromise = bundlePromise.then(bundle => {
          return bundle.generate(entry.output as OutputOptions)
        })
        outputs.push(outputPromise)
      }

      // Stream chunks
      Promise.all(bundles).then(() => {
        Promise.all(outputs).then(rollupOutputs => {
          for (const { output } of rollupOutputs) {
            for (const chunk of output) {
              if (chunk.type === 'chunk') {
                const code = new Vinyl({
                  path: chunk.fileName,
                  contents: Buffer.from(chunk.code)
                })
                this.push(code)
                if (!!chunk.map) {
                  const map = code.clone({ contents: false })
                  map.extname += '.map'
                  map.contents = Buffer.from(chunk.map.toString())
                  this.push(map)
                }
              } else if (chunk.type === 'asset') {
                const asset = new Vinyl({
                  path: chunk.fileName,
                  contents: Buffer.from(chunk.source)
                })
                this.push(asset)
              }
            }
          }
          this.push(null)
        })
      })
    }
  })
}
