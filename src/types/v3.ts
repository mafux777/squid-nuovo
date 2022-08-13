import type {Result} from './support'

export type CurrencyId = CurrencyId_Token | CurrencyId_ForeignAsset

export interface CurrencyId_Token {
  __kind: 'Token'
  value: TokenSymbol
}

export interface CurrencyId_ForeignAsset {
  __kind: 'ForeignAsset'
  value: number
}

export type AccountId32 = Uint8Array

export type TokenSymbol = TokenSymbol_DOT | TokenSymbol_IBTC | TokenSymbol_INTR | TokenSymbol_KSM | TokenSymbol_KBTC | TokenSymbol_KINT

export interface TokenSymbol_DOT {
  __kind: 'DOT'
}

export interface TokenSymbol_IBTC {
  __kind: 'IBTC'
}

export interface TokenSymbol_INTR {
  __kind: 'INTR'
}

export interface TokenSymbol_KSM {
  __kind: 'KSM'
}

export interface TokenSymbol_KBTC {
  __kind: 'KBTC'
}

export interface TokenSymbol_KINT {
  __kind: 'KINT'
}
