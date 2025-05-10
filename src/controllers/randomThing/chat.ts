import express from "express";
import { getUser } from "../../middleware/auth";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import Chat from "../../models/Chat";
import {
  CreatePeeChat,
  TypeChat,
  Id,
  Mode,
  ShowChat,
  EditChat,
  CreateNongChat,
  CreateBaanChat,
  ChatReady,
  SystemInfo,
  RoleCamp,
  InterChat,
} from "../../models/interface";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import TimeOffset from "../../models/TimeOffset";
import User from "../../models/User";
import { sendRes, swop, getSystemInfoRaw, stringToId } from "../setup";
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
  const campMemberCardIds: Id[] = [];
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds);
    if (!baan) {
      continue;
    }
    campMemberCardIds.push(...baan.peeCampMemberCardIds);
  }
  const chat = await Chat.create({
    message: create.message,
    userId: user._id,
    campModelId: campMemberCard.campModelId,
    role: campMemberCard.role,
    typeChat,
    refId: part._id,
    campMemberCardIds,
  });
  await campMemberCard.updateOne({
    ownChatIds: swop(null, chat._id, campMemberCard.ownChatIds),
  });
  await camp.updateOne({
    allPetoChatIds: swop(null, chat._id, camp.allPetoChatIds),
  });
  i = 0;
  while (i < campMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      campMemberCardIds[i++]
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
  }
  await part.updateOne({ chatIds: swop(null, chat._id, part.chatIds) });
  const showChat = await getShowChatFromChat(chat, "pee");
  res.status(201).json(showChat);
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
        const camp = await Camp.findById(nongCamp.campId);
        const baan = await Baan.findById(nongCamp.baanId);
        if (!camp || !baan) {
          continue;
        }
        partName = camp.nongCall;
        baanName = baan.name;
      }
    }
    let roomName: string;
    let canReadInModeNong: boolean;
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
        canReadInModeNong = true;
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
        canReadInModeNong = true;
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
        canReadInModeNong = true;
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
        canReadInModeNong = false;
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
        canReadInModeNong = false;
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
      canReadInModeNong,
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
  }
  const showChat = await getShowChatFromChat(chat, "pee");
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
  res.status(201).json(showChat);
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
  }
  const showChat = await getShowChatFromChat(chat, user.mode);
  if (!showChat) {
    sendRes(res, false);
    return;
  }
  await baan.updateOne({ peeChatIds: swop(null, chat._id, baan.peeChatIds) });
  res.status(201).json(showChat);
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
  }
  await campMemberCardSender.updateOne({
    ownChatIds: swop(null, chat._id, campMemberCardSender.ownChatIds),
  });
  await chat.updateOne({ campMemberCardIds });
  await baan.updateOne({ nongChatIds: swop(null, chat._id, baan.nongChatIds) });

  const showChat = await getShowChatFromChat(chat, "pee");
  res.status(201).json(showChat);
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
  if (camp.petoIds.includes(user._id)) {
    const chats = await getShowChatFromChatIds(camp.allPetoChatIds, user.mode);
    const output: ChatReady = {
      chats,
      mode: getModeBySituation(user.mode, "peto", true),
      sendType: null,
      timeOffset,
      success: true,
      roomName: "รวมทุกแชต",
      userId: user._id,
      subscribe: `${camp._id}${user._id}`,
      camp,
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
      timeOffset,
      success: true,
      roomName: "รวมทุกแชต",
      userId: user._id,
      subscribe: `${camp._id}${user._id}`,
      camp,
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
  const output: ChatReady = {
    chats,
    mode: getModeBySituation(user.mode, "pee", true),
    sendType: {
      roomType: "คุยกันในฝ่าย",
      id: part._id,
    },
    timeOffset,
    success: true,
    roomName: part._id.equals(camp.partPeeBaanId)
      ? `ห้องพี่${camp.groupName}คุยกัน ! อย่าหลุดสิ่งที่ไม่อยากให้น้องรู้ในแชตนี้`
      : `ฝ่าย${part.partName}`,
    userId: user._id,
    subscribe: `${part._id}`,
    camp,
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
        timeOffset,
        success: true,
        roomName: `ห้อง${camp.groupName}${baan.name}`,
        userId: user._id,
        subscribe: `Nong${baan._id}`,
        camp,
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
        timeOffset,
        success: true,
        roomName:
          user.mode == "pee"
            ? `ห้อง${camp.groupName}${baan.name}ที่มีน้องด้วย`
            : `ห้อง${camp.groupName}${baan.name}`,
        userId: user._id,
        subscribe: `Nong${baan._id}`,
        camp,
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
  const output: ChatReady = {
    chats,
    mode: "pee",
    sendType: {
      id: baan._id,
      roomType: "พี่คุยกันในบ้าน",
    },
    timeOffset,
    success: true,
    roomName: `ห้อง${camp.groupName}${baan.name}ที่มีแต่พี่`,
    userId: user._id,
    camp,
    subscribe: `Pee${baan._id}`,
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
    timeOffset,
    success: true,
    roomName: `คุยส่วนตัวกับน้อง${host.nickname} บ้าน${baan.name}`,
    userId: user._id,
    subscribe: `${campMemberCard._id}`,
    camp,
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
  const output: ChatReady = {
    chats,
    mode: getModeBySituation(user.mode, "pee", true),
    sendType: {
      roomType: "คุยกันในฝ่าย",
      id: part._id,
    },
    timeOffset,
    success: true,
    roomName:
      user.mode == "pee"
        ? `ห้องพี่${camp.groupName}คุยกัน ! อย่าหลุดสิ่งที่ไม่อยากให้น้องรู้ในแชตนี้`
        : `ห้องพี่${camp.groupName}คุยกัน`,
    userId: user._id,
    subscribe: `${part._id}`,
    camp,
  };
  res.status(200).json(output);
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
      const camp = await Camp.findById(nongCamp.campId);
      if (!baan || !camp) {
        return null;
      }
      partName = camp.nongCall;
      baanName = baan.name;
    }
  }
  let roomName: string;
  let canReadInModeNong: boolean;
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
      canReadInModeNong = true;
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
      canReadInModeNong = true;
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
      canReadInModeNong = true;
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
      canReadInModeNong = false;
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
      canReadInModeNong = false;
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
    canReadInModeNong,
  };
  return buffer;
}
