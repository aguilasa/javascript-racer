import * as Phaser from 'phaser'

// Reproduz a lógica de HUD de app/src/versions/v4-final/Hud.ts usando
// Phaser.GameObjects.Text em vez de DOM — ver docs/migracao-phaser/01-arquitetura-alvo.md
export class Hud {
  private lastValues = new Map<string, string | number>()
  private speedText: Phaser.GameObjects.Text
  private currentLapTimeText: Phaser.GameObjects.Text
  private lastLapTimeText: Phaser.GameObjects.Text
  private fastLapTimeText: Phaser.GameObjects.Text

  constructor(private scene: Phaser.Scene) {
    // Create text objects for HUD elements
    this.speedText = this.scene.add.text(10, 10, '0 mph', { fontSize: '24px', color: '#ffffff' })
    this.currentLapTimeText = this.scene.add.text(10, 40, 'Time: 0.0', { fontSize: '20px', color: '#ffffff' })
    this.lastLapTimeText = this.scene.add.text(10, 70, 'Last Lap: 0.0', { fontSize: '20px', color: '#ffffff' })
    this.fastLapTimeText = this.scene.add.text(10, 100, 'Fastest Lap: 0.0', { fontSize: '20px', color: '#ffffff' })

    // Initialize record from localStorage with default '180' (3 minutes)
    const stored = localStorage.getItem('fast_lap_time')
    const fastLapTime = stored ? parseFloat(stored) : 180
    localStorage.setItem('fast_lap_time', String(fastLapTime))
    this.setIfChanged('fast_lap_time', this.fastLapTimeText, this.formatTime(fastLapTime))
  }

  updateSpeed(speed: number): void {
    const value = 5 * Math.round(speed / 500)
    this.setIfChanged('speed', this.speedText, value + ' mph')
  }

  updateCurrentLapTime(seconds: number): void {
    const value = this.formatTime(seconds)
    this.setIfChanged('current_lap_time', this.currentLapTimeText, 'Time: ' + value)
  }

  onLapComplete(lapTime: number): void {
    const value = this.formatTime(lapTime)
    this.setIfChanged('last_lap_time', this.lastLapTimeText, 'Last Lap: ' + value)

    const fastLapTime = parseFloat(localStorage.getItem('fast_lap_time') || '0')
    if (!fastLapTime || lapTime <= fastLapTime) {
      localStorage.setItem('fast_lap_time', String(lapTime))
      this.setIfChanged('fast_lap_time', this.fastLapTimeText, 'Fastest Lap: ' + value)
      this.fastLapTimeText.setColor('#ffff00') // yellow for new record
      this.lastLapTimeText.setColor('#ffff00')
    } else {
      this.fastLapTimeText.setColor('#ffffff')
      this.lastLapTimeText.setColor('#ffffff')
    }
  }

  private formatTime(dt: number): string {
    const minutes = Math.floor(dt / 60)
    const seconds = Math.floor(dt - minutes * 60)
    const tenths = Math.floor(10 * (dt - Math.floor(dt)))
    if (minutes > 0) {
      return minutes + '.' + (seconds < 10 ? '0' : '') + seconds + '.' + tenths
    } else {
      return seconds + '.' + tenths
    }
  }

  private setIfChanged(key: string, text: Phaser.GameObjects.Text, value: string | number): void {
    if (this.lastValues.get(key) !== value) {
      this.lastValues.set(key, value)
      text.setText(String(value))
    }
  }
}
