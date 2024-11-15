import Camp from "../models/Camp";
import { sendRes, stringToId, swop } from "./setup";
import express from "express";
import { getUser } from "../middleware/auth";
import { changePartRaw, getImpotentPartIdBCRP } from "./camp";
import { Id } from "../models/interface";
export async function interview(req: express.Request, res: express.Response) {
    const { members, campId } = req.body
    const i = await interviewRaw(members, campId)
    if (i == 0) {
        sendRes(res, false)
        return
    }
   // const o=5
    res.status(200).json({ count: i })
}
async function interviewRaw(members: Id[], campId: Id) {
    const camp = await Camp.findById(campId)
    if (!camp) {
        return 0
    }
    let i = 0
    while (i < members.length) {
        camp.nongInterviewIds.set(members[i].toString(), camp.nongPendingIds.get(members[i].toString()))
        camp.nongPendingIds.delete(members[i++].toString())
    }
    await camp.updateOne({
        nongPendingIds: camp.nongPendingIds,
        nongInterviewIds: camp.nongInterviewIds
    })
    return i
}
async function passRaw(members: Id[], campId: Id) {
    const camp = await Camp.findById(campId)
    if (!camp) {
        return 0
    }
    let i = 0
    while (i < members.length) {
        camp.nongPassIds.set(members[i].toString(), camp.nongInterviewIds.get(members[i].toString()))
        camp.nongInterviewIds.delete(members[i++].toString())
        if (camp.registerModel === 'noPaid') {
            //camp.nongPaidIds.push(members[i - 1])
        }
    }
    await camp.updateOne({
        nongPassIds: camp.nongPassIds,
        nongInterviewIds: camp.nongInterviewIds,
        //nongPaidIds:camp.nongPaidIds
    })
    return i
}
export async function paid(req: express.Request, res: express.Response) {
    const user = await getUser(req)
    const camp = await Camp.findById(req.params.id)
    if (!camp || !user || !camp.nongPassIds.has(user._id.toString())) {
        sendRes(res, false)
        return
    }
    if (camp.registerModel === 'noPaid') {
        camp.nongPassIds.delete(user._id.toString())
        await camp.updateOne({
            nongSureIds: swop(null, user._id, camp.nongSureIds),
            nongPassIds: camp.nongPassIds
        })

    } else {
        await camp.updateOne({ nongPaidIds: swop(null, user._id, camp.nongPaidIds) })
    }
}
export async function sure(req: express.Request, res: express.Response) {
    const { members, campId }: { members: Id[], campId: Id } = req.body
    const camp = await Camp.findById(campId)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const nongSureIds = camp.nongSureIds
    let nongPaidIds=camp.nongPaidIds

    let i = 0
    while (i < members.length) {
        if (!camp.nongPaidIds.includes(stringToId(members[i].toString()))) {
            i++
            //console.log('jjjjjjjjjjjjjjjjjjjjjjjj')
            continue
        }
        camp.nongPassIds.delete(members[i].toString())
        nongPaidIds = swop(members[i], null, nongPaidIds)
        nongSureIds.push(members[i++])
    }
    await camp.updateOne({
        nongPaidIds,
        nongSureIds,
        nongPassIds: camp.nongPassIds
    })
    //console.log(members)
    //console.log(camp)
    res.status(200).json({ count: i })

}
export async function pass(req: express.Request, res: express.Response) {
    const { campId, members } = req.body
    const camp = await Camp.findById(campId)
    if (!camp) {
        sendRes(res, false)
        return
    }
    if (camp.registerModel !== 'all') {
        await interviewRaw(members, campId)
    }
    const i = await passRaw(members, campId)
    if (i == 0) {
        sendRes(res, false)
        return
    }
    res.status(200).json({ count: i })
}
export async function kickPee(req: express.Request, res: express.Response) {
    const { campId, members } = req.body
    const camp = await Camp.findById(campId)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const im = await getImpotentPartIdBCRP(camp._id)
    await changePartRaw(members, im[3])
    sendRes(res, true)
}
export async function kickNong(req: express.Request, res: express.Response) {
    const { members, campId }: { members: Id[], campId: Id } = req.body
    const camp = await Camp.findById(campId)
    if (!camp) {
        sendRes(res, false)
        return
    }
    let i = 0
    let { nongPaidIds } = camp
    while (i < members.length) {
        camp.nongInterviewIds.delete(members[i].toString())
        camp.nongPendingIds.delete(members[i].toString())
        camp.nongPassIds.delete(members[i].toString())
        camp.outRoundIds.push(members[i])
        nongPaidIds = swop(members[i++], null, nongPaidIds)

    }
    await camp.updateOne({
        nongPendingIds: camp.nongPendingIds,
        nongInterviewIds: camp.nongInterviewIds,
        nongPaidIds,
        nongPassIds: camp.nongPassIds,
        outRoundIds: camp.outRoundIds
    })
    sendRes(res, true)
}
