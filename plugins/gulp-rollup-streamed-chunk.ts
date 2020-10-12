import { rollup, OutputOptions, RollupOptions } from 'rollup'
import { Readable } from 'stream'
const Vinyl = require('vinyl')

export default function (options: RollupOptions | RollupOptions[]) {
  return new Readable({
    objectMode: true,
    read () {
      const entries = Array.isArray(options) ? options : [options]

      const promises = entries.map(async entry => {
        try {
          const bundle = await rollup(entry)
          const { output } = await bundle.generate(
            entry.output as OutputOptions
          )
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
        } catch (error) {
          this.emit('error', error.message)
        }
      })

      Promise.all(promises).finally(() => this.push(null))
    }
  })
}
