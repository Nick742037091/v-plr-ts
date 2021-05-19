import Video from './src/main.vue'
import { VueConstructor } from 'vue'

export default {
  install: function (Vue: VueConstructor): void {
    Vue.component(Video.name, Video)
  },
  name: Video.name,
}
