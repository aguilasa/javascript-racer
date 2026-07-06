import { Dom } from './dom'

export class AssetLoader {
  loadImages(names: string[]): Promise<HTMLImageElement[]> {
    return new Promise((resolve) => {
      const result: HTMLImageElement[] = []
      let count = names.length

      const onload = () => {
        if (--count === 0) resolve(result)
      }

      for (let n = 0; n < names.length; n++) {
        const img = document.createElement('img')
        Dom.on(img, 'load', onload)
        img.src = 'images/' + names[n] + '.png'
        result[n] = img
      }
    })
  }
}
