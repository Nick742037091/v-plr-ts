<template>
  <div class="video-wrapper" :style="wrapperStyle">
    <div class="video-block">
      <video
        ref="player"
        :src="src"
        webkit-playsinline="true"
        playsinline="true"
      />
    </div>
    <div v-if="$slots.default" class="slot-block">
      <slot />
    </div>

    <controls
      v-if="!$slots.default && !nativeControls"
      :current-time="currentTime"
      :duration="duration"
      :buffered="buffered"
      :is-playing="isPlaying"
      :is-loading="isLoading"
      :is-fullscreen="isFullscreen"
      @togglePlay="togglePlay"
      @toggleFullScreen="toggleFullScreen"
      @changeTime="toggleChangeTime"
      :title="title"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from 'vue-property-decorator'
import Controls from './controls.vue'
import { on, off } from '@/utils'
import browser from '@/utils/browser'
import { mediaEvents, videoEvents } from '@/utils/event'
import fullscreen from '@/utils/fullscreen'

interface FullscreenChangeEvent {
  isFullscreen: boolean
}

interface WrapperStyle {
  paddingBottom?: string
}

interface Video extends Element {
  play(): void
  pause(): void
  duration: number
  currentTime: number
  buffered: {
    end(num: number): number
  }
}

@Component({
  name: 'VVideo',
  components: { Controls },
})
export default class VVideo extends Vue {
  @Prop({ default: '' }) readonly src!: string
  @Prop({ default: 16 / 9 }) readonly ratio!: number
  @Prop({ default: '' }) readonly title!: string
  @Ref('player') readonly player!: Video
  private isReady = false
  private isPlaying = false
  private isLoading = false
  private isFullscreen = false
  private currentTime = 0
  private duration = 0
  private buffered = 0

  get wrapperStyle(): WrapperStyle {
    return {
      paddingBottom: (1 / this.ratio) * 100 + '%',
    }
  }

  get playProgerss(): number {
    if (this.duration === 0) return 0
    return this.currentTime / this.duration
  }

  get nativeControls(): boolean {
    // 1.微信安卓video控件在播放之后会覆盖自定义控件，默认全屏播放
    // 2.微信iOS video播放之后才能切换全屏
    // 3.QQ浏览器video控件播放之后会覆盖自定义控件
    return browser.isAndroid && browser.isWechat
  }

  mounted(): void {
    on(this.player, mediaEvents.loadstart, this.onLoadstart)
    on(this.player, mediaEvents.canplay, this.onCanplay)
    on(this.player, mediaEvents.play, this.onPlay)
    on(this.player, mediaEvents.playing, this.onPlaying)
    on(this.player, mediaEvents.pause, this.onPause)
    on(this.player, mediaEvents.timeupdate, this.onTimeupdate)
    on(this.player, mediaEvents.waiting, this.onWaiting)
    on(this.player, mediaEvents.ended, this.onEnded)
    on(this.player, mediaEvents.error, this.onError)
    fullscreen.onChange(this.player, this.onFullscreenChange)
  }

  destroyed(): void {
    off(this.player, mediaEvents.loadstart, this.onLoadstart)
    off(this.player, mediaEvents.play, this.onPlay)
    off(this.player, mediaEvents.playing, this.onPlaying)
    off(this.player, mediaEvents.pause, this.onPause)
    off(this.player, mediaEvents.timeupdate, this.onTimeupdate)
    off(this.player, mediaEvents.waiting, this.onWaiting)
    off(this.player, mediaEvents.ended, this.onEnded)
    off(this.player, mediaEvents.error, this.onError)
    fullscreen.offChange(this.player, this.onFullscreenChange)
  }
  /* 原生回调事件 */
  onLoadstart(): void {
    this.$emit(videoEvents.onLoadstart)
  }
  onCanplay(): void {
    this.isReady = true
    this.$emit(videoEvents.onCanplay)
  }
  onPlay(): void {
    this.isPlaying = true
    this.$emit(videoEvents.onPlay)
  }
  onPlaying(): void {
    this.isLoading = false
    this.$emit(videoEvents.onPlaying)
  }
  onPause(): void {
    this.isPlaying = false
    this.$emit(videoEvents.onPause)
  }
  onTimeupdate(): void {
    if (!this.player) return
    const duration = (this.duration = this.player.duration)
    const currentTime = (this.currentTime = this.player.currentTime)
    const buffered = (this.buffered = this.player.buffered.end(0))
    this.$emit(videoEvents.onTimeupdate, { duration, currentTime, buffered })
  }
  onWaiting(): void {
    this.isLoading = true
    this.$emit(videoEvents.onWaiting)
  }
  onEnded(): void {
    this.$emit(videoEvents.onEnded)
  }
  onError(): void {
    this.$emit(videoEvents.onError)
  }
  onFullscreenChange(event: FullscreenChangeEvent): void {
    this.isFullscreen = event.isFullscreen
    this.$emit(videoEvents.onFullscreenChange, event)
  }
  /* 组件回调事件 */
  togglePlay(): void {
    if (!this.player) return
    if (!this.isPlaying) {
      this.player.play()
    } else {
      this.player.pause()
    }
  }
  async toggleFullScreen(): Promise<void> {
    fullscreen.toggle(this.player)
  }
  toggleChangeTime(time: number): void {
    //TODO 节流
    this.player && (this.player.currentTime = time)
  }
}
</script>

<style lang="scss" scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  background-color: black;
  .video-block {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 0;
    video {
      width: 100%;
    }
  }
  .slot-block {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1;
  }
}
</style>
