import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampStyle from "../../models/CampStyle";
import NameContainer from "../../models/NameContainer";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import User from "../../models/User";
import WorkItem from "../../models/WorkItem";
import {
  CreateCamp,
  InterCampBack,
  UpdateCamp,
  UpdateBaan,
  Group,
  MyMap,
  Id,
  BasicPart,
  AuthType,
  BasicBaan,
  GetCampForUpdate,
} from "../../models/interface";
import { removeDuplicate, resOk, sendRes, swop } from "../setup";
import express from "express";
import PartNameContainer from "../../models/PartNameContainer";
import Place from "../../models/Place";
import { getUser } from "../../middleware/auth";
import Building from "../../models/Building";
import { addPetoRaw, addPeeRaw } from "../camp/admidsion";
import { changeBaanRaw } from "../camp/change";
import { getAuthTypes } from "../camp/getCampData";
import {
  lockDataNong,
  unlockDataNong,
  lockDataPee,
  unlockDataPee,
  lockDataPeto,
  unlockDataPeto,
} from "./lockAndUnlock";
import JobAssign from "../../models/JobAssign";
import BaanJob from "../../models/BaanJob";
//*export async function addBaan
//*export async function addPart
//*export async function updateBaan
//*export async function updatePart
//*export async function createCamp
// export async function forceDeleteCamp
//*export async function saveDeleteCamp
//*export async function addCampName
// export async function saveDeleteCampName
// export async function forceDeleteCampName
// export async function forceDeleteBaan
// export async function saveDeleteBaan
// export async function saveDeletePart
// export async function forceDeletePart
//*export async function addPartName
// export async function saveDeletePartName
// export async function forceDeletePartName
// export async function addAdmin
// export async function getAllAdmin
// export async function downRole
// export async function addMoreBoard
// export async function removeBoard
//*export async function updateCamp
//*export async function getCampNames
//*export async function createBaanByGroup
//*export async function deleteWorkingItemRaw
//*export async function getPartNames
// export async function addAllGroup
//*export async function getAllRemainPartName
//*export async function peeToPeto
//*export async function afterVisnuToPee
export async function addBaan(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const { campId, name } = req.body;
  const camp: InterCampBack | null = await Camp.findById(campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  if (
    !user ||
    (user.role != "admin" && !user.authPartIds.includes(camp.partBoardId))
  ) {
    res.status(403).json({ success: false });
    return;
  }
  const baan = await addBaanRaw(camp, name, "null");
  res.status(201).json(baan);
} //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function addBaanRaw(
  camp: InterCampBack,
  name: string,
  groupRef:
    | "A"
    | "B"
    | "C"
    | "Dog"
    | "E"
    | "F"
    | "G"
    | "H"
    | "J"
    | "K"
    | "L"
    | "M"
    | "N"
    | "P"
    | "Q"
    | "R"
    | "S"
    | "T"
    | "null"
): Promise<Id> {
  const baan = await Baan.create({
    campId: camp._id,
    name,
    groupRef,
    fullName: name,
  });
  const nongCamp = await NongCamp.create({
    campId: camp._id,
    baanId: baan._id,
  });
  let i = 0;
  while (i < camp.partIds.length) {
    const partId = camp.partIds[i];
    const part = await Part.findById(partId);
    const peeCamp = await PeeCamp.create({
      campId: camp._id,
      baanId: baan._id,
      partId,
    });
    setDefalse(peeCamp._id);
    baan.peeModelIds.push(peeCamp._id);
    await part?.updateOne({
      peeModelIds: swop(null, peeCamp._id, part.peeModelIds),
    });
    camp.peeModelIds.push(peeCamp._id);
    baan.mapPeeCampIdByPartId.set(partId.toString(), peeCamp._id);
    part?.mapPeeCampIdByBaanId.set(baan.id, peeCamp._id);
    await part?.updateOne({ mapPeeCampIdByBaanId: part.mapPeeCampIdByBaanId });
    i = i + 1;
  }
  i = 0;
  const jobIds: Id[] = [];
  while (i < camp.jobIds.length) {
    const job = await JobAssign.findById(camp.jobIds[i++]);
    if (!job) {
      continue;
    }
    const baanJob = await BaanJob.create({ baanId: baan._id, jobId: job._id });
    await job.updateOne({ memberIds: swop(null, baanJob._id, job.memberIds) });
    jobIds.push(baanJob._id);
  }
  await Camp.findByIdAndUpdate(camp._id, {
    nongModelIds: swop(null, nongCamp._id, camp.nongModelIds),
    baanIds: swop(null, baan._id, camp.baanIds),
    peeModelIds: camp.peeModelIds,
  });
  const campStyle = await CampStyle.create({ refId: baan._id, types: "baan" });
  await baan.updateOne({
    styleId: campStyle._id,
    mapPeeCampIdByPartId: baan.mapPeeCampIdByPartId,
    nongModelId: nongCamp._id,
    peeModelIds: baan.peeModelIds,
    jobIds,
  });
  return baan._id;
}
export async function addPart(req: express.Request, res: express.Response) {
  const { campId, nameId } = req.body;
  const user = await getUser(req);
  const camp = await Camp.findById(campId);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  const part = await Part.findById(camp?.partBoardId);
  if (
    user.role != "admin" &&
    !part?.peeIds.includes(user._id) &&
    !part?.petoIds.includes(user._id)
  ) {
    res.status(403).json({ success: false });
    return;
  }
  const newPart = await addPartRaw(camp._id, nameId, []);
  if (!newPart) {
    sendRes(res, false);
    return;
  }
  res.status(201).json(newPart);
}
async function addPartRaw(
  campId: Id,
  nameId: Id,
  auths: AuthType[]
): Promise<BasicPart | null> {
  const camp = await Camp.findById(campId);
  const partNameContainer = await PartNameContainer.findById(nameId);
  if (!camp || !partNameContainer) {
    return null;
  }
  const part = await Part.create({
    campId: camp._id,
    nameId,
    partName: `${partNameContainer.name} ${camp.campName}`,
    auths,
  });
  partNameContainer.partIds.push(part._id);
  partNameContainer.campIds.push(camp._id);
  await partNameContainer.updateOne({
    partIds: partNameContainer.partIds,
    campIds: partNameContainer.campIds,
  });
  const petoCamp = await PetoCamp.create({ campId, partId: part._id });
  let i = 0;
  while (i < camp.baanIds.length) {
    const baanId = camp.baanIds[i++];
    const baan = await Baan.findById(baanId);
    if (!baan) {
      continue;
    }
    const peeCamp = await PeeCamp.create({ baanId, campId, partId: part._id });
    await baan?.updateOne({
      peeModelIds: swop(null, peeCamp._id, baan.peeModelIds),
    });
    camp.peeModelIds.push(peeCamp._id);
    part.peeModelIds.push(peeCamp._id);
    setDefalse(peeCamp.id);
    baan.mapPeeCampIdByPartId.set(part._id.toString(), peeCamp._id);
    part.mapPeeCampIdByBaanId.set(baanId.toString(), peeCamp._id);
    await baan?.updateOne({ mapPeeCampIdByPartId: baan.mapPeeCampIdByPartId });
  }
  await camp.updateOne({
    partIds: swop(null, part._id, camp.partIds),
    petoModelIds: swop(null, petoCamp._id, camp.petoModelIds),
    peeModelIds: camp.peeModelIds,
    partNameIds: swop(null, partNameContainer._id, camp.partNameIds),
  });
  await part.updateOne({
    petoModelId: petoCamp._id,
    mapPeeCampIdByBaanId: part.mapPeeCampIdByBaanId,
    peeModelIds: part.peeModelIds,
  });
  const part2 = await Part.findById(part._id);
  return part2;
}
export async function updateBaan(req: express.Request, res: express.Response) {
  const update: UpdateBaan = req.body;
  const baan = await Baan.findById(update.baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp: InterCampBack | null = await Camp.findById(baan.campId);
  const user = await getUser(req);
  if (!user || !camp) {
    res.status(401).json({ success: false });
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("หัวหน้าพี่เลี้ยง") &&
      user.role != "admin" &&
      !user.authPartIds.includes(camp.partBoardId))
  ) {
    sendRes(res, false);
    return;
  }
  const s = await updateBaanRaw(update);
  sendRes(res, s);
}
export async function updateBaanRaw(update: UpdateBaan) {
  try {
    const {
      name,
      fullName,
      baanId,
      link,
      girlSleepPlaceId,
      boySleepPlaceId,
      normalPlaceId,
      nongSendMessage,
      canReadMirror,
      canWhriteMirror,
    } = update;
    const baan = await Baan.findById(baanId);
    if (!baan) {
      return false;
    }
    const boyNewP = await Place.findById(boySleepPlaceId);
    const girlNewP = await Place.findById(girlSleepPlaceId);
    const normalNewP = await Place.findById(normalPlaceId);
    const boyOldP = await Place.findById(baan.boySleepPlaceId);
    const girlOldP = await Place.findById(baan.girlSleepPlaceId);
    const normalOldP = await Place.findById(baan.normalPlaceId);
    if (boyNewP) {
      const boyNewB = await Building.findById(boyNewP.buildingId);
      if (boyNewB) {
        await boyNewB.updateOne({
          boySleepBaanIds: swop(null, baan._id, boyNewB.boySleepBaanIds),
        });
        await boyNewP.updateOne({
          boySleepBaanIds: swop(null, baan._id, boyNewP.boySleepBaanIds),
        });
      }
    }
    if (girlNewP) {
      const girlNewB = await Building.findById(girlNewP.buildingId);
      if (girlNewB) {
        await girlNewB.updateOne({
          girlSleepBaanIds: swop(null, baan._id, girlNewB.girlSleepBaanIds),
        });
        await girlNewP.updateOne({
          girlSleepBaanIds: swop(null, baan._id, girlNewP.girlSleepBaanIds),
        });
      }
    }
    if (normalNewP) {
      const normalNewB = await Building.findById(normalNewP.buildingId);
      if (normalNewB) {
        await normalNewB.updateOne({
          normalBaanIds: swop(null, baan._id, normalNewB.normalBaanIds),
        });
        await normalNewP.updateOne({
          normalBaanIds: swop(null, baan._id, normalNewP.normalBaanIds),
        });
      }
    }
    if (boyOldP) {
      const boyOldB = await Building.findById(boyOldP.buildingId);
      if (boyOldB) {
        await boyOldB.updateOne({
          boySleepBaanIds: swop(baan._id, null, boyOldB.boySleepBaanIds),
        });
        await boyOldP.updateOne({
          boySleepBaanIds: swop(baan._id, null, boyOldP.boySleepBaanIds),
        });
      }
    }
    if (girlOldP) {
      const girlOldB = await Building.findById(girlOldP.buildingId);
      if (girlOldB) {
        await girlOldB.updateOne({
          girlSleepBaanIds: swop(baan._id, null, girlOldB.girlSleepBaanIds),
        });
        await girlOldP.updateOne({
          girlSleepBaanIds: swop(baan._id, null, girlOldP.girlSleepBaanIds),
        });
      }
    }
    if (normalOldP) {
      const normalOldB = await Building.findById(normalOldP.buildingId);
      if (normalOldB) {
        await normalOldB.updateOne({
          normalBaanIds: swop(baan._id, null, normalOldB.normalBaanIds),
        });
        await normalOldP.updateOne({
          normalBaanIds: swop(baan._id, null, normalOldP.normalBaanIds),
        });
      }
    }
    await baan.updateOne({
      name,
      fullName,
      link,
      girlSleepPlaceId: girlNewP ? girlNewP._id : null,
      boySleepPlaceId: boyNewP ? boyNewP._id : null,
      normalPlaceId: normalNewP ? normalNewP._id : null,
      nongSendMessage,
      canReadMirror,
      canWhriteMirror,
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
export async function updatePart(req: express.Request, res: express.Response) {
  try {
    const { placeId, partId } = req.body;
    const part = await Part.findById(partId);
    if (!part) {
      sendRes(res, false);
      return;
    }
    const camp: InterCampBack | null = await Camp.findById(part.campId);
    const user = await getUser(req);
    if (!user || !camp) {
      res.status(401).json({ success: false });
      return;
    }
    const auths = await getAuthTypes(user._id, camp._id);
    if (
      !auths ||
      (!auths.includes("แผน") &&
        user.role != "admin" &&
        !user.authPartIds.includes(camp.partBoardId))
    ) {
      {
        sendRes(res, false);
        return;
      }
    }
    const newPlace = await Place.findById(placeId);
    if (newPlace) {
      const newBuilding = await Building.findById(newPlace.buildingId);
      if (newBuilding) {
        await newPlace.updateOne({
          partIds: swop(null, part._id, newPlace.partIds),
        });
        await newBuilding.updateOne({
          partIds: swop(null, part._id, newBuilding.partIds),
        });
      }
    }
    const oldPlace = await Place.findById(part.placeId);
    if (oldPlace) {
      const oldBuilding = await Building.findById(oldPlace.buildingId);
      if (oldBuilding) {
        await oldPlace.updateOne({
          partIds: swop(part._id, null, oldBuilding.partIds),
        });
        await oldBuilding.updateOne({
          partIds: swop(part._id, null, oldBuilding.partIds),
        });
      }
    }
    await part.updateOne({ placeId });
    sendRes(res, true);
  } catch {
    res.status(400).json({ success: false });
  }
}
async function setDefalse(peeCampId: Id) {
  // const name = [
  //   "arrayString1",
  //   "arrayString2",
  //   "arrayString3",
  //   "arrayString4",
  //   "arrayString5",
  //   "map1",
  //   "map2",
  //   "map3",
  //   "map4",
  //   "map5",
  // ];
  const peeCamp = await PeeCamp.findById(peeCampId);
  // peeCamp?.mapArrayStringNumberByName.set(name[0], peeCamp.arrayString1);
  // peeCamp?.mapArrayStringNumberByName.set(name[1], peeCamp.arrayString2);
  // peeCamp?.mapArrayStringNumberByName.set(name[2], peeCamp.arrayString3);
  // peeCamp?.mapArrayStringNumberByName.set(name[3], peeCamp.arrayString4);
  // peeCamp?.mapArrayStringNumberByName.set(name[4], peeCamp.arrayString5);
  // peeCamp?.mapMapNumberByName.set(name[5], peeCamp.map1);
  // peeCamp?.mapMapNumberByName.set(name[6], peeCamp.map2);
  // peeCamp?.mapMapNumberByName.set(name[7], peeCamp.map3);
  // peeCamp?.mapMapNumberByName.set(name[8], peeCamp.map4);
  // peeCamp?.mapMapNumberByName.set(name[9], peeCamp.map5);
  await peeCamp?.updateOne({
    mapMapNumberByName: peeCamp.mapMapNumberByName,
    mapArrayStringNumberByName: peeCamp.mapArrayStringNumberByName,
  });
}
export async function createCamp(req: express.Request, res: express.Response) {
  try {
    const {
      nameId,
      round,
      dateStart,
      dateEnd,
      boardIds,
      registerModel,
      memberStructure,
      nongSleepModel,
      peeSleepModel,
      defaultPartNameAndAuths,
    }: CreateCamp = req.body;
    const nameContainer = await NameContainer.findById(nameId);
    if (!nameContainer) {
      sendRes(res, false);
      return;
    }
    const camp = await Camp.create({
      nameId,
      round,
      dateStart,
      dateEnd,
      boardIds,
      registerModel,
      memberStructure,
      nongSleepModel,
      peeSleepModel,
      campName: `${nameContainer.name} ${round}`,
    });
    const campStyle = await CampStyle.create({
      refId: camp._id,
      types: "camp",
    });
    await camp.updateOne({ campStyleId: campStyle._id });
    await nameContainer?.updateOne({
      campIds: swop(null, camp._id, nameContainer.campIds),
    });
    let partNameContainerBoard = await PartNameContainer.findOne({
      name: "board",
    });
    if (!partNameContainerBoard) {
      partNameContainerBoard = await PartNameContainer.create({
        name: "board",
      });
    }
    let i = 0;
    while (i < boardIds.length) {
      const boardId = boardIds[i++];
      const user = await User.findById(boardId);
      if (!user) {
        continue;
      }
      await user.updateOne({
        authorizeIds: swop(null, camp._id, user.authorizeIds),
      });
    }
    for (const { partName, auths } of defaultPartNameAndAuths) {
      if (partName == "board") {
        continue;
      }
      let partNameContainer = await PartNameContainer.findOne({
        name: partName,
      });
      if (!partNameContainer) {
        partNameContainer = await PartNameContainer.create({
          name: partName,
        });
      }
      const part = await addPartRaw(camp._id, partNameContainer._id, auths);
      if (partName != "พี่บ้าน" || !part) {
        continue;
      }
      await camp.updateOne({ partPeeBaanId: part._id });
    }
    const board = await addPartRaw(camp._id, partNameContainerBoard._id, [
      "pr/studio",
      "ตรวจคำตอบข้อเขียน",
      "ทะเบียน",
      "พยาบาล",
      "สวัสดิการ",
      "หัวหน้าพี่เลี้ยง",
      "แก้ไขคำถาม",
      "แผน",
    ]);
    if (!board) {
      sendRes(res, false);
      return;
    }
    await camp.updateOne({
      partBoardId: board._id,
    });
    if (memberStructure == "nong->highSchool,pee->1year,peto->2upYear") {
      await addPetoRaw(boardIds, board._id, res);
    } else {
      const newCamp: InterCampBack | null = await Camp.findById(camp._id);
      if (!newCamp) {
        sendRes(res, false);
        return;
      }
      const baan = await addBaanRaw(newCamp, "board", "null");
      i = 0;
      while (i < boardIds.length) {
        camp.peePassIds.set(boardIds[i++].toString(), board._id);
      }
      await camp.updateOne({
        peePassIds: camp.peePassIds,
        baanBoardId: baan._id,
      });
      await addPeeRaw(boardIds, baan._id);
    }
    res.status(201).json(resOk);
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
}
export async function addAdmin(req: express.Request, res: express.Response) {
  const { userIds }: { userIds: string[] } = req.body;
  let i = 0;
  while (i < userIds.length) {
    await User.findByIdAndUpdate(userIds[i++], {
      role: "admin",
      fridayActEn: true,
      fridayAuth: true,
    });
  }
  res.status(200).json({ success: true });
}
export async function getAllAdmin(req: express.Request, res: express.Response) {
  const users = await User.find({ role: "admin" });
  res.status(200).json(users);
}
export async function downRole(req: express.Request, res: express.Response) {
  const users = await User.find({ role: "admin" });
  if (users.length == 1) {
    sendRes(res, false);
    return;
  }
  const user = await getUser(req);
  await user?.updateOne({ role: req.params.id });
  res.status(200).json({ success: true });
}
export async function addMoreBoard(
  req: express.Request,
  res: express.Response
) {
  const { campId, userIds }: { campId: string; userIds: string[] } = req.body;
  const camp = await Camp.findById(campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < userIds.length) {
    const user = await User.findById(userIds[i++]);
    if (!user) {
      continue;
    }
    await user.updateOne({
      authorizeIds: swop(null, camp._id, user.authorizeIds),
      authPartIds: swop(null, camp.partBoardId as Id, user.authPartIds),
    });
    camp.boardIds.push(user._id);
  }

  await camp.updateOne({ boardIds: camp.boardIds });
  res.status(200).json({ success: true });
}
export async function removeBoard(req: express.Request, res: express.Response) {
  const { campId, userId } = req.body;
  const camp = await Camp.findById(campId);
  const user = await User.findById(userId);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  await camp?.updateOne({ boardIds: swop(user._id, null, camp.boardIds) });
  await user?.updateOne({
    authorizeIds: swop(camp._id, null, user.authorizeIds),
    authPartIds: swop(camp.partBoardId as Id, null, user.authPartIds),
  });
  sendRes(res, true);
}
export async function updateCamp(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  if (
    !user ||
    (user.role != "admin" && !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    res.status(403).json({ success: false });
    return;
  }
  const {
    nongDataLock,
    open,
    link,
    allDone,
    lockChangePickup,
    pictureUrls,
    logoUrl,
    dateStart,
    dateEnd,
    registerSheetLink,
    peeLock,
    groupName,
    peeDataLock,
    petoDataLock,
    haveCloth,
    showCorrectAnswerAndScore,
    canAnswerTheQuestion,
    canNongSeeAllAnswer,
    canNongSeeAllActionPlan,
    canNongSeeAllTrackingSheet,
    canNongAccessDataWithRoleNong,
    lockChangeQuestion,
    updatePart,
    canReadTimeOnMirror,
    nongCall,
  }: UpdateCamp = req.body;
  if (camp.nongDataLock != nongDataLock) {
    if (nongDataLock) {
      await lockDataNong(camp._id);
    } else {
      await unlockDataNong(camp._id);
    }
  }
  if (camp.peeDataLock != peeDataLock) {
    if (peeDataLock) {
      await lockDataPee(camp._id);
    } else {
      await unlockDataPee(camp._id);
    }
  }
  if (camp.petoDataLock != petoDataLock) {
    if (petoDataLock) {
      await lockDataPeto(camp._id);
    } else {
      await unlockDataPeto(camp._id);
    }
  }
  await camp.updateOne({
    nongDataLock,
    open,
    link,
    allDone,
    lockChangePickup,
    pictureUrls,
    logoUrl,
    dateStart,
    dateEnd,
    registerSheetLink,
    peeLock,
    groupName,
    peeDataLock,
    petoDataLock,
    haveCloth,
    showCorrectAnswerAndScore,
    canAnswerTheQuestion,
    canNongSeeAllAnswer,
    canNongSeeAllActionPlan,
    canNongSeeAllTrackingSheet,
    canNongAccessDataWithRoleNong,
    lockChangeQuestion,
    canReadTimeOnMirror,
    nongCall,
  });
  for (const { id, auths } of updatePart) {
    const part = await Part.findById(id);
    if (!part) {
      continue;
    }
    if (auths.length > 0) {
      if (part.auths.length > 0) {
        await part.updateOne({ auths });
      } else {
        let i = 0;
        while (i < part.peeIds.length) {
          const user = await User.findById(part.peeIds[i++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(null, part._id, user.authPartIds),
          });
        }
        i = 0;
        while (i < part.petoIds.length) {
          const user = await User.findById(part.petoIds[i++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(null, part._id, user.authPartIds),
          });
        }
        await part.updateOne({ auths });
      }
    } else {
      if (part.auths.length > 0) {
        let i = 0;
        while (i < part.peeIds.length) {
          const user = await User.findById(part.peeIds[i++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(part._id, null, user.authPartIds),
          });
        }
        i = 0;
        while (i < part.petoIds.length) {
          const user = await User.findById(part.petoIds[i++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(part._id, null, user.authPartIds),
          });
        }
        await part.updateOne({ auths });
      }
    }
  }
  res.status(200).json(camp);
}
export async function getCampNames(
  req: express.Request,
  res: express.Response
) {
  const nameContainers = await NameContainer.find();
  res.status(200).json(nameContainers);
}
export async function createBaanByGroup(
  req: express.Request,
  res: express.Response
) {
  const camp: InterCampBack | null = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const allGroup: Group[] = [
    "A",
    "B",
    "C",
    "Dog",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
  ];
  //let baans: Map<'A' | 'B' | 'C' | 'Dog' | 'E' | 'F' | 'G' | 'H' | 'J' | 'K' | 'L' | 'M' | 'N' | 'P' | 'Q' | 'R' | 'S' | 'T', InterBaanFront> = new Map<'A' | 'B' | 'C' | 'Dog' | 'E' | 'F' | 'G' | 'H' | 'J' | 'K' | 'L' | 'M' | 'N' | 'P' | 'Q' | 'R' | 'S' | 'T', InterBaanFront>()
  const memberMap = new Map<Group, Id[]>();
  let i = 0;
  while (i < 18) {
    memberMap.set(allGroup[i++], []);
  }
  i = 0;
  const members: Id[] = [];
  camp.peePassIds.forEach((v, k) => {
    members.push(k);
  });
  while (i < members.length) {
    const user = await User.findById(members[i++]);
    if (!user || !user.group) {
      continue;
    }
    memberMap.get(user.group)?.push(user._id);
  }
  i = 0;
  while (i < 18) {
    const baan = await addBaanRaw(camp, allGroup[i], allGroup[i]);
    camp.groupRefMap.set(allGroup[i], baan._id);
    await addPeeRaw(memberMap.get(allGroup[i++]) as Id[], baan._id);
  }
  i = 0;
  const baan = await Baan.findById(camp.baanBoardId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const buf = baan.peeIds.map((e) => e);
  while (i < buf.length) {
    const user = await User.findById(buf[i++]);
    if (!user || !user.group) {
      continue;
    }
    const baanId: Id = camp.groupRefMap.get(user.group) as Id;
    await changeBaanRaw([user._id], baanId);
  }
  sendRes(res, true);
}
export async function deleteWorkingItemRaw(workItemId: Id) {
  const workItem = await WorkItem.findById(workItemId);
  if (!workItem) {
    return;
  }

  const part = await Part.findById(workItem.partId);
  const camp = await Camp.findById(part?.campId);
  if (!camp || !part) {
    return;
  }
  await part.updateOne({
    workItemIds: swop(workItem._id, null, part.workItemIds),
  });
  await camp.updateOne({
    workItemIds: swop(workItem._id, null, camp.workItemIds),
  });
  let i = 0;
  while (i < workItem.linkOutIds.length) {
    if (workItem.linkOutIds[i++]) {
      await deleteWorkingItemRaw(workItem.linkOutIds[i - 1]);
    }
  }
  await workItem.deleteOne();
}
export async function getPartNames(
  req: express.Request,
  res: express.Response
) {
  const partNames = await PartNameContainer.find();
  res.status(200).json(partNames);
}
export async function addAllGroup(req: express.Request, res: express.Response) {
  const baan = await Baan.findById(req.params.id);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  const user = await getUser(req);
  if (!camp || !user || baan.groupRef == "null") {
    sendRes(res, false);
    return;
  }
  if (camp.ready.includes(baan.groupRef)) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("หัวหน้าพี่เลี้ยง") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  const { ready } = camp;
  ready.push(baan.groupRef);
  await camp.updateOne({ ready });
  if (ready.length < 18) {
    sendRes(res, true);
    return;
  }
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan || !baan.groupRef) {
      continue;
    }
    let j = 0;
    while (j < baan.nongIds.length) {
      const user = await User.findById(baan.nongIds[j++]);
      await user?.updateOne({ group: baan.groupRef });
    }
  }
}
export async function getAllRemainPartName(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const partNameContainers = await PartNameContainer.find();
  const partNameIds = partNameContainers.map(
    (partNameContainer) => partNameContainer._id
  );
  const buf = removeDuplicate(partNameIds, camp.partNameIds);
  let i = 0;
  const out: MyMap[] = [];
  while (i < buf.length) {
    const partNameContainer = await PartNameContainer.findById(buf[i++]);
    if (!partNameContainer) {
      continue;
    }
    const { _id: key, name } = partNameContainer;
    const value = name;
    out.push({ key, value });
  }
  res.status(200).json(out);
}
export async function peeToPeto(req: express.Request, res: express.Response) {
  const users = await User.find({ role: "pee" });
  let i = 0;
  while (i < users.length) {
    await users[i++].updateOne({ role: "peto" });
  }
  sendRes(res, true);
}
export async function afterVisnuToPee(
  req: express.Request,
  res: express.Response
) {
  const users = await User.find({ fridayActEn: true });
  let i = 0;
  while (i < users.length) {
    await users[i++].updateOne({ role: "pee" });
  }
  sendRes(res, true);
}
export async function getCampForUpdate(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const partNameContainers = await PartNameContainer.find();
  const partNameIds = partNameContainers.map(
    (partNameContainer) => partNameContainer._id
  );
  const buf = removeDuplicate(partNameIds, camp.partNameIds);
  let i = 0;
  const remainPartName: MyMap[] = [];
  while (i < buf.length) {
    const partNameContainer = await PartNameContainer.findById(buf[i++]);
    if (!partNameContainer) {
      continue;
    }
    const { _id: key, name } = partNameContainer;
    const value = name;
    remainPartName.push({ key, value });
  }
  const parts: BasicPart[] = [];
  const baans: BasicBaan[] = [];
  i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    baans.push(baan);
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    parts.push(part);
  }
  const buffer: GetCampForUpdate = {
    remainPartName,
    camp,
    baans,
    parts,
  };
  res.status(200).json(buffer);
}
