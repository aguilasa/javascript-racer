type ElementRef = string | HTMLElement | Document

function resolve(id: ElementRef): HTMLElement {
  if (id instanceof HTMLElement) return id
  if (id === document) return document.documentElement
  const el = document.getElementById(id as string)
  if (!el) throw new Error(`Element not found: ${id}`)
  return el
}

export const Dom = {

  get(id: string | HTMLElement): HTMLElement {
    if (id instanceof HTMLElement) return id
    const el = document.getElementById(id)
    if (!el) throw new Error(`Element not found: ${id}`)
    return el
  },

  set(id: string | HTMLElement, html: string): void {
    Dom.get(id).innerHTML = html
  },

  on(ele: ElementRef, type: string, fn: EventListenerOrEventListenerObject, capture?: boolean): void {
    resolve(ele).addEventListener(type, fn, capture)
  },

  un(ele: ElementRef, type: string, fn: EventListenerOrEventListenerObject, capture?: boolean): void {
    resolve(ele).removeEventListener(type, fn, capture)
  },

  show(ele: string | HTMLElement, type?: string): void {
    Dom.get(ele).style.display = (type ?? 'block')
  },

  blur(ev: Event): void {
    (ev.target as HTMLElement).blur()
  },

  addClassName(ele: string | HTMLElement, name: string): void {
    Dom.toggleClassName(ele, name, true)
  },

  removeClassName(ele: string | HTMLElement, name: string): void {
    Dom.toggleClassName(ele, name, false)
  },

  toggleClassName(ele: string | HTMLElement, name: string, on?: boolean): void {
    const el = Dom.get(ele)
    const classes = el.className.split(' ')
    const n = classes.indexOf(name)
    const shouldAdd = (typeof on === 'undefined') ? (n < 0) : on
    if (shouldAdd && (n < 0))
      classes.push(name)
    else if (!shouldAdd && (n >= 0))
      classes.splice(n, 1)
    el.className = classes.join(' ')
  },

  storage: window.localStorage as Storage | Record<string, string> || {} as Record<string, string>,

}
