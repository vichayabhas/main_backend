import express from "express";
import { getUser } from "../../middleware/auth";
import Building from "../../models/Building";
import Camp from "../../models/Camp";
import {
  Id,
  InterLostAndFound,
  ShowLostAndFound,
} from "../../models/interface";
import LostAndFound from "../../models/LostAndFound";
import NongCamp from "../../models/NongCamp";
import Place from "../../models/Place";
import User from "../../models/User";
import { getAuthTypes } from "../camp/getCampData";
import { sendRes, swop, resError } from "../setup";

async function fillLostAndFound(
  input: InterLostAndFound,
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

export async function addLostAndFound(
  req: express.Request,
  res: express.Response,
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
  res: express.Response,
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
  res: express.Response,
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
  res: express.Response,
) {
  const lostAndFound = await LostAndFound.findById(req.params.id);
  if (!lostAndFound) {
    sendRes(res, false);
    return;
  }
  const buf = await fillLostAndFound(lostAndFound.toObject());
  res.status(200).json(buf);
}
