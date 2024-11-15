import express from "express";
import { Group } from "../models/interface";
import { getUser } from "../middleware/auth";
import { sendRes } from "./setup";
export async function peeBypass(req: express.Request, res: express.Response) {
    const { studentId, group }: { studentId: string, group: Group } = req.body
    const user = await getUser(req)
    if (!user) {
        sendRes(res, false)
        return
    }
    await user.updateOne({
        studentId,
        group,
        fridayActEn: true,
        role: 'pee',
        mode: 'pee'
    })
}
export async function petoBypass(req: express.Request, res: express.Response) {
    const { studentId, group }: { studentId: string, group: Group } = req.body
    const user = await getUser(req)
    if (!user) {
        sendRes(res, false)
        return
    }
    await user.updateOne({
        studentId,
        group,
        fridayActEn: true,
        role: 'peto',
        mode: 'pee'
    })
}
export async function nongBypass(req: express.Request, res: express.Response) {
    const { studentId }: { studentId: string } = req.body
    const user = await getUser(req)
    if (!user) {
        sendRes(res, false)
        return
    }
    await user.updateOne({
        studentId,
        fridayActEn: true,
    })
}
export async function adminBypass(req: express.Request, res: express.Response) {
    const { studentId, group }: { studentId: string, group: Group } = req.body
    const user = await getUser(req)
    if (!user) {
        sendRes(res, false)
        return
    }
    await user.updateOne({
        studentId,
        group,
        fridayActEn: true,
        role: 'admin',
        mode: 'pee'
    })
}