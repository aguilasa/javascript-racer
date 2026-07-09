import * as Phaser from 'phaser'
import { RacerEngine } from './RacerEngine'

// Ranges matching v4.final.html slider attributes
const SLIDER_CONFIGS = [
  { key: 'roadWidth'    as const, label: 'Road Width',    min: 500,  max: 3000, step: 10  },
  { key: 'cameraHeight' as const, label: 'Cam Height',    min: 500,  max: 5000, step: 10  },
  { key: 'drawDistance' as const, label: 'Draw Dist',     min: 100,  max: 500,  step: 1   },
  { key: 'fieldOfView'  as const, label: 'Field of View', min: 80,   max: 140,  step: 1   },
  { key: 'fogDensity'   as const, label: 'Fog Density',   min: 0,    max: 50,   step: 1   },
] as const

type SliderKey = (typeof SLIDER_CONFIGS)[number]['key']

const LANES_OPTIONS = [1, 2, 3, 4]

const RESOLUTION_OPTIONS = [
  { label: 'fine',   width: 1280, height: 960 },
  { label: 'high',   width: 1024, height: 768 },
  { label: 'medium', width: 640,  height: 480 },
  { label: 'low',    width: 480,  height: 360 },
] as const

// Layout constants
const PANEL_X_RIGHT_MARGIN = 10
const PANEL_Y_TOP_MARGIN   = 10
const PANEL_WIDTH          = 230
const ROW_HEIGHT           = 28
const LABEL_WIDTH          = 90
const VALUE_WIDTH          = 36
const TRACK_WIDTH          = PANEL_WIDTH - LABEL_WIDTH - VALUE_WIDTH - 16
const HANDLE_SIZE          = 14
const PANEL_PAD            = 8
const HEADER_HEIGHT        = 34
const STYLE_LABEL: Phaser.Types.GameObjects.Text.TextStyle = { fontSize: '13px', color: '#eee' }
const STYLE_VALUE: Phaser.Types.GameObjects.Text.TextStyle = { fontSize: '13px', color: '#ff0' }
const STYLE_BTN:   Phaser.Types.GameObjects.Text.TextStyle = { fontSize: '14px', color: '#fff', backgroundColor: '#333', padding: { x: 5, y: 2 } }

export class TweakUi {
  private container: Phaser.GameObjects.Container
  private panelBg: Phaser.GameObjects.Rectangle
  private toggleBtn: Phaser.GameObjects.Text
  private muteBtn: Phaser.GameObjects.Text
  private isOpen = false
  private fullPanelH = 0

  // Rows hidden when panel is collapsed
  private rows: Phaser.GameObjects.GameObject[] = []

  // Music ref (set by Game after construction)
  private music: Phaser.Sound.BaseSound | null = null

  // Callback for resolution changes (called with width, height)
  private onResolutionChange: (width: number, height: number) => void

