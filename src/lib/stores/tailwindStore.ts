// import resolveConfig from 'tailwindcss/resolveConfig'
// import tailwindConfig from '../../../tailwind.config.js'
import { readable } from 'svelte/store'

// const fullConfig = resolveConfig(tailwindConfig)

const smBreak = readable(640);
const mdBreak = readable(768);
const lgBreak = readable(1024);
const xlBreak = readable(1280);
const xl2Break = readable(1536);

export {
  smBreak,
  mdBreak,
  lgBreak,
  xlBreak,
  xl2Break
}