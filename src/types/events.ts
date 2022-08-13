import assert from 'assert'
import {Chain, ChainContext, EventContext, Event, Result} from './support'
import * as v1 from './v1'
import * as v2 from './v2'
import * as v3 from './v3'

export class TokensTransferEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Tokens.Transfer')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Transfer succeeded. \[currency_id, from, to, value\]
   */
  get isV1(): boolean {
    return this._chain.getEventHash('Tokens.Transfer') === 'fdaae151bb8b36a8d8ad740d8c981614f3554e661a6028bab9b8ca624adaac32'
  }

  /**
   * Transfer succeeded. \[currency_id, from, to, value\]
   */
  get asV1(): [v1.CurrencyId, v1.AccountId32, v1.AccountId32, bigint] {
    assert(this.isV1)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Transfer succeeded.
   */
  get isV2(): boolean {
    return this._chain.getEventHash('Tokens.Transfer') === '41417e5ccc760096c9529f3ff9dcfe27e94b23a733432b671ed451e2ff362dcc'
  }

  /**
   * Transfer succeeded.
   */
  get asV2(): {currencyId: v2.CurrencyId, from: v2.AccountId32, to: v2.AccountId32, amount: bigint} {
    assert(this.isV2)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Transfer succeeded.
   */
  get isV3(): boolean {
    return this._chain.getEventHash('Tokens.Transfer') === '7e7dbd0d1749f3d1ce62a6cb731a143be6c8c24d291fdd7dc24892ff941ffe3b'
  }

  /**
   * Transfer succeeded.
   */
  get asV3(): {currencyId: v3.CurrencyId, from: v3.AccountId32, to: v3.AccountId32, amount: bigint} {
    //assert(this.isV3)
    return this._chain.decodeEvent(this.event)
  }
}
