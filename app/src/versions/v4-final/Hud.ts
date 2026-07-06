import { Dom } from '../../core/dom';

export class Hud {
  private lastValues = new Map<string, string | number>();
  private speedDom: HTMLElement;
  private currentLapTimeDom: HTMLElement;
  private lastLapTimeDom: HTMLElement;
  private fastLapTimeDom: HTMLElement;

  constructor() {
    this.speedDom = Dom.get('speed_value');
    this.currentLapTimeDom = Dom.get('current_lap_time_value');
    this.lastLapTimeDom = Dom.get('last_lap_time_value');
    this.fastLapTimeDom = Dom.get('fast_lap_time_value');
  }

  updateSpeed(speed: number, maxSpeed: number): void {
    const value = Math.round(speed / maxSpeed * 500 / 5) * 5;
    this.setIfChanged('speed', this.speedDom, value);
  }

  updateCurrentLapTime(seconds: number): void {
    const value = this.formatTime(seconds);
    this.setIfChanged('current_lap_time', this.currentLapTimeDom, value);
  }

  onLapComplete(lapTime: number): void {
    const value = this.formatTime(lapTime);
    this.setIfChanged('last_lap_time', this.lastLapTimeDom, value);

    const fastLapTime = parseFloat(Dom.storage.fast_lap_time || '0');
    if (!fastLapTime || lapTime < fastLapTime) {
      Dom.storage.fast_lap_time = String(lapTime);
      this.setIfChanged('fast_lap_time', this.fastLapTimeDom, value);
      Dom.addClassName(this.fastLapTimeDom, 'fastest');
      Dom.addClassName(this.lastLapTimeDom, 'fastest');
    } else {
      Dom.removeClassName(this.fastLapTimeDom, 'fastest');
      Dom.removeClassName(this.lastLapTimeDom, 'fastest');
    }
  }

  private formatTime(dt: number): string {
    const minutes = Math.floor(dt / 60);
    const seconds = Math.floor(dt - minutes * 60);
    const tenths = Math.floor(10 * (dt - Math.floor(dt)));
    if (minutes > 0) {
      return minutes + '.' + (seconds < 10 ? '0' : '') + seconds + '.' + tenths;
    } else {
      return seconds + '.' + tenths;
    }
  }

  private setIfChanged(key: string, dom: HTMLElement, value: string | number): void {
    if (this.lastValues.get(key) !== value) {
      this.lastValues.set(key, value);
      Dom.set(dom, String(value));
    }
  }
}
