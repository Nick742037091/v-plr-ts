import Slider from './src/main.vue'
import { VueConstructor } from 'vue';

export default {
  install:function(Vue:VueConstructor) {
    Vue.component(Slider.name, Slider)
  },
  name: Slider.name
}
