<template>
  <div
    ref="slider"
    class="slider"
    @click.stop="onClickSlider"
    :style="sliderStyle"
  >
    <slider-button
      v-model="btnValue"
      :sliderSize="sliderSize"
      :min="min"
      :max="max"
      :border-width="btnBorderWidth"
      :border-color="btnBorderColor"
    />
    <div class="progress-seek" :style="seekStyle" />
    <div class="progress-played" :style="playedStyle" />
    <div class="progress-buffered" :style="bufferedStyle" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator'

import SliderButton from './button.vue'
import { on, off } from '@/utils'
import { Style, Event } from '@pkg/model/common'

@Component({
  name: 'Slider',
  components: { SliderButton },
})
export default class Slider extends Vue {
  @Prop({ default: 0 }) min!: number
  @Prop({ default: 100 }) max!: number
  @Prop({ default: 0 }) value!: number
  @Prop({ default: 40 }) height!: number | string
  @Prop({ default: '100%' }) width!: number | string
  @Prop({ default: 0 }) buffered!: number
  @Prop({ default: '#eeeeee' }) seekColor!: string
  @Prop({ default: '#ffe411' }) playedColor!: string
  @Prop({ default: '#cfcfcf' }) bufferedColor!: string
  @Prop({ default: 3 }) progerssHeight!: number
  @Prop({ default: 2 }) btnBorderWidth!: number
  @Prop({ default: 'grey' }) btnBorderColor!: string

  @Ref('slider') slider!: Element
  private sliderSize = 0
  private btnValue = 0

  get sliderStyle(): Style {
    const height =
      typeof this.height === 'number' ? `${this.height}px` : this.height
    const width =
      typeof this.width === 'number' ? `${this.width}px` : this.width
    return {
      height,
      width,
    }
  }

  get seekStyle(): Style {
    const borderRadius = this.progerssHeight / 2 + 'px'
    const width =
      typeof this.width === 'number' ? `${this.width}px` : this.width
    return {
      backgroundColor: this.seekColor,
      height: this.progerssHeight + 'px',
      width,
      borderRadius,
    }
  }

  get playedStyle(): Style {
    let borderRadius = this.progerssHeight / 2 + 'px'
    if (this.value !== 100) {
      borderRadius = `${borderRadius} 0 0 ${borderRadius}`
    }
    return {
      backgroundColor: this.playedColor,
      height: this.progerssHeight + 'px',
      width: (this.value / 100) * this.sliderSize + 'px',
      borderRadius,
    }
  }

  get bufferedStyle(): Style {
    let borderRadius = this.progerssHeight / 2 + 'px'
    if (this.value !== 100) {
      borderRadius = `${borderRadius} 0 0 ${borderRadius}`
    }
    return {
      backgroundColor: this.bufferedColor,
      height: this.progerssHeight + 'px',
      width: (this.buffered / 100) * this.sliderSize + 'px',
      borderRadius,
    }
  }

  @Watch('value', { immediate: true })
  onChangeValue(val: number): void {
    this.btnValue = val
  }

  @Watch('btnValue', { immediate: true })
  onChangeBtnValue(val: number): void {
    if (val !== this.value) {
      this.$emit('input', val)
      this.changeValue(val)
    }
  }

  mounted(): void {
    this.getSliderSize()
    on(window, 'resize', this.getSliderSize)
  }
  destroyed(): void {
    off(window, 'resize', this.getSliderSize)
  }
  getSliderSize(): void {
    if (!this.slider) return
    this.sliderSize = this.slider.clientWidth
  }
  onClickSlider(event: Event): void {
    const left = this.slider.getBoundingClientRect().left
    if (event.clientX === undefined) return
    let value = ((event.clientX - left) / this.sliderSize) * 100
    if (value < 0) {
      value = 0
    } else if (value > 100) {
      value = 100
    }
    this.$emit('input', value)
    // 点击更新值
    this.changeValue(value)
  }
  changeValue(value: number): void {
    this.$emit('changeValue', value)
  }
}
</script>

<style lang="scss" scoped>
.slider {
  position: relative;
  .progress-played {
    position: absolute;
    z-index: 1002;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
  }
  .progress-buffered {
    position: absolute;
    z-index: 1001;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
  .progress-seek {
    position: absolute;
    z-index: 1000;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
}
</style>
