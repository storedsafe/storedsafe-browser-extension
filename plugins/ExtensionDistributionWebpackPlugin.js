const fs = require('fs-extra')
const path = require('path')
const merge = require('lodash.merge')
const validateOptions = require('schema-utils')

const schema = {
  type: 'object',
  properties: {
    assetsPath: {
      description: 'Path to static assets to be copied after build.',
      type: 'string'
    },
    distPath: {
      description: 'Path to distribution directory.',
      type: 'string'
    },
    manifestPath: {
      description: 'Path to manifests directory.',
      type: 'string'
    },
    targets: {
      description: 'Target distributions.',
      type: 'array',
      items: {
        type: 'string'
      }
    },
    externals: {
      description: 'External dependencies files.',
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
}

class ExtensionDistributionPlugin {
  constructor (options = {}) {
    validateOptions(schema, options, 'ExtensionDistributionPlugin')
    this.options = options
  }

  copyToDist (src, isFile = false) {
    const { distPath, targets } = this.options
    return global.Promise.all(targets.map((target) => {
      const dst = isFile
        ? path.join(distPath, target, path.basename(src))
        : path.join(distPath, target)
      return fs.copy(src, dst, { overwrite: true })
    }))
  }

  copyManifests () {
    const { distPath, manifestPath, targets } = this.options

    return new global.Promise((resolve) => {
      const manifest = fs.readJsonSync(path.join(manifestPath, 'manifest.json'))
      targets.forEach((target) => {
        const targetManifest = fs.readJsonSync(
          path.join(manifestPath, `manifest.${target}.json`)
        )
        const mergedManifest = merge({}, manifest, targetManifest)
        fs.writeJsonSync(path.join(distPath, target, 'manifest.json'), mergedManifest)
        resolve()
      })
    })
  }

  apply (compiler) {
    const { distPath, assetsPath, externals } = this.options
    const plugin = { name: 'ExtensionDistributionPlugin' }

    compiler.hooks.done.tapPromise(plugin, (stats) => {
      return fs.remove(distPath).then(() => fs.ensureDir(distPath)).then(async () => {
        const outputPath = stats.compilation.options.output.path
        await this.copyToDist(outputPath)
        await this.copyToDist(assetsPath)
        await externals.forEach(async (externalPath) => (
          await this.copyToDist(externalPath, true)
        ))
        await this.copyManifests()
      })
    })
  }
}

module.exports = ExtensionDistributionPlugin
