import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: [ 'ssh-proxy.mjs' ],
  loader: {
    '.node': 'file'
  },
  outdir: '../../webui',
  platform: 'node',
  bundle: true,
  minify: true
});