  constructor(
    private scene: Phaser.Scene,
    private engine: RacerEngine,
    onResolutionChange: (width: number, height: number) => void,
  ) {
    this.onResolutionChange = onResolutionChange
    const sw = scene.scale.width

    // Panel background (initially sized to header only)
    this.panelBg = scene.add.rectangle(0, 0, PANEL_WIDTH, HEADER_HEIGHT, 0x000000, 0.75)
    this.panelBg.setOrigin(0, 0)

    // Toggle gear button (top-left of panel)
    this.toggleBtn = scene.add.text(PANEL_PAD, 6, '⚙ Tweak', { fontSize: '15px', color: '#fff' })
    this.toggleBtn.setInteractive({ useHandCursor: true })
    this.toggleBtn.on('pointerdown', () => this.toggle())

    // Mute button (top-right inside header)
    const isMuted = localStorage.getItem('muted') === 'true'
    this.muteBtn = scene.add.text(PANEL_WIDTH - 46, 6, isMuted ? '🔇' : '🔊', { fontSize: '15px', color: '#fff' })
    this.muteBtn.setInteractive({ useHandCursor: true })
    this.muteBtn.on('pointerdown', () => this.handleMute())

    // Build rows (created hidden initially)
    let rowY = HEADER_HEIGHT + 2

    // Lanes stepper row
    rowY = this.createStepperRow(rowY, 'Lanes', LANES_OPTIONS, LANES_OPTIONS.indexOf(engine.lanes))

    // Resolution stepper row
    const currentResIndex = RESOLUTION_OPTIONS.findIndex(r => r.width === engine.width && r.height === engine.height)
    rowY = this.createResolutionRow(rowY, RESOLUTION_OPTIONS, currentResIndex)

    // Slider rows
    for (const cfg of SLIDER_CONFIGS) {
      rowY = this.createSliderRow(rowY, cfg.label, cfg.key, cfg.min, cfg.max, (engine as any)[cfg.key] as number)
    }

    const totalH = rowY + PANEL_PAD
    this.fullPanelH = totalH
    this.panelBg.setSize(PANEL_WIDTH, totalH)

    // Group everything into a container anchored to top-right
    this.container = scene.add.container(sw - PANEL_WIDTH - PANEL_X_RIGHT_MARGIN, PANEL_Y_TOP_MARGIN)
    this.container.add(this.panelBg)
    this.container.add(this.toggleBtn)
    this.container.add(this.muteBtn)
    for (const obj of this.rows) this.container.add(obj)
    // Sprites/carros/player usam setDepth(100000 - cameraZ) (SceneryRenderer/TrafficRenderer/
    // Game.renderPlayer), chegando perto de 100000 para objetos próximos da câmera — o painel
    // precisa ficar acima disso para não renderizar atrás deles.
    this.container.setDepth(1_000_000)

    // Start collapsed
    this.setRowsVisible(false)
    this.panelBg.setSize(PANEL_WIDTH, HEADER_HEIGHT)
  }

  setMusic(music: Phaser.Sound.BaseSound): void {
    this.music = music
    // Sync mute icon to current state
    this.muteBtn.setText((music as any).mute ? '🔇' : '🔊')
  }

  reposition(width: number): void {
    this.container.setX(width - PANEL_WIDTH - PANEL_X_RIGHT_MARGIN)
  }

  private handleMute(): void {
    if (!this.music) return
    const newMuted = !(this.music as any).mute
    ;(this.music as any).setMute(newMuted)
    localStorage.setItem('muted', String(newMuted))
    this.muteBtn.setText(newMuted ? '🔇' : '🔊')
  }

  private toggle(): void {
    this.isOpen = !this.isOpen
    this.setRowsVisible(this.isOpen)
    if (this.isOpen) {
      this.panelBg.setSize(PANEL_WIDTH, this.fullPanelH)
    } else {
      this.panelBg.setSize(PANEL_WIDTH, HEADER_HEIGHT)
    }
  }

  private setRowsVisible(visible: boolean): void {
    for (const obj of this.rows) {
      if ('setVisible' in obj) (obj as Phaser.GameObjects.GameObject & { setVisible(v: boolean): void }).setVisible(visible)
    }
  }

  // -------------------------------------------------------------------------
  // Stepper row (for Lanes: 1/2/3/4)
  // -------------------------------------------------------------------------
  private stepperIndex = 0

  private createStepperRow(y: number, label: string, options: readonly number[], initialIndex: number): number {
    this.stepperIndex = initialIndex

    const labelText = this.scene.add.text(PANEL_PAD, y + 6, label + ':', STYLE_LABEL)
    const prevBtn   = this.scene.add.text(LABEL_WIDTH + PANEL_PAD, y + 2, '◀', STYLE_BTN)
    const valText   = this.scene.add.text(LABEL_WIDTH + PANEL_PAD + 26, y + 6, String(options[initialIndex]), STYLE_VALUE)
    const nextBtn   = this.scene.add.text(LABEL_WIDTH + PANEL_PAD + 60, y + 2, '▶', STYLE_BTN)

    prevBtn.setInteractive({ useHandCursor: true })
    prevBtn.on('pointerdown', () => {
      this.stepperIndex = Math.max(0, this.stepperIndex - 1)
      valText.setText(String(options[this.stepperIndex]))
      this.engine.applyOptions({ lanes: options[this.stepperIndex] })
    })

    nextBtn.setInteractive({ useHandCursor: true })
    nextBtn.on('pointerdown', () => {
      this.stepperIndex = Math.min(options.length - 1, this.stepperIndex + 1)
      valText.setText(String(options[this.stepperIndex]))
      this.engine.applyOptions({ lanes: options[this.stepperIndex] })
    })

    this.rows.push(labelText, prevBtn, valText, nextBtn)
    return y + ROW_HEIGHT
  }

