// import resolveConfig from 'tailwindcss/resolveConfig'
// import tailwindConfig from '../../../tailwind.config.js'
import { readable, writable, type Writable } from 'svelte/store'

// const fullConfig = resolveConfig(tailwindConfig)

const smBreak = readable(640);
const mdBreak = readable(768);
const lgBreak = readable(1024);
const xlBreak = readable(1280);
const xl2Break = readable(1536);

const isWindowSmall: Writable<boolean | undefined> = writable(undefined);

let storedWindow: Window | undefined;
const onResize = () => {
  if(storedWindow) {
    isWindowSmall.set(storedWindow.innerWidth >= 640 ? false : true);
  }
};

const windowSize = (window: Window) => {
  if(storedWindow) return;
  storedWindow = window;
  isWindowSmall.set(window.innerWidth >= 640 ? false : true);
  window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
}

export {
  isWindowSmall,
  windowSize,
  smBreak,
  mdBreak,
  lgBreak,
  xlBreak,
  xl2Break
}