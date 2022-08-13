//import {lookupArchive} from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import {BatchContext, BatchProcessorItem, SubstrateBatchProcessor} from "@subsquid/substrate-processor"
import {Store, TypeormDatabase} from "@subsquid/typeorm-store"
import {In} from "typeorm"
import {Account, Transfer, Token} from "./model"
import {TokensTransferEvent} from "./types/events"
import * as v1 from "./types/v1";
import * as v2 from "./types/v2";
import * as v3 from "./types/v3";
// import * as v6 from "./types/v6";
// import * as v10 from "./types/v10";
// import * as v15 from "./types/v15";
// import * as v17 from "./types/v17";
// import { CurrencyId_Token as CurrencyId_TokenV6 } from "./types/v6";
// import { CurrencyId_Token as CurrencyId_TokenV10 } from "./types/v10";
// import { CurrencyId_Token as CurrencyId_TokenV15 } from "./types/v15";
// import { CurrencyId_Token as CurrencyId_TokenV17 } from "./types/v17";

const processor = new SubstrateBatchProcessor()
    .setBatchSize(500)
    .setDataSource({
        // Lookup archive by the network name in the Subsquid registry
        //archive: lookupArchive("interlay", {release: "FireSquid"})
        archive: 'https://interlay.archive.subsquid.io/graphql'

        // Use archive created by archive/docker-compose.yml
        // archive: 'http://localhost:8888/graphql'
    })
    .addEvent('Tokens.Transfer', {
        data: {
            event: {
                args: true,
                extrinsic: {
                    hash: true,
                    fee: true
                }
            }
        }
    } as const)


type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchContext<Store, Item>


processor.run(new TypeormDatabase(), async ctx => {
    let transfersData = getTransfers(ctx)

    let accountIds = new Set<string>()
    for (let t of transfersData) {
        accountIds.add(t.from)
        accountIds.add(t.to)
    }

    let accounts = await ctx.store.findBy(Account, {id: In([...accountIds])}).then(accounts => {
        return new Map(accounts.map(a => [a.id, a]))
    })

    let transfers: Transfer[] = []

    for (let t of transfersData) {
        let {id, blockNumber, timestamp, extrinsicHash, amount, fee, token, comment} = t

        let from = getAccount(accounts, t.from)
        let to = getAccount(accounts, t.to)
        // @ts-ignore
        transfers.push(new Transfer({
            id,
            blockNumber,
            timestamp,
            extrinsicHash,
            from,
            to,
            amount,
            fee,
            // @ts-ignore
            token,
            comment
        }))
    }

    await ctx.store.save(Array.from(accounts.values()))
    await ctx.store.insert(transfers)
})


interface TransferEvent {
    id: string
    blockNumber: number
    timestamp: Date
    extrinsicHash?: string
    from: string
    to: string
    amount: bigint
    fee?: bigint
    token: string
    comment: string
}


function getTransfers(ctx: Ctx): TransferEvent[] {
    let transfers: TransferEvent[] = []
    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.name == "Tokens.Transfer") {
                // @ts-ignore
                let e = new TokensTransferEvent(ctx, item.event)
                let version:String
                let rec: {from: Uint8Array, to: Uint8Array, amount: bigint,
                    currencyId:v1.CurrencyId|v2.CurrencyId|v3.CurrencyId}
                if (e.isV1) {
                    let [currencyId, from, to, amount] = e.asV1
                    rec = {from, to, amount, currencyId}
                    version = '1'
                // } else if (e.isV2) {
                //     let {currencyId, from, to, amount} = e.asV2
                //     rec = {from, to, amount, currencyId}
                //     version = '2'
                } else {
                    // @ts-ignore
                    rec = e.asV3
                    version = '3'
                }
                const single_transfer = {
                    id: item.event.id,
                    blockNumber: block.header.height,
                    timestamp: new Date(block.header.timestamp),
                    extrinsicHash: item.event.extrinsic?.hash,
                    from: ss58.codec('interlay').encode(rec.from),
                    to: ss58.codec('interlay').encode(rec.to),
                    amount: rec.amount,
                    fee: item.event.extrinsic?.fee || 0n,
                    // @ts-ignore
                    token: Token[rec.currencyId.value.__kind],
                    comment: `${JSON.stringify(version)}`
                }
                // @ts-ignore
                if (rec.amount != 456621004566) {
                    transfers.push(single_transfer)
                    console.log(`Transfer: ${single_transfer.amount} ${single_transfer.token}`)
                }
            }
        }
    }
    return transfers
}


function getAccount(m: Map<string, Account>, id: string): Account {
    let acc = m.get(id)
    if (acc == null) {
        acc = new Account()
        acc.id = id
        m.set(id, acc)
    }
    return acc
}
