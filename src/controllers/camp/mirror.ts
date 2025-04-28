import express from "express";
import {
  BasicBaan,
  BasicUser,
  CreateMirror,
  GetMirrorBaan,
  GetMirrorPack,
  GetMirrorUser,
  Id,
  InterCampMemberCard,
  TriggerMirrorBaan,
  TriggerMirrorUser,
  UpdateMirror,
} from "../../models/interface";
import { getUser } from "../../middleware/auth";
import CampMemberCard from "../../models/CampMemberCard";
import { sendRes, swop } from "../setup";
import NongCamp from "../../models/NongCamp";
import Baan from "../../models/Baan";
import PeeCamp from "../../models/PeeCamp";
import Mirror from "../../models/Mirror";
import User from "../../models/User";
// export async function createMirrorUser
// export async function updateMirrorUser
// export async function deleteMirrorUser
// export async function createMirrorBaan
// export async function updateMirrorBaan
// export async function deleteMirrorBaan
export async function createMirrorUser(
  req: express.Request,
  res: express.Response
) {
  const input: CreateMirror = req.body;
  const user = await getUser(req);
  const myCampMemberCard = await CampMemberCard.findById(
    input.senderCampMemberCardId
  );
  if (
    !user ||
    !myCampMemberCard ||
    myCampMemberCard.userId.toString() != user._id.toString() ||
    input.types == "baan"
  ) {
    sendRes(res, false);
    return;
  }
  let baanId: Id | null | undefined;
  switch (myCampMemberCard.role) {
    case "nong": {
      const campModel = await NongCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "peto": {
      sendRes(res, false);
      return;
    }
  }
  const baan = await Baan.findById(baanId);
  if (!baan || !baan.canWriteMirror) {
    sendRes(res, false);
    return;
  }

  const receiverCampMemberCard = await CampMemberCard.findById(input.receiverId);
  if (!receiverCampMemberCard) {
    sendRes(res, false);
    return;
  }
  const receiver = await User.findById(receiverCampMemberCard.userId);
  if (!receiver) {
    sendRes(res, false);
    return;
  }
  const mirror = await Mirror.create(input);
  await myCampMemberCard.updateOne({
    mirrorSenderIds: swop(null, mirror._id, myCampMemberCard.mirrorSenderIds),
  });
  await receiverCampMemberCard.updateOne({
    mirrorReceiverIds: swop(
      null,
      mirror._id,
      receiverCampMemberCard.mirrorReceiverIds
    ),
  });
  const campMemberCard1 = await CampMemberCard.findById(myCampMemberCard._id);
  const campMemberCard2 = await CampMemberCard.findById(
    receiverCampMemberCard._id
  );
  if (!campMemberCard1 || !campMemberCard2) {
    sendRes(res, false);
    return;
  }
  const data = await triggerMirrorUser(
    campMemberCard1,
    campMemberCard2,
    user,
    receiver
  );
  res.status(200).json(data);
}
export async function getMirrorRaw(
  baan: BasicBaan,
  campMemberCard: InterCampMemberCard,
  user: BasicUser
): Promise<GetMirrorPack> {
  const userReceivers: GetMirrorUser[] = [];
  const userSenders: GetMirrorUser[] = [];
  const baanReceivers: GetMirrorBaan[] = [];
  const baanSenders: GetMirrorBaan[] = [];
  let i = 0;
  while (i < campMemberCard.mirrorBaanIds.length) {
    const mirror = await Mirror.findById(campMemberCard.mirrorBaanIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const receiver = await Baan.findById(receiverId);
    if (!receiver) {
      continue;
    }
    baanSenders.push({
      _id,
      message,
      receiverId,
      sender: user,
      senderCampMemberCardId,
      receiver,
      types: "baan",
      time,
    });
  }
  i = 0;
  while (i < campMemberCard.mirrorReceiverIds.length) {
    const mirror = await Mirror.findById(campMemberCard.mirrorReceiverIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const otherCampMemberCard = await CampMemberCard.findById(
      senderCampMemberCardId
    );
    if (!otherCampMemberCard) {
      continue;
    }
    const sender = await User.findById(otherCampMemberCard.userId);
    if (!sender) {
      continue;
    }
    userReceivers.push({
      _id,
      message,
      receiverId,
      sender,
      senderCampMemberCardId,
      receiver: user,
      types: "user",
      time,
    });
  }
  i = 0;
  while (i < campMemberCard.mirrorSenderIds.length) {
    const mirror = await Mirror.findById(campMemberCard.mirrorSenderIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const otherCampMemberCard = await CampMemberCard.findById(receiverId);
    if (!otherCampMemberCard) {
      continue;
    }
    const receiver = await User.findById(otherCampMemberCard.userId);
    if (!receiver) {
      continue;
    }
    userSenders.push({
      _id,
      message,
      receiverId,
      sender: user,
      senderCampMemberCardId,
      receiver,
      types: "user",
      time,
    });
  }
  i = 0;
  while (i < baan.mirrorIds.length) {
    const mirror = await Mirror.findById(baan.mirrorIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const otherCampMemberCard = await CampMemberCard.findById(
      senderCampMemberCardId
    );
    if (!otherCampMemberCard) {
      continue;
    }
    const sender = await User.findById(otherCampMemberCard.userId);
    if (!sender) {
      continue;
    }
    baanReceivers.push({
      _id,
      message,
      receiverId,
      sender,
      senderCampMemberCardId,
      receiver: baan,
      types: "baan",
      time,
    });
  }
  return { baanReceivers, baanSenders, userReceivers, userSenders };
}
export async function updateMirrorUser(
  req: express.Request,
  res: express.Response
) {
  const { message, _id }: UpdateMirror = req.body;
  const user = await getUser(req);
  const mirror = await Mirror.findById(_id);
  if (!mirror || mirror.types == "baan") {
    sendRes(res, false);
    return;
  }
  const myCampMemberCard = await CampMemberCard.findById(
    mirror.senderCampMemberCardId
  );
  if (
    !user ||
    !myCampMemberCard ||
    myCampMemberCard.userId.toString() != user._id.toString()
  ) {
    sendRes(res, false);
    return;
  }
  let baanId: Id | null | undefined;
  switch (myCampMemberCard.role) {
    case "nong": {
      const campModel = await NongCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "peto": {
      sendRes(res, false);
      return;
    }
  }
  const baan = await Baan.findById(baanId);
  if (!baan || !baan.canWriteMirror) {
    sendRes(res, false);
    return;
  }
  const receiverCampMemberCard = await CampMemberCard.findById(mirror.receiverId);
  if (!receiverCampMemberCard) {
    sendRes(res, false);
    return;
  }
  const receiver = await User.findById(receiverCampMemberCard.userId);
  if (!receiver) {
    sendRes(res, false);
    return;
  }
  await mirror.updateOne({ message, time: new Date(Date.now()) });
  const data = await triggerMirrorUser(
    myCampMemberCard,
    receiverCampMemberCard,
    user,
    receiver
  );
  res.status(200).json(data);
}
export async function deleteMirrorUser(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const mirror = await Mirror.findById(req.params.id);
  if (!mirror || mirror.types == "baan") {
    sendRes(res, false);
    return;
  }
  const myCampMemberCard = await CampMemberCard.findById(
    mirror.senderCampMemberCardId
  );
  if (
    !user ||
    !myCampMemberCard ||
    myCampMemberCard.userId.toString() != user._id.toString()
  ) {
    sendRes(res, false);
    return;
  }
  let baanId: Id | null | undefined;
  switch (myCampMemberCard.role) {
    case "nong": {
      const campModel = await NongCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "peto": {
      sendRes(res, false);
      return;
    }
  }
  const baan = await Baan.findById(baanId);
  if (!baan || !baan.canWriteMirror) {
    sendRes(res, false);
    return;
  }
  const receiverCampMemberCard = await CampMemberCard.findById(mirror.receiverId);
  if (!receiverCampMemberCard) {
    sendRes(res, false);
    return;
  }
  const receiver = await User.findById(receiverCampMemberCard.userId);
  if (!receiver) {
    sendRes(res, false);
    return;
  }
  await myCampMemberCard.updateOne({
    mirrorSenderIds: swop(mirror._id, null, myCampMemberCard.mirrorSenderIds),
  });
  await receiverCampMemberCard.updateOne({
    mirrorReceiverIds: swop(
      mirror._id,
      null,
      receiverCampMemberCard.mirrorReceiverIds
    ),
  });
  const campMemberCard1 = await CampMemberCard.findById(myCampMemberCard._id);
  const campMemberCard2 = await CampMemberCard.findById(
    receiverCampMemberCard._id
  );
  if (!campMemberCard1 || !campMemberCard2) {
    sendRes(res, false);
    return;
  }
  await mirror.deleteOne();
  const data = await triggerMirrorUser(
    campMemberCard1,
    campMemberCard2,
    user,
    receiver
  );
  res.status(200).json(data);
}
export async function createMirrorBaan(
  req: express.Request,
  res: express.Response
) {
  const input: CreateMirror = req.body;
  const user = await getUser(req);
  const myCampMemberCard = await CampMemberCard.findById(
    input.senderCampMemberCardId
  );
  if (
    !user ||
    !myCampMemberCard ||
    myCampMemberCard.userId.toString() != user._id.toString() ||
    input.types == "user"
  ) {
    sendRes(res, false);
    return;
  }
  let baanId: Id | null | undefined;
  switch (myCampMemberCard.role) {
    case "nong": {
      const campModel = await NongCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "peto": {
      sendRes(res, false);
      return;
    }
  }
  const baan = await Baan.findById(baanId);
  if (!baan || !baan.canWriteMirror) {
    sendRes(res, false);
    return;
  }
  const mirror = await Mirror.create(input);
  await myCampMemberCard.updateOne({
    mirrorBaanIds: swop(null, mirror._id, myCampMemberCard.mirrorBaanIds),
  });
  await baan.updateOne({
    mirrorIds: swop(null, mirror._id, baan.mirrorIds),
  });
  const campMemberCard = await CampMemberCard.findById(myCampMemberCard._id);
  const baan2 = await Baan.findById(baan._id);
  if (!campMemberCard || !baan2) {
    sendRes(res, false);
    return;
  }
  const data = await triggerMirrorBaan(campMemberCard, baan2, user);
  res.status(200).json(data);
}

export async function updateMirrorBaan(
  req: express.Request,
  res: express.Response
) {
  const { message, _id }: UpdateMirror = req.body;
  const user = await getUser(req);
  const mirror = await Mirror.findById(_id);
  if (!mirror) {
    sendRes(res, false);
    return;
  }
  const myCampMemberCard = await CampMemberCard.findById(
    mirror.senderCampMemberCardId
  );
  if (
    !user ||
    !myCampMemberCard ||
    myCampMemberCard.userId.toString() != user._id.toString()
  ) {
    sendRes(res, false);
    return;
  }
  let baanId: Id | null | undefined;
  switch (myCampMemberCard.role) {
    case "nong": {
      const campModel = await NongCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "peto": {
      sendRes(res, false);
      return;
    }
  }
  const baan = await Baan.findById(baanId);
  if (!baan || !baan.canWriteMirror) {
    sendRes(res, false);
    return;
  }
  await mirror.updateOne({ message, time: new Date(Date.now()) });
  const data = await triggerMirrorBaan(myCampMemberCard, baan, user);
  res.status(200).json(data);
}
export async function deleteMirrorBaan(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const mirror = await Mirror.findById(req.params.id);
  if (!mirror) {
    sendRes(res, false);
    return;
  }
  const myCampMemberCard = await CampMemberCard.findById(
    mirror.senderCampMemberCardId
  );
  if (
    !user ||
    !myCampMemberCard ||
    myCampMemberCard.userId.toString() != user._id.toString() ||
    mirror.types == "user"
  ) {
    sendRes(res, false);
    return;
  }
  let baanId: Id | null | undefined;
  switch (myCampMemberCard.role) {
    case "nong": {
      const campModel = await NongCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(myCampMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      baanId = campModel.baanId;
      break;
    }
    case "peto": {
      sendRes(res, false);
      return;
    }
  }
  const baan = await Baan.findById(baanId);
  if (!baan || !baan.canWriteMirror) {
    sendRes(res, false);
    return;
  }
  await myCampMemberCard.updateOne({
    mirrorBaanIds: swop(mirror._id, null, myCampMemberCard.mirrorBaanIds),
  });
  await baan.updateOne({
    mirrorIds: swop(mirror._id, null, baan.mirrorIds),
  });
  const campMemberCard = await CampMemberCard.findById(myCampMemberCard._id);
  const baan2 = await Baan.findById(baan._id);
  if (!campMemberCard || !baan2) {
    sendRes(res, false);
    return;
  }
  await mirror.deleteOne();
  const data = await triggerMirrorBaan(campMemberCard, baan2, user);
  res.status(200).json(data);
}
async function triggerMirrorBaan(
  campMemberCard: InterCampMemberCard,
  baan: BasicBaan,
  user: BasicUser
): Promise<TriggerMirrorBaan> {
  let i = 0;
  const senders: GetMirrorBaan[] = [];
  const receivers: GetMirrorBaan[] = [];
  while (i < campMemberCard.mirrorBaanIds.length) {
    const mirror = await Mirror.findById(campMemberCard.mirrorBaanIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const receiver = await Baan.findById(receiverId);
    if (!receiver) {
      continue;
    }
    senders.push({
      _id,
      message,
      receiverId,
      sender: user,
      senderCampMemberCardId,
      receiver,
      types: "baan",
      time,
    });
  }
  i = 0;
  while (i < baan.mirrorIds.length) {
    const mirror = await Mirror.findById(baan.mirrorIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const otherCampMemberCard = await CampMemberCard.findById(
      senderCampMemberCardId
    );
    if (!otherCampMemberCard) {
      continue;
    }
    const sender = await User.findById(otherCampMemberCard.userId);
    if (!sender) {
      continue;
    }
    receivers.push({
      _id,
      message,
      receiverId,
      sender,
      senderCampMemberCardId,
      receiver: baan,
      types: "baan",
      time,
    });
  }
  return {
    senders,
    receivers,
    receiverId: baan._id,
    senderId: campMemberCard._id,
  };
}
async function triggerMirrorUser(
  senderCampMemberCard: InterCampMemberCard,
  receiverCampMemberCard: InterCampMemberCard,
  sender: BasicUser,
  receiver: BasicUser
): Promise<TriggerMirrorUser> {
  let i = 0;
  const senders: GetMirrorUser[] = [];
  const receivers: GetMirrorUser[] = [];
  while (i < receiverCampMemberCard.mirrorReceiverIds.length) {
    const mirror = await Mirror.findById(
      receiverCampMemberCard.mirrorReceiverIds[i++]
    );
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const otherCampMemberCard = await CampMemberCard.findById(
      senderCampMemberCardId
    );
    if (!otherCampMemberCard) {
      continue;
    }
    const sender = await User.findById(otherCampMemberCard.userId);
    if (!sender) {
      continue;
    }
    receivers.push({
      _id,
      message,
      receiverId,
      sender,
      senderCampMemberCardId,
      receiver,
      types: "user",
      time,
    });
  }
  i = 0;
  while (i < senderCampMemberCard.mirrorSenderIds.length) {
    const mirror = await Mirror.findById(
      senderCampMemberCard.mirrorSenderIds[i++]
    );
    if (!mirror) {
      continue;
    }
    const { _id, receiverId, senderCampMemberCardId, message, time } = mirror;
    const otherCampMemberCard = await CampMemberCard.findById(receiverId);
    if (!otherCampMemberCard) {
      continue;
    }
    const receiver = await User.findById(otherCampMemberCard.userId);
    if (!receiver) {
      continue;
    }
    senders.push({
      _id,
      message,
      receiverId,
      sender,
      senderCampMemberCardId,
      receiver,
      types: "user",
      time,
    });
  }
  return {
    senders,
    receivers,
    receiverId: receiverCampMemberCard._id,
    senderId: senderCampMemberCard._id,
  };
}
