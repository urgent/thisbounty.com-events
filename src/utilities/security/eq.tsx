import * as Type from './type'

export const Lead = {
  equals: (x: Type.Lead, y: Type.Lead) =>
    x.suit === y.suit && x.number === y.number
}
