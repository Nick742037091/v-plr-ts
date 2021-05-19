import { VueConstructor } from 'vue'
import VVideo from '@pkg/video/src/main.vue'
import VSlider from '@pkg/slider/src/main.vue'
import { videoEvents } from '@/utils/event'
import pkg from '../package.json'

const install = function (Vue: VueConstructor): void {
  Vue.component(VSlider.name, VSlider)
  Vue.component(VVideo.name, VVideo)
}
const version = pkg.version
export default {
  install,
  version,
}

export { VSlider, VVideo, videoEvents }
