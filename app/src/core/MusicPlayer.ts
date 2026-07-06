import { Dom } from './dom'

export class MusicPlayer {
  private music: HTMLAudioElement

  constructor(musicId: string, muteButtonId: string) {
    this.music = Dom.get(musicId) as HTMLAudioElement
    this.music.loop   = true
    this.music.volume = 0.05
    this.music.muted  = (Dom.storage['muted'] === 'true')
    void this.music.play()
    Dom.toggleClassName(muteButtonId, 'on', this.music.muted)

    Dom.on(muteButtonId, 'click', () => {
      Dom.storage['muted'] = String(this.music.muted = !this.music.muted)
      Dom.toggleClassName(muteButtonId, 'on', this.music.muted)
    })
  }
}
