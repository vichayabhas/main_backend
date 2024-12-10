import ActionPlan from "../models/ActionPlan";
import Baan from "../models/Baan";
import Camp from "../models/Camp";
import CampStyle from "../models/CampStyle";
import HeathIssue from "../models/HeathIssue";
import NameContainer from "../models/NameContainer";
import NongCamp from "../models/NongCamp";
import Part from "../models/Part";
import PeeCamp from "../models/PeeCamp";
import PetoCamp from "../models/PetoCamp";
import CampMemberCard from "../models/CampMemberCard";
import User from "../models/User";
import WorkItem from "../models/WorkItem";
import {
  CreateCamp,
  InterCampBack,
  UpdateCamp,
  UpdateBaan,
  Group,
  MyMap,
  Size,
  Id,
  BasicPart,
  CreatePusherData,
} from "../models/interface";
import {
  calculate,
  ifIsTrue,
  jsonToMapSize,
  removeDuplicate,
  resOk,
  sendRes,
  sizeJsonMod,
  sizeMapToJson,
  startJsonSize,
  startSize,
  stringToId,
  swop,
} from "./setup";
import express from "express";
import Song from "../models/Song";
import PartNameContainer from "../models/PartNameContainer";
import Place from "../models/Place";
import { getUser } from "../middleware/auth";
import Building from "../models/Building";
import LostAndFound from "../models/LostAndFound";
import { addPeeRaw, addPetoRaw, changeBaanRaw } from "./camp";
import Chat from "../models/Chat";
import { revalidationHeathIssues } from "./user";
import { deleteChatRaw } from "./randomThing";
import AnswerContainer from "../models/AnswerContainer";
import ChoiceAnswer from "../models/ChoiceAnswer";
import ChoiceQuestion from "../models/ChoiceQuestion";
import TextAnswer from "../models/TextAnswer";
import TextQuestion from "../models/TextQuestion";
import Meal from "../models/Meal";
import Food from "../models/Food";
import PusherData from "../models/PusherData";
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
//*export async function updatePusher
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
  const newPart = await addPartRaw(camp._id, nameId, false);
  if (!newPart) {
    sendRes(res, false);
    return;
  }
  res.status(201).json(newPart);
}
async function addPartRaw(
  campId: Id,
  nameId: Id,
  isAuth: boolean
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
    isAuth,
  });
  //await partNameContainer.updateOne({ partIds: swop(null, part._id, partNameContainer.partIds) })
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
  if (
    !user ||
    !camp ||
    (user.role != "admin" &&
      !user.authPartIds.includes(camp.partBoardId) &&
      !user.authPartIds.includes(camp.partCoopId))
  ) {
    res.status(401).json({ success: false });
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
    if (
      !user ||
      !camp ||
      (user.role != "admin" &&
        !user.authPartIds.includes(camp.partBoardId) &&
        !user.authPartIds.includes(camp.partCoopId))
    ) {
      res.status(401).json({ success: false });
      return;
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
    let partNameContainer = await PartNameContainer.findOne({ name: "board" });
    if (!partNameContainer) {
      partNameContainer = await PartNameContainer.create({ name: "board" });
    }
    let partNameContainerCoop = await PartNameContainer.findOne({
      name: "ประสาน",
    });
    if (!partNameContainerCoop) {
      partNameContainerCoop = await PartNameContainer.create({
        name: "ประสาน",
      });
    }
    let partNameContainerRegis = await PartNameContainer.findOne({
      name: "ทะเบียน",
    });
    if (!partNameContainerRegis) {
      partNameContainerRegis = await PartNameContainer.create({
        name: "ทะเบียน",
      });
    }
    let partNameContainerPeeBaan = await PartNameContainer.findOne({
      name: "พี่บ้าน",
    });
    if (!partNameContainerPeeBaan) {
      partNameContainerPeeBaan = await PartNameContainer.create({
        name: "พี่บ้าน",
      });
    }
    let partNameContainerWelfare = await PartNameContainer.findOne({
      name: "สวัสดิการ",
    });
    if (!partNameContainerWelfare) {
      partNameContainerWelfare = await PartNameContainer.create({
        name: "สวัสดิการ",
      });
    }
    let partNameContainerMed = await PartNameContainer.findOne({
      name: "พยาบาล",
    });
    if (!partNameContainerMed) {
      partNameContainerMed = await PartNameContainer.create({ name: "พยาบาล" });
    }
    let partNameContainerPlan = await PartNameContainer.findOne({
      name: "แผน",
    });
    if (!partNameContainerPlan) {
      partNameContainerPlan = await PartNameContainer.create({ name: "แผน" });
    }
    let partNameContainerPrStudio = await PartNameContainer.findOne({
      name: "PR/studio",
    });
    if (!partNameContainerPrStudio) {
      partNameContainerPrStudio = await PartNameContainer.create({
        name: "PR/studio",
      });
    }
    const part = await Part.create({
      nameId: partNameContainer._id,
      campId: camp._id,
      partName: `${partNameContainer.name} ${nameContainer.name} ${camp.round}`,
      isAuth: true,
    });
    await partNameContainer.updateOne({
      campIds: swop(null, camp._id, partNameContainer.campIds),
      partIds: swop(null, part._id, partNameContainer.partIds),
    });
    const petoCamp = await PetoCamp.create({
      partId: part._id,
      campId: camp._id,
    });
    await camp.updateOne({
      partIds: [part._id],
      petoModelIds: [petoCamp._id],
      campName: `${nameContainer.name} ${camp.round}`,
      baanBoardId: null,
      partBoardId: part._id,
      partNameIds: [partNameContainer._id],
    });
    await part.updateOne({ petoModelId: petoCamp._id });
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
    const coop = await addPartRaw(camp._id, partNameContainerCoop._id, true);
    const regis = await addPartRaw(camp._id, partNameContainerRegis._id, true);
    const peeBaan = await addPartRaw(
      camp._id,
      partNameContainerPeeBaan._id,
      false
    );
    const welfare = await addPartRaw(
      camp._id,
      partNameContainerWelfare._id,
      true
    );
    const med = await addPartRaw(camp._id, partNameContainerMed._id, true);
    const plan = await addPartRaw(camp._id, partNameContainerPlan._id, true);
    const prStudio = await addPartRaw(
      camp._id,
      partNameContainerPrStudio._id,
      true
    );
    if (!coop || !regis || !peeBaan || !welfare || !med || !plan || !prStudio) {
      sendRes(res, false);
      return;
    }
    await camp.updateOne({
      partCoopId: coop._id,
      partRegisterId: regis._id,
      partPeeBaanId: peeBaan._id,
      partMedId: med._id,
      partWelfareId: welfare._id,
      partPlanId: plan._id,
      partPrStudioId: prStudio._id,
    });
    if (memberStructure == "nong->highSchool,pee->1year,peto->2upYear") {
      await addPetoRaw(boardIds, part._id, res);
    } else {
      const newCamp: InterCampBack | null = await Camp.findById(camp._id);
      if (!newCamp) {
        sendRes(res, false);
        return;
      }
      const baan = await addBaanRaw(newCamp, "board", "null");
      i = 0;
      while (i < boardIds.length) {
        camp.peePassIds.set(boardIds[i++].toString(), part._id);
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
export async function forceDeleteCamp(
  req: express.Request,
  res: express.Response
) {
  const campId = req.params.id;
  await forceDeleteCampRaw(stringToId(campId), res);
}
async function forceDeleteCampRaw(campId: Id, res: express.Response | null) {
  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res?.status(400).json({ success: false });
    }
    await CampStyle.findByIdAndDelete(camp.campStyleId);
    let i = 0;
    while (i < camp.peeCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        camp.peeCampMemberCardIds[i++]
      );
      const user = await User.findById(campMemberCard?.userId);
      if (!user || !campMemberCard) {
        continue;
      }
      await user.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          user.campMemberCardIds
        ),
        filterIds: swop(camp._id, null, user.filterIds),
        registerIds: swop(camp._id, null, user.registerIds),
      });
      await campMemberCard.deleteOne();
    }
    i = 0;
    while (i < camp.nongCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        camp.nongCampMemberCardIds[i++]
      );
      const user = await User.findById(campMemberCard?.userId);
      if (!user || !campMemberCard) {
        continue;
      }
      await user.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          user.campMemberCardIds
        ),
      });
      let j = 0;
      while (j < campMemberCard.chatIds.length) {
        await Chat.findByIdAndDelete(campMemberCard.chatIds[j++]);
      }
      await campMemberCard.deleteOne();
    }
    i = 0;
    while (i < camp.petoCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        camp.petoCampMemberCardIds[i++]
      );
      const user = await User.findById(campMemberCard?.userId);
      if (!user || !campMemberCard) {
        continue;
      }
      await user.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          user.campMemberCardIds
        ),
        filterIds: swop(camp._id, null, user.filterIds),
        registerIds: swop(camp._id, null, user.registerIds),
      });
      await campMemberCard.deleteOne();
    }
    i = 0;
    while (i < camp.boardIds.length) {
      const user = await User.findById(camp.boardIds[i++]);
      if (!user) {
        continue;
      }
      const news = swop(camp._id, null, user.authorizeIds);
      await user.updateOne({
        authorizeIds: news,
        authPartIds: swop(camp.partBoardId as Id, null, user.authPartIds),
      });
    }
    i = 0;
    while (i < camp.nongModelIds.length) {
      const nongCamp = await NongCamp.findById(camp.nongModelIds[i++]);
      if (!nongCamp) {
        continue;
      }
      let j = 0;
      while (j < nongCamp.nongIds.length) {
        const user = await User.findById(nongCamp.nongIds[j++]);
        if (!user) {
          continue;
        }
        await user.updateOne({
          nongCampIds: swop(nongCamp._id, null, user.nongCampIds),
        });
      }
      await nongCamp.deleteOne();
    }
    i = 0;
    while (i < camp.peeModelIds.length) {
      const peeCamp = await PeeCamp.findById(camp.peeModelIds[i++]);
      if (!peeCamp) {
        continue;
      }
      let j = 0;
      while (j < peeCamp.peeIds.length) {
        const user = await User.findById(peeCamp.peeIds[j++]);
        if (!user) {
          continue;
        }
        await user.updateOne({
          peeCampIds: swop(peeCamp._id, null, user.peeCampIds),
        });
      }
      await peeCamp.deleteOne();
    }
    i = 0;
    while (i < camp.petoModelIds.length) {
      const petoCamp = await PetoCamp.findById(camp.petoModelIds[i++]);
      if (!petoCamp) {
        continue;
      }
      let j = 0;
      while (j < petoCamp.petoIds.length) {
        const user = await User.findById(petoCamp.petoIds[j++]);
        if (!user) {
          continue;
        }
        await user.updateOne({
          petoCampIds: swop(petoCamp._id, null, user.petoCampIds),
        });
      }
      await petoCamp.deleteOne();
    }
    i = 0;
    while (i < camp.baanIds.length) {
      const baan = await Baan.findById(camp.baanIds[i++]);
      if (!baan) {
        continue;
      }
      let j = 0;
      while (j < baan.songIds.length) {
        const song = await Song.findById(baan.songIds[j++]);
        if (!song) {
          continue;
        }
        await song.updateOne({ baanIds: swop(baan._id, null, song.baanIds) });
      }
      const boyP = await Place.findById(baan.boySleepPlaceId);
      if (boyP) {
        await boyP.updateOne({
          boySleepBaanIds: swop(baan._id, null, boyP.boySleepBaanIds),
        });
        const boyB = await Building.findById(boyP.buildingId);
        if (boyB) {
          await boyB.updateOne({
            boySleepBaanIds: swop(baan._id, null, boyB.boySleepBaanIds),
          });
        }
      }
      const girlP = await Place.findById(baan.girlSleepPlaceId);
      if (girlP) {
        await girlP.updateOne({
          girlSleepBaanIds: swop(baan._id, null, girlP.girlSleepBaanIds),
        });
        const girlB = await Building.findById(girlP.buildingId);
        if (girlB) {
          await girlB.updateOne({
            girlSleepBaanIds: swop(baan._id, null, girlB.girlSleepBaanIds),
          });
        }
      }
      const normalP = await Place.findById(baan.normalPlaceId);
      if (normalP) {
        await normalP.updateOne({
          normalBaanIds: swop(baan._id, null, normalP.normalBaanIds),
        });
        const normalB = await Building.findById(normalP.buildingId);
        if (normalB) {
          await normalB.updateOne({
            normalBaanIds: swop(baan._id, null, normalB.normalBaanIds),
          });
        }
      }
      await CampStyle.findByIdAndDelete(baan.styleId);
      j = 0;
      while (j < baan.nongChatIds.length) {
        await Chat.findByIdAndDelete(baan.nongChatIds[j++]);
      }
      j = 0;
      while (j < baan.peeChatIds.length) {
        await Chat.findByIdAndDelete(baan.peeChatIds[j++]);
      }
      await baan.deleteOne();
    }
    await CampStyle.findByIdAndDelete(camp.campStyleId);
    i = 0;
    if (camp.nongDataLock) {
      while (i < camp.nongHeathIssueIds.length) {
        const heathIssue = await HeathIssue.findById(
          camp.nongHeathIssueIds[i++]
        );
        if (!heathIssue) {
          continue;
        }
        await heathIssue.updateOne({
          campIds: swop(camp._id, null, heathIssue.campIds),
        });
      }
    } else {
      while (i < camp.nongCampMemberCardHaveHeathIssueIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          camp.nongCampMemberCardHaveHeathIssueIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        const heathIssue = await HeathIssue.findById(
          campMemberCard.healthIssueId
        );
        if (!heathIssue) {
          continue;
        }
        await heathIssue.updateOne({
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            heathIssue.campMemberCardIds
          ),
        });
      }
    }
    i = 0;
    if (camp.peeDataLock) {
      while (i < camp.peeHeathIssueIds.length) {
        const heathIssue = await HeathIssue.findById(
          camp.peeHeathIssueIds[i++]
        );
        if (!heathIssue) {
          continue;
        }
        await heathIssue.updateOne({
          campIds: swop(camp._id, null, heathIssue.campIds),
        });
      }
    } else {
      while (i < camp.peeCampMemberCardHaveHeathIssueIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          camp.peeCampMemberCardHaveHeathIssueIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        const heathIssue = await HeathIssue.findById(
          campMemberCard.healthIssueId
        );
        if (!heathIssue) {
          continue;
        }
        await heathIssue.updateOne({
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            heathIssue.campMemberCardIds
          ),
        });
      }
    }
    i = 0;
    if (camp.petoDataLock) {
      while (i < camp.petoHeathIssueIds.length) {
        const heathIssue = await HeathIssue.findById(
          camp.petoHeathIssueIds[i++]
        );
        if (!heathIssue) {
          continue;
        }
        await heathIssue.updateOne({
          campIds: swop(camp._id, null, heathIssue.campIds),
        });
      }
    } else {
      while (i < camp.petoCampMemberCardHaveHeathIssueIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          camp.petoCampMemberCardHaveHeathIssueIds[i++]
        );
        if (!campMemberCard) {
          continue;
        }
        const heathIssue = await HeathIssue.findById(
          campMemberCard.healthIssueId
        );
        if (!heathIssue) {
          continue;
        }
        await heathIssue.updateOne({
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            heathIssue.campMemberCardIds
          ),
        });
      }
    }
    i = 0;
    await revalidationHeathIssues(camp.nongHeathIssueIds);
    await revalidationHeathIssues(camp.peeHeathIssueIds);
    await revalidationHeathIssues(camp.petoHeathIssueIds);
    while (i < camp.partIds.length) {
      const part = await Part.findById(camp.partIds[i++]);
      if (!part) {
        continue;
      }
      const partNameContainer = await PartNameContainer.findById(part?.nameId);
      await partNameContainer?.updateOne({
        partIds: swop(part._id, null, partNameContainer.partIds),
        campIds: swop(camp._id, null, partNameContainer.campIds),
      });
      let j = 0;
      while (j < part.chatIds.length) {
        await Chat.findByIdAndDelete(part.chatIds[j++]);
      }
      if (part.isAuth) {
        j = 0;
        while (j < part.peeIds.length) {
          const user = await User.findById(part.peeIds[j++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(part._id, null, user.authPartIds),
            authorizeIds: swop(camp._id, null, user.authorizeIds),
          });
        }
        j = 0;
        while (j < part.petoIds.length) {
          const user = await User.findById(part.petoIds[j++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(part._id, null, user.authPartIds),
            authorizeIds: swop(camp._id, null, user.authorizeIds),
          });
        }
      }
      await part.deleteOne();
    }
    i = 0;
    while (i < camp.workItemIds.length) {
      await WorkItem.findByIdAndDelete(camp.workItemIds[i++]);
    }
    i = 0;
    while (i < camp.actionPlanIds.length) {
      const actionPlan = await ActionPlan.findById(camp.actionPlanIds[i++]);
      if (!actionPlan) {
        continue;
      }
      let j = 0;
      while (j < actionPlan.placeIds.length) {
        const place = await Place.findById(actionPlan.placeIds[j++]);
        if (!place) {
          continue;
        }
        await place.updateOne({
          actionPlanIds: swop(actionPlan._id, null, place.actionPlanIds),
        });
        const building = await Building.findById(place.buildingId);
        if (!building) {
          continue;
        }
        await building.updateOne({
          actionPlanIds: swop(actionPlan._id, null, building.actionPlanIds),
        });
      }
      await actionPlan.deleteOne();
    }
    i = 0;
    while (i < camp.lostAndFoundIds.length) {
      await LostAndFound.findByIdAndUpdate(camp.lostAndFoundIds[i++], {
        campId: null,
      });
    }
    const name = await NameContainer.findById(camp.nameId);
    if (name) {
      await name.updateOne({ campIds: swop(camp._id, null, name.campIds) });
    }
    i = 0;
    while (i < camp.nongAnswerPackIds.length) {
      const answerPack = await AnswerContainer.findById(
        camp.nongAnswerPackIds[i++]
      );
      if (!answerPack) {
        continue;
      }
      const user = await User.findById(answerPack.userId);
      if (!user) {
        continue;
      }
      await user.updateOne({
        nongAnswerPackIds: swop(answerPack._id, null, user.nongAnswerPackIds),
      });
      await answerPack.deleteOne();
    }
    i = 0;
    while (i < camp.peeAnswerPackIds.length) {
      const answerPack = await AnswerContainer.findById(
        camp.peeAnswerPackIds[i++]
      );
      if (!answerPack) {
        continue;
      }
      const user = await User.findById(answerPack.userId);
      if (!user) {
        continue;
      }
      await user.updateOne({
        peeAnswerPackIds: swop(answerPack._id, null, user.peeAnswerPackIds),
      });
      await answerPack.deleteOne();
    }
    i = 0;
    while (i < camp.choiceQuestionIds.length) {
      const choiceQuestion = await ChoiceQuestion.findById(
        camp.choiceQuestionIds[i++]
      );
      if (!choiceQuestion) {
        continue;
      }
      let j = 0;
      while (j < choiceQuestion.answerIds.length) {
        await ChoiceAnswer.findByIdAndDelete(choiceQuestion.answerIds[j++]);
      }
    }
    i = 0;
    while (i < camp.textQuestionIds.length) {
      const textQuestion = await TextQuestion.findById(
        camp.textQuestionIds[i++]
      );
      if (!textQuestion) {
        continue;
      }
      let j = 0;
      while (j < textQuestion.answerIds.length) {
        await ChoiceAnswer.findByIdAndDelete(textQuestion.answerIds[j++]);
      }
    }
    i = 0;
    while (i < camp.mealIds.length) {
      await Meal.findByIdAndDelete(camp.mealIds[i++]);
    }
    i = 0;
    while (i < camp.foodIds.length) {
      await Food.findByIdAndDelete(camp.foodIds[i++]);
    }
    await PusherData.findByIdAndDelete(camp.pusherId)
    await camp.deleteOne();
    res?.status(200).json({ success: true });
  } catch {
    res?.status(400).json({ success: false });
  }
}
export async function saveDeleteCamp(
  req: express.Request,
  res: express.Response
) {
  const campId: string = req.params.id;
  const camp: InterCampBack | null = await Camp.findById(campId);
  if (!camp) {
    res.status(400).json({
      success: false,
      message: "no camp",
    });
    return;
  }
  if (
    camp.nongPaidIds.length ||
    camp.nongPassIds.size ||
    camp.nongInterviewIds.size ||
    camp.peeIds.length + camp.petoIds.length > camp.boardIds.length ||
    camp.partIds.length > 8 ||
    camp.baanIds.length > 19 ||
    camp.peePassIds.size
  ) {
    res
      .status(400)
      .json({ success: false, message: "this camp is not save to delete" });
    return;
  }
  forceDeleteCampRaw(camp._id, res);
}
export async function addCampName(req: express.Request, res: express.Response) {
  try {
    const name = await NameContainer.create({ name: req.params.id });
    res.status(201).json(name);
  } catch (err) {
    console.log(err);
    sendRes(res, false);
  }
}
export async function saveDeleteCampName(
  req: express.Request,
  res: express.Response
) {
  try {
    const hospital = await NameContainer.findById(req.params.id);
    if (hospital?.campIds.length) {
      return res
        .status(400)
        .json({ success: false, massage: "this not safe to delete" });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function forceDeleteCampName(
  req: express.Request,
  res: express.Response
) {
  const name = await NameContainer.findById(req.params.id);
  if (!name) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < name.campIds.length) {
    await forceDeleteCampRaw(name.campIds[i++], null);
  }
  await name.deleteOne();
  res.status(200).json({ success: true });
}
export async function forceDeleteBaan(
  req: express.Request,
  res: express.Response
) {
  const baan = await Baan.findById(req.params.id);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  let nongIds = camp.nongIds;
  let nongCampMemberCardIds = camp.nongCampMemberCardIds;
  let peeCampMemberCardIds = camp.peeCampMemberCardIds;
  let peeModelIds = camp.peeModelIds;
  let peeIds = camp.peeIds;
  let peeHeathIssueIds = camp.peeHeathIssueIds;
  let nongHeathIssueIds = camp.nongHeathIssueIds;
  let peeSleepIds = camp.peeSleepIds;
  let nongSleepIds = camp.nongSleepIds;
  let nongHaveBottleIds = camp.nongHaveBottleIds;
  let peeHaveBottleIds = camp.peeHaveBottleIds;
  let nongCampMemberCardHaveHeathIssueIds =
    camp.nongCampMemberCardHaveHeathIssueIds;
  let peeCampMemberCardHaveHeathIssueIds =
    camp.peeCampMemberCardHaveHeathIssueIds;
  let i = 0;
  if (camp.nongDataLock) {
    while (i < baan.nongCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.nongCampMemberCardHaveHeathIssueIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!heathIssue) {
        continue;
      }
      nongHeathIssueIds = swop(heathIssue._id, null, nongHeathIssueIds);
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
      nongCampMemberCardHaveHeathIssueIds = swop(
        campMemberCard._id,
        null,
        nongCampMemberCardHaveHeathIssueIds
      );
      await clearHealthIssue(campMemberCard._id);
    }
  } else {
    while (i < baan.nongCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.nongCampMemberCardHaveHeathIssueIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!heathIssue) {
        continue;
      }
      nongHeathIssueIds = swop(heathIssue._id, null, nongHeathIssueIds);
      await heathIssue.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
      nongCampMemberCardHaveHeathIssueIds = swop(
        campMemberCard._id,
        null,
        nongCampMemberCardHaveHeathIssueIds
      );
      await clearHealthIssue(campMemberCard._id);
    }
  }
  i = 0;
  while (i < baan.peeCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const part = await Part.findById(peeCamp.partId);
    if (!part) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    peeHeathIssueIds = swop(heathIssue._id, null, peeHeathIssueIds);
    if (camp.peeDataLock) {
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
    } else {
      await heathIssue.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
    }
    await part.updateOne({
      peeHeathIssueIds: swop(heathIssue._id, null, part.peeHeathIssueIds),
      peeCampMemberCardHaveHeathIssueIds: swop(
        campMemberCard._id,
        null,
        part.peeCampMemberCardHaveHeathIssueIds
      ),
    });
    peeCampMemberCardHaveHeathIssueIds = swop(
      campMemberCard._id,
      null,
      peeCampMemberCardHaveHeathIssueIds
    );
    await clearHealthIssue(campMemberCard._id);
  }
  i = 0;
  while (i < baan.songIds.length) {
    const song = await Song.findById(baan.songIds[i++]);
    await song?.updateOne({ baanIds: swop(baan._id, null, song.baanIds) });
  }
  i = 0;
  while (i < baan.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(baan.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    const part = await Part.findById(peeCamp.partId);
    if (!part) {
      continue;
    }
    let j = 0;
    while (j < peeCamp.peeIds.length) {
      const user = await User.findById(peeCamp.peeIds[j++]);
      if (!user) {
        continue;
      }
      if (baan.peeHaveBottleIds.includes(user._id)) {
        await part.updateOne({
          peeHaveBottleIds: swop(user._id, null, part.peeHaveBottleIds),
        });
        peeHaveBottleIds = swop(user._id, null, peeHaveBottleIds);
      }
      const peeCampIds = swop(peeCamp._id, null, user.peeCampIds);
      const p = swop(user._id, null, part.peeIds);
      await part.updateOne({ peeIds: p });
      peeIds = swop(user._id, null, peeIds);
      await user.updateOne({ peeCampIds });
      if (part.isAuth) {
        await user.updateOne({
          authorizeIds: swop(camp._id, null, user.authorizeIds),
          authPartIds: swop(part._id, null, user.authPartIds),
        });
      }
    }
    peeModelIds = swop(peeCamp._id, null, peeModelIds);
  }
  const nongCamp = await NongCamp.findById(baan.nongModelId);
  if (!nongCamp) {
    sendRes(res, false);
    return;
  }
  i = 0;
  while (i < nongCamp.nongIds.length) {
    const user = await User.findById(nongCamp.nongIds[i++]);
    if (!user) {
      continue;
    }
    await user.updateOne({
      nongCampIds: swop(nongCamp._id, null, user.nongCampIds),
    });
    nongIds = swop(user._id, null, nongIds);
    if (baan.nongHaveBottleIds.includes(user._id)) {
      nongHaveBottleIds = swop(user._id, null, nongHaveBottleIds);
    }
  }
  await nongCamp.deleteOne();
  camp.nongShirtSize.forEach((v, k) => {
    camp.nongShirtSize.set(k, calculate(v, 0, baan.nongShirtSize.get(k)));
  });
  const boyP = await Place.findById(baan.boySleepPlaceId);
  if (boyP) {
    await boyP.updateOne({
      boySleepBaanIds: swop(baan._id, null, boyP.boySleepBaanIds),
    });
    const boyB = await Building.findById(boyP.buildingId);
    if (boyB) {
      await boyB.updateOne({
        boySleepBaanIds: swop(baan._id, null, boyB.boySleepBaanIds),
      });
    }
  }
  const girlP = await Place.findById(baan.girlSleepPlaceId);
  if (girlP) {
    await girlP.updateOne({
      girlSleepBaanIds: swop(baan._id, null, girlP.girlSleepBaanIds),
    });
    const girlB = await Building.findById(girlP.buildingId);
    if (girlB) {
      await girlB.updateOne({
        girlSleepBaanIds: swop(baan._id, null, girlB.girlSleepBaanIds),
      });
    }
  }
  const normalP = await Place.findById(baan.normalPlaceId);
  if (normalP) {
    await normalP.updateOne({
      normalBaanIds: swop(baan._id, null, normalP.normalBaanIds),
    });
    const normalB = await Building.findById(normalP.buildingId);
    if (normalB) {
      await normalB.updateOne({
        normalBaanIds: swop(baan._id, null, normalB.normalBaanIds),
      });
    }
  }
  camp.peeShirtSize.forEach((v, k) => {
    camp.peeShirtSize.set(k, calculate(v, 0, baan?.peeShirtSize.get(k)));
  });
  while (i < baan.nongCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.nongCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    await user.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    nongCampMemberCardIds = swop(
      campMemberCard._id,
      null,
      nongCampMemberCardIds
    );
    let j = 0;
    if (campMemberCard.sleepAtCamp) {
      nongSleepIds = swop(user._id, null, nongSleepIds);
    }
    while (j < campMemberCard.allChatIds.length) {
      const chat = await Chat.findById(campMemberCard.allChatIds[j++]);
      if (!chat) {
        continue;
      }
      await chat.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          chat.campMemberCardIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    await removeAnswer(user._id, camp._id);
    campMemberCard?.deleteOne();
  }
  i = 0;
  while (i < baan.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      return;
    }
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const part = await Part.findById(peeCamp.partId);
    const user = await User.findById(campMemberCard.userId);
    if (!user || !part) {
      continue;
    }
    await user.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    peeCampMemberCardIds = swop(campMemberCard._id, null, peeCampMemberCardIds);
    if (campMemberCard.sleepAtCamp) {
      peeSleepIds = swop(user._id, null, peeSleepIds);
      await part.updateOne({
        peeSleepIds: swop(user._id, null, part.peeSleepIds),
      });
    }
    part.peeShirtSize.set(
      campMemberCard.size,
      calculate(part.peeShirtSize.get(campMemberCard.size), 0, 1)
    );
    await part.updateOne({
      peeCampMemberCardIds: swop(
        campMemberCard._id,
        null,
        part.peeCampMemberCardIds
      ),
      peeShirtSize: part.peeShirtSize,
    });
    let j = 0;
    while (j < campMemberCard.allChatIds.length) {
      const chat = await Chat.findById(campMemberCard.allChatIds[j++]);
      if (!chat) {
        continue;
      }
      await chat.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          chat.campMemberCardIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    if (camp.peeAnswerIds.includes(user._id)) {
      await removeAnswer(user._id, camp._id);
    }
    await CampMemberCard.findByIdAndDelete(campMemberCard._id);
  }
  i = 0;
  while (i < baan.peeModelIds.length) {
    await PeeCamp.findByIdAndDelete(baan.peeModelIds[i++]);
  }
  await camp.updateOne({
    nongIds,
    nongShirtSize: camp.nongShirtSize,
    peeIds,
    peeModelIds,
    peeShirtSize: camp.peeShirtSize,
    peeCampMemberCardIds,
    nongCampMemberCardIds,
    nongHeathIssueIds,
    peeHeathIssueIds,
    nongSleepIds,
    peeSleepIds,
    baanIds: swop(baan._id, null, camp.baanIds),
    nongModelIds: swop(baan.nongModelId as Id, null, camp.nongModelIds),
    nongCampMemberCardHaveHeathIssueIds,
    peeCampMemberCardHaveHeathIssueIds,
  });
  await CampStyle.findByIdAndDelete(baan.styleId);
  await baan.deleteOne();
  res.status(200).json({ success: true });
}
export async function saveDeleteBaan(
  req: express.Request,
  res: express.Response
) {
  const baan = await Baan.findById(req.params.id);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  if (
    !user ||
    (user.role != "admin" && !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    return res.status(403).json({ success: false });
  }
  if (
    baan.nongIds.length ||
    baan.peeIds.length ||
    baan.songIds.length ||
    baan.nongChatIds.length ||
    baan.peeChatIds.length
  ) {
    return res
      .status(400)
      .json({ success: false, message: "this baan is not save to delete" });
  }
  let peeModelIds = camp.peeModelIds;
  let i = 0;
  while (i < baan.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(baan.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    peeModelIds = swop(peeCamp._id, null, peeModelIds);
    peeCamp.deleteOne();
  }
  const boyP = await Place.findById(baan.boySleepPlaceId);
  if (boyP) {
    await boyP.updateOne({
      boySleepBaanIds: swop(baan._id, null, boyP.boySleepBaanIds),
    });
    const boyB = await Building.findById(boyP.buildingId);
    if (boyB) {
      await boyB.updateOne({
        boySleepBaanIds: swop(baan._id, null, boyB.boySleepBaanIds),
      });
    }
  }
  const girlP = await Place.findById(baan.girlSleepPlaceId);
  if (girlP) {
    await girlP.updateOne({
      girlSleepBaanIds: swop(baan._id, null, girlP.girlSleepBaanIds),
    });
    const girlB = await Building.findById(girlP.buildingId);
    if (girlB) {
      await girlB.updateOne({
        girlSleepBaanIds: swop(baan._id, null, girlB.girlSleepBaanIds),
      });
    }
  }
  const normalP = await Place.findById(baan?.normalPlaceId);
  if (normalP) {
    await normalP.updateOne({
      normalBaanIds: swop(baan._id, null, normalP.normalBaanIds),
    });
    const normalB = await Building.findById(normalP.buildingId);
    if (normalB) {
      await normalB.updateOne({
        normalBaanIds: swop(baan._id, null, normalB.normalBaanIds),
      });
    }
  }
  await camp.updateOne({
    nongModelIds: swop(baan.nongModelId as Id, null, camp.nongModelIds),
    peeModelIds,
  });
  await NongCamp.findByIdAndDelete(baan.nongModelId);
  await CampStyle.findByIdAndDelete(baan.styleId);
  await baan.deleteOne();
  res.status(200).json({ success: true });
}
export async function saveDeletePart(
  req: express.Request,
  res: express.Response
) {
  const part = await Part.findById(req.params.id);
  if (!part) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(part.campId);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  if (
    !user ||
    (user.role != "admin" &&
      !user.authPartIds.includes(camp.partBoardId as Id)) ||
    part.isAuth ||
    part._id.equals(camp.partPeeBaanId)
  ) {
    return res.status(403).json({ success: false });
  }
  if (
    part.petoIds.length ||
    part.peeIds.length ||
    part.actionPlanIds.length ||
    part.workItemIds.length ||
    part.chatIds
  ) {
    return res
      .status(400)
      .json({ success: false, message: "this baan is not save to delete" });
  }
  let i = 0;
  while (i < part.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(part.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    camp.updateOne({ peeModelIds: swop(peeCamp._id, null, camp.peeModelIds) });
    peeCamp?.deleteOne();
  }
  camp.updateOne({
    petoModelIds: swop(part.petoModelId as Id, null, camp.petoModelIds),
  });
  await PetoCamp.findByIdAndDelete(part?.petoModelId);
  part.deleteOne();
  res.status(200).json({ success: true });
}
export async function forceDeletePart(
  req: express.Request,
  res: express.Response
) {
  forceDeletePartRaw(stringToId(req.params.id));
  res.status(200).json({ success: true });
}
async function forceDeletePartRaw(partId: Id) {
  const part = await Part.findById(partId);
  if (!part) {
    return;
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    return;
  }
  let petoCampMemberCardIds = camp.petoCampMemberCardIds;
  let peeCampMemberCardIds = camp.peeCampMemberCardIds;
  let actionPlanIds = camp.actionPlanIds;
  let petoIds = camp.petoIds;
  let peeIds = camp.peeIds;
  let peeModelIds = camp.peeModelIds;
  let workItemIds = camp.workItemIds;
  let peeHeathIssueIds = camp.peeHeathIssueIds;
  let petoHeathIssueIds = camp.petoHeathIssueIds;
  let peeSleepIds = camp.peeSleepIds;
  let petoSleepIds = camp.petoSleepIds;
  let peeHaveBottleIds = camp.peeHaveBottleIds;
  let petoHaveBottleIds = camp.petoHaveBottleIds;
  let peeCampMemberCardHaveHeathIssueIds =
    camp.peeCampMemberCardHaveHeathIssueIds;
  let petoCampMemberCardHaveHeathIssueIds =
    camp.petoCampMemberCardHaveHeathIssueIds;
  let i = 0;
  while (i < part.peeCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      part.peeCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const baan = await Baan.findById(peeCamp.partId);
    if (!baan) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    peeHeathIssueIds = swop(heathIssue._id, null, peeHeathIssueIds);
    if (camp.peeDataLock) {
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
    } else {
      await heathIssue.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
    }
    await baan.updateOne({
      peeHeathIssueIds: swop(heathIssue._id, null, baan.peeHeathIssueIds),
      peeCampMemberCardHaveHeathIssueIds: swop(
        campMemberCard._id,
        null,
        baan.peeCampMemberCardHaveHeathIssueIds
      ),
    });
    peeCampMemberCardHaveHeathIssueIds = swop(
      campMemberCard._id,
      null,
      peeCampMemberCardHaveHeathIssueIds
    );
  }
  i = 0;
  if (camp.petoDataLock) {
    while (i < part.petoCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.petoCampMemberCardHaveHeathIssueIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!heathIssue) {
        continue;
      }
      petoHeathIssueIds = swop(heathIssue._id, null, petoHeathIssueIds);
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
      petoCampMemberCardHaveHeathIssueIds = swop(
        campMemberCard._id,
        null,
        petoCampMemberCardHaveHeathIssueIds
      );
      await clearHealthIssue(campMemberCard._id);
    }
  } else {
    while (i < part.petoCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.petoCampMemberCardHaveHeathIssueIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!heathIssue) {
        continue;
      }
      petoHeathIssueIds = swop(heathIssue._id, null, petoHeathIssueIds);
      await heathIssue.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
      petoCampMemberCardHaveHeathIssueIds = swop(
        campMemberCard._id,
        null,
        petoCampMemberCardHaveHeathIssueIds
      );
      await clearHealthIssue(campMemberCard._id);
    }
  }
  camp.petoShirtSize.forEach((v, k) => {
    camp.petoShirtSize.set(k, calculate(v, 0, part?.petoShirtSize.get(k)));
  });
  camp.peeShirtSize.forEach((v, k) => {
    camp.peeShirtSize.set(k, calculate(v, 0, part?.peeShirtSize.get(k)));
  });
  i = 0;
  while (i < part.actionPlanIds.length) {
    const actionPlan = await ActionPlan.findById(part.actionPlanIds[i++]);
    if (!actionPlan) {
      continue;
    }
    let j = 0;
    while (j < actionPlan.placeIds.length) {
      const place = await Place.findById(actionPlan.placeIds[j++]);
      if (!place) {
        continue;
      }
      await place.updateOne({
        actionPlanIds: swop(actionPlan._id, null, place.actionPlanIds),
      });
      const building = await Building.findById(place.buildingId);
      if (!building) {
        continue;
      }
      await building.updateOne({
        actionPlanIds: swop(actionPlan._id, null, building.actionPlanIds),
      });
    }
    actionPlanIds = swop(actionPlan._id, null, actionPlanIds);
  }
  i = 0;
  while (i < part.workItemIds.length) {
    const workItem = await WorkItem.findById(part.workItemIds[i++]);
    if (!workItem) {
      continue;
    }
    if (workItem.fromId) {
      const from = await WorkItem.findById(workItem.fromId);
      if (from) {
        await from.updateOne({
          linkOutIds: swop(workItem._id, null, from.linkOutIds),
        });
      }
    }
    workItemIds = swop(workItem?._id, null, workItemIds);
    await deleteWorkingItemRaw(workItem._id);
  }
  i = 0;
  while (i < part.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(part.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    const baan = await Baan.findById(peeCamp.baanId);
    if (!baan) {
      continue;
    }
    let j = 0;
    while (j < peeCamp.peeIds.length) {
      const user = await User.findById(peeCamp.peeIds[j++]);
      if (!user) {
        continue;
      }
      if (part.peeHaveBottleIds.includes(user._id)) {
        peeHaveBottleIds = swop(user._id, null, peeHaveBottleIds);
        await baan.updateOne({
          peeHaveBottleIds: swop(user._id, null, baan.peeHaveBottleIds),
        });
      }
      await baan.updateOne({ peeIds: swop(user._id, null, baan.peeIds) });
      peeIds = swop(user._id, null, peeIds);
      await user.updateOne({
        peeCampIds: swop(peeCamp._id, null, user.peeCampIds),
      });
    }
    peeModelIds = swop(peeCamp._id, null, peeModelIds);
  }
  const petoCamp = await PetoCamp.findById(part.petoModelId);
  if (!petoCamp) {
    return;
  }
  i = 0;
  while (i < petoCamp?.petoIds.length) {
    const user = await User.findById(petoCamp.petoIds);
    if (!user) {
      continue;
    }
    petoIds = swop(user._id, null, petoIds);
    await user.updateOne({
      petoCampIds: swop(petoCamp._id, null, user.petoCampIds),
    });
    if (part.petoHaveBottleIds.includes(user._id)) {
      petoHaveBottleIds = swop(user._id, null, petoHaveBottleIds);
    }
  }
  i = 0;
  while (i < part.chatIds.length) {
    await deleteChatRaw(part.chatIds[i++]);
  }
  petoCamp.deleteOne();
  i = 0;
  while (i < part.petoCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      part.petoCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    await user.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    petoCampMemberCardIds = swop(
      campMemberCard._id,
      null,
      petoCampMemberCardIds
    );
    if (campMemberCard.sleepAtCamp) {
      petoSleepIds = swop(user._id, null, petoSleepIds);
    }
    let j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    campMemberCard?.deleteOne();
    if (camp.peeAnswerIds.includes(user._id)) {
      await removeAnswer(user._id, camp._id);
    }
  }
  i = 0;
  while (i < part.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      part.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    await user?.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    peeCampMemberCardIds = swop(campMemberCard._id, null, peeCampMemberCardIds);
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const baan = await Baan.findById(peeCamp.baanId);
    if (!baan) {
      continue;
    }
    if (campMemberCard.sleepAtCamp) {
      peeSleepIds = swop(user._id, null, peeSleepIds);
      await baan.updateOne({
        peeSleepIds: swop(user._id, null, baan.peeSleepIds),
      });
    }
    baan.updateOne({
      peeCampMemberCardIds: swop(
        campMemberCard?._id,
        null,
        part.peeCampMemberCardIds
      ),
    });
    baan.peeShirtSize.set(
      campMemberCard.size,
      calculate(baan.peeShirtSize.get(campMemberCard.size), 0, 1)
    );
    let j = 0;
    while (j < campMemberCard.allChatIds.length) {
      const chat = await Chat.findById(campMemberCard.allChatIds[j++]);
      if (!chat) {
        continue;
      }
      await chat.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          chat.campMemberCardIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    if (camp.peeAnswerIds.includes(user._id)) {
      await removeAnswer(user._id, camp._id);
    }
    await campMemberCard.deleteOne();
    await baan.updateOne({ peeShirtSize: baan.peeShirtSize });
  }
  i = 0;
  while (i < part.peeModelIds.length) {
    await PeeCamp.findByIdAndDelete(part.peeModelIds[i++]);
  }
  await camp.updateOne({
    partIds: swop(part._id, null, camp.partIds),
    petoModelIds: swop(part.petoModelId as Id, null, camp.petoModelIds),
    petoShirtSize: camp.petoShirtSize,
    petoCampMemberCardIds,
    peeCampMemberCardIds,
    peeModelIds,
    actionPlanIds,
    petoIds,
    peeIds,
    workItemIds,
    peeHeathIssueIds,
    petoHeathIssueIds,
    peeSleepIds,
    petoSleepIds,
    peeHaveBottleIds,
    petoHaveBottleIds,
    peeCampMemberCardHaveHeathIssueIds,
    petoCampMemberCardHaveHeathIssueIds,
  });
  if (part.isAuth) {
    let j = 0;
    while (j < part.peeIds.length) {
      const user = await User.findById(part.peeIds[j++]);
      if (!user) {
        continue;
      }
      await user.updateOne({
        authPartIds: swop(part._id, null, user.authPartIds),
        authorizeIds: swop(camp._id, null, user.authorizeIds),
      });
    }
    j = 0;
    while (j < part.petoIds.length) {
      const user = await User.findById(part.petoIds[j++]);
      if (!user) {
        continue;
      }
      await user.updateOne({
        authPartIds: swop(part._id, null, user.authPartIds),
        authorizeIds: swop(camp._id, null, user.authorizeIds),
      });
    }
  }
  await part.deleteOne();
}
export async function addPartName(req: express.Request, res: express.Response) {
  const name = await PartNameContainer.create({ name: req.params.id });
  res.status(201).json(name);
}
export async function saveDeletePartName(
  req: express.Request,
  res: express.Response
) {
  try {
    const hospital = await PartNameContainer.findById(req.params.id);
    res.status(400).json({
      success: false,
    });
    if (hospital?.campIds.length) {
      return res
        .status(400)
        .json({ success: false, massage: "this not safe to delete" });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function forceDeletePartName(
  req: express.Request,
  res: express.Response
) {
  const partNameContainer = await PartNameContainer.findById(req.params.id);
  if (!partNameContainer) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < partNameContainer.partIds.length) {
    await forceDeletePartRaw(partNameContainer.partIds[i++]);
  }
  res.status(200).json({ success: true });
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
  const update: UpdateCamp = req.body;
  if (camp.nongDataLock != update.nongDataLock) {
    if (update.nongDataLock) {
      await lockDataNong(camp._id);
    } else {
      await unlockDataNong(camp._id);
    }
  }
  if (camp.peeDataLock != update.peeDataLock) {
    if (update.peeDataLock) {
      await lockDataPee(camp._id);
    } else {
      await unlockDataPee(camp._id);
    }
  }
  if (camp.petoDataLock != update.petoDataLock) {
    if (update.petoDataLock) {
      await lockDataPeto(camp._id);
    } else {
      await unlockDataPeto(camp._id);
    }
  }
  await camp.updateOne(update);
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
    await changeBaanRaw([user._id], baanId, res);
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
  if (
    camp.ready.includes(baan.groupRef) ||
    (!user.authPartIds.includes(camp.partCoopId as Id) &&
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

async function lockDataNong(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.nongCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      camp.nongCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    await heathIssue.updateOne({
      campIds: swop(null, camp._id, heathIssue.campIds),
      campMemberCardIds: swop(
        campMemberCard._id,
        null,
        heathIssue.campMemberCardIds
      ),
    });
  }
}
async function lockDataPee(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.peeCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      camp.peeCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    await heathIssue.updateOne({
      campIds: swop(null, camp._id, heathIssue.campIds),
      campMemberCardIds: swop(
        campMemberCard._id,
        null,
        heathIssue.campMemberCardIds
      ),
    });
  }
}
async function lockDataPeto(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.petoCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      camp.petoCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    await heathIssue.updateOne({
      campIds: swop(null, camp._id, heathIssue.campIds),
      campMemberCardIds: swop(
        campMemberCard._id,
        null,
        heathIssue.campMemberCardIds
      ),
    });
  }
}
async function unlockDataNong(campId: Id) {
  const camp1 = await Camp.findByIdAndUpdate(campId, {
    nongShirtSize: startSize(),
    nongSleepIds: [],
    nongHaveBottleIds: [],
  });
  if (!camp1) {
    return;
  }
  let i = 0;
  while (i < camp1.nongCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      camp1.nongCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    await heathIssue.updateOne({
      campIds: swop(camp1._id, null, heathIssue.campIds),
    });
    await campMemberCard.updateOne({
      healthIssueId: null,
      whiteListFoodIds: [],
      blackListFoodIds: [],
    });
  }
  i = 0;
  while (i < camp1.baanIds.length) {
    await Baan.findByIdAndUpdate(camp1.baanIds[i++], {
      nongHeathIssueIds: [],
      nongShirtSize: startSize(),
      nongSleepIds: [],
      nongCampMemberCardHaveHeathIssueIds: [],
      nongHaveBottleIds: [],
    });
  }
  i = 0;
  while (i < camp1.foodIds.length) {
    await Food.findByIdAndUpdate(camp1.foodIds[i++], {
      nongCampMemberCardIds: [],
      nongHeathIssueIds: [],
      nongIds: [],
    });
  }
  await revalidationHeathIssues(camp1.nongHeathIssueIds);
  await camp1.updateOne({
    nongCampMemberCardHaveHeathIssueIds: [],
    nongHeathIssueIds: [],
  });
  const camp2 = await Camp.findById(camp1._id);
  const campNongShirtSize = startJsonSize();
  const campNongSleepIds: Id[] = [];
  const campNongHaveBottleIds: Id[] = [];
  const campNongHeathIssueIds: Id[] = [];
  const campNongCampMemberCardHaveHeathIssueIds: Id[] = [];
  i = 0;
  if (!camp2) {
    return;
  }
  while (i < camp2.nongModelIds.length) {
    const nongCamp = await NongCamp.findById(camp2.nongModelIds[i++]);
    if (!nongCamp) {
      continue;
    }
    const baan = await Baan.findById(nongCamp.baanId);
    if (!baan) {
      continue;
    }
    let j = 0;
    const baanNongSleepIds = baan.nongSleepIds;
    const baanNongShirtSize = sizeMapToJson(
      baan.nongShirtSize as Map<Size, number>
    );
    const baanNongHaveBottleIds = baan.nongHaveBottleIds;
    const baanNongHeathIssueIds = baan.nongHeathIssueIds;
    const baanNongCampMemberCardHaveHeathIssueIds =
      baan.nongCampMemberCardHaveHeathIssueIds;
    while (j < nongCamp.nongCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        nongCamp.nongCampMemberCardIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const user = await User.findById(campMemberCard.userId);
      if (!user) {
        continue;
      }
      let sleepAtCamp: boolean;
      switch (camp2.nongSleepModel) {
        case "นอนทุกคน": {
          sleepAtCamp = true;
          break;
        }
        case "เลือกได้ว่าจะค้างคืนหรือไม่": {
          sleepAtCamp = user.likeToSleepAtCamp;
          break;
        }
        case "ไม่มีการค้างคืน": {
          sleepAtCamp = false;
          break;
        }
      }
      await campMemberCard.updateOne({
        haveBottle: user.haveBottle,
        size: user.shirtSize,
        sleepAtCamp,
      });
      ifIsTrue(
        user.haveBottle,
        user._id,
        campNongHaveBottleIds,
        baanNongHaveBottleIds
      );
      sizeJsonMod(user.shirtSize, 1, baanNongShirtSize);
      sizeJsonMod(user.shirtSize, 1, campNongShirtSize);
      if (user.healthIssueId) {
        const heathIssue = await HeathIssue.findById(user.healthIssueId);
        if (heathIssue) {
          await heathIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              heathIssue.campMemberCardIds
            ),
          });
          baanNongHeathIssueIds.push(heathIssue._id);
          campNongHeathIssueIds.push(heathIssue._id);
          baanNongCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          campNongCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: heathIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, campNongSleepIds, baanNongSleepIds);
    }
    await baan.updateOne({
      nongHeathIssueIds: baanNongHeathIssueIds,
      nongShirtSize: jsonToMapSize(baanNongShirtSize),
      nongSleepIds: baanNongSleepIds,
      nongCampMemberCardHaveHeathIssueIds:
        baanNongCampMemberCardHaveHeathIssueIds,
      nongHaveBottleIds: baanNongHaveBottleIds,
    });
  }
  await camp2.updateOne({
    nongHeathIssueIds: campNongHeathIssueIds,
    nongShirtSize: jsonToMapSize(campNongShirtSize),
    nongSleepIds: campNongSleepIds,
    nongCampMemberCardHaveHeathIssueIds:
      campNongCampMemberCardHaveHeathIssueIds,
    nongHaveBottleIds: campNongHaveBottleIds,
  });
}
async function unlockDataPee(campId: Id) {
  const camp1 = await Camp.findByIdAndUpdate(campId, {
    peeShirtSize: startSize(),
    peeSleepIds: [],
    peeHaveBottleIds: [],
  });
  if (!camp1) {
    return;
  }
  let i = 0;
  while (i < camp1.peeCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      camp1.peeCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    await heathIssue.updateOne({
      campIds: swop(camp1._id, null, heathIssue.campIds),
    });
    await campMemberCard.updateOne({
      healthIssueId: null,
      whiteListFoodIds: [],
      blackListFoodIds: [],
    });
  }
  i = 0;
  while (i < camp1.baanIds.length) {
    await Baan.findByIdAndUpdate(camp1.baanIds[i++], {
      peeHeathIssueIds: [],
      peeShirtSize: startSize(),
      peeSleepIds: [],
      peeCampMemberCardHaveHeathIssueIds: [],
      peeHaveBottleIds: [],
    });
  }
  i = 0;
  while (i < camp1.partIds.length) {
    await Part.findByIdAndUpdate(camp1.partIds[i++], {
      peeHeathIssueIds: [],
      peeShirtSize: startSize(),
      peeSleepIds: [],
      peeCampMemberCardHaveHeathIssueIds: [],
      peeHaveBottleIds: [],
    });
  }
  i = 0;
  while (i < camp1.foodIds.length) {
    await Food.findByIdAndUpdate(camp1.foodIds[i++], {
      peeCampMemberCardIds: [],
      peeHeathIssueIds: [],
      peeIds: [],
    });
  }
  await revalidationHeathIssues(camp1.peeHeathIssueIds);
  await camp1.updateOne({
    peeHeathIssueIds: [],
    peeCampMemberCardHaveHeathIssueIds: [],
  });
  const camp2 = await Camp.findById(camp1._id);
  const campPeeShirtSize = startJsonSize();
  const campPeeSleepIds: Id[] = [];
  const campPeeHaveBottleIds: Id[] = [];
  const campPeeHeathIssueIds: Id[] = [];
  const campPeeCampMemberCardHaveHeathIssueIds: Id[] = [];
  i = 0;
  if (!camp2) {
    return;
  }
  while (i < camp2.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(camp2.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    const baan = await Baan.findById(peeCamp.baanId);
    const part = await Part.findById(peeCamp.partId);
    if (!baan || !part) {
      continue;
    }
    let j = 0;
    const baanPeeSleepIds = baan.peeSleepIds;
    const baanPeeShirtSize = sizeMapToJson(
      baan.peeShirtSize as Map<Size, number>
    );
    const baanPeeHaveBottleIds = baan.peeHaveBottleIds;
    const baanPeeHeathIssueIds = baan.peeHeathIssueIds;
    const baanPeeCampMemberCardHaveHeathIssueIds =
      baan.peeCampMemberCardHaveHeathIssueIds;
    const partPeeSleepIds = part.peeSleepIds;
    const partPeeShirtSize = sizeMapToJson(
      part.peeShirtSize as Map<Size, number>
    );
    const partPeeHaveBottleIds = part.peeHaveBottleIds;
    const partPeeHeathIssueIds = part.peeHeathIssueIds;
    const partPeeCampMemberCardHaveHeathIssueIds =
      part.peeCampMemberCardHaveHeathIssueIds;
    while (j < peeCamp.peeCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        peeCamp.peeCampMemberCardIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const user = await User.findById(campMemberCard.userId);
      if (!user) {
        continue;
      }
      let sleepAtCamp: boolean;
      switch (camp2.peeSleepModel) {
        case "นอนทุกคน": {
          sleepAtCamp = true;
          break;
        }
        case "เลือกได้ว่าจะค้างคืนหรือไม่": {
          sleepAtCamp = user.likeToSleepAtCamp;
          break;
        }
        case "ไม่มีการค้างคืน": {
          sleepAtCamp = false;
          break;
        }
      }
      await campMemberCard.updateOne({
        haveBottle: user.haveBottle,
        size: user.shirtSize,
        sleepAtCamp,
      });
      ifIsTrue(
        user.haveBottle,
        user._id,
        baanPeeHaveBottleIds,
        campPeeHaveBottleIds,
        partPeeHaveBottleIds
      );
      sizeJsonMod(user.shirtSize, 1, baanPeeShirtSize);
      sizeJsonMod(user.shirtSize, 1, campPeeShirtSize);
      sizeJsonMod(user.shirtSize, 1, partPeeShirtSize);
      if (user.healthIssueId) {
        const heathIssue = await HeathIssue.findById(user.healthIssueId);
        if (heathIssue) {
          await heathIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              heathIssue.campMemberCardIds
            ),
          });
          baanPeeHeathIssueIds.push(heathIssue._id);
          campPeeHeathIssueIds.push(heathIssue._id);
          partPeeHeathIssueIds.push(heathIssue._id);
          baanPeeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          campPeeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          partPeeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: heathIssue._id });
        }
      }
      ifIsTrue(
        sleepAtCamp,
        user._id,
        campPeeSleepIds,
        baanPeeSleepIds,
        partPeeSleepIds
      );
    }
    await baan.updateOne({
      peeHeathIssueIds: baanPeeHeathIssueIds,
      peeShirtSize: jsonToMapSize(baanPeeShirtSize),
      peeSleepIds: baanPeeSleepIds,
      peeCampMemberCardHaveHeathIssueIds:
        baanPeeCampMemberCardHaveHeathIssueIds,
      peeHaveBottleIds: baanPeeHaveBottleIds,
    });
    await part.updateOne({
      peeHeathIssueIds: partPeeHeathIssueIds,
      peeShirtSize: jsonToMapSize(partPeeShirtSize),
      peeSleepIds: partPeeSleepIds,
      peeCampMemberCardHaveHeathIssueIds:
        partPeeCampMemberCardHaveHeathIssueIds,
      peeHaveBottleIds: partPeeHaveBottleIds,
    });
  }
  await camp2.updateOne({
    peeHeathIssueIds: campPeeHeathIssueIds,
    peeShirtSize: jsonToMapSize(campPeeShirtSize),
    peeSleepIds: campPeeSleepIds,
    peeCampMemberCardHaveHeathIssueIds: campPeeCampMemberCardHaveHeathIssueIds,
    peeHaveBottleIds: campPeeHaveBottleIds,
  });
}
async function unlockDataPeto(campId: Id) {
  const camp1 = await Camp.findByIdAndUpdate(campId, {
    petoShirtSize: startSize(),
    petoSleepIds: [],
    petoHaveBottleIds: [],
  });
  if (!camp1) {
    return;
  }
  let i = 0;
  while (i < camp1.petoCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      camp1.petoCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    await heathIssue.updateOne({
      campIds: swop(camp1._id, null, heathIssue.campIds),
    });
    await campMemberCard.updateOne({
      healthIssueId: null,
      whiteListFoodIds: [],
      blackListFoodIds: [],
    });
  }
  i = 0;
  while (i < camp1.partIds.length) {
    await Part.findByIdAndUpdate(camp1.partIds[i++], {
      petoHeathIssueIds: [],
      petoShirtSize: startSize(),
      petoSleepIds: [],
      petoHaveBottleIds: [],
      petoCampMemberCardHaveHeathIssueIds: [],
    });
  }
  i = 0;
  while (i < camp1.foodIds.length) {
    await Food.findByIdAndUpdate(camp1.foodIds[i++], {
      petoCampMemberCardIds: [],
      petoHeathIssueIds: [],
      petoIds: [],
    });
  }
  await revalidationHeathIssues(camp1.petoHeathIssueIds);
  await camp1.updateOne({
    petoHeathIssueIds: [],
    petoCampMemberCardHaveHeathIssueIds: [],
  });
  const camp2 = await Camp.findById(camp1._id);
  const campPetoShirtSize = startJsonSize();
  const campPetoSleepIds: Id[] = [];
  const campPetoHaveBottleIds: Id[] = [];
  const campPetoHeathIssueIds: Id[] = [];
  const campPetoCampMemberCardHaveHeathIssueIds: Id[] = [];
  i = 0;
  if (!camp2) {
    return;
  }
  while (i < camp2.petoModelIds.length) {
    const petoCamp = await PetoCamp.findById(camp2.petoModelIds[i++]);
    if (!petoCamp) {
      continue;
    }
    const part = await Part.findById(petoCamp.partId);
    if (!part) {
      continue;
    }
    let j = 0;
    const partPetoSleepIds = part.petoSleepIds;
    const partPetoShirtSize = sizeMapToJson(
      part.petoShirtSize as Map<Size, number>
    );
    const partPetoHaveBottleIds = part.petoHaveBottleIds;
    const partPetoHeathIssueIds = part.petoHeathIssueIds;
    const partPetoCampMemberCardHaveHeathIssueIds =
      part.petoCampMemberCardHaveHeathIssueIds;
    while (j < petoCamp.petoCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        petoCamp.petoCampMemberCardIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const user = await User.findById(campMemberCard.userId);
      if (!user) {
        continue;
      }
      let sleepAtCamp: boolean;
      switch (camp2.peeSleepModel) {
        case "นอนทุกคน": {
          sleepAtCamp = true;
          break;
        }
        case "เลือกได้ว่าจะค้างคืนหรือไม่": {
          sleepAtCamp = user.likeToSleepAtCamp;
          break;
        }
        case "ไม่มีการค้างคืน": {
          sleepAtCamp = false;
          break;
        }
      }
      await campMemberCard.updateOne({
        haveBottle: user.haveBottle,
        size: user.shirtSize,
        sleepAtCamp,
      });
      ifIsTrue(
        user.haveBottle,
        user._id,
        campPetoHaveBottleIds,
        partPetoHaveBottleIds
      );
      sizeJsonMod(user.shirtSize, 1, campPetoShirtSize);
      sizeJsonMod(user.shirtSize, 1, partPetoShirtSize);
      if (user.healthIssueId) {
        const heathIssue = await HeathIssue.findById(user.healthIssueId);
        if (heathIssue) {
          await heathIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              heathIssue.campMemberCardIds
            ),
          });
          campPetoHeathIssueIds.push(heathIssue._id);
          partPetoHeathIssueIds.push(heathIssue._id);
          campPetoCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          partPetoCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: heathIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, campPetoSleepIds, partPetoSleepIds);
    }
    await part.updateOne({
      petoHeathIssueIds: partPetoHeathIssueIds,
      petoShirtSize: jsonToMapSize(partPetoShirtSize),
      petoSleepIds: partPetoSleepIds,
      petoCampMemberCardHaveHeathIssueIds:
        partPetoCampMemberCardHaveHeathIssueIds,
      petoHaveBottleIds: partPetoHaveBottleIds,
    });
  }
  await camp2.updateOne({
    petoHeathIssueIds: campPetoHeathIssueIds,
    petoShirtSize: jsonToMapSize(campPetoShirtSize),
    petoSleepIds: campPetoSleepIds,
    petoCampMemberCardHaveHeathIssueIds:
      campPetoCampMemberCardHaveHeathIssueIds,
    petoHaveBottleIds: campPetoHaveBottleIds,
  });
}
async function removeAnswer(userId: Id, campId: Id) {
  const camp = await Camp.findById(campId);
  const user = await User.findById(userId);
  if (!camp || !user) {
    return;
  }
  const answerContainer = await AnswerContainer.findById(
    camp.mapAnswerPackIdByUserId.get(user._id.toString())
  );
  if (!answerContainer) {
    return;
  }
  const role = answerContainer.role;
  let i = 0;
  while (i < answerContainer.choiceAnswerIds.length) {
    const choiceAnswer = await ChoiceAnswer.findById(
      answerContainer.choiceAnswerIds[i++]
    );
    if (!choiceAnswer) {
      continue;
    }
    const choiceQuestion = await ChoiceQuestion.findById(
      choiceAnswer.questionId
    );
    if (!choiceQuestion) {
      continue;
    }
    switch (choiceAnswer.answer) {
      case "A": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerA: choiceQuestion.nongAnswerA - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerA: choiceQuestion.peeAnswerA - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "B": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerB: choiceQuestion.nongAnswerB - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerB: choiceQuestion.peeAnswerB - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "C": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerC: choiceQuestion.nongAnswerC - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerC: choiceQuestion.peeAnswerC - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "D": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerD: choiceQuestion.nongAnswerD - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerD: choiceQuestion.peeAnswerD - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "E": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerE: choiceQuestion.nongAnswerE - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerE: choiceQuestion.peeAnswerE - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "-": {
        break;
      }
    }
    await choiceAnswer.deleteOne();
  }
  i = 0;
  while (i < answerContainer.textAnswerIds.length) {
    const textAnswer = await TextAnswer.findById(
      answerContainer.textAnswerIds[i++]
    );
    if (!textAnswer) {
      continue;
    }
    const textQuestion = await TextQuestion.findById(textAnswer.questionId);
    if (!textQuestion) {
      continue;
    }
    await textQuestion.updateOne({
      answerIds: swop(textAnswer._id, null, textQuestion.answerIds),
    });
  }
  camp.mapAnswerPackIdByUserId.delete(user._id.toString());
  if (role == "nong") {
    await camp.updateOne({
      mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
      nongAnswerPackIds: swop(
        answerContainer._id,
        null,
        camp.nongAnswerPackIds
      ),
    });
    await user.updateOne({
      nongAnswerPackIds: swop(
        answerContainer._id,
        null,
        user.nongAnswerPackIds
      ),
    });
  } else {
    await camp.updateOne({
      mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
      peeAnswerPackIds: swop(answerContainer._id, null, camp.peeAnswerPackIds),
      peeAnswerIds: swop(user._id, null, camp.peeAnswerIds),
    });
    await user.updateOne({
      peeAnswerPackIds: swop(answerContainer._id, null, user.peeAnswerPackIds),
    });
  }
  await answerContainer.deleteOne();
}
async function clearHealthIssue(campMemberCardId: Id) {
  const campMemberCard = await CampMemberCard.findById(campMemberCardId);
  if (!campMemberCard) {
    return;
  }
  const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
  if (!healthIssue) {
    return;
  }
  const user = await User.findById(healthIssue.userId);
  if (!user) {
    return;
  }
  let i = 0;
  switch (campMemberCard.role) {
    case "nong": {
      while (i < campMemberCard.whiteListFoodIds.length) {
        const food = await Food.findById(campMemberCard.whiteListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          nongIds: swop(user._id, null, food.nongIds),
          nongCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.nongCampMemberCardIds
          ),
          nongHeathIssueIds: swop(
            healthIssue._id,
            null,
            food.nongCampMemberCardIds
          ),
        });
      }
      i = 0;
      while (i < campMemberCard.blackListFoodIds.length) {
        const food = await Food.findById(campMemberCard.blackListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          nongIds: swop(user._id, null, food.nongIds),
          nongCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.nongCampMemberCardIds
          ),
          nongHeathIssueIds: swop(
            healthIssue._id,
            null,
            food.nongCampMemberCardIds
          ),
        });
      }
      break;
    }
    case "pee": {
      while (i < campMemberCard.whiteListFoodIds.length) {
        const food = await Food.findById(campMemberCard.whiteListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          peeIds: swop(user._id, null, food.peeIds),
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.peeCampMemberCardIds
          ),
          peeHeathIssueIds: swop(healthIssue._id, null, food.peeHeathIssueIds),
        });
      }
      i = 0;
      while (i < campMemberCard.blackListFoodIds.length) {
        const food = await Food.findById(campMemberCard.blackListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          peeIds: swop(user._id, null, food.peeIds),
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.peeCampMemberCardIds
          ),
          peeHeathIssueIds: swop(healthIssue._id, null, food.peeHeathIssueIds),
        });
      }
      break;
    }
    case "peto": {
      while (i < campMemberCard.whiteListFoodIds.length) {
        const food = await Food.findById(campMemberCard.whiteListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          petoIds: swop(user._id, null, food.petoIds),
          petoCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.petoCampMemberCardIds
          ),
          petoHeathIssueIds: swop(
            healthIssue._id,
            null,
            food.petoHeathIssueIds
          ),
        });
      }
      i = 0;
      while (i < campMemberCard.blackListFoodIds.length) {
        const food = await Food.findById(campMemberCard.blackListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          petoIds: swop(user._id, null, food.petoIds),
          petoCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.petoCampMemberCardIds
          ),
          petoHeathIssueIds: swop(
            healthIssue._id,
            null,
            food.petoHeathIssueIds
          ),
        });
      }
      break;
    }
  }
  if (
    !healthIssue._id.equals(user.healthIssueId) &&
    healthIssue.campIds.length == 0
  ) {
    await healthIssue.deleteOne();
  }
}
export async function updatePusher(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const update: CreatePusherData = req.body;
  const camp = await Camp.findById(update.campId);
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
  const pusherData = await PusherData.findById(camp.pusherId);
  if (!pusherData) {
    const newPusherData = await PusherData.create(update);
    await camp.updateOne({ pusherId: newPusherData._id });
  } else {
    await pusherData.updateOne(update);
  }
}
