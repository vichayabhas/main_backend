import express from 'express'
import { InterBaanBack, InterBaanFront, InterCampBack, InterCampFront, InterPartBack, InterPartFront, InterSize, MapObjectId, MyMap, Size, Id } from '../models/interface'
import mongoose from 'mongoose'


export function startSize(): Map<'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL', number> {
    const size: Map<'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL', number> = new Map()
    const s: ('S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL')[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL']
    s.forEach((e: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL') => {
        size.set(e, 0)

    })
    return size
}
export function swop(olds: Id | null, news: Id | null, array: Id[]): Id[] {
    if (!olds) {
        if (news) {
            array.push(news)
        }
        return array
    }
    const re = array.filter(e => {
        return e.toString().split(' ')[0].localeCompare(olds.toString().split(' ')[0])
    })
    if (news) {
        re.push(news)
    }
    return re
}
export function calculate(input: unknown | number | undefined, plus: | unknown | number | undefined, minus: unknown | number | undefined) {
    return (input as number) + (plus as number) - (minus as number)
}
export const resOk = { success: true }
export const resError = { success: false }
export function sendRes(res: express.Response, success: boolean) {
    res.status(success ? 200 : 400).json({ success })
}
export function sizeMapToJson(input: Map<'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL', number>): InterSize {
    const out: InterSize = {
        _id: null,
        sizeS: input.get('S') as number,
        sizeM: input.get('M') as number,
        sizeL: input.get('L') as number,
        sizeXL: input.get('XL') as number,
        sizeXXL: input.get('XXL') as number,
        size3XL: input.get('3XL') as number
    }
    return (out)
}
export function sizeJsonMod(size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL', count: number, input: InterSize): InterSize {
    switch (size) {
        case 'S': {
            input.sizeS = input.sizeS + count
            break
        }
        case 'M': {
            input.sizeM = input.sizeM + count
            break
        }
        case 'L': {
            input.sizeL = input.sizeL + count
            break
        }
        case 'XL': {
            input.sizeXL = input.sizeXL + count
            break
        }
        case 'XXL': {
            input.sizeXXL = input.sizeXXL + count
            break
        }
        case '3XL': {
            input.size3XL = input.size3XL + count
            break
        }
    }
    return input
}

export function mapBoolToArray(input: Map<Id, boolean>): Id[] {
    const out: Id[] = []
    input.forEach((v: boolean, k: Id) => {
        if (v) {
            out.push(k)
        }
    })
    return out

}
export function conBaanBackToFront(input: InterBaanBack): InterBaanFront {
    const {
        name,
        fullName,
        campId,
        peeIds,
        nongIds,
        nongHeathIssueIds,
        peeHeathIssueIds,
        nongShirtSize,
        peeShirtSize,
        songIds,
        peeModelIds,
        nongModelId,
        nongCampMemberCardIds,
        peeCampMemberCardIds,
        link,
        styleId,
        boySleepPlaceId,
        girlSleepPlaceId,
        mapCampMemberCardIdByUserId,
        normalPlaceId,
        _id,
        peeSleepIds,
        nongSleepIds,
        groupRef,
        chatIds,
        mdTime,
        peeChatIds,
        nongChatIds,
        nongSendMessage,
        nongHaveBottleIds,
        nongCampMemberCardHaveHeathIssueIds,
        peeHaveBottleIds,
        peeCampMemberCardHaveHeathIssueIds,
    } = input
    return ({
        name,
        fullName,
        campId,
        link,
        normalPlaceId,
        nongHeathIssueIds,
        nongIds,
        nongModelId,
        nongCampMemberCardIds,
        peeHeathIssueIds,
        peeIds,
        peeCampMemberCardIds,
        peeModelIds,
        peeShirtSize: sizeMapToJson(peeShirtSize),
        nongShirtSize: sizeMapToJson(nongShirtSize),
        songIds,
        styleId,
        boySleepPlaceId,
        girlSleepPlaceId,
        mapCampMemberCardIdByUserId: mapObjectIdToMyMap(mapCampMemberCardIdByUserId),
        _id,
        peeSleepIds,
        nongSleepIds,
        groupRef,
        chatIds,
        mdTime,
        peeChatIds,
        nongChatIds,
        nongSendMessage,
        nongHaveBottleIds,
        nongCampMemberCardHaveHeathIssueIds,
        peeHaveBottleIds,
        peeCampMemberCardHaveHeathIssueIds,
    })
}
export function conCampBackToFront(input: InterCampBack): InterCampFront {
    const {
        nameId,
        round,
        dateStart,
        dateEnd,
        boardIds,
        peeIds,
        nongIds,
        partIds,
        petoIds,
        authorizeIds,
        nongHeathIssueIds,
        peeHeathIssueIds,
        petoHeathIssueIds,
        dataLock,
        nongShirtSize,
        peeShirtSize,
        petoShirtSize,
        nongModelIds,
        peeModelIds,
        petoModelIds,
        nongPendingIds,                            /////////////i
        nongPassIds,                               ////////////////////i
        open,
        peePassIds,//<userId,partId>               ////////////////////////i
        songIds,
        nongSureIds,
        baanIds,
        nongCampMemberCardIds,
        peeCampMemberCardIds,
        petoCampMemberCardIds,
        link,
        allDone,
        lockChangePickup,
        pictureUrls,
        campStyleId,
        actionPlanIds,
        workItemIds,
        nongPaidIds,
        nongInterviewIds,                            ////////////////////////////////i
        registerModel,
        memberStructure: memberStructure,
        mapCampMemberCardIdByUserId,
        logoUrl,
        registerSheetLink,
        peeLock,
        outRoundIds,
        campName,
        _id,
        peeSleepIds,
        peeSleepModel,
        nongSleepIds,
        nongSleepModel,
        baanBoardId,
        partNameIds,
        partBoardId,
        partCoopId,
        partRegisterId,
        partPeeBaanId,
        peeDataLock,
        petoDataLock,
        groupName,
        actionPlanOffset,
        haveCloth,
        currentNong,
        currentPee,
        nongMapIdGtoL,
        peeMapIdGtoL,
        mdTime,
        partWelfareId,
        partMedId,
        partPlanId,
        allPetoChatIds,
        petoSleepIds,
        nongHaveBottleIds,
        nongCampMemberCardHaveHeathIssueIds,
        peeHaveBottleIds,
        peeCampMemberCardHaveHeathIssueIds,
        petoHaveBottleIds,
        petoCampMemberCardHaveHeathIssueIds,
        partPrStudioId,
        choiceQuestionIds,
        textQuestionIds,
        nongAnswerPackIds,
        peeAnswerPackIds,
        mapAnswerPackIdByUserId,
        peeAnswerIds,
        showCorrectAnswerAndScore,

    } = input
    return ({
        partIds,
        open,
        peeHeathIssueIds,
        peeIds,
        peeModelIds,
        peePassIds: mapObjectIdToMyMap(peePassIds),
        peeCampMemberCardIds,
        peeShirtSize: sizeMapToJson(peeShirtSize),
        petoHeathIssueIds,
        petoIds,
        petoModelIds,
        petoCampMemberCardIds,
        petoShirtSize: sizeMapToJson(petoShirtSize),
        pictureUrls,
        nameId,
        nongHeathIssueIds,
        nongIds,
        nongInterviewIds: mapStringToMyMap(nongInterviewIds),
        nongModelIds,
        nongPaidIds,
        nongPassIds: mapStringToMyMap(nongPassIds),
        nongPendingIds: mapStringToMyMap(nongPendingIds),
        nongCampMemberCardIds,
        nongShirtSize: sizeMapToJson(nongShirtSize),
        nongSureIds,
        registerModel,
        round,
        actionPlanIds,
        allDone,
        authorizeIds,
        baanIds,
        boardIds,
        campStyleId,
        link,
        lockChangePickup,
        dataLock,
        dateEnd,
        dateStart,
        memberStructure,
        workItemIds,
        songIds,
        partNameIds,
        logoUrl,
        mapCampMemberCardIdByUserId: mapObjectIdToMyMap(mapCampMemberCardIdByUserId),
        registerSheetLink,
        peeLock,
        outRoundIds,
        campName,
        _id,
        peeSleepIds,
        peeSleepModel,
        nongSleepIds,
        nongSleepModel,
        baanBoardId,
        partBoardId,
        partCoopId,
        partRegisterId,
        partPeeBaanId,
        groupName,
        peeDataLock,
        petoDataLock,
        actionPlanOffset,
        haveCloth,
        currentNong,
        currentPee,
        nongMapIdGtoL: mapStringToMyMap(nongMapIdGtoL),
        peeMapIdGtoL: mapStringToMyMap(peeMapIdGtoL),
        mdTime,
        partWelfareId,
        partMedId,
        partPlanId,
        allPetoChatIds,
        petoSleepIds,
        nongHaveBottleIds,
        nongCampMemberCardHaveHeathIssueIds,
        peeHaveBottleIds,
        peeCampMemberCardHaveHeathIssueIds,
        petoHaveBottleIds,
        petoCampMemberCardHaveHeathIssueIds,
        partPrStudioId,
        choiceQuestionIds,
        textQuestionIds,
        nongAnswerPackIds,
        peeAnswerPackIds,
        mapAnswerPackIdByUserId: mapObjectIdToMyMap(mapAnswerPackIdByUserId),
        peeAnswerIds,
        showCorrectAnswerAndScore,

    })
}
export function conPartBackToFront(input: InterPartBack): InterPartFront {
    const {
        nameId,
        campId,
        peeIds,
        petoIds,
        peeHeathIssueIds,
        petoHeathIssueIds,
        peeShirtSize,
        petoShirtSize,
        peeModelIds,
        petoModelId,
        peeCampMemberCardIds,
        petoCampMemberCardIds,
        actionPlanIds,
        workItemIds,
        mapCampMemberCardIdByUserId,
        placeId,
        partName,
        peeSleepIds,
        _id,
        chatIds,
        isAuth,
        petoSleepIds,
        peeHaveBottleIds,
        peeCampMemberCardHaveHeathIssueIds,
        petoHaveBottleIds,
        petoCampMemberCardHaveHeathIssueIds,
    } = input

    return ({
        actionPlanIds,
        workItemIds,
        campId,
        nameId,
        peeHeathIssueIds,
        peeIds,
        peeModelIds,
        peeCampMemberCardIds,
        peeShirtSize: sizeMapToJson(peeShirtSize),
        petoHeathIssueIds,
        petoIds,
        petoModelId,
        petoCampMemberCardIds,
        petoShirtSize: sizeMapToJson(petoShirtSize),
        placeId,
        mapCampMemberCardIdByUserId: mapObjectIdToMyMap(mapCampMemberCardIdByUserId),
        partName,
        peeSleepIds,
        _id,
        chatIds,
        isAuth,
        petoSleepIds,
        peeHaveBottleIds,
        peeCampMemberCardHaveHeathIssueIds,
        petoHaveBottleIds,
        petoCampMemberCardHaveHeathIssueIds,
    })
}
export function mapStringToMyMap(input: Map<Id, string | number>): MyMap[] {
    const out: MyMap[] = []
    input.forEach((v: string | number, key: Id) => {
        out.push({ key, value: v.toString() })
    })
    return out
}
export function mapObjectIdToMyMap(input: Map<Id, Id>): MapObjectId[] {
    const out: MapObjectId[] = []
    input.forEach((value: Id, key: Id) => {
        out.push({ key, value })
    })
    return out
}
export function isInTime(start: Date, end: Date): boolean {
    const now = new Date(Date.now())
    return (now > start && now < end)
}
// export function plusActionPlan(input: InterActionPlan, minute: number): InterActionPlan {
//     const millisecond = minute * 1000 * 60
//     const {
//         start,
//         end,
//         partId,
//         placeIds,
//         action,
//         headId,
//         body,
//         _id,
//         partName
//     } = input
//     return ({
//         start: new Date(start.getTime() + millisecond),
//         end: new Date(end.getTime() + millisecond),
//         partId,
//         placeIds,
//         action,
//         headId,
//         body,
//         _id,
//         partName
//     })
// }
export const backendUrl = 'http://localhost:5000'
export const userPath = 'api/v1/auth'
export function removeDuplicate(input: Id[], compare: Id[]): Id[] {
    return input.filter((e) => {
        return !compare.map((v)=>v.toString()).includes(e.toString())
    })
}
export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    if (value === null || value === undefined) return false;
    return true;
}


