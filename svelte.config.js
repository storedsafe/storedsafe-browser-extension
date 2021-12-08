const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  css: css => css.write('bundle.css', true),
  preprocess: sveltePreprocess(),
};
