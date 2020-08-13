import * as t from 'io-ts'
import * as Codec from './codec'
import localForage from 'localforage'
import { Eq } from 'fp-ts/lib/Eq'

export type Lead = t.TypeOf<typeof Codec.Lead>

export interface Dependencies<A> {
  state: A[]
  setState: React.Dispatch<React.SetStateAction<A[]>>
  socket: WebSocket
  localForage: typeof localForage
  decoder: t.Decoder<unknown, A>
  eq: Eq<A>
}
