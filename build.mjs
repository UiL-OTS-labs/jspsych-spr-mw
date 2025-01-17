import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: [
        './plugins/jspsych-spr-moving-window.js',
    ],
    bundle:true,
    outdir: 'dist',
    minify: false,
    sourcemap: true,
    format: "esm"
})

