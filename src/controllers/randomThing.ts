import { getUser } from "../middleware/auth";
import Baan from "../models/Baan";
import Camp from "../models/Camp"
import Song from "../models/Song"
import User from "../models/User"
import express from "express";
import { getEndEmail, getSystemMode, resError, resOk, sendRes, stringToId, swop } from "./setup";
import LostAndFound from "../models/LostAndFound";
import Building from "../models/Building";
import Place from "../models/Place";
import NongCamp from "../models/NongCamp";
import { ChatReady, CreateBaanChat, CreateNongChat, CreatePeeChat, EditChat, Id, InterLostAndFound, InterPlace, Mode, RoleCamp, ShowChat, ShowLostAndFound, ShowPlace, TypeChat } from "../models/interface";
import PeeCamp from "../models/PeeCamp";
import PetoCamp from "../models/PetoCamp";
import Part from "../models/Part";
import CampMemberCard from "../models/CampMemberCard";
import Chat from "../models/Chat";
import TimeOffset from "../models/TimeOffset";
// export async function addLikeSong
// export async function getNongLikeSong
// export async function getPeeLikeSong
// export async function getPetoLikeSong
// export async function getAllCampLikeSong
// export async function addBaanSong
// export async function removeBaanSong
//*export async function addLostAndFound
// export async function deleteLostAndFound
//*export async function getLostAndFounds
// export async function getLostAndFound
//*export async function getAllBuilding
//*export async function createPlace
// export async function saveDeletePlace
//*export async function createBuilding
// export async function saveDeleteBuilding
//*export async function getPlaces
//*export async function getPlace
//*export async function getBuilding
//*export async function getShowPlace
//*export async function createPartChat
//*export async function getShowChatFromChatIds
// export async function editChat
// export async function deleteChat
//*export async function deleteChatRaw
//*export async function createNongChat
//*export async function createPeeBaanChat
//*export async function createNongBaanChat
//*export async function getAllChatFromCampId
//*export async function getPartChat
//*export async function getNongBaanChat
//*export async function getPeeBaanChat
//*export async function getNongChat
//*export async function getSystemInfo
//*export async function getPartPeebaanChat
export async function addLikeSong(req: express.Request, res: express.Response) {
    const { songIds }: { songIds: string[] } = req.body
    const user = await getUser(req)
    if (!user) {
        sendRes(res, false)
        return
    }
    let i = 0
    while (i < songIds.length) {
        const song = await Song.findById(songIds[i++])
        if (!song) {
            continue
        }
        await song.updateOne({ userLikeIds: swop(null, user._id, song.userLikeIds) })
        user.likeSongIds.push(song?._id)
    }
    await user.updateOne({ likeSongIds: user.likeSongIds })
    res.status(200).json({
        success: true
    })
}
async function getAllSong() {
    const songs = await Song.find()
    const map: Map<Id, number> = new Map
    let i = 0
    while (i < songs.length) {
        map.set(songs[i++]._id, 0)
    }
    return map
}
export async function getNongLikeSong(req: express.Request, res: express.Response) {
    const camp = await Camp.findById(req.params.id)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const songList: Map<Id, number> = await getAllSong()
    let i = 0
    while (i < camp.nongIds.length) {
        const user = await User.findById(camp.nongIds[i++])
        if (!user) {
            continue
        }
        let j = 0
        while (j < user.likeSongIds.length) {
            const songId = user.likeSongIds[j++]
            songList.set(songId, songList.get(songId) as number + 1)
        }
    }
    res.status(200).json({ songList })
}
export async function getPeeLikeSong(req: express.Request, res: express.Response) {
    const camp = await Camp.findById(req.params.id)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const songList: Map<Id, number> = await getAllSong()
    let i = 0
    while (i < camp.peeIds.length) {
        const user = await User.findById(camp.peeIds[i++])
        if (!user) {
            continue
        }
        let j = 0
        while (j < user.likeSongIds.length) {
            const songId = user.likeSongIds[j++]
            songList.set(songId, songList.get(songId) as number + 1)
        }
    }
    res.status(200).json({ songList })
}
export async function getPetoLikeSong(req: express.Request, res: express.Response) {
    const camp = await Camp.findById(req.params.id)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const songList: Map<Id, number> = await getAllSong()
    let i = 0
    while (i < camp.petoIds.length) {
        const user = await User.findById(camp.petoIds[i++])
        if (!user) {
            continue
        }
        let j = 0
        while (j < user.likeSongIds.length) {
            const songId = user.likeSongIds[j++]
            songList.set(songId, songList.get(songId) as number + 1)
        }
    }
    res.status(200).json({ songList })
}
export async function getAllCampLikeSong(req: express.Request, res: express.Response) {
    const camp = await Camp.findById(req.params.id)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const songList: Map<Id, number> = await getAllSong()
    let i = 0
    while (i < camp.nongIds.length) {
        const user = await User.findById(camp.nongIds[i++])
        if (!user) {
            continue
        }
        let j = 0
        while (j < user.likeSongIds.length) {
            const songId = user.likeSongIds[j++]
            songList.set(songId, songList.get(songId) as number + 1)
        }
    }
    while (i < camp.peeIds.length) {
        const user = await User.findById(camp.peeIds[i++])
        if (!user) {
            continue
        }
        let j = 0
        while (j < user.likeSongIds.length) {
            const songId = user.likeSongIds[j++]
            songList.set(songId, songList.get(songId) as number + 1)
        }
    }
    while (i < camp.petoIds.length) {
        const user = await User.findById(camp.petoIds[i++])
        if (!user) {
            continue
        }
        let j = 0
        while (j < user.likeSongIds.length) {
            const songId = user.likeSongIds[j++]
            songList.set(songId, songList.get(songId) as number + 1)
        }
    }
    res.status(200).json({ songList })
}
export async function addBaanSong(req: express.Request, res: express.Response) {
    const { baanId, songIds }: { baanId: string, songIds: string[] } = req.body
    const baan = await Baan.findById(baanId)
    if (!baan) {
        return res.status(400).json({ success: false })
    }
    let i = 0
    while (i < songIds.length) {
        const song = await Song.findById(songIds[i++])
        if (song) {
            baan.songIds.push(song._id)
            await song.updateOne({ baanIds: swop(null, baan._id, song.baanIds) })
        }
    }
    await baan.updateOne({ songIds: baan.songIds })
    res.status(200).json({ success: true })
}
export async function removeBaanSong(req: express.Request, res: express.Response) {
    const { baanId, songId } = req.body
    const baan = await Baan.findById(baanId)
    const song = await Song.findById(songId)
    if (!baan || !song) {
        return res.status(400).json(resError)
    }
    await baan.updateOne({ songIds: swop(song._id, null, baan.songIds) })
    await song.updateOne({ baanIds: swop(baan._id, null, song.baanIds) })
    res.status(200).json(resOk)
}
export async function addLostAndFound(req: express.Request, res: express.Response) {
    const {
        campId,
        type,
        name,
        detail,
        placeId,
    } = req.body
    const user = await getUser(req)
    const buildingId = placeId ? (await Place.findById(placeId))?.buildingId : null
    const place = placeId ? await Place.findById(placeId) : null
    if (!user) {
        sendRes(res, false)
        return
    }
    const lostAndFound = await LostAndFound.create({ campId, type, name, detail, userId: user._id, placeId, buildingId })
    await user.updateOne({ lostAndFoundIds: swop(null, lostAndFound._id, user.lostAndFoundIds) })
    if (campId) {
        const camp = await Camp.findById(campId)
        await camp?.updateOne({ lostAndFoundIds: swop(null, lostAndFound._id, camp.lostAndFoundIds) })
    }
    if (place) {
        await place.updateOne({ lostAndFoundIds: swop(null, lostAndFound._id, place.lostAndFoundIds) })
        const building = await Building.findById(place.buildingId)
        await building?.updateOne({ lostAndFoundIds: swop(null, lostAndFound._id, building.lostAndFoundIds) })
    }

    res.status(201).json({})
}
export async function deleteLostAndFound(req: express.Request, res: express.Response) {
    const user = await getUser(req)
    const lostAndFound = await LostAndFound.findById(req.params.id)
    if (!lostAndFound || !user) {
        sendRes(res, false)
        return
    }
    const camp = await Camp.findById(lostAndFound.campId)
    if (!user || (user.role != 'admin' && (lostAndFound.userId !== (user._id)) && (camp ? !user.authPartIds.includes(camp.partBoardId as Id) && !user.authPartIds.includes(camp.partRegisterId as Id) : true) && !camp?.boardIds.includes(user._id))) {
        res.status(403).json(resError)
    }
    const owner = await User.findById(lostAndFound.userId)
    const place = await Place.findById(lostAndFound.placeId)
    const building = await Building.findById(lostAndFound?.buildingId)
    await owner?.updateOne({ lostAndFoundIds: swop(lostAndFound._id, null, owner.lostAndFoundIds) })
    await place?.updateOne({ lostAndFoundIds: swop(lostAndFound._id, null, place.lostAndFoundIds) })
    await building?.updateOne({ lostAndFoundIds: swop(lostAndFound._id, null, building.lostAndFoundIds) })
    if (camp) {
        camp.updateOne({ lostAndFoundIds: swop(lostAndFound._id, null, camp.lostAndFoundIds) })
    }
    await lostAndFound.deleteOne()
    sendRes(res, true)
}
export async function getLostAndFounds(req: express.Request, res: express.Response) {
    const user = await getUser(req)
    if (!user) {
        sendRes(res, false)
        return
    }
    let out: InterLostAndFound[] = []
    let i = 0
    if (user.fridayActEn) {
        out = await LostAndFound.find()
    } else {
        while (i < user.nongCampIds.length) {
            const nongCamp = await NongCamp.findById(user.nongCampIds[i++])
            if (!nongCamp) {
                continue
            }
            const camp = await Camp.findById(nongCamp.campId)
            if (!camp) {
                continue
            }
            let j = 0
            while (j < camp.lostAndFoundIds.length) {
                const lostAndFound: InterLostAndFound | null = await LostAndFound.findById(camp.lostAndFoundIds[j++])
                if (lostAndFound) {
                    out.push(lostAndFound)
                }
            }
        }
    }
    i = 0
    const output: ShowLostAndFound[] = []
    while (i < out.length) {
        const buf = await fillLostAndFound(out[i++])
        if (buf) {
            output.push(buf)
        }
    }
    res.status(200).json(output)
}
export async function getLostAndFound(req: express.Request, res: express.Response) {
    const lostAndFound = await LostAndFound.findById(req.params.id)
    if (!lostAndFound) {
        sendRes(res, false)
        return
    }
    const buf = await fillLostAndFound(lostAndFound.toObject())
    res.status(200).json(buf)
}
export async function getAllBuilding(req: express.Request, res: express.Response) {
    const buildings = await Building.find()
    res.status(200).json(buildings)
}
export async function createPlace(req: express.Request, res: express.Response) {
    const { room, buildingId, floor } = req.body
    const place = await Place.create({ room, buildingId, floor })
    const building = await Building.findById(buildingId)
    await building?.updateOne({ placeIds: swop(null, place._id, building.placeIds) })
    res.status(201).json(place)
}
export async function saveDeletePlace(req: express.Request, res: express.Response) {
    const place = await Place.findById(req.params.id)
    if (place?.actionPlanIds.length || place?.boySleepBaanIds.length || place?.girlSleepBaanIds.length || place?.normalBaanIds.length || place?.fridayActIds.length || place?.partIds.length || place?.lostAndFoundIds.length) {
        return res.status(400).json({ success: false })
    }
    await place?.deleteOne()
    res.status(200).json({ success: true })
}
export async function createBuilding(req: express.Request, res: express.Response) {
    const building = await Building.create({ name: req.params.id })
    res.status(201).json(building)
}
export async function saveDeleteBuilding(req: express.Request, res: express.Response) {
    const building = await Building.findById(req.params.id)
    if (building?.placeIds.length) {
        return res.status(400).json({ success: false })
    }
    await building?.deleteOne()
    sendRes(res, true)
}
export async function getPlaces(req: express.Request, res: express.Response) {
    const building = await Building.findById(req.params.id)
    if (!building) {
        sendRes(res, false)
        return
    }
    const places: InterPlace[] = []
    let i = 0
    while (i < building.placeIds.length) {
        const place = await Place.findById(building.placeIds[i++])
        if (place) {
            places.push(place.toObject())
        }
    }
    res.status(200).json(places)
}
export async function getPlace(req: express.Request, res: express.Response) {
    const place = await Place.findById(req.params.id)
    res.status(200).json(place)
}
export async function getBuilding(req: express.Request, res: express.Response) {
    const building = await Building.findById(req.params.id)
    res.status(200).json(building)
}
async function fillLostAndFound(input: InterLostAndFound): Promise<ShowLostAndFound | null> {
    const {
        _id,
        name,
        buildingId,
        placeId,
        userId,
        detail,
        campId,
        type


    } = input
    const user = await User.findById(userId)
    const building = await Building.findById(buildingId)
    const place = await Place.findById(placeId)
    const camp = await Camp.findById(campId)
    if (!user) {
        return null
    }
    return {
        _id,
        name,
        buildingId,
        placeId,
        detail,
        userId,
        userLastName: user.lastname,
        userName: user.name,
        userNickname: user.nickname,
        tel: user.tel,
        room: place ? place.room : 'null',
        floor: place ? place.floor : 'null',
        buildingName: building ? building.name : 'null',
        campId,
        type,
        campName: camp ? camp.campName : 'null'
    }
}
export async function getShowPlace(req: express.Request, res: express.Response) {
    const place = await Place.findById(req.params.id)
    if (!place) {
        sendRes(res, false)
        return
    }
    const building = await Building.findById(place.buildingId)
    if (!building) {
        sendRes(res, false)
        return
    }
    const showPlace: ShowPlace = {
        _id: place._id,
        buildingName: building.name,
        floor: place.floor,
        room: place.room
    }
    res.status(200).json(showPlace)
}
export async function createPartChat(req: express.Request, res: express.Response) {
    const create: CreatePeeChat = req.body
    const user = await getUser(req)
    const part = await Part.findById(create.partId)
    if (!user || !part) {
        sendRes(res, false)
        return
    }
    const camp = await Camp.findById(part.campId)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const campMemberCard = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(user._id.toString()))
    if (!campMemberCard || campMemberCard.role === 'nong') {
        sendRes(res, false)
        return
    }
    let typeChat: TypeChat
    if (part._id.equals(camp.partPeeBaanId)) {
        typeChat = 'พี่บ้านคุยกัน'
    } else {
        typeChat = 'คุยกันในฝ่าย'
    }
    const chat = await Chat.create({
        message: create.message,
        userId: user._id,
        campModelId: campMemberCard.campModelId,
        role: campMemberCard.role,
        typeChat,
        refId: part._id,
        campMemberCardIds: camp.peeCampMemberCardIds,
    })
    await campMemberCard.updateOne({ ownChatIds: swop(null, chat._id, campMemberCard.ownChatIds) })
    await camp.updateOne({ allPetoChatIds: swop(null, chat._id, camp.allPetoChatIds) })
    let i = 0
    while (i < camp.peeCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(camp.peeCampMemberCardIds[i++])
        if (!campMemberCard) {
            continue
        }
        await campMemberCard.updateOne({ allChatIds: swop(null, chat._id, campMemberCard.allChatIds) })
    }
    await part.updateOne({ chatIds: swop(null, chat._id, part.chatIds) })
    res.status(201).json(chat)
}
export async function getShowChatFromChatIds(inputs: Id[], mode: Mode) {
    const out: ShowChat[] = []
    let i = 0
    while (i < inputs.length) {
        const chat = await Chat.findById(inputs[i++])
        if (!chat) {
            continue
        }
        const {
            message,
            userId,
            role,
            campModelId,
            typeChat,
            refId,
            campMemberCardIds,
            date,
        } = chat
        let baanName: string
        let partName: string
        const user = await User.findById(userId)
        switch (role) {
            case "pee": {
                const peeCamp = await PeeCamp.findById(campModelId)
                if (!peeCamp || !user) {
                    continue
                }
                const part = await Part.findById(peeCamp.partId)
                const baan = await Baan.findById(peeCamp.baanId)
                if (!part || !baan) {
                    continue
                }
                partName = part.partName
                baanName = baan.name
                break
            }
            case "peto": {
                const petoCamp = await PetoCamp.findById(campModelId)
                if (!petoCamp || !user) {
                    continue
                }
                const part = await Part.findById(petoCamp.partId)
                if (!part) {
                    continue
                }
                partName = part.partName
                baanName = 'ปีโต'
                break
            }
            case "nong": {
                const nongCamp = await NongCamp.findById(chat.campModelId)
                if (!user || !nongCamp) {
                    continue
                }
                const baan = await Baan.findById(nongCamp.baanId)
                if (!baan) {
                    continue
                }
                partName = 'น้องค่าย'
                baanName = baan.name
            }
        }
        let roomName: string
        switch (chat.typeChat) {
            case 'คุยกันในบ้าน': {
                const baan = await Baan.findById(chat.refId)
                if (!baan) {
                    continue
                }
                const camp = await Camp.findById(baan.campId)
                if (!camp) {
                    continue
                }
                roomName = `${camp.groupName}${baan.name}`
                break
            }
            case 'พี่บ้านคุยกัน': {
                const part = await Part.findById(chat.refId)
                if (!part) {
                    continue
                }
                const camp = await Camp.findById(part.campId)
                if (!camp) {
                    continue
                }
                roomName = `พี่${camp.groupName}`
                break
            }
            case 'น้องคุยส่วนตัวกับพี่': {
                const campMemberCard = await CampMemberCard.findById(chat.refId)
                if (!campMemberCard) {
                    continue
                }
                const user = await User.findById(campMemberCard.userId)
                const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
                if (!user || !nongCamp) {
                    continue
                }
                const baan = await Baan.findById(nongCamp.baanId)
                if (!baan) {
                    continue
                }
                roomName = `น้อง${user.nickname} บ้าน${baan.name}`
                break
            }
            case 'คุยกันในฝ่าย': {
                const part = await Part.findById(chat.refId)
                if (!part || mode == 'nong') {
                    continue
                }
                const camp = await Camp.findById(part.campId)
                if (!camp) {
                    continue
                }
                roomName = `ฝ่าย${part.partName}`
                break
            }
            case 'พี่คุยกันในบ้าน': {
                const baan = await Baan.findById(chat.refId)
                if (!baan || mode == 'nong') {
                    continue
                }
                const camp = await Camp.findById(baan.campId)
                if (!camp) {
                    continue
                }
                roomName = `พี่${camp.groupName}${baan.name}`
                break
            }
        }
        out.push({
            nickname: user.nickname,
            partName,
            baanName,
            message,
            role,
            userId,
            campModelId,
            roomName,
            typeChat,
            refId,
            campMemberCardIds,
            date,
        })
    }
    return out
}
export async function editChat(req: express.Request, res: express.Response) {
    const { message, id }: EditChat = req.body
    const chat = await Chat.findByIdAndUpdate(id, { message })
    res.status(200).json(chat)
}
export async function deleteChat(req: express.Request, res: express.Response) {
    const success = await deleteChatRaw(stringToId(req.params.id))
    sendRes(res, success)
}
export async function deleteChatRaw(chatId: Id) {
    const chat = await Chat.findById(chatId)
    if (!chat) {
        return false
    }
    let i = 0
    switch (chat.typeChat) {
        case 'น้องคุยส่วนตัวกับพี่': {
            while (i < chat.campMemberCardIds.length) {
                const campMemberCard = await CampMemberCard.findById(chat.campMemberCardIds[i++])
                if (!campMemberCard) {
                    continue
                }
                await campMemberCard.updateOne({ allChatIds: swop(chat._id, null, campMemberCard.allChatIds) })
            }
            const campMemberCardHost = await CampMemberCard.findById(chat.refId)
            if (!campMemberCardHost) {
                return false
            }
            await campMemberCardHost.updateOne({ chatIds: swop(chat._id, null, campMemberCardHost.chatIds) })
            break
        }
        case 'คุยกันในบ้าน': {
            while (i < chat.campMemberCardIds.length) {
                const campMemberCard = await CampMemberCard.findById(chat.campMemberCardIds[i++])
                if (!campMemberCard) {
                    continue
                }
                await campMemberCard.updateOne({ allChatIds: swop(chat._id, null, campMemberCard.allChatIds) })
            }
            const baan = await Baan.findById(chat.refId)
            if (!baan) {
                return false
            }
            await baan.updateOne({ nongChatIds: swop(chat._id, null, baan.nongChatIds) })
            break
        }
        case 'คุยกันในฝ่าย': {
            while (i < chat.campMemberCardIds.length) {
                const campMemberCard = await CampMemberCard.findById(chat.campMemberCardIds[i++])
                if (!campMemberCard) {
                    continue
                }
                await campMemberCard.updateOne({ allChatIds: swop(chat._id, null, campMemberCard.allChatIds) })
            }
            const part = await Part.findById(chat.refId)
            if (!part) {
                return false
            }
            await part.updateOne({ nongChatIds: swop(chat._id, null, part.chatIds) })
            const camp = await Camp.findById(part.campId)
            if (!camp) {
                return false
            }
            await camp.updateOne({ allPetoChatIds: swop(chat._id, null, camp.allPetoChatIds) })
            break
        }
        case 'พี่คุยกันในบ้าน': {
            while (i < chat.campMemberCardIds.length) {
                const campMemberCard = await CampMemberCard.findById(chat.campMemberCardIds[i++])
                if (!campMemberCard) {
                    continue
                }
                await campMemberCard.updateOne({ allChatIds: swop(chat._id, null, campMemberCard.allChatIds) })
            }
            const baan = await Baan.findById(chat.refId)
            if (!baan) {
                return false
            }
            await baan.updateOne({ peeChatIds: swop(chat._id, null, baan.peeChatIds) })
            break
        }
        case 'พี่บ้านคุยกัน': {
            while (i < chat.campMemberCardIds.length) {
                const campMemberCard = await CampMemberCard.findById(chat.campMemberCardIds[i++])
                if (!campMemberCard) {
                    continue
                }
                await campMemberCard.updateOne({ allChatIds: swop(chat._id, null, campMemberCard.allChatIds) })
            }
            const part = await Part.findById(chat.refId)
            if (!part) {
                return false
            }
            await part.updateOne({ nongChatIds: swop(chat._id, null, part.chatIds) })
            const camp = await Camp.findById(part.campId)
            if (!camp) {
                return false
            }
            await camp.updateOne({ allPetoChatIds: swop(chat._id, null, camp.allPetoChatIds) })
            break
        }
    }
    await chat.deleteOne()
    return true
}
export async function createNongChat(req: express.Request, res: express.Response) {
    const create: CreateNongChat = req.body
    const campMemberCardHost = await CampMemberCard.findById(create.CampMemberCard)
    const user = await getUser(req)
    if (!campMemberCardHost || !user || campMemberCardHost.role !== 'nong') {
        sendRes(res, false)
        return
    }
    const nongCamp = await NongCamp.findById(campMemberCardHost.campModelId)
    if (!nongCamp) {
        sendRes(res, false)
        return
    }
    const camp = await Camp.findById(nongCamp.campId)
    const baan = await Baan.findById(nongCamp.baanId)
    if (!camp || !baan) {
        sendRes(res, false)
        return
    }
    const campMemberCardSender = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(user._id.toString()))
    if (!campMemberCardSender) {
        sendRes(res, false)
        return
    }
    const chat = await Chat.create({
        message: create.message,
        campModelId: campMemberCardSender.campModelId,
        userId: user._id,
        role: campMemberCardSender.role,
        typeChat: 'น้องคุยส่วนตัวกับพี่',
        refId: campMemberCardHost._id,
        campMemberCardIds: baan.peeCampMemberCardIds,
    })
    await campMemberCardSender.updateOne({ ownChatIds: swop(null, chat._id, campMemberCardSender.ownChatIds) })
    let i = 0
    while (i < baan.peeCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(baan.peeCampMemberCardIds[i++])
        if (!campMemberCard) {
            continue
        }
        await campMemberCard.updateOne({ allChatIds: swop(null, chat._id, campMemberCard.allChatIds) })
    }
    await campMemberCardHost.updateOne({ chatIds: swop(null, chat._id, campMemberCardHost.chatIds) })
    await chat.updateOne({ campMemberCardIds: swop(null, campMemberCardHost._id, chat.campMemberCardIds) })
    res.status(201).json(chat)
}
export async function createPeeBaanChat(req: express.Request, res: express.Response) {
    const create: CreateBaanChat = req.body
    const baan = await Baan.findById(create.baanId)
    const user = await getUser(req)
    if (!baan || !user) {
        sendRes(res, false)
        return
    }
    const camp = await Camp.findById(baan.campId)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const campMemberCardSender = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(user._id.toString()))
    if (!campMemberCardSender) {
        sendRes(res, false)
        return
    }
    const chat = await Chat.create({
        message: create.message,
        campModelId: campMemberCardSender.campModelId,
        userId: user._id,
        role: campMemberCardSender.role,
        typeChat: 'พี่คุยกันในบ้าน',
        refId: baan._id,
        campMemberCardIds: baan.peeCampMemberCardIds,
    })
    await campMemberCardSender.updateOne({ ownChatIds: swop(null, chat._id, campMemberCardSender.ownChatIds) })
    let i = 0
    while (i < baan.peeCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(baan.peeCampMemberCardIds[i++])
        if (!campMemberCard) {
            continue
        }
        await campMemberCard.updateOne({ allChatIds: swop(null, chat._id, campMemberCard.allChatIds) })
    }
    await baan.updateOne({ peeChatIds: swop(null, chat._id, baan.peeChatIds) })
}
export async function createNongBaanChat(req: express.Request, res: express.Response) {
    const create: CreateBaanChat = req.body
    const baan = await Baan.findById(create.baanId)
    const user = await getUser(req)
    if (!baan || !user) {
        sendRes(res, false)
        return
    }
    const camp = await Camp.findById(baan.campId)
    if (!camp) {
        sendRes(res, false)
        return
    }
    const campMemberCardSender = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(user._id.toString()))
    if (!campMemberCardSender) {
        sendRes(res, false)
        return
    }
    const campMemberCardIds: Id[] = []
    const chat = await Chat.create({
        message: create.message,
        campModelId: campMemberCardSender.campModelId,
        userId: user._id,
        role: campMemberCardSender.role,
        typeChat: 'คุยกันในบ้าน',
        refId: baan._id,
    })
    let i = 0
    while (i < baan.peeCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(baan.peeCampMemberCardIds[i++])
        if (!campMemberCard) {
            continue
        }
        await campMemberCard.updateOne({ allChatIds: swop(null, chat._id, campMemberCard.allChatIds) })
        campMemberCardIds.push(campMemberCard._id)
    }
    i = 0
    while (i < baan.nongCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(baan.nongCampMemberCardIds[i++])
        if (!campMemberCard) {
            continue
        }
        await campMemberCard.updateOne({ allChatIds: swop(null, chat._id, campMemberCard.allChatIds) })
        campMemberCardIds.push(campMemberCard._id)
    }
    await campMemberCardSender.updateOne({ ownChatIds: swop(null, chat._id, campMemberCardSender.ownChatIds) })
    await chat.updateOne({ campMemberCardIds })
    await baan.updateOne({ nongChatIds: swop(null, chat._id, baan.nongChatIds) })
}
export async function getAllChatFromCampId(req: express.Request, res: express.Response) {
    const user = await getUser(req)
    const camp = await Camp.findById(req.params.id)
    if (!camp || !user) {
        sendRes(res, false)
        return
    }
    const timeOffset = await TimeOffset.findById(user.displayOffsetId)
    if (!timeOffset) {
        sendRes(res, false)
        return
    }
    if (camp.petoIds.includes(user._id)) {
        const chats = await getShowChatFromChatIds(camp.allPetoChatIds, user.mode)
        const output: ChatReady = {
            chats,
            mode: getModeBySituation(user.mode, 'peto', true),
            sendType: null,
            groupName: camp.groupName,
            timeOffset,
            success: true,
            roomName: 'รวมทุกแชต',
        }
        res.status(200).json(output)
    } else {
        const campMemberCard = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(user._id.toString()))
        if (!campMemberCard) {
            sendRes(res, false)
            return
        }
        const chats = await getShowChatFromChatIds(campMemberCard.allChatIds, getModeBySituation(user.mode, campMemberCard.role, true))
        const output: ChatReady = {
            chats,
            mode: getModeBySituation(user.mode, campMemberCard.role, true),
            sendType: null,
            groupName: camp.groupName,
            timeOffset,
            success: true,
            roomName: 'รวมทุกแชต',
        }
        res.status(200).json(output)
    }
}
export async function getPartChat(req: express.Request, res: express.Response) {
    const part = await Part.findById(req.params.id)
    const user = await getUser(req)
    if (!part || !user) {
        sendRes(res, false)
        return
    }
    const camp = await Camp.findById(part.campId)
    if (!camp || (!camp.peeIds.includes(user._id) && !camp.petoIds.includes(user._id))) {
        sendRes(res, false)
        return
    }
    const chats = await getShowChatFromChatIds(part.chatIds, user.mode)
    const timeOffset = await TimeOffset.findById(user.displayOffsetId)
    if (!timeOffset) {
        sendRes(res, false)
        return
    }
    const output: ChatReady = {
        chats,
        mode: getModeBySituation(user.mode, 'pee', true),
        sendType: {
            roomType: 'คุยกันในฝ่าย',
            id: part._id,
        },
        groupName: camp.groupName,
        timeOffset,
        success: true,
        roomName: part._id.equals(camp.partPeeBaanId) ? `ห้องพี่${camp.groupName}คุยกัน ! อย่าหลุดสิ่งที่ไม่อยากให้น้องรู้ในแชตนี้` : `ฝ่าย${part.partName}`
    }
    res.status(200).json(output)
}
export async function getNongBaanChat(req: express.Request, res: express.Response) {
    const camp = await Camp.findById(req.params.id)
    const user = await getUser(req)
    if (!camp || !user) {
        sendRes(res, false)
        return
    }
    const campMemberCard = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(user._id.toString()))
    if (!campMemberCard) {
        sendRes(res, false)
        return
    }
    const timeOffset = await TimeOffset.findById(user.displayOffsetId)
    if (!timeOffset) {
        sendRes(res, false)
        return
    }
    switch (campMemberCard.role) {
        case "nong": {
            const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
            if (!nongCamp) {
                sendRes(res, false)
                return
            }
            const baan = await Baan.findById(nongCamp.baanId)
            if (!baan) {
                sendRes(res, false)
                return
            }
            const chats = await getShowChatFromChatIds(baan.nongChatIds, getModeBySituation(user.mode, 'nong', true))
            const output: ChatReady = {
                chats,
                mode: getModeBySituation(user.mode, 'nong', true),
                sendType: baan.nongSendMessage ? {
                    id: baan._id,
                    roomType: 'คุยกันในบ้าน',
                } : null,
                groupName: camp.groupName,
                timeOffset,
                success: true,
                roomName: `ห้อง${camp.groupName}${baan.name}`,
            }
            res.status(200).json(output)
            return
        }
        case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
            if (!peeCamp) {
                sendRes(res, false)
                return
            }
            const baan = await Baan.findById(peeCamp.baanId)
            if (!baan) {
                sendRes(res, false)
                return
            }
            const chats = await getShowChatFromChatIds(baan.nongChatIds, user.mode)
            const output: ChatReady = {
                chats,
                mode: getModeBySituation(user.mode, 'pee', true),
                sendType: {
                    id: baan._id,
                    roomType: 'คุยกันในบ้าน',
                },
                groupName: camp.groupName,
                timeOffset,
                success: true,
                roomName: user.mode == 'pee' ? `ห้อง${camp.groupName}${baan.name}ที่มีน้องด้วย` : `ห้อง${camp.groupName}${baan.name}`,
            }
            res.status(200).json(output)
            return
        }
        case "peto": {
            sendRes(res, false)
            return
        }
    }
}
export async function getPeeBaanChat(req: express.Request, res: express.Response) {
    const camp = await Camp.findById(req.params.id)
    const user = await getUser(req)
    if (!camp || !user) {
        sendRes(res, false)
        return
    }
    const campMemberCard = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(user._id.toString()))
    if (!campMemberCard || campMemberCard.role !== 'pee' || user.mode == 'nong') {
        sendRes(res, false)
        return
    }
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
    if (!peeCamp) {
        sendRes(res, false)
        return
    }
    const baan = await Baan.findById(peeCamp.baanId)
    if (!baan) {
        sendRes(res, false)
        return
    }
    const chats = await getShowChatFromChatIds(baan.peeChatIds, 'pee')
    const timeOffset = await TimeOffset.findById(user.displayOffsetId)
    if (!timeOffset) {
        sendRes(res, false)
        return
    }
    const output: ChatReady = {
        chats,
        mode: 'pee',
        sendType: {
            id: baan._id,
            roomType: 'พี่คุยกันในบ้าน'
        },
        groupName: camp.groupName,
        timeOffset,
        success: true,
        roomName: `ห้อง${camp.groupName}${baan.name}ที่มีแต่พี่`,
    }
    res.status(200).json(output)
}
export async function getNongChat(req: express.Request, res: express.Response) {
    const campMemberCard = await CampMemberCard.findById(req.params.id)
    const user = await getUser(req)
    if (!campMemberCard || !user) {
        sendRes(res, false)
        return
    }
    const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
    if (!nongCamp) {
        sendRes(res, false)
        return
    }
    const camp = await Camp.findById(nongCamp.campId)
    const baan = await Baan.findById(nongCamp.baanId)
    if (!camp || !baan) {
        sendRes(res, false)
        return
    }
    if (!campMemberCard.userId.equals(user._id) && !baan.peeIds.includes(user._id)) {
        sendRes(res, false)
        return
    }
    const host = await User.findById(campMemberCard.userId)
    const chats = await getShowChatFromChatIds(campMemberCard.chatIds, getModeBySituation(user.mode, campMemberCard.userId.equals(user._id) ? 'nong' : 'pee', true))
    const timeOffset = await TimeOffset.findById(user.displayOffsetId)
    if (!timeOffset || !host) {
        sendRes(res, false)
        return
    }
    const output: ChatReady = {
        chats,
        mode: getModeBySituation(user.mode, campMemberCard.userId.equals(user._id) ? 'nong' : 'pee', true),
        sendType: {
            id: campMemberCard._id,
            roomType: 'น้องคุยส่วนตัวกับพี่'
        },
        groupName: camp.groupName,
        timeOffset,
        success: true,
        roomName: `คุยส่วนตัวกับน้อง${host.nickname} บ้าน${baan.name}`,
    }
    res.status(200).json(output)
}
export async function getSystemInfo(req: express.Request, res: express.Response) {
    const systemMode = getSystemMode()
    const endEmail = getEndEmail()
    res.status(200).json({ systemMode, endEmail })
}
function getModeBySituation(mode: Mode, role: RoleCamp, isHidePart: boolean): Mode {
    if (!isHidePart) {
        return 'pee'
    }
    if (role == 'nong') {
        return 'nong'
    }
    return mode
}
export async function getPartPeebaanChat(req: express.Request, res: express.Response) {
    const camp = await Camp.findById(req.params.id)
    const user = await getUser(req)
    if (!camp || !user) {
        sendRes(res, false)
        return
    }
    const part = await Part.findById(camp.partPeeBaanId)
    if (!part || (!camp.peeIds.includes(user._id) && !camp.petoIds.includes(user._id))) {
        sendRes(res, false)
        return
    }
    const chats = await getShowChatFromChatIds(part.chatIds, user.mode)
    const timeOffset = await TimeOffset.findById(user.displayOffsetId)
    if (!timeOffset) {
        sendRes(res, false)
        return
    }
    const output: ChatReady = {
        chats,
        mode: getModeBySituation(user.mode, 'pee', true),
        sendType: {
            roomType: 'คุยกันในฝ่าย',
            id: part._id,
        },
        groupName: camp.groupName,
        timeOffset,
        success: true,
        roomName: user.mode == 'pee' ? `ห้องพี่${camp.groupName}คุยกัน ! อย่าหลุดสิ่งที่ไม่อยากให้น้องรู้ในแชตนี้` : `ห้องพี่${camp.groupName}คุยกัน`,
    }
    res.status(200).json(output)
}