import * as t from 'io-ts'

export const Lead = t.type({
  suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
  number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.Int]),
  bounty: t.Int
})