import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport'


export function sendingEmail(email: string, text: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'arifmini64@gmail.com',
            pass: 'mtekbmbboehothcy',
        },
    });
    const mailOptions: MailOptions = {
        from: 'arifmini64@gmail.com',
        to: email,
        subject: "verify email",
        text,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email sending failed:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}
export const removeDups = (
    input: Id[]
): Id[] => {
    const arr = input.map((e) => (e.toString().split(' ')[0]))
    const unique = arr.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
    })
    return unique.map((e) => stringToId(e));
}
export function jsonToMapSize(input: InterSize): Map<Size, number> {
    const output = new Map<Size, number>()
    output.set('S', input.sizeS)
    output.set('M', input.sizeM)
    output.set('L', input.sizeL)
    output.set('XL', input.sizeXL)
    output.set('XXL', input.sizeXXL)
    output.set('3XL', input.size3XL)
    return output
}
export function startJsonSize(): InterSize {
    return {
        sizeS: 0,
        sizeM: 0,
        sizeL: 0,
        sizeXL: 0,
        sizeXXL: 0,
        size3XL: 0,
        _id: null
    }
}
export function ifIsTrue<T>(input: boolean, id: T, array1: T[], array2?: T[], array3?: T[]) {
    if (input) {
        array1.push(id)
        if (array2) {
            array2.push(id)
        }
        if (array3) {
            array3.push(id)
        }
    }
    return array1
}
export function ifIsHave(input: Id | null, array: Id[]) {
    if (input) {
        array.push(input)
    }
    return array
}
export function ifIsPlus(logic: boolean, input: number): number {
    if (logic) {
        return input + 1
    } else {
        return input
    }
}
export function getSystemMode() {
    return process.env.MODE
}
export function getEndEmail() {
    return process.env.END_EMAIL
}
export function stringToId(input: string) {
    return new mongoose.Types.ObjectId(input)
}
export const arrayObjectId = {
    type: [mongoose.Schema.ObjectId],
    default: []
} as const
export const dataString = {
    type: String,
    required: true,
} as const
export const dataNumber = {
    type: Number,
    default: 0
} as const
export const dataMap = {
    type: Map,
    default: new Map()
} as const
export const dataId = {
    type: mongoose.Schema.ObjectId,
    required: true
} as const
export const dataDate = {
    type: Date,
    required: true
} as const
export const dataSize = {// size    count
    type: Map,
    default: startSize()
} as const