  // -------------------------------------------------------------------------
  // Resolution stepper row (fine/high/medium/low)
  // -------------------------------------------------------------------------
  private resolutionIndex = 0

  private createResolutionRow(y: number, options: readonly { label: string; width: number; height: number }[], initialIndex: number): number {
    this.resolutionIndex = initialIndex

    const labelText = this.scene.add.text(PANEL_PAD, y + 6, 'Res:', STYLE_LABEL)
    const prevBtn   = this.scene.add.text(LABEL_WIDTH + PANEL_PAD, y + 2, '◀', STYLE_BTN)
    const valText   = this.scene.add.text(LABEL_WIDTH + PANEL_PAD + 26, y + 6, options[initialIndex].label, STYLE_VALUE)
    const nextBtn   = this.scene.add.text(LABEL_WIDTH + PANEL_PAD + 60, y + 2, '▶', STYLE_BTN)

    prevBtn.setInteractive({ useHandCursor: true })
    prevBtn.on('pointerdown', () => {
      this.resolutionIndex = Math.max(0, this.resolutionIndex - 1)
      valText.setText(options[this.resolutionIndex].label)
      this.onResolutionChange(options[this.resolutionIndex].width, options[this.resolutionIndex].height)
    })

    nextBtn.setInteractive({ useHandCursor: true })
    nextBtn.on('pointerdown', () => {
      this.resolutionIndex = Math.min(options.length - 1, this.resolutionIndex + 1)
      valText.setText(options[this.resolutionIndex].label)
      this.onResolutionChange(options[this.resolutionIndex].width, options[this.resolutionIndex].height)
    })

    this.rows.push(labelText, prevBtn, valText, nextBtn)
    return y + ROW_HEIGHT
  }

  // -------------------------------------------------------------------------
  // Slider row (for continuous numeric fields)
  // -------------------------------------------------------------------------
  private createSliderRow(
    y: number,
    label: string,
    key: SliderKey,
    min: number,
    max: number,
    initialValue: number,
  ): number {
    const trackX = LABEL_WIDTH + PANEL_PAD
    const trackY = y + ROW_HEIGHT / 2

    const labelText = this.scene.add.text(PANEL_PAD, y + 6, label + ':', STYLE_LABEL)

    // Track
    const track = this.scene.add.rectangle(trackX + TRACK_WIDTH / 2, trackY, TRACK_WIDTH, 4, 0x888888)
    track.setOrigin(0.5, 0.5)

    // Handle
    const ratio  = (initialValue - min) / (max - min)
    const handleX = trackX + ratio * TRACK_WIDTH
    const handle  = this.scene.add.rectangle(handleX, trackY, HANDLE_SIZE, HANDLE_SIZE, 0xffffff)
    handle.setOrigin(0.5, 0.5)
    handle.setInteractive({ useHandCursor: true, draggable: true })
    this.scene.input.setDraggable(handle)

    // Value label
    const valueText = this.scene.add.text(trackX + TRACK_WIDTH + 6, y + 6, String(Math.round(initialValue)), STYLE_VALUE)

    // For a GameObject with a parentContainer, Phaser's 'drag' event already reports dragX in
    // the container's local space (InputPlugin#processDragEvents adds the delta to
    // input.dragStartX, itself local) — do NOT subtract this.container.x again, or the value
    // always clamps to the track minimum regardless of where the pointer actually is.
    handle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const clampedX = Phaser.Math.Clamp(dragX, trackX, trackX + TRACK_WIDTH)
      handle.setX(clampedX)
      const t = (clampedX - trackX) / TRACK_WIDTH
      const value = Math.round(min + t * (max - min))
      valueText.setText(String(value))
      this.engine.applyOptions({ [key]: value } as Parameters<RacerEngine['applyOptions']>[0])
    })

    this.rows.push(labelText, track, handle, valueText)
    return y + ROW_HEIGHT
  }
}
