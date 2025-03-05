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
//*export async function createMirror
//*export async function updateMirror
//*export async function deleteMirror
export async function createMirror(
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
  if (!baan || !baan.canWhriteMirror) {
    sendRes(res, false);
    return;
  }
  const mirror = await Mirror.create(input);
  switch (mirror.types) {
    case "baan": {
      await myCampMemberCard.updateOne({
        mirrorBaanIds: swop(null, mirror._id, myCampMemberCard.mirrorBaanIds),
      });
      await baan.updateOne({
        mirrorIds: swop(null, mirror._id, baan.mirrorIds),
      });
      break;
    }
    case "user": {
      const reciverCampMemberCard = await CampMemberCard.findById(
        mirror.reciverId
      );
      if (!reciverCampMemberCard) {
        sendRes(res, false);
        return;
      }
      await myCampMemberCard.updateOne({
        mirrorSenderIds: swop(
          null,
          mirror._id,
          myCampMemberCard.mirrorSenderIds
        ),
      });
      await reciverCampMemberCard.updateOne({
        mirrorReciverIds: swop(
          null,
          mirror._id,
          reciverCampMemberCard.mirrorReciverIds
        ),
      });
      break;
    }
  }
  sendRes(res, true);
}
export async function getMirrorRaw(
  baan: BasicBaan,
  campMemberCard: InterCampMemberCard,
  user: BasicUser
): Promise<GetMirrorPack> {
  const userRecivers: GetMirrorUser[] = [];
  const userSenders: GetMirrorUser[] = [];
  const baanRecivers: GetMirrorBaan[] = [];
  const baanSenders: GetMirrorBaan[] = [];
  let i = 0;
  while (i < campMemberCard.mirrorBaanIds.length) {
    const mirror = await Mirror.findById(campMemberCard.mirrorBaanIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, reciverId, senderCampMemberCardId, message, time } = mirror;
    const reciver: BasicBaan | null = await Baan.findById(reciverId);
    if (!reciver) {
      continue;
    }
    baanSenders.push({
      _id,
      message,
      reciverId,
      sender: user,
      senderCampMemberCardId,
      reciver,
      types: "baan",
      time,
    });
  }
  i = 0;
  while (i < campMemberCard.mirrorReciverIds.length) {
    const mirror = await Mirror.findById(campMemberCard.mirrorReciverIds[i++]);
    if (!mirror) {
      continue;
    }
    const { _id, reciverId, senderCampMemberCardId, message, time } = mirror;
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
    userRecivers.push({
      _id,
      message,
      reciverId,
      sender,
      senderCampMemberCardId,
      reciver: user,
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
    const { _id, reciverId, senderCampMemberCardId, message, time } = mirror;
    const otherCampMemberCard = await CampMemberCard.findById(reciverId);
    if (!otherCampMemberCard) {
      continue;
    }
    const reciver = await User.findById(otherCampMemberCard.userId);
    if (!reciver) {
      continue;
    }
    userSenders.push({
      _id,
      message,
      reciverId,
      sender: user,
      senderCampMemberCardId,
      reciver,
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
    const { _id, reciverId, senderCampMemberCardId, message, time } = mirror;
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
    baanRecivers.push({
      _id,
      message,
      reciverId,
      sender,
      senderCampMemberCardId,
      reciver: baan,
      types: "baan",
      time,
    });
  }
  return { baanRecivers, baanSenders, userRecivers, userSenders };
}
export async function updateMirror(
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
  if (!baan || !baan.canWhriteMirror) {
    sendRes(res, false);
    return;
  }
  await mirror.updateOne({ message, time: new Date(Date.now()) });
  sendRes(res, true);
}
export async function deleteMirror(
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
  if (!baan || !baan.canWhriteMirror) {
    sendRes(res, false);
    return;
  }
  switch (mirror.types) {
    case "baan": {
      await myCampMemberCard.updateOne({
        mirrorBaanIds: swop(mirror._id, null, myCampMemberCard.mirrorBaanIds),
      });
      await baan.updateOne({
        mirrorIds: swop(mirror._id, null, baan.mirrorIds),
      });
      break;
    }
    case "user": {
      const reciverCampMemberCard = await CampMemberCard.findById(
        mirror.reciverId
      );
      if (!reciverCampMemberCard) {
        sendRes(res, false);
        return;
      }
      await myCampMemberCard.updateOne({
        mirrorSenderIds: swop(
          mirror._id,
          null,
          myCampMemberCard.mirrorSenderIds
        ),
      });
      await reciverCampMemberCard.updateOne({
        mirrorReciverIds: swop(
          mirror._id,
          null,
          reciverCampMemberCard.mirrorReciverIds
        ),
      });
      break;
    }
  }
  await mirror.deleteOne();
  sendRes(res, true);
}
