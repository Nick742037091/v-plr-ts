<template>
  <div class="video-control-panel" @click="togglePanel">
    <spinner
      v-if="isLoading"
      class="loading"
      :animation-duration="1000"
      :size="40"
      color="#ffe411"
    />
    <transition name="fade-top">
      <div v-if="showControls" class="top-bar" @click.stop>{{ title }}</div>
    </transition>
    <transition name="fade-bottom">
      <div v-if="showControls" class="bottom-bar" @click.stop>
        <img
          v-if="isPlaying"
          src="@/assets/img/pause.png"
          class="btn-pause"
          @click="togglePlay"
        />
        <img
          v-else
          src="@/assets/img/play.png"
          class="btn-play"
          @click="togglePlay"
        />
        <span class="time-block">
          <span id="currentTime">{{ currentTime | mediaTime }}</span
          >/
          <span id="duration">{{ duration | mediaTime }}</span>
        </span>
        <slider
          v-model="sliderValue"
          :buffered="sliderBuffered"
          btn-border-color="white"
          class="slider"
          @changeValue="onChangeValue"
        />
        <img
          v-if="!isFullscreen"
          src="@/assets/img/fullscreen.png"
          class="btn-fullscreen"
          @click="toggleFullScreen"
        />
        <img
          v-else
          src="@/assets/img/fullscreen-exit.png"
          class="btn-fullscreen-exit"
          @click="toggleFullScreen"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import Slider from '@pkg/slider/src/main.vue'
import { HalfCircleSpinner as Spinner } from 'epic-spinners'
import { mediaTime } from '@/utils'

const HIDE_TIME = 1000
@Component({
  name: 'VideoControls',
  components: { Slider, Spinner },
  filters: {
    mediaTime,
  },
})
export default class Controls extends Vue {
  @Prop({ default: false }) isPlaying!: boolean
  @Prop({ default: false }) isFullscreen!: boolean
  @Prop({ default: false }) isLoading!: boolean
  @Prop({ default: 0 }) currentTime!: number
  @Prop({ default: 0 }) duration!: number
  @Prop({ default: 0 }) buffered!: number
  @Prop({ default: '' }) title!: string

  private sliderValue = 0
  private showControls = true
  private hideTimer!: number | null

  get sliderBuffered(): number {
    if (this.duration === 0) return 0
    return (this.buffered / this.duration) * 100
  }

  @Watch('currentTime')
  onCurrentTimeChange(val: number): void {
    if (this.duration === 0) return
    this.sliderValue = (val / this.duration) * 100
  }

  @Watch('isPlaying')
  onIsPlayingChange(val: number): void {
    this.clearHideTimer()
    if (val) {
      this.startHideTimer()
    }
  }

  destroyed(): void {
    this.clearHideTimer()
  }

  startHideTimer(): void {
    this.hideTimer = setTimeout(() => {
      this.showControls = false
    }, HIDE_TIME)
  }
  clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
  }
  togglePlay(): void {
    this.$emit('togglePlay')
  }
  toggleFullScreen(): void {
    this.$emit('toggleFullScreen')
  }
  async togglePanel(): Promise<void> {
    this.clearHideTimer()
    this.showControls = !this.showControls
    await this.$nextTick()
    // 播放状态点击面板，自动延时隐藏
    if (this.showControls && this.isPlaying) {
      this.startHideTimer()
    }
  }
  onChangeValue(value: number): void {
    if (this.duration === 0) {
      this.$emit('changeTime', 0)
    } else {
      this.$emit('changeTime', (value / 100) * this.duration)
    }
    // 拖动、点击延时隐藏面板
    this.clearHideTimer()
    if (this.isPlaying) {
      this.startHideTimer()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/flex.scss';
.video-control-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: white;
  font-size: 12px;
  overflow: hidden;
  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .bottom-bar {
    @include flex-row;
    @include align-center;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.4)
    );
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    .btn-play,
    .btn-pause,
    .btn-fullscreen,
    .btn-fullscreen-exit {
      width: 15px;
      height: 15px;
      padding: 10px;
    }
    .time-block {
      width: 80px;
    }

    .slider {
      @include flex-main;
      margin: 0 5px 0 10px;
    }
  }

  .top-bar {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    text-align: center;
    line-height: 40px;
  }

  .fade-bottom-enter-active,
  .fade-bottom-leave-active {
    transition: all 0.5s ease-in-out;
  }
  .fade-bottom-enter,
  .fade-bottom-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }

  .fade-top-enter-active,
  .fade-top-leave-active {
    transition: all 0.5s ease-in-out;
  }
  .fade-top-enter,
  .fade-top-leave-to {
    opacity: 0;
    transform: translateY(-100%);
  }
}
</style>
