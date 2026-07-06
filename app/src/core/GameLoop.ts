import { timestamp } from './util'

export class GameLoop {
  private readonly step: number
  private readonly update: (dt: number) => void
  private readonly render: () => void
  private readonly onFrame?: () => void

  constructor(
    step: number,
    update: (dt: number) => void,
    render: () => void,
    onFrame?: () => void,
  ) {
    this.step     = step
    this.update   = update
    this.render   = render
    this.onFrame  = onFrame
  }

  start(): void {
    let last = timestamp()
    let gdt  = 0

    const frame = () => {
      const now = timestamp()
      const dt  = Math.min(1, (now - last) / 1000)
      gdt = gdt + dt
      while (gdt > this.step) {
        gdt = gdt - this.step
        this.update(this.step)
      }
      this.render()
      if (this.onFrame) this.onFrame()
      last = now
      requestAnimationFrame(frame)
    }
    frame()
  }
}
