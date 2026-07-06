import Stats from 'stats.js'
import { Dom } from './dom'

export class StatsPanel {
  private stats: Stats
  private lastMs = 0

  constructor(parentId: string, id?: string) {
    this.stats = new Stats()
    this.stats.dom.id = id ?? 'stats'
    Dom.get(parentId).appendChild(this.stats.dom)

    const msg = document.createElement('div')
    msg.style.cssText = 'border: 2px solid gray; padding: 5px; margin-top: 5px; text-align: left; font-size: 1.15em; text-align: right;'
    msg.innerHTML = 'Your canvas performance is '
    Dom.get(parentId).appendChild(msg)

    const value = document.createElement('span')
    value.innerHTML = '...'
    msg.appendChild(value)

    setInterval(() => {
      const fps   = this.lastMs > 0 ? Math.round(1000 / this.lastMs) : 0
      const ok    = (fps > 50) ? 'good'  : (fps < 30) ? 'bad' : 'ok'
      const color = (fps > 50) ? 'green' : (fps < 30) ? 'red' : 'gray'
      value.innerHTML       = ok
      value.style.color     = color
      msg.style.borderColor = color
    }, 5000)
  }

  update(): void {
    this.stats.begin()
    this.lastMs = this.stats.end()
    this.stats.update()
  }
}
