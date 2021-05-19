<template>
  <div class="slider-button-wrapper" :style="buttonWrapperStyle">
    <div
      ref="slider-button"
      class="slider-button"
      :style="buttonStyle"
      :class="{ 'slider-button--hover': hovering }"
      @mouseenter.stop="onMouseEnter"
      @mouseleave.stop="onMouseLeave"
      @mousedown.stop="onButtonDown"
      @touchstart.stop="onButtonDown"
    ></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from 'vue-property-decorator'

import { on, off } from '@/utils'
import { Style, Event } from '@pkg/model/common'

@Component({
  name: 'SliderButton',
})
export default class SliderButton extends Vue {
  @Prop({ default: '#ffe411' }) color!: string
  @Prop({ default: 12 }) size!: number | string
  @Prop({ default: 0 }) sliderSize!: number
  @Prop({ default: 2 }) borderWidth!: number
  @Prop({ default: 'grey' }) borderColor!: string
  @Prop({ default: 0 }) min!: number
  @Prop({ default: 100 }) max!: number
  @Prop({ default: 0 }) value!: number

  private isClick = false
  private hovering = false
  private dragging = false
  private startY = 0
  private startX = 0
  private startPosition = 0
  private newPosition = 0
  @Ref('slider-button') button!: Element

  get buttonWrapperStyle(): Style {
    const left: string = this.currentPosition
    const top = '50%'
    return {
      left,
      top,
    }
  }

  get buttonStyle(): Style {
    let width, height
    if (typeof this.size === 'string') {
      width = height = this.size
    } else {
      width = height = `${this.size}px`
    }
    return {
      width,
      height,
      backgroundColor: this.color,
      borderWidth: `${this.borderWidth}px`,
      borderColor: this.borderColor,
    }
  }

  get currentPosition(): string {
    return `${((this.value - this.min) / (this.max - this.min)) * 100}%`
  }

  onMouseEnter(): void {
    this.hovering = true
  }
  onMouseLeave(): void {
    if (!this.dragging) {
      this.hovering = false
    }
  }
  onButtonDown(event: Event): void {
    this.hovering = true
    this.onDragStart(event)
    on(window, 'mousemove', this.onDraging)
    on(window, 'touchmove', this.onDraging)
    on(window, 'mouseup', this.onDragEnd)
    on(window, 'touchend', this.onDragEnd)
  }
  onDragStart(event: Event): void {
    this.dragging = true
    this.isClick = true
    if (event.type === 'touchstart') {
      event.clientY = event.touches[0].clientY
      event.clientX = event.touches[0].clientX
    }
    event.clientX && (this.startX = event.clientX)
    this.startPosition = Number.parseFloat(this.currentPosition)
  }
  onDragEnd(): void {
    this.hovering = false
    this.dragging = false
    this.isClick = false
    off(window, 'mousemove', this.onDraging)
    off(window, 'touchmove', this.onDraging)
    off(window, 'mouseup', this.onDragEnd)
    off(window, 'touchend', this.onDragEnd)
  }
  onDraging(event: Event): void {
    this.isClick = false
    if (event.type === 'touchmove') {
      event.clientY = event.touches[0].clientY
      event.clientX = event.touches[0].clientX
    }
    let diff = 0
    event.clientX &&
      (diff = ((event.clientX - this.startX) / this.sliderSize) * 100)
    this.newPosition = this.startPosition + diff
    this.setPosition(this.newPosition)
  }
  setPosition(position: number): void {
    if (position < 0) {
      position = 0
    } else if (position > 100) {
      position = 100
    }
    this.$emit('input', position)
  }
}
</script>

<style lang="scss" scoped>
.slider-button-wrapper {
  position: absolute;
  z-index: 1003;
  transform: translate(-50%, -50%);
  transition: scale ease-in 500ms;
  padding: 10px 10px;
  .slider-button {
    border-radius: 50%;
    // border-width: 2px;
    border-style: solid;
    // border-color: white;
  }
  .slider-button--hover {
    transform: scale(1.4);
  }
}
</style>
