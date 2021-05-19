import pkg from '../../package.json'
export const appVersion = pkg.version
export const isDev = process.env.NODE_ENV === 'development'

interface IEEventTarget {
  attachEvent(event: string, handler: EventListener): void
  detachEvent(event: string, handler: EventListener): void
}

type MixEventTarget = EventTarget | IEEventTarget

export const on = (function () {
  if ('addEventListener' in document) {
    return function (
      element: MixEventTarget,
      event: string,
      handler: EventListener
    ) {
      if (element && event && handler) {
        ;(element as EventTarget).addEventListener(event, handler, false)
      }
    }
  } else {
    return function (
      element: MixEventTarget,
      event: string,
      handler: EventListener
    ) {
      if (element && event && handler) {
        ;(element as IEEventTarget).attachEvent('on' + event, handler)
      }
    }
  }
})()

export const off = (function () {
  if ('removeEventListener' in document) {
    return function (
      element: MixEventTarget,
      event: string,
      handler: EventListener
    ) {
      if (element && event) {
        ;(element as EventTarget).removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (
      element: MixEventTarget,
      event: string,
      handler: EventListener
    ) {
      if (element && event) {
        ;(element as IEEventTarget).detachEvent('on' + event, handler)
      }
    }
  }
})()

export const once = function (
  // TODO fix
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  el: any,
  event: string,
  fn: (...args: any[]) => void | null
): void {
  const listener = function (...args: any) {
    if (fn) {
      fn(...args)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

export const setAsyncTimeout = (time: number): Promise<void> =>
  new Promise((resolve: (value?: any) => void) => {
    setTimeout(() => {
      resolve()
    }, time)
  })

const addZero = (number: number) => {
  if (number < 10) {
    return '0' + number
  } else {
    return '' + number
  }
}

export const mediaTime = (time: number): string => {
  time = Math.ceil(time)
  const aHour = 60 * 60
  const aMinute = 60
  const hour = addZero(Math.floor(time / aHour))
  const minute = addZero(Math.floor((time % aHour) / aMinute))
  const second = addZero(Math.floor(time % aMinute))
  if (Math.floor(time / aHour) > 0) {
    return `${hour}:${minute}:${second}`
  } else if (Math.floor(time / aMinute) > 0) {
    return `${minute}:${second}`
  } else {
    return '00:' + addZero(time)
  }
}
