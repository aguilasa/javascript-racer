import type { ResetOptions } from './RacerGame'
import { Dom } from './dom'
import * as Util from './util'

export class TweakUI {
  private resetFn: (options: ResetOptions) => void

  constructor(resetFn: (options: ResetOptions) => void) {
    this.resetFn = resetFn
  }

  bind(): void {
    Dom.on('resolution', 'change', (ev) => {
      const select = (ev.target as HTMLSelectElement)
      const value  = select.options[select.selectedIndex]!.value
      let w: number, h: number
      switch (value) {
        case 'fine':   w = 1280; h = 960;  break
        case 'high':   w = 1024; h = 768;  break
        case 'medium': w = 640;  h = 480;  break
        case 'low':    w = 480;  h = 360;  break
        default:       w = 1024; h = 768;  break
      }
      this.resetFn({ width: w, height: h })
      Dom.blur(ev)
    })

    Dom.on('lanes', 'change', (ev) => {
      Dom.blur(ev)
      const select = (ev.target as HTMLSelectElement)
      this.resetFn({ lanes: Util.toInt(select.options[select.selectedIndex]!.value) })
    })

    this.bindRange('roadWidth',    (v) => this.resetFn({ roadWidth:    v }))
    this.bindRange('cameraHeight', (v) => this.resetFn({ cameraHeight: v }))
    this.bindRange('drawDistance', (v) => this.resetFn({ drawDistance: v }))
    this.bindRange('fieldOfView',  (v) => this.resetFn({ fieldOfView:  v }))
    this.bindRange('fogDensity',   (v) => this.resetFn({ fogDensity:   v }))
  }

  refresh(config: {
    lanes:        number
    roadWidth:    number
    cameraHeight: number
    drawDistance: number
    fieldOfView:  number
    fogDensity:   number
  }): void {
    const lanesEl = Dom.get('lanes') as HTMLSelectElement
    lanesEl.selectedIndex = config.lanes - 1

    this.setRange('roadWidth',    config.roadWidth)
    this.setRange('cameraHeight', config.cameraHeight)
    this.setRange('drawDistance', config.drawDistance)
    this.setRange('fieldOfView',  config.fieldOfView)
    this.setRange('fogDensity',   config.fogDensity)
  }

  private bindRange(id: string, cb: (value: number) => void): void {
    Dom.on(id, 'change', (ev) => {
      Dom.blur(ev)
      const input = ev.target as HTMLInputElement
      const min   = Util.toInt(input.getAttribute('min'))
      const max   = Util.toInt(input.getAttribute('max'))
      cb(Util.limit(Util.toInt(input.value), min, max))
    })
  }

  private setRange(id: string, value: number): void {
    const input = Dom.get(id) as HTMLInputElement
    input.value = String(value)
    const current = document.getElementById('current' + id.charAt(0).toUpperCase() + id.slice(1))
    if (current) current.innerHTML = String(value)
  }
}
