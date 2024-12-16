import { getUser } from "../middleware/auth";
import Baan from "../models/Baan";
import Camp from "../models/Camp";
import Song from "../models/Song";
import User from "../models/User";
import express from "express";
import {
  getPusherClient,
  getSystemInfoRaw,
  ifIsTrue,
  removeDuplicate,
  resError,
  resOk,
  sendRes,
  stringToId,
  swop,
} from "./setup";
import LostAndFound from "../models/LostAndFound";
import Building from "../models/Building";
import Place from "../models/Place";
import NongCamp from "../models/NongCamp";
import {
  AuthSongsCamp,
  BasicBaan,
  BasicCamp,
  ChatReady,
  CreateBaanChat,
  CreateFood,
  CreateMeal,
  CreateNongChat,
  CreatePeeChat,
  EditChat,
  GetFoodForUpdate,
  GetMeals,
  GetMenuSongs,
  HeathIssuePack,
  Id,
  InterCampBack,
  InterChat,
  InterFood,
  InterLostAndFound,
  InterPlace,
  InterSong,
  Mode,
  RoleCamp,
  ScoreEvent,
  SendData,
  ShowCampSong,
  ShowCampSongReady,
  ShowChat,
  ShowLostAndFound,
  ShowPlace,
  ShowSong,
  ShowSongPage,
  SystemInfo,
  TypeChat,
  UpdateFood,
  UpdateMeal,
  UpdateSongPage,
} from "../models/interface";
import PeeCamp from "../models/PeeCamp";
import PetoCamp from "../models/PetoCamp";
import Part from "../models/Part";
import CampMemberCard from "../models/CampMemberCard";
import Chat from "../models/Chat";
import TimeOffset from "../models/TimeOffset";
import Meal from "../models/Meal";
import Food from "../models/Food";
import HeathIssue from "../models/HeathIssue";
import { isFoodValid } from "./user";
import { getAuthTypes, getPusherServer } from "./camp";
import PusherData from "../models/PusherData";
import Pusher from "pusher";
//*export async function addLikeSong
//*export async function addBaanSong
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
//*export async function createMeal
//*export async function createFood
//*export async function getFoodForUpdate
//*export async function getHealthIssuePack
//*export async function updateFood
//*export async function getMealByUser
//*export async function deleteFood
//*export async function deleteMeal
//*export async function getFoods
//*export async function getMeal
//*export async function updateMeal
//*export async function getMenuSongs
//*export async function createSong
//*export async function getShowSong
//*export async function addCampSong
//*export async function updateSongPage
//*export async function getShowCampSongs
//*export async function getShowBaanSongs
//*export async function getAuthSongs
//*export async function realTimeScoring
export async function addLikeSong(req: express.Request, res: express.Response) {
  const { songIds }: { songIds: Id[] } = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await addLikeSongRaw(user._id, songIds);
  sendRes(res, true);
}
async function addLikeSongRaw(userId: Id, songIds: Id[]) {
  const user = await User.findById(userId);
  if (!user) {
    return;
  }
  const add = removeDuplicate(songIds, user.likeSongIds);
  const remove = removeDuplicate(user.likeSongIds, songIds);
  let likeSongIds = user.likeSongIds;
  let i = 0;
  while (i < add.length) {
    const song = await Song.findById(add[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(null, song._id, likeSongIds);
    await song.updateOne({
      userLikeIds: swop(null, user._id, song.userLikeIds),
    });
  }
  i = 0;
  while (i < remove.length) {
    const song = await Song.findById(remove[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(song._id, null, likeSongIds);
    await song.updateOne({
      userLikeIds: swop(user._id, null, song.userLikeIds),
    });
  }
  await user.updateOne({ likeSongIds });
}
async function getAllSong() {
  const songs = await Song.find();
  const map: Map<string, number> = new Map();
  let i = 0;
  while (i < songs.length) {
    map.set(songs[i++]._id.toString(), 0);
  }
  return map;
}
async function getUserLikeSong(userIds: Id[]) {
  const songList: Map<string, number> = await getAllSong();
  let i = 0;
  while (i < userIds.length) {
    const user = await User.findById(userIds[i++]);
    if (!user) {
      continue;
    }
    let j = 0;
    while (j < user.likeSongIds.length) {
      const songId = user.likeSongIds[j++];
      songList.set(
        songId.toString(),
        (songList.get(songId.toString()) as number) + 1
      );
    }
  }
  return songList;
}
export async function addBaanSong(req: express.Request, res: express.Response) {
  const { songIds }: { songIds: Id[] } = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await addBaanSongRaw(stringToId(req.params.id), songIds, user._id);
  sendRes(res, true);
}

async function addBaanSongRaw(baanId: Id, songIds: Id[], userId: Id) {
  const baan = await Baan.findById(baanId);
  if (!baan) {
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(userId.toString())
  );
  if (!campMemberCard) {
    return;
  }
  const auths = await getAuthTypes(userId, camp._id);
  if (!auths) {
    return;
  }
  switch (campMemberCard.role) {
    case "nong":
      return;
    case "pee": {
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        return;
      }
      if (
        part._id.toString() == camp.partBoardId?.toString() ||
        auths.includes("pr/studio") ||
        auths.includes("หัวหน้าพี่เลี้ยง")
      ) {
        break;
      } else {
        return;
      }
    }
    case "peto": {
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        return;
      }
      if (
        part._id.toString() == camp.partBoardId?.toString() ||
        auths.includes("pr/studio") ||
        auths.includes("หัวหน้าพี่เลี้ยง")
      ) {
        break;
      } else {
        return;
      }
    }
  }
  const add = removeDuplicate(songIds, baan.songIds);
  const remove = removeDuplicate(baan.songIds, songIds);
  let likeSongIds = baan.songIds;
  let i = 0;
  while (i < add.length) {
    const song = await Song.findById(add[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(null, song._id, likeSongIds);
    await song.updateOne({
      baanIds: swop(null, baan._id, song.baanIds),
    });
  }
  i = 0;
  while (i < remove.length) {
    const song = await Song.findById(remove[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(song._id, null, likeSongIds);
    await song.updateOne({
      baanIds: swop(baan._id, null, song.baanIds),
    });
  }
  await baan.updateOne({ songIds: likeSongIds });
}
export async function addLostAndFound(
  req: express.Request,
  res: express.Response
) {
  const { campId, type, name, detail, placeId } = req.body;
  const user = await getUser(req);
  const buildingId = placeId
    ? (await Place.findById(placeId))?.buildingId
    : null;
  const place = placeId ? await Place.findById(placeId) : null;
  if (!user) {
    sendRes(res, false);
    return;
  }
  const lostAndFound = await LostAndFound.create({
    campId,
    type,
    name,
    detail,
    userId: user._id,
    placeId,
    buildingId,
  });
  await user.updateOne({
    lostAndFoundIds: swop(null, lostAndFound._id, user.lostAndFoundIds),
  });
  if (campId) {
    const camp = await Camp.findById(campId);
    await camp?.updateOne({
      lostAndFoundIds: swop(null, lostAndFound._id, camp.lostAndFoundIds),
    });
  }
  if (place) {
    await place.updateOne({
      lostAndFoundIds: swop(null, lostAndFound._id, place.lostAndFoundIds),
    });
    const building = await Building.findById(place.buildingId);
    await building?.updateOne({
      lostAndFoundIds: swop(null, lostAndFound._id, building.lostAndFoundIds),
    });
  }

  res.status(201).json({});
}
export async function deleteLostAndFound(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const lostAndFound = await LostAndFound.findById(req.params.id);
  if (!lostAndFound || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(lostAndFound.campId);
  const auths = await getAuthTypes(user._id, lostAndFound.campId);
  if (
    !user ||
    (user.role != "admin" &&
      lostAndFound.userId !== user._id &&
      (camp
        ? !auths ||
          (!user.authPartIds.includes(camp.partBoardId as Id) &&
            !auths.includes("ทะเบียน"))
        : true) &&
      !camp?.boardIds.includes(user._id))
  ) {
    res.status(403).json(resError);
  }

  const owner = await User.findById(lostAndFound.userId);
  const place = await Place.findById(lostAndFound.placeId);
  const building = await Building.findById(lostAndFound?.buildingId);
  await owner?.updateOne({
    lostAndFoundIds: swop(lostAndFound._id, null, owner.lostAndFoundIds),
  });
  await place?.updateOne({
    lostAndFoundIds: swop(lostAndFound._id, null, place.lostAndFoundIds),
  });
  await building?.updateOne({
    lostAndFoundIds: swop(lostAndFound._id, null, building.lostAndFoundIds),
  });
  if (camp) {
    camp.updateOne({
      lostAndFoundIds: swop(lostAndFound._id, null, camp.lostAndFoundIds),
    });
  }
  await lostAndFound.deleteOne();
  sendRes(res, true);
}
export async function getLostAndFounds(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  let out: InterLostAndFound[] = [];
  let i = 0;
  if (user.fridayActEn) {
    out = await LostAndFound.find();
  } else {
    while (i < user.nongCampIds.length) {
      const nongCamp = await NongCamp.findById(user.nongCampIds[i++]);
      if (!nongCamp) {
        continue;
      }
      const camp = await Camp.findById(nongCamp.campId);
      if (!camp) {
        continue;
      }
      let j = 0;
      while (j < camp.lostAndFoundIds.length) {
        const lostAndFound: InterLostAndFound | null =
          await LostAndFound.findById(camp.lostAndFoundIds[j++]);
        if (lostAndFound) {
          out.push(lostAndFound);
        }
      }
    }
  }
  i = 0;
  const output: ShowLostAndFound[] = [];
  while (i < out.length) {
    const buf = await fillLostAndFound(out[i++]);
    if (buf) {
      output.push(buf);
    }
  }
  res.status(200).json(output);
}
export async function getLostAndFound(
  req: express.Request,
  res: express.Response
) {
  const lostAndFound = await LostAndFound.findById(req.params.id);
  if (!lostAndFound) {
    sendRes(res, false);
    return;
  }
  const buf = await fillLostAndFound(lostAndFound.toObject());
  res.status(200).json(buf);
}
export async function getAllBuilding(
  req: express.Request,
  res: express.Response
) {
  const buildings = await Building.find();
  res.status(200).json(buildings);
}
export async function createPlace(req: express.Request, res: express.Response) {
  const { room, buildingId, floor } = req.body;
  const place = await Place.create({ room, buildingId, floor });
  const building = await Building.findById(buildingId);
  await building?.updateOne({
    placeIds: swop(null, place._id, building.placeIds),
  });
  res.status(201).json(place);
}
export async function saveDeletePlace(
  req: express.Request,
  res: express.Response
) {
  const place = await Place.findById(req.params.id);
  if (
    place?.actionPlanIds.length ||
    place?.boySleepBaanIds.length ||
    place?.girlSleepBaanIds.length ||
    place?.normalBaanIds.length ||
    place?.fridayActIds.length ||
    place?.partIds.length ||
    place?.lostAndFoundIds.length
  ) {
    return res.status(400).json({ success: false });
  }
  await place?.deleteOne();
  res.status(200).json({ success: true });
}
export async function createBuilding(
  req: express.Request,
  res: express.Response
) {
  const building = await Building.create({ name: req.params.id });
  res.status(201).json(building);
}
export async function saveDeleteBuilding(
  req: express.Request,
  res: express.Response
) {
  const building = await Building.findById(req.params.id);
  if (building?.placeIds.length) {
    return res.status(400).json({ success: false });
  }
  await building?.deleteOne();
  sendRes(res, true);
}
export async function getPlaces(req: express.Request, res: express.Response) {
  const building = await Building.findById(req.params.id);
  if (!building) {
    sendRes(res, false);
    return;
  }
  const places: InterPlace[] = [];
  let i = 0;
  while (i < building.placeIds.length) {
    const place = await Place.findById(building.placeIds[i++]);
    if (place) {
      places.push(place.toObject());
    }
  }
  res.status(200).json(places);
}
export async function getPlace(req: express.Request, res: express.Response) {
  const place = await Place.findById(req.params.id);
  res.status(200).json(place);
}
export async function getBuilding(req: express.Request, res: express.Response) {
  const building = await Building.findById(req.params.id);
  res.status(200).json(building);
}
async function fillLostAndFound(
  input: InterLostAndFound
): Promise<ShowLostAndFound | null> {
  const { _id, name, buildingId, placeId, userId, detail, campId, type } =
    input;
  const user = await User.findById(userId);
  const building = await Building.findById(buildingId);
  const place = await Place.findById(placeId);
  const camp = await Camp.findById(campId);
  if (!user) {
    return null;
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
    room: place ? place.room : "null",
    floor: place ? place.floor : "null",
    buildingName: building ? building.name : "null",
    campId,
    type,
    campName: camp ? camp.campName : "null",
  };
}
export async function getShowPlace(
  req: express.Request,
  res: express.Response
) {
  const place = await Place.findById(req.params.id);
  if (!place) {
    sendRes(res, false);
    return;
  }
  const building = await Building.findById(place.buildingId);
  if (!building) {
    sendRes(res, false);
    return;
  }
  const showPlace: ShowPlace = {
    _id: place._id,
    buildingName: building.name,
    floor: place.floor,
    room: place.room,
  };
  res.status(200).json(showPlace);
}
export async function createPartChat(
  req: express.Request,
  res: express.Response
) {
  const create: CreatePeeChat = req.body;
  const user = await getUser(req);
  const part = await Part.findById(create.partId);
  if (!user || !part) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCard || campMemberCard.role === "nong") {
    sendRes(res, false);
    return;
  }
  let typeChat: TypeChat;
  if (part._id.equals(camp.partPeeBaanId)) {
    typeChat = "พี่บ้านคุยกัน";
  } else {
    typeChat = "คุยกันในฝ่าย";
  }
  const chat = await Chat.create({
    message: create.message,
    userId: user._id,
    campModelId: campMemberCard.campModelId,
    role: campMemberCard.role,
    typeChat,
    refId: part._id,
    campMemberCardIds: camp.peeCampMemberCardIds,
  });
  await campMemberCard.updateOne({
    ownChatIds: swop(null, chat._id, campMemberCard.ownChatIds),
  });
  await camp.updateOne({
    allPetoChatIds: swop(null, chat._id, camp.allPetoChatIds),
  });
  let i = 0;
  const pusherServer = await getPusherServer(camp.pusherId);
  while (i < camp.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      camp.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      allChatIds: swop(null, chat._id, campMemberCard.allChatIds),
    });
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    const showChat = await getShowChatFromChat(chat, user.mode);
    if (!showChat) {
      continue;
    }
    if (!pusherServer) {
      continue;
    }
    await pusherServer.trigger(
      `${getSystemInfoRaw().chatText}${camp._id}${user._id}`,
      getSystemInfoRaw().newText,
      showChat
    );
  }
  await part.updateOne({ chatIds: swop(null, chat._id, part.chatIds) });
  const showChat = await getShowChatFromChat(chat, "pee");
  if (pusherServer)
    await pusherServer.trigger(
      `${getSystemInfoRaw().chatText}${part._id}`,
      getSystemInfoRaw().newText,
      showChat
    );
  res.status(201).json(chat);
}
export async function getShowChatFromChatIds(inputs: Id[], mode: Mode) {
  const out: ShowChat[] = [];
  let i = 0;
  while (i < inputs.length) {
    const chat = await Chat.findById(inputs[i++]);
    if (!chat) {
      continue;
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
      _id,
    } = chat;
    let baanName: string;
    let partName: string;
    const user = await User.findById(userId);
    switch (role) {
      case "pee": {
        const peeCamp = await PeeCamp.findById(campModelId);
        if (!peeCamp || !user) {
          continue;
        }
        const part = await Part.findById(peeCamp.partId);
        const baan = await Baan.findById(peeCamp.baanId);
        if (!part || !baan) {
          continue;
        }
        partName = part.partName;
        baanName = baan.name;
        break;
      }
      case "peto": {
        const petoCamp = await PetoCamp.findById(campModelId);
        if (!petoCamp || !user) {
          continue;
        }
        const part = await Part.findById(petoCamp.partId);
        if (!part) {
          continue;
        }
        partName = part.partName;
        baanName = "ปีโต";
        break;
      }
      case "nong": {
        const nongCamp = await NongCamp.findById(chat.campModelId);
        if (!user || !nongCamp) {
          continue;
        }
        const baan = await Baan.findById(nongCamp.baanId);
        if (!baan) {
          continue;
        }
        partName = "น้องค่าย";
        baanName = baan.name;
      }
    }
    let roomName: string;
    switch (chat.typeChat) {
      case "คุยกันในบ้าน": {
        const baan = await Baan.findById(chat.refId);
        if (!baan) {
          continue;
        }
        const camp = await Camp.findById(baan.campId);
        if (!camp) {
          continue;
        }
        roomName = `${camp.groupName}${baan.name}`;
        break;
      }
      case "พี่บ้านคุยกัน": {
        const part = await Part.findById(chat.refId);
        if (!part) {
          continue;
        }
        const camp = await Camp.findById(part.campId);
        if (!camp) {
          continue;
        }
        roomName = `พี่${camp.groupName}`;
        break;
      }
      case "น้องคุยส่วนตัวกับพี่": {
        const campMemberCard = await CampMemberCard.findById(chat.refId);
        if (!campMemberCard) {
          continue;
        }
        const user = await User.findById(campMemberCard.userId);
        const nongCamp = await NongCamp.findById(campMemberCard.campModelId);
        if (!user || !nongCamp) {
          continue;
        }
        const baan = await Baan.findById(nongCamp.baanId);
        if (!baan) {
          continue;
        }
        roomName = `น้อง${user.nickname} บ้าน${baan.name}`;
        break;
      }
      case "คุยกันในฝ่าย": {
        const part = await Part.findById(chat.refId);
        if (!part || mode == "nong") {
          continue;
        }
        const camp = await Camp.findById(part.campId);
        if (!camp) {
          continue;
        }
        roomName = `ฝ่าย${part.partName}`;
        break;
      }
      case "พี่คุยกันในบ้าน": {
        const baan = await Baan.findById(chat.refId);
        if (!baan || mode == "nong") {
          continue;
        }
        const camp = await Camp.findById(baan.campId);
        if (!camp) {
          continue;
        }
        roomName = `พี่${camp.groupName}${baan.name}`;
        break;
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
      _id,
    });
  }
  return out;
}
export async function editChat(req: express.Request, res: express.Response) {
  const { message, id }: EditChat = req.body;
  const chat = await Chat.findByIdAndUpdate(id, { message });
  res.status(200).json(chat);
}
export async function deleteChat(req: express.Request, res: express.Response) {
  const success = await deleteChatRaw(stringToId(req.params.id));
  sendRes(res, success);
}
export async function deleteChatRaw(chatId: Id) {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return false;
  }
  let i = 0;
  switch (chat.typeChat) {
    case "น้องคุยส่วนตัวกับพี่": {
      while (i < chat.campMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          chat.campMemberCardIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        await campMemberCard.updateOne({
          allChatIds: swop(chat._id, null, campMemberCard.allChatIds),
        });
      }
      const campMemberCardHost = await CampMemberCard.findById(chat.refId);
      if (!campMemberCardHost) {
        return false;
      }
      await campMemberCardHost.updateOne({
        chatIds: swop(chat._id, null, campMemberCardHost.chatIds),
      });
      break;
    }
    case "คุยกันในบ้าน": {
      while (i < chat.campMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          chat.campMemberCardIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        await campMemberCard.updateOne({
          allChatIds: swop(chat._id, null, campMemberCard.allChatIds),
        });
      }
      const baan = await Baan.findById(chat.refId);
      if (!baan) {
        return false;
      }
      await baan.updateOne({
        nongChatIds: swop(chat._id, null, baan.nongChatIds),
      });
      break;
    }
    case "คุยกันในฝ่าย": {
      while (i < chat.campMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          chat.campMemberCardIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        await campMemberCard.updateOne({
          allChatIds: swop(chat._id, null, campMemberCard.allChatIds),
        });
      }
      const part = await Part.findById(chat.refId);
      if (!part) {
        return false;
      }
      await part.updateOne({ nongChatIds: swop(chat._id, null, part.chatIds) });
      const camp = await Camp.findById(part.campId);
      if (!camp) {
        return false;
      }
      await camp.updateOne({
        allPetoChatIds: swop(chat._id, null, camp.allPetoChatIds),
      });
      break;
    }
    case "พี่คุยกันในบ้าน": {
      while (i < chat.campMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          chat.campMemberCardIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        await campMemberCard.updateOne({
          allChatIds: swop(chat._id, null, campMemberCard.allChatIds),
        });
      }
      const baan = await Baan.findById(chat.refId);
      if (!baan) {
        return false;
      }
      await baan.updateOne({
        peeChatIds: swop(chat._id, null, baan.peeChatIds),
      });
      break;
    }
    case "พี่บ้านคุยกัน": {
      while (i < chat.campMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          chat.campMemberCardIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        await campMemberCard.updateOne({
          allChatIds: swop(chat._id, null, campMemberCard.allChatIds),
        });
      }
      const part = await Part.findById(chat.refId);
      if (!part) {
        return false;
      }
      await part.updateOne({ nongChatIds: swop(chat._id, null, part.chatIds) });
      const camp = await Camp.findById(part.campId);
      if (!camp) {
        return false;
      }
      await camp.updateOne({
        allPetoChatIds: swop(chat._id, null, camp.allPetoChatIds),
      });
      break;
    }
  }
  await chat.deleteOne();
  return true;
}
export async function createNongChat(
  req: express.Request,
  res: express.Response
) {
  const create: CreateNongChat = req.body;
  const campMemberCardHost = await CampMemberCard.findById(
    create.CampMemberCard
  );
  const user = await getUser(req);
  if (!campMemberCardHost || !user || campMemberCardHost.role !== "nong") {
    sendRes(res, false);
    return;
  }
  const nongCamp = await NongCamp.findById(campMemberCardHost.campModelId);
  if (!nongCamp) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(nongCamp.campId);
  const baan = await Baan.findById(nongCamp.baanId);
  if (!camp || !baan) {
    sendRes(res, false);
    return;
  }
  const campMemberCardSender = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCardSender) {
    sendRes(res, false);
    return;
  }
  const pusherServer = await getPusherServer(camp.pusherId);
  const chat = await Chat.create({
    message: create.message,
    campModelId: campMemberCardSender.campModelId,
    userId: user._id,
    role: campMemberCardSender.role,
    typeChat: "น้องคุยส่วนตัวกับพี่",
    refId: campMemberCardHost._id,
    campMemberCardIds: baan.peeCampMemberCardIds,
  });
  await campMemberCardSender.updateOne({
    ownChatIds: swop(null, chat._id, campMemberCardSender.ownChatIds),
  });
  let i = 0;
  while (i < baan.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      allChatIds: swop(null, chat._id, campMemberCard.allChatIds),
    });
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    const showChat = await getShowChatFromChat(chat, user.mode);
    if (!showChat) {
      continue;
    }
    await pusherServer?.trigger(
      `${getSystemInfoRaw().chatText}${camp._id}${user._id}`,
      getSystemInfoRaw().newText,
      showChat
    );
  }
  const showChat = await getShowChatFromChat(chat, "pee");
  await pusherServer?.trigger(
    `${getSystemInfoRaw().chatText}${campMemberCardHost._id}`,
    getSystemInfoRaw().newText,
    showChat
  );
  await campMemberCardHost.updateOne({
    chatIds: swop(null, chat._id, campMemberCardHost.chatIds),
  });
  await chat.updateOne({
    campMemberCardIds: swop(
      null,
      campMemberCardHost._id,
      chat.campMemberCardIds
    ),
  });
  res.status(201).json(chat);
}
export async function createPeeBaanChat(
  req: express.Request,
  res: express.Response
) {
  const create: CreateBaanChat = req.body;
  const baan = await Baan.findById(create.baanId);
  const user = await getUser(req);
  if (!baan || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const campMemberCardSender = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCardSender) {
    sendRes(res, false);
    return;
  }
  const pusherServer = await getPusherServer(camp.pusherId);
  const chat = await Chat.create({
    message: create.message,
    campModelId: campMemberCardSender.campModelId,
    userId: user._id,
    role: campMemberCardSender.role,
    typeChat: "พี่คุยกันในบ้าน",
    refId: baan._id,
    campMemberCardIds: baan.peeCampMemberCardIds,
  });
  await campMemberCardSender.updateOne({
    ownChatIds: swop(null, chat._id, campMemberCardSender.ownChatIds),
  });
  let i = 0;
  while (i < baan.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      allChatIds: swop(null, chat._id, campMemberCard.allChatIds),
    });
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    const showChat = await getShowChatFromChat(chat, user.mode);
    if (!showChat) {
      continue;
    }
    await pusherServer?.trigger(
      `chatPee${baan._id}`,
      getSystemInfoRaw().newText,
      showChat
    );
  }
  await baan.updateOne({ peeChatIds: swop(null, chat._id, baan.peeChatIds) });
}
export async function createNongBaanChat(
  req: express.Request,
  res: express.Response
) {
  const create: CreateBaanChat = req.body;
  const baan = await Baan.findById(create.baanId);
  const user = await getUser(req);
  if (!baan || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const pusherServer = await getPusherServer(camp.pusherId);
  const campMemberCardSender = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCardSender) {
    sendRes(res, false);
    return;
  }
  const campMemberCardIds: Id[] = [];
  const chat = await Chat.create({
    message: create.message,
    campModelId: campMemberCardSender.campModelId,
    userId: user._id,
    role: campMemberCardSender.role,
    typeChat: "คุยกันในบ้าน",
    refId: baan._id,
  });
  let i = 0;
  while (i < baan.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      allChatIds: swop(null, chat._id, campMemberCard.allChatIds),
    });
    campMemberCardIds.push(campMemberCard._id);
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    const showChat = await getShowChatFromChat(chat, user.mode);
    if (!showChat) {
      continue;
    }
    await pusherServer?.trigger(
      `${getSystemInfoRaw().chatText}${camp._id}${user._id}`,
      getSystemInfoRaw().newText,
      showChat
    );
  }
  i = 0;
  while (i < baan.nongCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.nongCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      allChatIds: swop(null, chat._id, campMemberCard.allChatIds),
    });
    campMemberCardIds.push(campMemberCard._id);
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    const showChat = await getShowChatFromChat(chat, user.mode);
    if (!showChat) {
      continue;
    }
    await pusherServer?.trigger(
      `${getSystemInfoRaw().chatText}${camp._id}${user._id}`,
      getSystemInfoRaw().newText,
      showChat
    );
  }
  await campMemberCardSender.updateOne({
    ownChatIds: swop(null, chat._id, campMemberCardSender.ownChatIds),
  });
  await chat.updateOne({ campMemberCardIds });
  await baan.updateOne({ nongChatIds: swop(null, chat._id, baan.nongChatIds) });

  const showChat = await getShowChatFromChat(chat, "pee");

  await pusherServer?.trigger(
    `${getSystemInfoRaw().chatText}${camp._id}${user._id}`,
    getSystemInfoRaw().newText,
    showChat
  );
}
export async function getAllChatFromCampId(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const camp = await Camp.findById(req.params.id);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const timeOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!timeOffset) {
    sendRes(res, false);
    return;
  }
  const systemInfo = getSystemInfoRaw();
  const pusherData = await PusherData.findById(camp.pusherId);
  if (camp.petoIds.includes(user._id)) {
    const chats = await getShowChatFromChatIds(camp.allPetoChatIds, user.mode);
    const output: ChatReady = {
      chats,
      mode: getModeBySituation(user.mode, "peto", true),
      sendType: null,
      groupName: camp.groupName,
      timeOffset,
      success: true,
      roomName: "รวมทุกแชต",
      userId: user._id,
      subscribe: `${getSystemInfoRaw().chatText}${camp._id}${user._id}`,
      pusher: getPusherClient(pusherData),
      systemInfo,
    };
    res.status(200).json(output);
  } else {
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(user._id.toString())
    );
    if (!campMemberCard) {
      sendRes(res, false);
      return;
    }
    const chats = await getShowChatFromChatIds(
      campMemberCard.allChatIds,
      getModeBySituation(user.mode, campMemberCard.role, true)
    );
    const output: ChatReady = {
      chats,
      mode: getModeBySituation(user.mode, campMemberCard.role, true),
      sendType: null,
      groupName: camp.groupName,
      timeOffset,
      success: true,
      roomName: "รวมทุกแชต",
      userId: user._id,
      subscribe: `${getSystemInfoRaw().chatText}${camp._id}${user._id}`,
      pusher: getPusherClient(pusherData),
      systemInfo,
    };
    res.status(200).json(output);
  }
}
export async function getPartChat(req: express.Request, res: express.Response) {
  const part = await Part.findById(req.params.id);
  const user = await getUser(req);
  if (!part || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(part.campId);
  if (
    !camp ||
    (!camp.peeIds.includes(user._id) && !camp.petoIds.includes(user._id))
  ) {
    sendRes(res, false);
    return;
  }
  const chats = await getShowChatFromChatIds(part.chatIds, user.mode);
  const timeOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!timeOffset) {
    sendRes(res, false);
    return;
  }
  const pusherData = await PusherData.findById(camp.pusherId);
  const output: ChatReady = {
    chats,
    mode: getModeBySituation(user.mode, "pee", true),
    sendType: {
      roomType: "คุยกันในฝ่าย",
      id: part._id,
    },
    groupName: camp.groupName,
    timeOffset,
    success: true,
    roomName: part._id.equals(camp.partPeeBaanId)
      ? `ห้องพี่${camp.groupName}คุยกัน ! อย่าหลุดสิ่งที่ไม่อยากให้น้องรู้ในแชตนี้`
      : `ฝ่าย${part.partName}`,
    userId: user._id,
    subscribe: `${getSystemInfoRaw().chatText}${part._id}`,
    pusher: getPusherClient(pusherData),
    systemInfo: getSystemInfoRaw(),
  };
  res.status(200).json(output);
}
export async function getNongBaanChat(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCard) {
    sendRes(res, false);
    return;
  }
  const timeOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!timeOffset) {
    sendRes(res, false);
    return;
  }
  const systemInfo = getSystemInfoRaw();
  const pusherData = await PusherData.findById(camp.pusherId);
  switch (campMemberCard.role) {
    case "nong": {
      const nongCamp = await NongCamp.findById(campMemberCard.campModelId);
      if (!nongCamp) {
        sendRes(res, false);
        return;
      }
      const baan = await Baan.findById(nongCamp.baanId);
      if (!baan) {
        sendRes(res, false);
        return;
      }
      const chats = await getShowChatFromChatIds(
        baan.nongChatIds,
        getModeBySituation(user.mode, "nong", true)
      );
      const output: ChatReady = {
        chats,
        mode: getModeBySituation(user.mode, "nong", true),
        sendType: baan.nongSendMessage
          ? {
              id: baan._id,
              roomType: "คุยกันในบ้าน",
            }
          : null,
        groupName: camp.groupName,
        timeOffset,
        success: true,
        roomName: `ห้อง${camp.groupName}${baan.name}`,
        userId: user._id,
        subscribe: `chatNong${baan._id}`,
        pusher: getPusherClient(pusherData),
        systemInfo,
      };
      res.status(200).json(output);
      return;
    }
    case "pee": {
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        sendRes(res, false);
        return;
      }
      const baan = await Baan.findById(peeCamp.baanId);
      if (!baan) {
        sendRes(res, false);
        return;
      }
      const chats = await getShowChatFromChatIds(baan.nongChatIds, user.mode);
      const output: ChatReady = {
        chats,
        mode: getModeBySituation(user.mode, "pee", true),
        sendType: {
          id: baan._id,
          roomType: "คุยกันในบ้าน",
        },
        groupName: camp.groupName,
        timeOffset,
        success: true,
        roomName:
          user.mode == "pee"
            ? `ห้อง${camp.groupName}${baan.name}ที่มีน้องด้วย`
            : `ห้อง${camp.groupName}${baan.name}`,
        userId: user._id,
        subscribe: `chatNong${baan._id}`,
        pusher: getPusherClient(pusherData),
        systemInfo,
      };
      res.status(200).json(output);
      return;
    }
    case "peto": {
      sendRes(res, false);
      return;
    }
  }
}
export async function getPeeBaanChat(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCard || campMemberCard.role !== "pee" || user.mode == "nong") {
    sendRes(res, false);
    return;
  }
  const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
  if (!peeCamp) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(peeCamp.baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const chats = await getShowChatFromChatIds(baan.peeChatIds, "pee");
  const timeOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!timeOffset) {
    sendRes(res, false);
    return;
  }
  const systemInfo = getSystemInfoRaw();
  const pusherData = await PusherData.findById(camp.pusherId);
  const output: ChatReady = {
    chats,
    mode: "pee",
    sendType: {
      id: baan._id,
      roomType: "พี่คุยกันในบ้าน",
    },
    groupName: camp.groupName,
    timeOffset,
    success: true,
    roomName: `ห้อง${camp.groupName}${baan.name}ที่มีแต่พี่`,
    userId: user._id,
    subscribe: `chatPee${baan._id}`,
    pusher: getPusherClient(pusherData),
    systemInfo,
  };
  res.status(200).json(output);
}
export async function getNongChat(req: express.Request, res: express.Response) {
  const campMemberCard = await CampMemberCard.findById(req.params.id);
  const user = await getUser(req);
  if (!campMemberCard || !user) {
    sendRes(res, false);
    return;
  }
  const nongCamp = await NongCamp.findById(campMemberCard.campModelId);
  if (!nongCamp) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(nongCamp.campId);
  const baan = await Baan.findById(nongCamp.baanId);
  if (!camp || !baan) {
    sendRes(res, false);
    return;
  }
  if (
    !campMemberCard.userId.equals(user._id) &&
    !baan.peeIds.includes(user._id)
  ) {
    sendRes(res, false);
    return;
  }
  const host = await User.findById(campMemberCard.userId);
  const chats = await getShowChatFromChatIds(
    campMemberCard.chatIds,
    getModeBySituation(
      user.mode,
      campMemberCard.userId.equals(user._id) ? "nong" : "pee",
      true
    )
  );
  const timeOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!timeOffset || !host) {
    sendRes(res, false);
    return;
  }
  const pusherData = await PusherData.findById(camp.pusherId);
  const output: ChatReady = {
    chats,
    mode: getModeBySituation(
      user.mode,
      campMemberCard.userId.equals(user._id) ? "nong" : "pee",
      true
    ),
    sendType: {
      id: campMemberCard._id,
      roomType: "น้องคุยส่วนตัวกับพี่",
    },
    groupName: camp.groupName,
    timeOffset,
    success: true,
    roomName: `คุยส่วนตัวกับน้อง${host.nickname} บ้าน${baan.name}`,
    userId: user._id,
    subscribe: `${getSystemInfoRaw().chatText}${campMemberCard._id}`,
    pusher: getPusherClient(pusherData),
    systemInfo: getSystemInfoRaw(),
  };
  res.status(200).json(output);
}
export function getSystemInfo(req: express.Request, res: express.Response) {
  const buffer: SystemInfo = getSystemInfoRaw();
  res.status(200).json(buffer);
}
function getModeBySituation(
  mode: Mode,
  role: RoleCamp,
  isHidePart: boolean
): Mode {
  if (!isHidePart) {
    return "pee";
  }
  if (role == "nong") {
    return "nong";
  }
  return mode;
}
export async function getPartPeebaanChat(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const part = await Part.findById(camp.partPeeBaanId);
  if (
    !part ||
    (!camp.peeIds.includes(user._id) && !camp.petoIds.includes(user._id))
  ) {
    sendRes(res, false);
    return;
  }
  const chats = await getShowChatFromChatIds(part.chatIds, user.mode);
  const timeOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!timeOffset) {
    sendRes(res, false);
    return;
  }
  const pusherData = await PusherData.findById(camp.pusherId);
  const output: ChatReady = {
    chats,
    mode: getModeBySituation(user.mode, "pee", true),
    sendType: {
      roomType: "คุยกันในฝ่าย",
      id: part._id,
    },
    groupName: camp.groupName,
    timeOffset,
    success: true,
    roomName:
      user.mode == "pee"
        ? `ห้องพี่${camp.groupName}คุยกัน ! อย่าหลุดสิ่งที่ไม่อยากให้น้องรู้ในแชตนี้`
        : `ห้องพี่${camp.groupName}คุยกัน`,
    userId: user._id,
    subscribe: `${getSystemInfoRaw().chatText}${part._id}`,
    pusher: getPusherClient(pusherData),
    systemInfo: getSystemInfoRaw(),
  };
  res.status(200).json(output);
}
export async function createMeal(req: express.Request, res: express.Response) {
  const input: CreateMeal = req.body;
  const user = await getUser(req);
  const camp = await Camp.findById(input.campId);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  const meal = await Meal.create(input);
  await camp.updateOne({ mealIds: swop(null, meal._id, camp.mealIds) });
  res.status(201).json(resOk);
}
export async function createFood(req: express.Request, res: express.Response) {
  const input: CreateFood = req.body;
  const user = await getUser(req);
  const camp = await Camp.findById(input.campId);
  const meal = await Meal.findById(input.mealId);
  if (!user || !camp || !meal) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  const food = await Food.create(input);
  await camp.updateOne({ foodIds: swop(null, food._id, camp.foodIds) });
  await meal.updateOne({ foodIds: swop(null, food._id, meal.foodIds) });
  res.status(201).json(resOk);
}
export async function getFoodForUpdate(
  req: express.Request,
  res: express.Response
) {
  const food = await Food.findById(req.params.id);
  if (!food) {
    sendRes(res, false);
    return;
  }
  const meal = await Meal.findById(food.mealId);
  const camp = await Camp.findById(food.campId);
  if (!camp || !meal) {
    sendRes(res, false);
    return;
  }

  const nongHealths: HeathIssuePack[] =
    camp.nongDataLock && meal.roles.includes("nong")
      ? await getHealthIssuePack(
          camp.nongCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const peeHealths: HeathIssuePack[] =
    camp.peeDataLock && meal.roles.includes("pee")
      ? await getHealthIssuePack(
          camp.peeCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const petoHealths: HeathIssuePack[] =
    camp.petoDataLock && meal.roles.includes("peto")
      ? await getHealthIssuePack(
          camp.petoCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const {
    isWhiteList,
    name,
    lists,
    _id,
    isSpicy,
    nongCampMemberCardIds,
    peeCampMemberCardIds,
    petoCampMemberCardIds,
    listPriority,
  } = food;
  const buffer: GetFoodForUpdate = {
    name,
    nongHealths,
    peeHealths,
    petoHealths,
    lists,
    _id,
    isSpicy,
    camp,
    isWhiteList,
    time: meal.time,
    nongCampMemberCardIds,
    peeCampMemberCardIds,
    petoCampMemberCardIds,
    listPriority,
  };
  res.status(200).json(buffer);
}
export async function getHealthIssuePack(
  campMemberCardIds: Id[],
  isValid: (input: HeathIssuePack) => boolean,
  optionalArray?: HeathIssuePack[]
) {
  let i = 0;
  const healthPacks: HeathIssuePack[] = [];
  while (i < campMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      campMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    const user = await User.findById(campMemberCard.userId);
    if (!heathIssue || !user) {
      continue;
    }
    const buffer: HeathIssuePack = {
      user,
      heathIssue,
      campMemberCardId: campMemberCard._id,
    };
    ifIsTrue(isValid(buffer), buffer, healthPacks, optionalArray);
  }
  return healthPacks;
}
export async function updateFood(req: express.Request, res: express.Response) {
  const input: UpdateFood = req.body;
  const user = await getUser(req);
  const food = await Food.findById(input._id);
  if (!user || !food) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(food.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  if (input.isWhiteList == food.isWhiteList) {
    const removeNong = removeDuplicate(
      food.nongCampMemberCardIds,
      input.nongCampMemberCardIds
    );
    const addNong = removeDuplicate(
      input.nongCampMemberCardIds,
      food.nongCampMemberCardIds
    );
    const removePee = removeDuplicate(
      food.peeCampMemberCardIds,
      input.peeCampMemberCardIds
    );
    const addPee = removeDuplicate(
      input.peeCampMemberCardIds,
      food.peeCampMemberCardIds
    );
    const removePeto = removeDuplicate(
      food.petoCampMemberCardIds,
      input.petoCampMemberCardIds
    );
    const addPeto = removeDuplicate(
      input.petoCampMemberCardIds,
      food.petoCampMemberCardIds
    );
    let {
      nongCampMemberCardIds,
      nongIds,
      nongHeathIssueIds,
      peeCampMemberCardIds,
      peeIds,
      peeHeathIssueIds,
      petoCampMemberCardIds,
      petoIds,
      petoHeathIssueIds,
    } = food;
    let i = 0;
    while (i < removeNong.length) {
      const campMemberCard = await CampMemberCard.findById(removeNong[i++]);
      if (!campMemberCard) {
        continue;
      }
      nongIds = swop(campMemberCard.userId, null, nongIds);
      nongCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        nongCampMemberCardIds
      );
      nongHeathIssueIds = swop(
        campMemberCard.healthIssueId,
        null,
        nongHeathIssueIds
      );
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < addNong.length) {
      const campMemberCard = await CampMemberCard.findById(addNong[i++]);
      if (!campMemberCard) {
        continue;
      }
      nongIds = swop(null, campMemberCard.userId, nongIds);
      nongCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        nongCampMemberCardIds
      );
      nongHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        nongHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < removePee.length) {
      const campMemberCard = await CampMemberCard.findById(removePee[i++]);
      if (!campMemberCard) {
        continue;
      }
      peeIds = swop(campMemberCard.userId, null, peeIds);
      peeCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        peeCampMemberCardIds
      );
      peeHeathIssueIds = swop(
        campMemberCard.healthIssueId,
        null,
        peeHeathIssueIds
      );
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < addPee.length) {
      const campMemberCard = await CampMemberCard.findById(addPee[i++]);
      if (!campMemberCard) {
        continue;
      }
      peeIds = swop(null, campMemberCard.userId, peeIds);
      peeCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        peeCampMemberCardIds
      );
      peeHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        peeHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < removePeto.length) {
      const campMemberCard = await CampMemberCard.findById(removePeto[i++]);
      if (!campMemberCard) {
        continue;
      }
      petoIds = swop(campMemberCard.userId, null, petoIds);
      petoCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        petoCampMemberCardIds
      );
      petoHeathIssueIds = swop(
        campMemberCard.healthIssueId,
        null,
        petoHeathIssueIds
      );
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < addPeto.length) {
      const campMemberCard = await CampMemberCard.findById(addPeto[i++]);
      if (!campMemberCard) {
        continue;
      }
      petoIds = swop(null, campMemberCard.userId, petoIds);
      petoCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        petoCampMemberCardIds
      );
      petoHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        petoHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    const { name, lists } = input;
    await food.updateOne({
      nongCampMemberCardIds,
      nongIds,
      nongHeathIssueIds,
      peeCampMemberCardIds,
      peeIds,
      peeHeathIssueIds,
      petoCampMemberCardIds,
      petoIds,
      petoHeathIssueIds,
      name,
      lists,
    });
  } else {
    let nongCampMemberCardIds: Id[] = [];
    let nongIds: Id[] = [];
    let nongHeathIssueIds: Id[] = [];
    let peeCampMemberCardIds: Id[] = [];
    let peeIds: Id[] = [];
    let peeHeathIssueIds: Id[] = [];
    let petoCampMemberCardIds: Id[] = [];
    let petoIds: Id[] = [];
    let petoHeathIssueIds: Id[] = [];
    let i = 0;
    while (i < food.nongCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        food.nongCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < input.nongCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        input.nongCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      nongIds = swop(null, campMemberCard.userId, nongIds);
      nongCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        nongCampMemberCardIds
      );
      nongHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        nongHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < food.peeCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        food.peeCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < input.peeCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        input.peeCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      peeIds = swop(null, campMemberCard.userId, peeIds);
      peeCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        peeCampMemberCardIds
      );
      peeHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        peeHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < food.petoCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        food.petoCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < input.petoCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        input.petoCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      petoIds = swop(null, campMemberCard.userId, petoIds);
      petoCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        petoCampMemberCardIds
      );
      petoHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        petoHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    const { name, isWhiteList, lists } = input;
    await food.updateOne({
      nongCampMemberCardIds,
      nongIds,
      nongHeathIssueIds,
      peeCampMemberCardIds,
      peeIds,
      peeHeathIssueIds,
      petoCampMemberCardIds,
      petoIds,
      petoHeathIssueIds,
      name,
      isWhiteList,
      lists,
    });
  }
  sendRes(res, true);
}
export async function getMealByUser(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const meal = await getMealByUserRaw(user._id, stringToId(req.params.id));
  if (!meal) {
    sendRes(res, false);
    return;
  }
  res.status(200).json(meal);
}
export async function getMealByUserRaw(userId: Id, mealId: Id) {
  const user = await User.findById(userId);
  const meal = await Meal.findById(mealId);
  if (!user || !meal) {
    return null;
  }
  const camp = await Camp.findById(meal.campId);
  if (!camp) {
    return null;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCard) {
    return null;
  }
  const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
  const whiteLists: InterFood[] = [];
  const blackLists: InterFood[] = [];
  let i = 0;
  if (!healthIssue) {
    while (i < meal.foodIds.length) {
      const food = await Food.findById(meal.foodIds[i++]);
      if (!food) {
        continue;
      }
      if (food.isWhiteList) {
        blackLists.push(food);
      } else {
        whiteLists.push(food);
      }
    }
  } else {
    while (i < meal.foodIds.length) {
      const food = await Food.findById(meal.foodIds[i++]);
      if (!food) {
        continue;
      }
      if (campMemberCard.whiteListFoodIds.includes(food._id)) {
        whiteLists.push(food);
      } else if (
        campMemberCard.blackListFoodIds.includes(food._id) ||
        food.listPriority
      ) {
        blackLists.push(food);
      } else {
        switch (healthIssue.foodLimit) {
          case "อิสลาม": {
            if (healthIssue.spicy) {
              if (!food.isSpicy && food.lists.includes("อิสลาม")) {
                whiteLists.push(food);
              } else {
                blackLists.push(food);
              }
            } else {
              if (food.lists.includes("อิสลาม")) {
                whiteLists.push(food);
              } else {
                blackLists.push(food);
              }
            }
            break;
          }
          case "มังสวิรัติ": {
            if (healthIssue.spicy) {
              if (!food.isSpicy && food.lists.includes("มังสวิรัติ")) {
                whiteLists.push(food);
              } else {
                blackLists.push(food);
              }
            } else {
              if (food.lists.includes("มังสวิรัติ")) {
                whiteLists.push(food);
              } else {
                blackLists.push(food);
              }
            }
            break;
          }
          case "เจ": {
            if (healthIssue.spicy) {
              if (!food.isSpicy && food.lists.includes("เจ")) {
                whiteLists.push(food);
              } else {
                blackLists.push(food);
              }
            } else {
              if (food.lists.includes("เจ")) {
                whiteLists.push(food);
              } else {
                blackLists.push(food);
              }
            }
            break;
          }
          case "ไม่มีข้อจำกัดด้านความเชื่อ": {
            if (healthIssue.spicy) {
              if (food.isSpicy) {
                blackLists.push(food);
              } else {
                whiteLists.push(food);
              }
            } else {
              if (food.isWhiteList) {
                blackLists.push(food);
              } else {
                whiteLists.push(food);
              }
            }
            break;
          }
        }
      }
    }
  }
  const buffer: GetMeals = {
    time: meal.time,
    whiteLists,
    blackLists,
  };
  return buffer;
}
async function deleteFoodRaw(foodId: Id): Promise<boolean> {
  const food = await Food.findById(foodId);
  if (!food) {
    return false;
  }
  const camp = await Camp.findById(food.campId);
  const meal = await Meal.findById(food.mealId);
  if (!camp || !meal) {
    return false;
  }
  await camp.updateOne({ foodIds: swop(food._id, null, camp.foodIds) });
  await meal.updateOne({ foodIds: swop(food._id, null, meal.foodIds) });
  let i = 0;
  while (i < food.nongCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      food.nongCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    if (food.isWhiteList) {
      await campMemberCard.updateOne({
        whiteListFoodIds: swop(food._id, null, campMemberCard.whiteListFoodIds),
      });
    } else {
      await campMemberCard.updateOne({
        blackListFoodIds: swop(food._id, null, campMemberCard.blackListFoodIds),
      });
    }
  }
  i = 0;
  while (i < food.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      food.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    if (food.isWhiteList) {
      await campMemberCard.updateOne({
        whiteListFoodIds: swop(food._id, null, campMemberCard.whiteListFoodIds),
      });
    } else {
      await campMemberCard.updateOne({
        blackListFoodIds: swop(food._id, null, campMemberCard.blackListFoodIds),
      });
    }
  }
  i = 0;
  while (i < food.petoCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      food.petoCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    if (food.isWhiteList) {
      await campMemberCard.updateOne({
        whiteListFoodIds: swop(food._id, null, campMemberCard.whiteListFoodIds),
      });
    } else {
      await campMemberCard.updateOne({
        blackListFoodIds: swop(food._id, null, campMemberCard.blackListFoodIds),
      });
    }
  }
  await food.deleteOne();
  return true;
}
export async function deleteFood(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const food = await Food.findById(req.params.id);
  if (!user || !food) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(food.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  const success = await deleteFoodRaw(food._id);
  sendRes(res, success);
}
export async function deleteMeal(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const meal = await Meal.findById(req.params.id);
  if (!user || !meal) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(meal.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  await camp.updateOne({ mealIds: swop(meal._id, null, camp.mealIds) });
  let i = 0;
  const foodIds = meal.foodIds.map((e) => e);
  while (i < foodIds.length) {
    await deleteFoodRaw(foodIds[i++]);
  }
  await meal.deleteOne();
  sendRes(res, true);
}
export async function getFoods(req: express.Request, res: express.Response) {
  const meal = await Meal.findById(req.params.id);
  if (!meal) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  const foods: InterFood[] = [];
  while (i < meal.foodIds.length) {
    const food = await Food.findById(meal.foodIds[i++]);
    if (!food) {
      continue;
    }
    foods.push(food);
  }
  res.status(200).json(foods);
}
export async function getMeal(req: express.Request, res: express.Response) {
  const meal = await Meal.findById(req.params.id);
  res.status(200).json(meal);
}
export async function updateMeal(req: express.Request, res: express.Response) {
  const input: UpdateMeal = req.body;
  const user = await getUser(req);
  const meal = await Meal.findById(input.mealId);
  if (!user || !meal) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(meal.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  await meal.updateOne({ time: input.time, roles: input.roles });
}
async function getShowSongRaw(
  song: InterSong,
  userId: Id | null
): Promise<ShowSong> {
  let i = 0;
  const campNames: string[] = [];
  const baanNames: string[] = [];
  const baanRelates: string[] = [];
  const campRelates: string[] = [];
  const { name, campIds, baanIds, author, time, link, userLikeIds, _id } = song;
  while (i < baanIds.length) {
    const baan = await Baan.findById(baanIds[i++]);
    if (!baan) {
      continue;
    }
    const camp = await Camp.findById(baan.campId);
    if (!camp) {
      continue;
    }
    baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    if (!userId) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(userId.toString())
    );
    if (!campMemberCard) {
      continue;
    }
    switch (campMemberCard.role) {
      case "nong": {
        if (baan.nongIds.includes(userId)) {
          baanRelates.push(
            `น้องค่าย ${camp.groupName}${baan.name} จากค่าย ${camp.campName}`
          );
        }
        break;
      }
      case "pee": {
        if (baan.peeIds.includes(userId)) {
          baanRelates.push(
            `พี่${camp.groupName} ${camp.groupName}${baan.name} จากค่าย ${camp.campName}`
          );
        }
        break;
      }
      case "peto": {
        break;
      }
    }
  }
  i = 0;
  while (i < campIds.length) {
    const camp = await Camp.findById(campIds[i++]);
    if (!camp) {
      continue;
    }
    campNames.push(camp.campName);
    if (!userId) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(userId.toString())
    );
    if (!campMemberCard) {
      continue;
    }
    switch (campMemberCard.role) {
      case "nong": {
        campRelates.push(`น้องค่าย ${camp.campName}`);
        break;
      }
      case "pee": {
        campRelates.push(`พี่${camp.groupName} ${camp.campName}`);
        break;
      }
      case "peto": {
        campRelates.push(`พี่ปีโต ${camp.campName}`);
        break;
      }
    }
  }
  const buffer: ShowSong = {
    campNames,
    campRelates,
    baanNames,
    baanRelates,
    like: userLikeIds.length,
    time,
    name,
    author,
    link,
    _id,
  };
  return buffer;
}
export async function getMenuSongs(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const songs = await Song.find();
  const out: ShowSong[] = [];
  let i = 0;
  if (!user) {
    while (i < songs.length) {
      const song = await getShowSongRaw(songs[i++], null);
      out.push(song);
    }
    const buffer: GetMenuSongs = {
      songs: out,
      likeSongIds: [],
      authBaans: [],
      authCamps: [],
    };
    res.status(200).json(buffer);
  } else {
    while (i < songs.length) {
      const song = await getShowSongRaw(songs[i++], user._id);
      out.push(song);
    }
    i = 0;
    const authBaans: {
      data: BasicBaan;
      showName: string;
    }[] = [];
    const authCamps: BasicCamp[] = [];
    while (i < user.authPartIds.length) {
      const part = await Part.findById(user.authPartIds[i++]);
      if (!part) {
        continue;
      }
      const camp: InterCampBack | null = await Camp.findById(part.campId);
      if (!camp) {
        continue;
      }
      const auths = await getAuthTypes(user._id, camp._id);
      if (!auths) {
        continue;
      }
      if (user.authPartIds.includes(camp.partBoardId)) {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          authBaans.push({
            data: baan,
            showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
          });
        }
        authCamps.push(camp);
        continue;
      }
      if (auths.includes("pr/studio")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            authCamps.push(camp);
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            authCamps.push(camp);
            break;
          }
        }
        continue;
      }
      if (auths.includes("หัวหน้าพี่เลี้ยง")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            break;
          }
        }
        continue;
      }
    }
    const buffer: GetMenuSongs = {
      songs: out,
      likeSongIds: user.likeSongIds,
      authBaans,
      authCamps,
    };
    res.status(200).json(buffer);
  }
}
export async function createSong(req: express.Request, res: express.Response) {
  await Song.create(req.body);
  res.status(201).json(resOk);
}
export async function getShowSong(req: express.Request, res: express.Response) {
  const song = await Song.findById(req.params.id);
  if (!song) {
    sendRes(res, false);
    return;
  }
  const user = await getUser(req);
  if (!user) {
    const out = await getShowSongRaw(song, null);
    const buffer: ShowSongPage = {
      song: out,
      authBaans: [],
      authCamps: [],
      likeSongIds: [],
    };
    res.status(200).json(buffer);
  } else {
    const out = await getShowSongRaw(song, user._id);
    let i = 0;
    const authBaans: {
      data: BasicBaan;
      showName: string;
    }[] = [];
    const authCamps: BasicCamp[] = [];
    while (i < user.authPartIds.length) {
      const part = await Part.findById(user.authPartIds[i++]);
      if (!part) {
        continue;
      }
      const camp: InterCampBack | null = await Camp.findById(part.campId);
      if (!camp) {
        continue;
      }
      const auths = await getAuthTypes(user._id, camp._id);
      if (!auths) {
        continue;
      }
      if (user.authPartIds.includes(camp.partBoardId)) {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          authBaans.push({
            data: baan,
            showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
          });
        }
        authCamps.push(camp);
        continue;
      }
      if (auths.includes("pr/studio")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            authCamps.push(camp);
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            authCamps.push(camp);
            break;
          }
        }
        continue;
      }
      if (auths.includes("หัวหน้าพี่เลี้ยง")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            break;
          }
        }
        continue;
      }
    }
    const buffer: ShowSongPage = {
      song: out,
      authBaans,
      authCamps,
      likeSongIds: user.likeSongIds,
    };
    res.status(200).json(buffer);
  }
}
export async function addCampSong(req: express.Request, res: express.Response) {
  const { songIds }: { songIds: Id[] } = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await addCampSongRaw(stringToId(req.params.id), songIds, user._id);
  sendRes(res, true);
}
async function addCampSongRaw(campId: Id, songIds: Id[], userId: Id) {
  const camp = await Camp.findById(campId);
  const user = await User.findById(userId);
  if (!camp || !user) {
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths) {
    return;
  }
  if (
    !auths.includes("pr/studio") &&
    user.authPartIds.includes(camp.partBoardId as Id)
  ) {
    return;
  }
  const add = removeDuplicate(songIds, camp.songIds);
  const remove = removeDuplicate(camp.songIds, songIds);
  let likeSongIds = camp.songIds;
  let i = 0;
  while (i < add.length) {
    const song = await Song.findById(add[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(null, song._id, likeSongIds);
    await song.updateOne({
      campIds: swop(null, camp._id, song.campIds),
    });
  }
  i = 0;
  while (i < remove.length) {
    const song = await Song.findById(remove[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(song._id, null, likeSongIds);
    await song.updateOne({
      campIds: swop(camp._id, null, song.campIds),
    });
  }
  await camp.updateOne({ songIds: likeSongIds });
}
export async function updateSongPage(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const input: UpdateSongPage = req.body;
  if (!user) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < input.baans.length) {
    const baan = input.baans[i++];
    await addBaanSongRaw(baan._id, baan.songIds, user._id);
  }
  i = 0;
  while (i < input.camps.length) {
    const camp = input.camps[i++];
    await addCampSongRaw(camp._id, camp.songIds, user._id);
  }
  await addLikeSongRaw(user._id, input.userLikeSongIds);
  sendRes(res, true);
}
export async function getShowCampSongs(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const camp = await Camp.findById(req.params.id);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const nongLikeSongs = await getUserLikeSong(camp.nongIds);
  const peeLikeSongs = await getUserLikeSong(camp.peeIds);
  const petoLikeSongs = await getUserLikeSong(camp.petoIds);
  const songs = await Song.find();
  const outputs: ShowCampSong[] = [];
  let i = 0;
  while (i < songs.length) {
    const { _id, name, userLikeIds, link, author, time, baanIds, campIds } =
      songs[i++];
    let j = 0;
    const campNames: string[] = [];
    const baanNames: string[] = [];
    while (j < baanIds.length) {
      const baan = await Baan.findById(baanIds[j++]);
      if (!baan) {
        continue;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        continue;
      }
      baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    }
    i = 0;
    while (i < campIds.length) {
      const camp = await Camp.findById(campIds[i++]);
      if (!camp) {
        continue;
      }
      campNames.push(camp.campName);
    }
    outputs.push({
      _id,
      like: userLikeIds.length,
      name,
      link,
      author,
      nongLike: nongLikeSongs.get(_id.toString()) || 0,
      peeLike: peeLikeSongs.get(_id.toString()) || 0,
      petoLike: petoLikeSongs.get(_id.toString()) || 0,
      time,
      campNames,
      baanNames,
    });
  }
  res.status(200).json(outputs);
}
export async function getShowBaanSongs(
  req: express.Request,
  res: express.Response
) {
  const baan = await Baan.findById(req.params.id);
  const user = await getUser(req);
  if (!baan || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const nongLikeSongs = await getUserLikeSong(baan.nongIds);
  const peeLikeSongs = await getUserLikeSong(baan.peeIds);
  const songs = await Song.find();
  const outputs: ShowCampSong[] = [];
  let i = 0;
  while (i < songs.length) {
    const { _id, name, userLikeIds, link, author, time, baanIds, campIds } =
      songs[i++];
    let j = 0;
    const campNames: string[] = [];
    const baanNames: string[] = [];
    while (j < baanIds.length) {
      const baan = await Baan.findById(baanIds[j++]);
      if (!baan) {
        continue;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        continue;
      }
      baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    }
    i = 0;
    while (i < campIds.length) {
      const camp = await Camp.findById(campIds[i++]);
      if (!camp) {
        continue;
      }
      campNames.push(camp.campName);
    }
    outputs.push({
      _id,
      like: userLikeIds.length,
      name,
      link,
      author,
      nongLike: nongLikeSongs.get(_id.toString()) || 0,
      peeLike: peeLikeSongs.get(_id.toString()) || 0,
      petoLike: 0,
      time,
      campNames,
      baanNames,
    });
  }
  const buffer: ShowCampSongReady = {
    showCampSongs: outputs,
    groupName: camp.groupName,
    baanName: baan.name,
    songIds: baan.songIds,
    _id: baan._id,
    userLikeSongIds: user.likeSongIds,
  };
  res.status(200).json(buffer);
}
export async function getAuthSongs(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const camp: InterCampBack | null = await Camp.findById(req.params.id);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id)
  );
  if (!campMemberCard) {
    sendRes(res, false);
    return;
  }
  let authCamp: boolean;
  const baans: BasicBaan[] = [];
  let i = 0;
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths) {
    sendRes(res, false);
    return;
  }
  if (user.authPartIds.includes(camp.partBoardId)) {
    let j = 0;
    while (j < camp.baanIds.length) {
      const baan = await Baan.findById(camp.baanIds[j++]);
      if (!baan) {
        continue;
      }
      baans.push(baan);
    }
    authCamp = true;
  } else if (auths.includes("pr/studio")) {
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(user._id)
    );
    if (!campMemberCard) {
      sendRes(res, false);
      return;
    }
    switch (campMemberCard.role) {
      case "nong": {
        sendRes(res, false);
        return;
      }
      case "pee": {
        const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
        if (!peeCamp) {
          sendRes(res, false);
          return;
        }
        const baan = await Baan.findById(peeCamp.baanId);
        if (!baan) {
          sendRes(res, false);
          return;
        }
        baans.push(baan);
        authCamp = true;
        break;
      }
      case "peto": {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          baans.push(baan);
        }
        authCamp = true;
        break;
      }
    }
  } else if (auths.includes("หัวหน้าพี่เลี้ยง")) {
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(user._id)
    );
    if (!campMemberCard) {
      sendRes(res, false);
      return;
    }
    switch (campMemberCard.role) {
      case "nong": {
        sendRes(res, false);
        return;
      }

      case "pee": {
        const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
        if (!peeCamp) {
          sendRes(res, false);
          return;
        }
        const baan = await Baan.findById(peeCamp.baanId);
        if (!baan) {
          sendRes(res, false);
          return;
        }
        baans.push(baan);
        authCamp = false;
        break;
      }
      case "peto": {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          baans.push(baan);
        }
        authCamp = false;
        break;
      }
    }
  } else {
    sendRes(res, false);
    return;
  }
  const songs = await Song.find();
  const outputs: ShowCampSong[] = [];
  i = 0;
  const nongLikeSongs = await getUserLikeSong(camp.nongIds);
  const peeLikeSongs = await getUserLikeSong(camp.peeIds);
  const petoLikeSongs = await getUserLikeSong(camp.petoIds);
  while (i < songs.length) {
    const { _id, name, userLikeIds, link, author, time, baanIds, campIds } =
      songs[i++];
    let j = 0;
    const campNames: string[] = [];
    const baanNames: string[] = [];
    while (j < baanIds.length) {
      const baan = await Baan.findById(baanIds[j++]);
      if (!baan) {
        continue;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        continue;
      }
      baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    }
    j = 0;
    while (j < campIds.length) {
      const camp = await Camp.findById(campIds[j++]);
      if (!camp) {
        continue;
      }
      campNames.push(camp.campName);
    }
    outputs.push({
      _id,
      like: userLikeIds.length,
      name,
      link,
      author,
      time,
      campNames,
      baanNames,
      nongLike: nongLikeSongs.get(_id.toString()) || 0,
      peeLike: peeLikeSongs.get(_id.toString()) || 0,
      petoLike: petoLikeSongs.get(_id.toString()) || 0,
    });
  }
  const buffer: AuthSongsCamp = {
    authCamp,
    baans,
    camp,
    songs: outputs,
    userLikeSongIds: user.likeSongIds,
  };
  res.status(200).json(buffer);
}
export async function getShowChatFromChat(chat: InterChat, mode: Mode) {
  const {
    message,
    userId,
    role,
    campModelId,
    typeChat,
    refId,
    campMemberCardIds,
    date,
    _id,
  } = chat;
  let baanName: string;
  let partName: string;
  const user = await User.findById(userId);
  switch (role) {
    case "pee": {
      const peeCamp = await PeeCamp.findById(campModelId);
      if (!peeCamp || !user) {
        return null;
      }
      const part = await Part.findById(peeCamp.partId);
      const baan = await Baan.findById(peeCamp.baanId);
      if (!part || !baan) {
        return null;
      }
      partName = part.partName;
      baanName = baan.name;
      break;
    }
    case "peto": {
      const petoCamp = await PetoCamp.findById(campModelId);
      if (!petoCamp || !user) {
        return null;
      }
      const part = await Part.findById(petoCamp.partId);
      if (!part) {
        return null;
      }
      partName = part.partName;
      baanName = "ปีโต";
      break;
    }
    case "nong": {
      const nongCamp = await NongCamp.findById(chat.campModelId);
      if (!user || !nongCamp) {
        return null;
      }
      const baan = await Baan.findById(nongCamp.baanId);
      if (!baan) {
        return null;
      }
      partName = "น้องค่าย";
      baanName = baan.name;
    }
  }
  let roomName: string;
  switch (chat.typeChat) {
    case "คุยกันในบ้าน": {
      const baan = await Baan.findById(chat.refId);
      if (!baan) {
        return null;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        return null;
      }
      roomName = `${camp.groupName}${baan.name}`;
      break;
    }
    case "พี่บ้านคุยกัน": {
      const part = await Part.findById(chat.refId);
      if (!part) {
        return null;
      }
      const camp = await Camp.findById(part.campId);
      if (!camp) {
        return null;
      }
      roomName = `พี่${camp.groupName}`;
      break;
    }
    case "น้องคุยส่วนตัวกับพี่": {
      const campMemberCard = await CampMemberCard.findById(chat.refId);
      if (!campMemberCard) {
        return null;
      }
      const user = await User.findById(campMemberCard.userId);
      const nongCamp = await NongCamp.findById(campMemberCard.campModelId);
      if (!user || !nongCamp) {
        return null;
      }
      const baan = await Baan.findById(nongCamp.baanId);
      if (!baan) {
        return null;
      }
      roomName = `น้อง${user.nickname} บ้าน${baan.name}`;
      break;
    }
    case "คุยกันในฝ่าย": {
      const part = await Part.findById(chat.refId);
      if (!part || mode == "nong") {
        return null;
      }
      const camp = await Camp.findById(part.campId);
      if (!camp) {
        return null;
      }
      roomName = `ฝ่าย${part.partName}`;
      break;
    }
    case "พี่คุยกันในบ้าน": {
      const baan = await Baan.findById(chat.refId);
      if (!baan || mode == "nong") {
        return null;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        return null;
      }
      roomName = `พี่${camp.groupName}${baan.name}`;
      break;
    }
  }
  const buffer: ShowChat = {
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
    _id,
  };

  return buffer;
}
export async function realTimeScoring(
  req: express.Request,
  res: express.Response
) {
  const buffer: SendData<ScoreEvent> = req.body;
  const pusher = new Pusher(buffer.pusherData);

  await pusher.trigger(
    buffer.chanel,
    buffer.event,
    JSON.stringify(buffer.data)
  );
  console.log(buffer.data);
  sendRes(res, true);
}
