const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const yargs = require('yargs')

const argv = yargs
  .options('input', {
    alias: 'i',
    description: 'Input directory'
  })
  .option('output', {
    alias: 'o',
    description: 'Output zip file path'
  })
  .demandOption(['input', 'output'])
  .help()
  .alias('help', 'h')
  .version(false)
  .argv

const rootPath = path.join(__dirname, '../')
const inputPath = path.join(rootPath, argv.input)
const outputPath = path.join(rootPath, argv.output)

const output = fs.createWriteStream(outputPath)
const archive = archiver('zip')

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes')
  console.log('archiver has been finalized and the output file descriptor has been closed.')
})

output.on('warning', function(err) {
  console.log('Data has been drained.')
})

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.log('File not found.')
  } else {
    throw err
  }
})

archive.on('error', function(err) {
  throw err
})

archive.pipe(output)
archive.directory(inputPath, false)
archive.finalize()

