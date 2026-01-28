import express from "express";
import { getUser } from "../../middleware/auth";
import { sendRes, swop } from "../setup";
import {
  CreateCampDict,
  GetBaanDictForUpdate,
  GetCampDictForUpdate,
  GetPartDictForUpdate,
  Id,
  InterCampDict,
  UpdateCampDict,
} from "../../models/interface";
import Camp from "../../models/Camp";
import { isHaveThisAuth } from "./authPart";
import CampDict from "../../models/CampDict";
import Part from "../../models/Part";
import Baan from "../../models/Baan";
export async function createCampDict(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const {
    parentId,
    types,
    key,
    value,
    canNongAccidentallySee,
    canNongSee,
  }: CreateCampDict = req.body;
  switch (types) {
    case "camp": {
      const camp = await Camp.findById(parentId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        camp._id,
        user._id,
        "สามารถแก้ไข dict ค่ายได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      const campDict = await CampDict.create({
        parentId,
        key,
        types,
        value,
        canNongAccidentallySee,
        canNongSee,
      });
      const campDictIds = swop(null, campDict._id, camp.campDictIds);
      await camp.updateOne({
        campDictIds,
      });
      const campDicts = await getCampDictsRaw(campDictIds);
      res.status(200).json(campDicts);
      return;
    }
    case "part": {
      const part = await Part.findById(parentId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        part.campId,
        user._id,
        "สามารถแก้ไข dict ฝ่ายได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      const campDict = await CampDict.create({
        parentId,
        key,
        types,
        value,
        canNongAccidentallySee,
        canNongSee,
      });
      const campDictIds = swop(null, campDict._id, part.campDictIds);
      await part.updateOne({
        campDictIds,
      });
      const campDicts = await getCampDictsRaw(campDictIds);
      res.status(200).json(campDicts);
      return;
    }
    case "baan": {
      const baan = await Baan.findById(parentId);
      if (!baan) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        baan.campId,
        user._id,
        "สามารถแก้ไข dict บ้านได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      const campDict = await CampDict.create({
        parentId,
        key,
        types,
        value,
        canNongAccidentallySee,
        canNongSee,
      });
      const campDictIds = swop(null, campDict._id, baan.campDictIds);
      await baan.updateOne({
        campDictIds,
      });
      const campDicts = await getCampDictsRaw(campDictIds);
      res.status(200).json(campDicts);
      return;
    }
  }
}
export async function getCampDictsRaw(ids: Id[]) {
  let i = 0;
  const campDicts: InterCampDict[] = [];
  while (i < ids.length) {
    const campDict = await CampDict.findById(ids[i++]);
    if (!campDict) continue;
    campDicts.push(campDict);
  }
  return campDicts;
}
export async function updateCampDict(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  const {
    _id,
    canNongAccidentallySee,
    canNongSee,
    key,
    value,
  }: UpdateCampDict = req.body;
  const campDict = await CampDict.findById(_id);
  if (!campDict || !user) {
    sendRes(res, false);
    return;
  }
  switch (campDict.types) {
    case "camp": {
      const camp = await Camp.findById(campDict.parentId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        camp._id,
        user._id,
        "สามารถแก้ไข dict ค่ายได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      await campDict.updateOne({
        key,
        value,
        canNongAccidentallySee,
        canNongSee,
      });
      const campDicts = await getCampDictsRaw(camp.campDictIds);
      res.status(200).json(campDicts);
      return;
    }
    case "part": {
      const part = await Part.findById(campDict.parentId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        part.campId,
        user._id,
        "สามารถแก้ไข dict ฝ่ายได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      await campDict.updateOne({
        key,
        value,
        canNongAccidentallySee,
        canNongSee,
      });
      const campDicts = await getCampDictsRaw(part.campDictIds);
      res.status(200).json(campDicts);
      return;
    }
    case "baan": {
      const baan = await Baan.findById(campDict.parentId);
      if (!baan) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        baan.campId,
        user._id,
        "สามารถแก้ไข dict บ้านได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      await campDict.updateOne({
        key,
        value,
        canNongAccidentallySee,
        canNongSee,
      });
      const campDicts = await getCampDictsRaw(baan.campDictIds);
      res.status(200).json(campDicts);
      return;
    }
  }
}
export async function deleteCampDict(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  const id = req.params.id;
  const campDict = await CampDict.findById(id);
  if (!campDict || !user) {
    sendRes(res, false);
    return;
  }
  switch (campDict.types) {
    case "camp": {
      const camp = await Camp.findById(campDict.parentId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        camp._id,
        user._id,
        "สามารถแก้ไข dict ค่ายได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      await campDict.deleteOne();
      const campDictIds = swop(campDict._id, null, camp.campDictIds);
      await camp.updateOne({
        campDictIds,
      });
      const campDicts = await getCampDictsRaw(campDictIds);
      res.status(200).json(campDicts);
      return;
    }
    case "part": {
      const part = await Part.findById(campDict.parentId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        part.campId,
        user._id,
        "สามารถแก้ไข dict ฝ่ายได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      await campDict.deleteOne();
      const campDictIds = swop(campDict._id, null, part.campDictIds);
      await part.updateOne({
        campDictIds,
      });
      const campDicts = await getCampDictsRaw(campDictIds);
      res.status(200).json(campDicts);
      return;
    }
    case "baan": {
      const baan = await Baan.findById(campDict.parentId);
      if (!baan) {
        sendRes(res, false);
        return;
      }
      const isPass = await isHaveThisAuth(
        baan.campId,
        user._id,
        "สามารถแก้ไข dict บ้านได้",
      );
      if (!isPass) {
        sendRes(res, false);
        return;
      }
      await campDict.deleteOne();
      const campDictIds = swop(campDict._id, null, baan.campDictIds);
      await baan.updateOne({
        campDictIds,
      });
      const campDicts = await getCampDictsRaw(campDictIds);
      res.status(200).json(campDicts);
      return;
    }
  }
}
export async function getCampDictsForUpdate(
  req: express.Request,
  res: express.Response,
) {
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const campDicts = await getCampDictsRaw(camp.campDictIds);
  const data: GetCampDictForUpdate = {
    camp,
    campDicts,
  };
  res.status(200).json(data);
}
export async function getBaanDictsForUpdate(
  req: express.Request,
  res: express.Response,
) {
  const baan = await Baan.findById(req.params.id);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const campDicts = await getCampDictsRaw(baan.campDictIds);
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const data: GetBaanDictForUpdate = {
    camp,
    campDicts,
    baan,
  };
  res.status(200).json(data);
}
export async function getPartDictsForUpdate(
  req: express.Request,
  res: express.Response,
) {
  const part = await Part.findById(req.params.id);
  if (!part) {
    sendRes(res, false);
    return;
  }
  const campDicts = await getCampDictsRaw(part.campDictIds);
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const data: GetPartDictForUpdate = {
    camp,
    campDicts,
    part,
  };
  res.status(200).json(data);
}
