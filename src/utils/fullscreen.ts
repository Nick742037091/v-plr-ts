const document =
  typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? window.document
    : {}

//参考api https://blog.csdn.net/Lee_0220/article/details/82187905
// https://developer.mozilla.org/zh-CN/docs/Web/API/Fullscreen_API/%E6%8C%87%E5%8D%97

enum BrowserType {
  STANDARD = 'standand',
  WEBKIT = 'webkit', //Safari/Chrome/Opera/Edge
  NEW_WEBKIT = 'newWebkit', //mobile ios webkit
  FIREFOX = 'firfox',
  IE = 'ie',
}

enum ApiTarget {
  DOCUMENT = 'document',
  VIDEO = 'video',
}

interface ApiTargetType {
  [props: string]: any
}

interface ApiOptions {
  api: string
  target: ApiTarget
}

interface ApiUnion {
  element?: ApiOptions
  enter?: ApiOptions
  exit?: ApiOptions
  onChange?: ApiOptions
  onEnter?: ApiOptions
  onExit?: ApiOptions
  active?: ApiOptions
}

type Api =
  | 'element'
  | 'enter'
  | 'exit'
  | 'active'
  | 'onChange'
  | 'onEnter'
  | 'onExit'

interface OnChangeOption {
  isFullscreen: boolean
}

type OnChangeCallback = (option: OnChangeOption) => void

const API_MAP = {
  [BrowserType.STANDARD]: {
    enter: { api: 'requestFullscreen', target: ApiTarget.VIDEO },
    exit: { api: 'exitFullscreen', target: ApiTarget.DOCUMENT },
    onChange: { api: 'onfullscreenchange', target: ApiTarget.DOCUMENT },
    element: { api: 'fullscreenElement', target: ApiTarget.DOCUMENT },
  },
  [BrowserType.WEBKIT]: {
    enter: { api: 'webkitRequestFullscreen', target: ApiTarget.VIDEO },
    exit: { api: 'webkitExitFullscreen', target: ApiTarget.DOCUMENT },
    onChange: { api: 'onwebkitfullscreenchange', target: ApiTarget.DOCUMENT },
    element: { api: 'webkitFullscreenElement', target: ApiTarget.DOCUMENT },
  },
  [BrowserType.NEW_WEBKIT]: {
    enter: { api: 'webkitEnterFullscreen', target: ApiTarget.VIDEO },
    exit: { api: 'webkitExitFullscreen', target: ApiTarget.VIDEO },
    onEnter: { api: 'webkitbeginfullscreen', target: ApiTarget.VIDEO },
    onExit: { api: 'webkitendfullscreen', target: ApiTarget.VIDEO },
    active: { api: 'webkitDisplayingFullscreen', target: ApiTarget.VIDEO },
  },
  [BrowserType.FIREFOX]: {
    enter: { api: 'mozRequestFullScreen', target: ApiTarget.VIDEO },
    exit: { api: 'mozCancelFullScreen', target: ApiTarget.DOCUMENT },
    onChange: { api: 'onmozfullscreenchange', target: ApiTarget.DOCUMENT },
    element: { api: 'mozFullScreenElement', target: ApiTarget.DOCUMENT },
  },
  [BrowserType.IE]: {
    enter: { api: 'msRequestFullscreen', target: ApiTarget.VIDEO },
    exit: { api: 'msExitFullscreen', target: ApiTarget.DOCUMENT },
    onChange: { api: 'onMSFullscreenChange', target: ApiTarget.DOCUMENT },
    element: { api: 'msFullscreenElement', target: ApiTarget.DOCUMENT },
  },
}

class Fullscreen {
  private changeHandlers = new Set<OnChangeCallback>()
  private newWebkitChangeHanlders = new Map()
  private preChangeHandler: OnChangeCallback | null = null

  get browerType(): BrowserType {
    if ('fullscreenEnabled' in document) {
      return BrowserType.STANDARD
    }

    if ('webkitFullscreenEnabled' in document) {
      return BrowserType.WEBKIT
    }

    if ('mozFullScreenEnabled' in document) {
      return BrowserType.FIREFOX
    }

    if ('msFullscreenEnabled' in document) {
      return BrowserType.IE
    }

    return BrowserType.NEW_WEBKIT
  }

  isActive(video: ApiTargetType): boolean {
    if (this.browerType === BrowserType.NEW_WEBKIT) {
      // 通过webkitDisplayingFullscreen 判断全屏状态
      const { element, api } = this.getApi(video, 'active')
      return element[api]
    } else {
      // fullScreenElement 元素是视频元素，处于全屏状态
      const { element, api } = this.getApi(video, 'element')
      return element[api] === video
    }
  }

  getApi(video: ApiTargetType, key: Api): ApiTargetType {
    const browser: ApiUnion = API_MAP[this.browerType]
    const { target, api } = browser[key] || {
      target: ApiTarget.DOCUMENT,
      api: '',
    }
    const element = target === ApiTarget.DOCUMENT ? window.document : video
    return { element, api }
  }

  async enter(video: ApiTargetType): Promise<void> {
    const { element, api } = this.getApi(video, 'enter')
    element[api]()
  }

  async exit(video: ApiTargetType) {
    const { element, api } = this.getApi(video, 'exit')
    element[api]()
  }

  toggle(video: ApiTargetType) {
    if (this.isActive(video)) {
      console.log('exitFullScreen')
      this.exit(video)
    } else {
      console.log('enterFullScreen')
      this.enter(video)
    }
  }

  onChange(video: ApiTargetType, callback: OnChangeCallback) {
    if (this.browerType === BrowserType.NEW_WEBKIT) {
      const changeEvent = () => callback({ isFullscreen: this.isActive(video) })
      this.newWebkitChangeHanlders.set(callback, changeEvent)
      const enter = this.getApi(video, 'onEnter')
      const exit = this.getApi(video, 'onExit')
      enter.element.addEventListener(enter.api, changeEvent)
      enter.element.addEventListener(exit.api, changeEvent)
    } else {
      const { element, api } = this.getApi(video, 'onChange')
      if (!this.changeHandlers) {
        this.preChangeHandler = element[api]
        this.changeHandlers = new Set()
      }
      this.changeHandlers.add(callback)
      element[api] = () => {
        this.preChangeHandler &&
          this.preChangeHandler({ isFullscreen: this.isActive(video) })
        for (const handler of this.changeHandlers) {
          handler && handler({ isFullscreen: this.isActive(video) })
        }
      }
    }
  }

  offChange(video: ApiTargetType, callback: OnChangeCallback) {
    if (this.browerType === BrowserType.NEW_WEBKIT) {
      const changeEvent = this.newWebkitChangeHanlders.get(callback)
      const enter = this.getApi(video, 'onEnter')
      const exit = this.getApi(video, 'onExit')
      enter.element.removeEventListener(enter.api, changeEvent)
      exit.element.removeEventListener(exit.api, changeEvent)
      this.newWebkitChangeHanlders.delete(callback)
    } else {
      if (this.changeHandlers && this.changeHandlers.has(callback)) {
        this.changeHandlers.delete(callback)
      }
    }
  }
}

export default new Fullscreen()
