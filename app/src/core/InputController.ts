import { Dom } from './dom'

export interface KeyBinding {
  key?:    number
  keys?:   number[]
  mode?:   'down' | 'up'
  action:  () => void
}

export class InputController {
  bind(bindings: KeyBinding[]): void {
    const onkey = (keyCode: number, mode: 'down' | 'up') => {
      for (const k of bindings) {
        const bindMode = k.mode ?? 'up'
        if ((k.key === keyCode) || (k.keys && k.keys.indexOf(keyCode) >= 0)) {
          if (bindMode === mode) {
            k.action()
          }
        }
      }
    }

    Dom.on(document, 'keydown', (ev) => { onkey((ev as KeyboardEvent).keyCode, 'down') })
    Dom.on(document, 'keyup',   (ev) => { onkey((ev as KeyboardEvent).keyCode, 'up')   })
  }
}
