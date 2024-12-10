import ActionPlan from "../models/ActionPlan";
import Baan from "../models/Baan";
import Camp from "../models/Camp";
import NongCamp from "../models/NongCamp";
import Part from "../models/Part";
import PeeCamp from "../models/PeeCamp";
import PetoCamp from "../models/PetoCamp";
import User from "../models/User";
import CampMemberCard from "../models/CampMemberCard";
import {
  calculate,
  conCampBackToFront,
  getPusherClient,
  getSystemInfoRaw,
  ifIsPlus,
  ifIsTrue,
  mapObjectIdToMyMap,
  removeDuplicate,
  resError,
  sendRes,
  sizeMapToJson,
  startJsonSize,
  startSize,
  stringToId,
  swop,
} from "./setup";
import PartNameContainer from "../models/PartNameContainer";
import NameContainer from "../models/NameContainer";
import express from "express";
import { getUser } from "../middleware/auth";
import {
  InterCampFront,
  BasicUser,
  InterActionPlan,
  ShowMember,
  CreateActionPlan,
  showActionPlan,
  CreateWorkingItem,
  InterWorkingItem,
  ShowRegister,
  MyMap,
  WelfarePack,
  HeathIssuePack,
  CampWelfarePack,
  GetBaansForPlan,
  GetPartForPlan,
  GetAllPlanData,
  UpdateAllPlanData,
  CampNumberData,
  CampSleepDataContainer,
  Id,
  AnswerPack,
  EditQuestionPack,
  GetAllQuestion,
  GetChoiceQuestion,
  GetTextQuestion,
  RoleCamp,
  InterChoiceQuestion,
  InterTextQuestion,
  UserAndAllQuestionPack,
  GetAllAnswerAndQuestion,
  ScoreTextQuestions,
  CampHealthIssuePack,
  ShowHealthIssuePack,
  GetCoopData,
  AllNongRegister,
  InterMeal,
  SuccessBase,
  UpdateActionPlan,
  InterFood,
  GetMeals,
  HeathIssueBody,
  InterCampMemberCard,
  ShowPlace,
  GetNongData,
  UpdateTimeOffsetRaw,
  GetPeeData,
  GetPetoData,
  BasicBaan,
  InterBaanBack,
  InterCampBack,
  BasicPart,
  InterPartBack,
  RegisPart,
  RegisBaan,
  RegisterData,
  TriggerChoiceQuestion,
  TriggerTextQuestion,
  CampState,
} from "../models/interface";
import Song from "../models/Song";
import HeathIssue from "../models/HeathIssue";
import Place from "../models/Place";
import Building from "../models/Building";
import WorkItem from "../models/WorkItem";
import { deleteWorkingItemRaw, updateBaanRaw } from "./admin";
import { isWelfareValid } from "./user";
import AnswerContainer from "../models/AnswerContainer";
import ChoiceAnswer from "../models/ChoiceAnswer";
import ChoiceQuestion from "../models/ChoiceQuestion";
import TextAnswer from "../models/TextAnswer";
import TextQuestion from "../models/TextQuestion";
import { getHealthIssuePack } from "./randomThing";
import Meal from "../models/Meal";
import bcrypt from "bcrypt";
import Food from "../models/Food";
import TimeOffset from "../models/TimeOffset";
import PusherData from "../models/PusherData";
import Pusher from "pusher";

//*export async function getBaan
//*export async function getCamp
//*export async function getBaans
//*export async function getCamps
//*export async function getNongCamp
//*export async function getPeeCamp
//*export async function getPetoCamp
//*export async function getPart
//*export async function addNong
//*export async function addPee
//*export async function addPeeRaw
// export async function addPeto
//*export async function addPetoRaw
//*export async function staffRegister
//*export async function getActionPlanByPartId
//*export async function createActionPlan
//*export async function updateActionPlan
//*export async function deleteActionPlan
//*export async function getActionPlans
//*export async function nongRegister
//*export async function getCampName
//*export async function getPartName
//*export async function changeBaan
//*export async function changeBaanRaw
//*export async function changePart
//*export async function changePartRaw
//*export async function getNongsFromBaanId
//*export async function getPeesFromBaanId
//*export async function getPeesFromPartId
//*export async function getPetosFromPartId
// export async function getLinkRegister
//*export async function getImpotentPartIdBCRP
//*export async function getActionPlan
//*export async function getWorkingItemByPartId
//*export async function createWorkingItem
//*export async function updateWorkingItem
//*export async function deleteWorkingItem
//*export async function getWorkingItems
//*export async function getWorkingItem
//*export async function getShowRegisters
//*export async function getAllUserCamp
//*export async function getAllWelfare
//*export async function getAllPlanData
//*export async function planUpdateCamp
//*export async function editQuestion
//*export async function getAllQuestion
//*export async function answerAllQuestion
//*export async function deleteChoiceQuestion
//*export async function deleteTextQuestion
//*export async function peeAnswerQuestion
//*export async function plusActionPlan
//*export async function getAllAnswerAndQuestion
//*export async function scoreTextQuestions
// export async function getHealthIssueForAct
// export async function getMedicalHealthIssue
//*export async function getCoopData
//*export async function getAllNongRegister
//*export async function getActionPlanByCampId
//*export async function getWorkingItemByCampId
//*export async function getParts
//*export async function getNongCampData
//*export async function getPeeCampData
//*export async function getPetoCampData
//*export async function getPartForUpdate
//*export async function getRegisterData
//*export async function getPusherData
//*export async function getCampState
export async function getBaan(req: express.Request, res: express.Response) {
  try {
    const data = await Baan.findById(req.params.id);
    if (!data) {
      sendRes(res, false);
      return;
    }
    res.status(200).json(data);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function getCamp(req: express.Request, res: express.Response) {
  try {
    //console.log(req.params.id)
    const data: InterCampBack | null = await Camp.findById(req.params.id);
    if (!data) {
      sendRes(res, false);
      return;
    }
    //console.log(data.toObject())
    res.status(200).json(conCampBackToFront(data));
    //console.log(req.params.id)
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
    });
  }
}
export async function getBaans(req: express.Request, res: express.Response) {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) {
      sendRes(res, false);
      return;
    }
    const baans: BasicBaan[] = [];
    let i = 0;
    while (i < camp.baanIds.length) {
      const baan = await Baan.findById(camp.baanIds[i++]);
      if (baan) {
        baans.push(baan);
      }
    }
    res.status(200).json(baans);
  } catch {
    res.status(400).json(resError);
  }
}
export async function getCamps(req: express.Request, res: express.Response) {
  try {
    const data: InterCampBack[] = await Camp.find();
    if (!data) {
      sendRes(res, false);
      return;
    }
    const out: InterCampFront[] = data.map((input: InterCampBack) => {
      return conCampBackToFront(input);
    });
    res.status(200).json(out);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
    });
  }
}
export async function getNongCamp(req: express.Request, res: express.Response) {
  try {
    const data = await NongCamp.findById(req.params.id);
    if (!data) {
      sendRes(res, false);
      return;
    }
    res.status(200).json(data);
  } catch {
    res.status(400).json(resError);
  }
}
export async function getPeeCamp(req: express.Request, res: express.Response) {
  try {
    const data = await PeeCamp.findById(req.params.id);
    if (!data) {
      sendRes(res, false);
      return;
    }
    res.status(200).json(data);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function getPetoCamp(req: express.Request, res: express.Response) {
  try {
    const data = await PetoCamp.findById(req.params.id);
    if (!data) {
      sendRes(res, false);
      return;
    }
    res.status(200).json(data);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function getPart(req: express.Request, res: express.Response) {
  try {
    const data = await Part.findById(req.params.id);
    if (!data) {
      sendRes(res, false);
      return;
    }
    res.status(200).json(data);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function addNong(req: express.Request, res: express.Response) {
  try {
    const {
      baanId,
      members,
    }: {
      baanId: Id;
      members: Id[];
    } = req.body;
    const baan = await Baan.findById(baanId);
    if (!baan) {
      sendRes(res, false);
      return;
    }
    const camp = await Camp.findById(baan.campId);
    if (!camp) {
      sendRes(res, false);
      return;
    }
    const nongCamp = await NongCamp.findById(baan.nongModelId);
    if (!nongCamp) {
      sendRes(res, false);
      return;
    }
    let newNongPassIds = camp.nongSureIds;
    let count = 0;
    const baanNongHaveBottleIds = baan.nongHaveBottleIds;
    const campNongHaveBottleIds = camp.nongHaveBottleIds;
    const baanNongSleepIds = baan.nongSleepIds;
    const campNongSleepIds = camp.nongSleepIds;
    const size: Map<"S" | "M" | "L" | "XL" | "XXL" | "3XL", number> =
      startSize();
    let i = 0;
    while (i < members.length) {
      count = count + 1;
      const user = await User.findById(members[i++]);
      if (
        !user ||
        camp.nongIds.includes(user._id) ||
        camp.peeIds.includes(user._id) ||
        camp.petoIds.includes(user._id)
      ) {
        continue;
      }
      await nongCamp.updateOne({
        nongIds: swop(null, user._id, nongCamp.nongIds),
      });
      await baan.updateOne({ nongIds: swop(null, user._id, baan.nongIds) });
      await camp.updateOne({ nongIds: swop(null, user._id, camp.nongIds) });
      let sleepAtCamp: boolean;
      switch (camp.nongSleepModel) {
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
      ifIsTrue(sleepAtCamp, user._id, campNongSleepIds, baanNongSleepIds);
      const campMemberCard = await CampMemberCard.create({
        userId: user._id,
        size: user.shirtSize,
        campModelId: nongCamp._id,
        receive: "baan",
        role: "nong",
        haveBottle: user.haveBottle,
        sleepAtCamp,
        healthIssueId: user.healthIssueId,
      });
      nongCamp.nongCampMemberCardIds.push(campMemberCard._id);
      baan.nongCampMemberCardIds.push(campMemberCard._id);
      camp.nongCampMemberCardIds.push(campMemberCard._id);
      user.campMemberCardIds.push(campMemberCard._id);
      newNongPassIds = swop(user._id, null, newNongPassIds);
      if (user.healthIssueId) {
        baan.nongHeathIssueIds.push(user.healthIssueId);
        camp.nongHeathIssueIds.push(user.healthIssueId);
        const heathIssue = await HeathIssue.findById(user.healthIssueId);
        baan.nongCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
        camp.nongCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
        if (heathIssue) {
          await heathIssue.updateOne({
            //nongCampIds: swop(null, nongCamp._id, heathIssue.nongCampIds),
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              heathIssue.campMemberCardIds
            ),
          });
        }
      }
      const userSize = user.shirtSize;
      size.set(userSize, (size.get(userSize) as number) + 1);
      ifIsTrue(
        user.haveBottle,
        user._id,
        baanNongHaveBottleIds,
        campNongHaveBottleIds
      );
      user.nongCampIds.push(nongCamp._id);
      camp.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
      baan.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id); //
      await baan.updateOne({
        mapCampMemberCardIdByUserId: baan.mapCampMemberCardIdByUserId,
      });
      await user.updateOne({
        nongCampIds: user.nongCampIds,
        campMemberCardIds: user.campMemberCardIds,
      });
    }
    size.forEach((v, k) => {
      camp.nongShirtSize.set(k, (camp.nongShirtSize.get(k) as number) + v);
      baan.nongShirtSize.set(k, (camp.nongShirtSize.get(k) as number) + v);
    });
    await camp.updateOne({
      nongSureIds: newNongPassIds,
      nongCampMemberCardIds: camp.nongCampMemberCardIds,
      nongShirtSize: camp.nongShirtSize,
      nongHeathIssueIds: camp.nongHeathIssueIds,
      nongIds: camp.nongIds,
      mapCampMemberCardIdByUserId: camp.mapCampMemberCardIdByUserId,
      nongSleepIds: campNongSleepIds,
      currentNong: camp.currentNong,
      nongCampMemberCardHaveHeathIssueIds:
        camp.nongCampMemberCardHaveHeathIssueIds,
      nongHaveBottleIds: campNongHaveBottleIds,
    });
    await baan.updateOne({
      nongCampMemberCardIds: baan.nongCampMemberCardIds,
      nongShirtSize: baan.nongShirtSize,
      nongHeathIssueIds: baan.nongHeathIssueIds,
      nongIds: baan.nongIds, //
      mapCampMemberCardIdByUserId: baan.mapCampMemberCardIdByUserId,
      nongSleepIds: baanNongSleepIds,
      nongCampMemberCardHaveHeathIssueIds:
        baan.nongCampMemberCardHaveHeathIssueIds,
      nongHaveBottleIds: baanNongHaveBottleIds,
    });
    await nongCamp.updateOne({
      nongIds: nongCamp.nongIds, //
      nongCampMemberCardIds: nongCamp.nongCampMemberCardIds,
    });
    res.status(200).json({
      success: true,
      count,
    });
  } catch {
    sendRes(res, false);
  }
}
export async function addPee(req: express.Request, res: express.Response) {
  const {
    members,
    baanId,
  }: {
    members: Id[];
    baanId: Id;
  } = req.body;
  const baan = await Baan.findById(baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < members.length) {
    const user = await User.findById(members[i++]);
    if (
      !user ||
      camp.nongIds.includes(user._id) ||
      camp.peeIds.includes(user._id) ||
      camp.petoIds.includes(user._id)
    ) {
      continue;
    }
    const part = await Part.findById(camp.peePassIds.get(user.id));
    if (!part) {
      continue;
    }
    if (part.isAuth) {
      await user.updateOne({
        authPartIds: swop(null, part._id, user.authPartIds),
      });
    }
  }
  const success = await addPeeRaw(members, baanId);
  sendRes(res, success);
}
export async function addPeeRaw(members: Id[], baanId: Id) {
  try {
    const baan = await Baan.findById(baanId);
    if (!baan) {
      return false;
    }
    const camp = await Camp.findById(baan.campId);
    if (!camp) {
      return false;
    }
    const baanPeeHaveBottleIds = baan.peeHaveBottleIds;
    const campPeeHaveBottleIds = camp.peeHaveBottleIds;
    const baanPeeSleepIds = baan.peeSleepIds;
    const campPeeSleepIds = camp.peeSleepIds;
    let count = 0;
    const size: Map<"S" | "M" | "L" | "XL" | "XXL" | "3XL", number> =
      startSize();
    let i = 0;
    while (i < members.length) {
      const user = await User.findById(members[i++]);
      if (!user) {
        continue;
      }
      const part = await Part.findById(camp.peePassIds.get(user.id));
      if (!part) {
        continue;
      }
      const peeCamp = await PeeCamp.findById(
        baan?.mapPeeCampIdByPartId.get(part.id)
      );
      if (!peeCamp) {
        continue;
      }
      let sleepAtCamp: boolean;
      switch (camp.toObject().peeSleepModel) {
        case "นอนทุกคน": {
          sleepAtCamp = true;
          break;
        }
        case "เลือกได้ว่าจะค้างคืนหรือไม่": {
          sleepAtCamp = user.likeToSleepAtCamp;
          break;
        }
        case "ไม่มีการค้างคืน":
          sleepAtCamp = false;
      }

      camp.peeMapIdGtoL.set(user._id.toString(), camp.currentPee + 1);
      camp.peeMapIdLtoG.set((camp.currentPee + 1).toString(), user._id);
      const campMemberCard = await CampMemberCard.create({
        userId: user._id,
        size: user.shirtSize,
        campModelId: peeCamp._id,
        receive: "baan",
        role: "pee",
        haveBottle: user.haveBottle,
        sleepAtCamp,
        healthIssueId: user.healthIssueId,
      });
      part.peeCampMemberCardIds.push(campMemberCard._id);
      camp.peeCampMemberCardIds.push(campMemberCard._id);
      baan.peeCampMemberCardIds.push(campMemberCard._id);
      user.campMemberCardIds.push(campMemberCard._id);
      count = count + 1;
      peeCamp.peeCampMemberCardIds.push(campMemberCard._id);
      baan.peeIds.push(user._id);
      camp.peeIds.push(user._id);
      part.peeIds.push(user._id);
      if (user.healthIssueId) {
        baan.peeHeathIssueIds.push(user.healthIssueId);
        camp.peeHeathIssueIds.push(user.healthIssueId);
        part.peeHeathIssueIds.push(user.healthIssueId);
        const heathIssue = await HeathIssue.findById(user.healthIssueId);
        if (heathIssue) {
          await heathIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              heathIssue.campMemberCardIds
            ),
          });
          baan.peeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          part.peeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          camp.peeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
        }
      }
      const userSize = user.shirtSize as "S" | "M" | "L" | "XL" | "XXL" | "3XL";
      part.peeShirtSize.set(
        userSize,
        (part.peeShirtSize.get(userSize) as number) + 1
      );
      size.set(userSize, (size.get(userSize) as number) + 1);

      user.peeCampIds.push(peeCamp._id);
      user.registerIds.push(camp._id);
      camp.peePassIds.delete(user.id);
      peeCamp.peeIds.push(user._id);
      camp.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
      part.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
      baan.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
      await peeCamp.updateOne({
        peeIds: peeCamp.peeIds,
        peeCampMemberCardIds: peeCamp.peeCampMemberCardIds,
      });
      await user.updateOne({
        peeCampIds: user.peeCampIds,
        campMemberCardIds: user.campMemberCardIds,
        registerIds: user.registerIds,
        authPartIds: ifIsTrue(part.isAuth, part._id, user.authPartIds),
      });
      await part.updateOne({
        mapCampMemberCardIdByUserId: part.mapCampMemberCardIdByUserId,
        peeHeathIssueIds: part.peeHeathIssueIds,
        peeIds: part.peeIds,
        peeCampMemberCardIds: part.peeCampMemberCardIds,
        peeShirtSize: part.peeShirtSize,
        peeCampMemberCardHaveHeathIssueIds:
          part.peeCampMemberCardHaveHeathIssueIds,
        peeSleepIds: ifIsTrue(
          sleepAtCamp,
          user._id,
          part.peeSleepIds,
          campPeeSleepIds,
          baanPeeSleepIds
        ),
        peeHaveBottleIds: ifIsTrue(
          user.haveBottle,
          user._id,
          part.peeHaveBottleIds,
          baanPeeHaveBottleIds,
          campPeeHaveBottleIds
        ),
      });
    }
    size.forEach((v, k) => {
      camp.peeShirtSize.set(k, (camp.peeShirtSize.get(k) as number) + v);
      baan.peeShirtSize.set(k, (baan.peeShirtSize.get(k) as number) + v);
    });
    await camp.updateOne({
      peeCampMemberCardIds: camp.peeCampMemberCardIds,
      peeShirtSize: camp.peeShirtSize,
      peeIds: camp.peeIds,
      peeHeathIssueIds: camp.peeHeathIssueIds,
      peePassIds: camp.peePassIds,
      mapCampMemberCardIdByUserId: camp.mapCampMemberCardIdByUserId,
      peeSleepIds: campPeeSleepIds,
      currentPee: camp.currentPee,
      peeCampMemberCardHaveHeathIssueIds:
        camp.peeCampMemberCardHaveHeathIssueIds,
      peeHaveBottleIds: campPeeHaveBottleIds,
      peeMapIdGtoL: camp.peeMapIdGtoL,
      peeMapIdLtoG: camp.peeMapIdLtoG,
    });
    await baan.updateOne({
      peeHeathIssueIds: baan.peeHeathIssueIds,
      peeIds: baan.peeIds,
      peeCampMemberCardIds: baan.peeCampMemberCardIds,
      mapCampMemberCardIdByUserId: baan.mapCampMemberCardIdByUserId,
      peeShirtSize: baan.peeShirtSize,
      peeSleepIds: baanPeeSleepIds,
      peeCampMemberCardHaveHeathIssueIds:
        baan.peeCampMemberCardHaveHeathIssueIds,
      peeHaveBottleIds: baanPeeHaveBottleIds,
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
export async function addPeto(req: express.Request, res: express.Response) {
  const { member, partId } = req.body;
  await addPetoRaw(member, partId, res);
}
export async function addPetoRaw(
  member: Id[],
  partId: Id,
  res: express.Response
) {
  const part = await Part.findById(partId);
  if (!part) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const campPetoHaveBottleIds = camp.petoHaveBottleIds;
  const partPetoHaveBottleIds = part.petoHaveBottleIds;
  let count = 0;
  const size: Map<"S" | "M" | "L" | "XL" | "XXL" | "3XL", number> = startSize();
  const petoCamp = await PetoCamp.findById(part.petoModelId);
  if (!petoCamp) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < member.length) {
    count = count + 1;
    const user = await User.findById(member[i++]);
    if (
      !user ||
      camp.nongIds.includes(user._id) ||
      camp.peeIds.includes(user._id) ||
      camp.petoIds.includes(user._id)
    ) {
      continue;
    }
    camp.peeMapIdGtoL.set(user._id.toString(), camp.currentPee + 1);
    camp.peeMapIdLtoG.set((camp.currentPee + 1).toString(), user._id);
    await camp.updateOne({
      peeMapIdGtoL: camp.peeMapIdGtoL,
      peeMapIdLtoG: camp.peeMapIdLtoG,
    });
    part.petoIds.push(user._id);
    camp.petoIds.push(user._id);
    let sleepAtCamp: boolean;
    switch (camp.toObject().peeSleepModel) {
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
    if (sleepAtCamp) {
      camp.petoSleepIds.push(user._id);
      part.petoSleepIds.push(user._id);
    }
    const campMemberCard = await CampMemberCard.create({
      userId: user._id,
      size: user.shirtSize,
      campModelId: petoCamp._id,
      receive: "part",
      role: "peto",
      haveBottle: user.haveBottle,
      sleepAtCamp,
      healthIssueId: user.healthIssueId,
    });
    petoCamp.petoCampMemberCardIds.push(campMemberCard._id);
    part.petoCampMemberCardIds.push(campMemberCard._id);
    camp.petoCampMemberCardIds.push(campMemberCard._id);
    user.campMemberCardIds.push(campMemberCard._id);
    if (user.healthIssueId) {
      part.petoHeathIssueIds.push(user.healthIssueId);
      camp.petoHeathIssueIds.push(user.healthIssueId);
      const heathIssue = await HeathIssue.findById(user.healthIssueId);
      if (heathIssue) {
        await heathIssue.updateOne({
          //petoCampIds: swop(null, petoCamp._id, heathIssue.petoCampIds),
          campMemberCardIds: swop(
            null,
            campMemberCard._id,
            heathIssue.campMemberCardIds
          ),
        });
        part.petoCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
        camp.petoCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
      }
    }
    const userSize = user.shirtSize;
    size.set(userSize, (size.get(userSize) as number) + 1);
    ifIsTrue(
      user.haveBottle,
      user._id,
      partPetoHaveBottleIds,
      campPetoHaveBottleIds
    );
    user.petoCampIds.push(petoCamp._id);
    user.registerIds.push(camp._id);
    camp.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
    part.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
    await user.updateOne({
      petoCampIds: user.petoCampIds,
      campMemberCardIds: user.campMemberCardIds,
      registerIds: user.registerIds,
      authPartIds: ifIsTrue(part.isAuth, part._id, user.authPartIds),
    });
  }
  size.forEach((v, k) => {
    camp.petoShirtSize.set(k, (camp.petoShirtSize.get(k) as number) + v);
    part.petoShirtSize.set(k, (part.petoShirtSize.get(k) as number) + v);
  });
  await camp.updateOne({
    petoHeathIssueIds: camp.petoHeathIssueIds,
    petoIds: camp.petoIds,
    petoCampMemberCardIds: camp.petoCampMemberCardIds,
    petoShirtSize: camp.petoShirtSize,
    mapCampMemberCardIdByUserId: camp.mapCampMemberCardIdByUserId,
    petoSleepIds: camp.petoSleepIds,
    petoCampMemberCardHaveHeathIssueIds:
      camp.petoCampMemberCardHaveHeathIssueIds,
    petoHaveBottleIds: campPetoHaveBottleIds,
    peeMapIdGtoL: camp.peeMapIdGtoL,
    peeMapIdLtoG: camp.peeMapIdLtoG,
  });
  await part.updateOne({
    petoHeathIssueIds: part.petoHeathIssueIds,
    petoIds: part.petoIds,
    petoCampMemberCardIds: part.petoCampMemberCardIds,
    petoShirtSize: part.petoShirtSize,
    mapCampMemberCardIdByUserId: part.mapCampMemberCardIdByUserId,
    petoSleepIds: part.petoSleepIds,
    petoCampMemberCardHaveHeathIssueIds:
      part.petoCampMemberCardHaveHeathIssueIds,
    petoHaveBottleIds: partPetoHaveBottleIds,
  });
  sendRes(res, true);
}
export async function staffRegister(
  req: express.Request,
  res: express.Response
) {
  const partId = stringToId(req.params.id);
  const part = await Part.findById(partId);
  const user = await getUser(req);
  if (!user || !part) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  if (
    user.role === "pee" ||
    camp.memberStructure != "nong->highSchool,pee->1year,peto->2upYear"
  ) {
    camp.peePassIds.set(user.id, partId);
    await camp.updateOne({ peePassIds: camp.peePassIds });
    res.status(200).json({
      success: true,
    });
  } else {
    await addPetoRaw([user._id], part._id, res);
  }
}
export async function getActionPlanByPartId(
  req: express.Request,
  res: express.Response
) {
  try {
    const part = await Part.findById(req.params.id);
    const data: showActionPlan[] = [];
    const user = await getUser(req);
    if (!part) {
      sendRes(res, false);
      return;
    }
    const camp = await Camp.findById(part.campId);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllActionPlan &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let j = 0;
    while (j < part.actionPlanIds.length) {
      const actionPlan: InterActionPlan | null = await ActionPlan.findById(
        part.actionPlanIds[j++]
      );
      if (!actionPlan) {
        continue;
      }
      const {
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        partName,
        _id,
      } = actionPlan;
      const user = await User.findById(headId);
      if (!user) {
        continue;
      }
      let k = 0;
      const placeName: string[] = [];
      while (k < placeIds.length) {
        const place = await Place.findById(placeIds[k++]);
        const building = await Building.findById(place?.buildingId);
        placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
      }
      data.push({
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        headName: user.nickname,
        headTel: user.tel,
        partName,
        placeName,
        _id,
      });
    }
    data.sort((a, b) => a.start.getTime() - b.start.getTime());
    const buffer: SuccessBase<showActionPlan[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
export async function createActionPlan(
  req: express.Request,
  res: express.Response
) {
  const create: CreateActionPlan = req.body;
  const hospital = await ActionPlan.create(create);
  const part = await Part.findById(create.partId);
  const camp = await Camp.findById(part?.campId);
  await part?.updateOne({
    actionPlanIds: swop(null, hospital._id, part.actionPlanIds),
  });
  await camp?.updateOne({
    actionPlanIds: swop(null, hospital._id, camp.actionPlanIds),
  });
  await hospital.updateOne({ partName: part?.partName });
  let i = 0;
  while (i < hospital.placeIds.length) {
    const place = await Place.findById(create.placeIds[i++]);
    const building = await Building.findById(place?.buildingId);
    await place?.updateOne({
      actionPlanIds: swop(null, hospital._id, place.actionPlanIds),
    });
    await building?.updateOne({
      actionPlanIds: swop(null, hospital._id, building.actionPlanIds),
    });
  }
  res.status(200).json(hospital);
}
export async function updateActionPlan(
  req: express.Request,
  res: express.Response
) {
  try {
    const actionPlan = await ActionPlan.findById(req.params.id);
    if (!actionPlan) {
      sendRes(res, false);
      return;
    }
    let i = 0;
    const update: UpdateActionPlan = req.body;
    const removes = removeDuplicate(actionPlan.placeIds, update.placeIds);
    const adds = removeDuplicate(update.placeIds, actionPlan.placeIds);
    while (i < removes.length) {
      const place = await Place.findById(removes[i++]);
      if (!place) {
        continue;
      }
      const building = await Building.findById(place.buildingId);
      if (!building) {
        continue;
      }
      await place.updateOne({
        actionPlanIds: swop(actionPlan._id, null, place.actionPlanIds),
      });
      await building?.updateOne({
        actionPlanIds: swop(actionPlan._id, null, building.actionPlanIds),
      });
    }
    while (i < adds.length) {
      const place = await Place.findById(adds[i++]);
      if (!place) {
        continue;
      }
      const building = await Building.findById(place.buildingId);
      if (!building) {
        continue;
      }
      await place.updateOne({
        actionPlanIds: swop(null, actionPlan._id, place.actionPlanIds),
      });
      await building.updateOne({
        actionPlanIds: swop(null, actionPlan._id, building.actionPlanIds),
      });
    }
    await actionPlan.updateOne(update);
    sendRes(res, true);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function deleteActionPlan(
  req: express.Request,
  res: express.Response
) {
  try {
    const hospital = await ActionPlan.findById(req.params.id);
    if (!hospital) {
      res.status(400).json({
        success: false,
      });
      return;
    }
    const part = await Part.findById(hospital.partId);
    if (!part) {
      sendRes(res, false);
      return;
    }
    const buf = swop(hospital._id, null, part.actionPlanIds);
    await part?.updateOne({ actionPlanIds: buf });
    const camp = await Camp.findById(part.campId);
    await camp?.updateOne({
      actionPlanIds: swop(hospital._id, null, camp.actionPlanIds),
    });
    let i = 0;
    while (i < hospital.placeIds.length) {
      const place = await Place.findById(hospital.placeIds[i++]);
      const building = await Building.findById(place?.buildingId);
      await place?.updateOne({
        actionPlanIds: swop(hospital._id, null, place.actionPlanIds),
      });
      await building?.updateOne({
        actionPlanIds: swop(hospital._id, null, building.actionPlanIds),
      });
    }

    await hospital?.deleteOne();
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
export async function getActionPlans(
  req: express.Request,
  res: express.Response
) {
  try {
    const data: showActionPlan[] = [];
    const user = await getUser(req);
    if (!user) {
      sendRes(res, false);
      return;
    }
    if (user.filterIds.length == 0) {
      let i = 0;
      while (i < user.registerIds.length) {
        const camp = await Camp.findById(user.registerIds[i++]);
        if (!camp) {
          continue;
        }
        let j = 0;
        while (j < camp.actionPlanIds.length) {
          const actionPlan: InterActionPlan | null = await ActionPlan.findById(
            camp.actionPlanIds[j++]
          );
          if (!actionPlan) {
            continue;
          }
          const {
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            partName,
            _id,
          } = actionPlan;
          const user = await User.findById(headId);
          if (!user) {
            continue;
          }
          let k = 0;
          const placeName: string[] = [];
          while (k < placeIds.length) {
            const place = await Place.findById(placeIds[k++]);
            const building = await Building.findById(place?.buildingId);
            placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
          }
          data.push({
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            headName: user.nickname,
            headTel: user.tel,
            partName,
            placeName,
            _id,
          });
        }
      }
    } else {
      let i = 0;
      while (i < user.filterIds.length) {
        const camp = await Camp.findById(user.filterIds[i++]);
        if (!camp) {
          continue;
        }
        let j = 0;
        while (j < camp.actionPlanIds.length) {
          const actionPlan: InterActionPlan | null = await ActionPlan.findById(
            camp.actionPlanIds[j++]
          );
          if (!actionPlan) {
            continue;
          }
          const {
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            partName,
            _id,
          } = actionPlan;
          const user = await User.findById(headId);
          if (!user) {
            continue;
          }
          let k = 0;
          const placeName: string[] = [];
          while (k < placeIds.length) {
            const place = await Place.findById(placeIds[k++]);
            const building = await Building.findById(place?.buildingId);
            placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
          }
          data.push({
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            headName: user.nickname,
            headTel: user.tel,
            partName,
            placeName,
            _id,
          });
        }
      }
    }
    data.sort((a, b) => a.start.getTime() - b.start.getTime());
    const buffer: SuccessBase<showActionPlan[]> = { data, success: true };
    res.status(200).json(buffer);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function nongRegister(
  req: express.Request,
  res: express.Response
) {
  try {
    const { campId, link, answer } = req.body;
    const nong = await getUser(req);
    if (!campId || !link || !nong) {
      sendRes(res, false);
      return;
    }
    const camp = await Camp.findById(campId);
    await answerAllQuestion(answer, nong._id, "nong");
    if (!camp?.open) {
      res.status(400).json({ success: false, message: "This camp is close" });
      return;
    }
    camp.nongMapIdGtoL.set(nong._id.toString(), camp.currentNong + 1);
    camp.nongMapIdLtoG.set((camp.currentNong + 1).toString(), nong._id);
    camp.nongPendingIds.set(nong._id.toString(), link);
    await camp.updateOne({
      nongPendingIds: camp.nongPendingIds,
      currentNong: camp.currentNong + 1,
      nongMapIdGtoL: camp.nongMapIdGtoL,
      nongMapIdLtoG: camp.nongMapIdLtoG,
    });
    res.status(200).json({
      success: true,
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function getCampName(req: express.Request, res: express.Response) {
  try {
    const camp = await NameContainer.findById(req.params.id);
    res.status(200).json(camp);
  } catch {
    res.status(400).json(resError);
  }
}
export async function getPartName(req: express.Request, res: express.Response) {
  try {
    const camp = await PartNameContainer.findById(req.params.id);
    res.status(200).json(camp);
  } catch {
    res.status(400).json(resError);
  }
}
export async function changeBaan(req: express.Request, res: express.Response) {
  const { userIds, baanId }: { userIds: Id[]; baanId: Id } = req.body;
  const user = await getUser(req);
  const baan = await Baan.findById(baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp: InterCampBack | null = await Camp.findById(baan.campId);
  if (
    !user ||
    !camp ||
    (!user.authPartIds.includes(camp.partBoardId) &&
      !user.authPartIds.includes(camp.partRegisterId))
  ) {
    sendRes(res, false);
    return;
  }
  await changeBaanRaw(userIds, baanId, res);
}
export async function changeBaanRaw(
  userIds: Id[],
  baanId: Id,
  res: express.Response
) {
  const baan = await Baan.findById(baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  const newNongCamp = await NongCamp.findById(baan.nongModelId);
  if (!camp || !newNongCamp) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < userIds.length) {
    const user = await User.findById(userIds[i++]);
    if (!user) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(user.id)
    );
    if (!campMemberCard) {
      continue;
    }
    switch (campMemberCard.role) {
      case "nong": {
        const oldNongCamp = await NongCamp.findById(campMemberCard.campModelId);
        if (!oldNongCamp) {
          continue;
        }
        const oldBaan = await Baan.findById(oldNongCamp.baanId);
        if (!oldBaan || oldBaan._id.equals(baan._id)) {
          continue;
        }
        await user.updateOne({
          nongCampIds: swop(oldNongCamp._id, newNongCamp._id, user.nongCampIds),
        });
        oldBaan.nongShirtSize.set(
          campMemberCard.size as "S" | "M" | "L" | "XL" | "XXL" | "3XL",
          calculate(
            oldBaan.nongShirtSize.get(
              campMemberCard.size as "S" | "M" | "L" | "XL" | "XXL" | "3XL"
            ),
            0,
            1
          )
        );
        oldBaan.mapCampMemberCardIdByUserId.delete(user.id);
        await oldBaan.updateOne({
          nongCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldBaan.nongCampMemberCardIds
          ),
          nongIds: swop(user._id, null, oldBaan.nongIds),
          mapCampMemberCardIdByUserId: oldBaan.mapCampMemberCardIdByUserId,
          nongShirtSize: oldBaan.nongShirtSize,
        });
        baan.nongShirtSize.set(
          campMemberCard.size,
          calculate(baan.nongShirtSize.get(campMemberCard.size), 1, 0)
        );
        baan.nongIds.push(user._id);
        baan.nongCampMemberCardIds.push(campMemberCard._id);
        await campMemberCard.updateOne({ campModelId: newNongCamp._id });
        if (campMemberCard.haveBottle) {
          await oldBaan.updateOne({
            nongHaveBottleIds: swop(user._id, null, oldBaan.nongHaveBottleIds),
          });
          baan.nongHaveBottleIds.push(user._id);
        }
        baan.mapCampMemberCardIdByUserId.set(user?.id, campMemberCard._id);
        await oldNongCamp.updateOne({
          nongIds: swop(user._id, null, oldNongCamp.nongIds),
          nongCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldNongCamp.nongCampMemberCardIds
          ),
        });
        if (campMemberCard.healthIssueId) {
          await oldBaan.updateOne({
            nongHeathIssueIds: swop(
              campMemberCard.healthIssueId,
              null,
              oldBaan.nongHeathIssueIds
            ),
            nongCampMemberCardHaveHeathIssueIds: swop(
              campMemberCard._id,
              null,
              oldBaan.nongCampMemberCardHaveHeathIssueIds
            ),
          });
          baan.nongCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          baan.nongHeathIssueIds.push(campMemberCard.healthIssueId);
        }
        if (campMemberCard.sleepAtCamp) {
          await oldBaan.updateOne({
            nongSleepIds: swop(user._id, null, oldBaan.nongSleepIds),
          });
          baan.nongSleepIds.push(user._id);
        }
        newNongCamp.nongIds.push(user._id);
        await baan.updateOne({
          mapCampMemberCardIdByUserId: baan.mapCampMemberCardIdByUserId,
          nongHeathIssueIds: baan.nongHeathIssueIds,
          nongIds: baan.nongIds,
          nongCampMemberCardIds: baan.nongCampMemberCardIds,
          nongShirtSize: baan.nongShirtSize,
          nongCampMemberCardHaveHeathIssueIds:
            baan.nongCampMemberCardHaveHeathIssueIds,
          nongHaveBottleIds: baan.nongHaveBottleIds,
          nongSleepIds: baan.nongSleepIds,
        });
        await newNongCamp.updateOne({
          nongIds: newNongCamp.nongIds,
          nongCampMemberCardIds: newNongCamp.nongCampMemberCardIds,
        });
        break;
      }
      case "pee": {
        const oldPeeCamp = await PeeCamp.findById(campMemberCard.campModelId);
        if (!oldPeeCamp) {
          continue;
        }
        const oldBaan = await Baan.findById(oldPeeCamp.baanId);
        if (!oldBaan || oldBaan._id.equals(baan._id)) {
          continue;
        }
        const newPeeCamp = await PeeCamp.findById(
          baan.mapPeeCampIdByPartId.get(oldPeeCamp.partId?.toString() as string)
        );
        if (!newPeeCamp) {
          continue;
        }
        await user.updateOne({
          peeCampIds: swop(oldPeeCamp._id, newPeeCamp._id, user.peeCampIds),
        });
        oldBaan.peeShirtSize.set(
          campMemberCard.size,
          calculate(oldBaan.peeShirtSize.get(campMemberCard.size), 0, 1)
        );
        await oldBaan.updateOne({
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldBaan.peeCampMemberCardIds
          ),
          peeIds: swop(user._id, null, oldBaan.peeIds),
          peeShirtSize: oldBaan.peeShirtSize,
        });
        baan.peeShirtSize.set(
          campMemberCard.size,
          calculate(baan.peeShirtSize.get(campMemberCard.size), 1, 0)
        );
        baan.peeIds.push(user._id);
        baan.peeCampMemberCardIds.push(campMemberCard._id);
        await campMemberCard.updateOne({ campModelId: newPeeCamp._id });
        if (campMemberCard.haveBottle) {
          await oldBaan.updateOne({
            peeHaveBottleIds: swop(user._id, null, oldBaan.peeHaveBottleIds),
          });
          baan.peeHaveBottleIds.push(user._id);
        }
        oldBaan?.mapCampMemberCardIdByUserId.delete(user.id);
        baan.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
        if (campMemberCard.healthIssueId) {
          await oldBaan.updateOne({
            peeHeathIssueIds: swop(
              campMemberCard.healthIssueId,
              null,
              oldBaan.peeHeathIssueIds
            ),
            peeCampMemberCardHaveHeathIssueIds: swop(
              campMemberCard._id,
              null,
              oldBaan.peeCampMemberCardHaveHeathIssueIds
            ),
          });
          baan.peeHeathIssueIds.push(campMemberCard.healthIssueId);
          baan.peeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
        }
        if (campMemberCard.sleepAtCamp) {
          await oldBaan.updateOne({
            peeSleepIds: swop(user._id, null, oldBaan.peeSleepIds),
          });
          baan.peeSleepIds.push(user._id);
        }
        await newPeeCamp.updateOne({
          peeCampMemberCardIds: swop(
            null,
            campMemberCard._id,
            newPeeCamp.peeCampMemberCardIds
          ),
          peeIds: swop(null, user._id, newPeeCamp.peeIds),
        });
        await oldPeeCamp.updateOne({
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldPeeCamp.peeCampMemberCardIds
          ),
          peeIds: swop(user._id, null, oldPeeCamp.peeIds),
        });
        await baan.updateOne({
          peeHeathIssueIds: baan.peeHeathIssueIds,
          mapCampMemberCardIdByUserId: baan.mapCampMemberCardIdByUserId,
          peeIds: baan.peeIds,
          peeCampMemberCardIds: baan.peeCampMemberCardIds,
          peeShirtSize: baan.peeShirtSize,
          peeCampMemberCardHaveHeathIssueIds:
            baan.peeCampMemberCardHaveHeathIssueIds,
          peeHaveBottleIds: baan.peeHaveBottleIds,
          peeSleepIds: baan.peeSleepIds,
        });
        break;
      }
    }
  }
  sendRes(res, true);
}
export async function changePart(req: express.Request, res: express.Response) {
  const { userIds, partId }: { userIds: Id[]; partId: Id } = req.body;
  const out = await changePartRaw(userIds, partId);
  sendRes(res, out);
}
export async function changePartRaw(userIds: Id[], partId: Id) {
  const part = await Part.findById(partId);
  if (!part) {
    return false;
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    return false;
  }
  const newPetoCamp = await PetoCamp.findById(part.petoModelId);
  if (!newPetoCamp) {
    return false;
  }
  let i = 0;
  while (i < userIds.length) {
    const user = await User.findById(userIds[i++]);
    if (!user) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(user.id)
    );
    if (!campMemberCard) {
      continue;
    }
    switch (campMemberCard.role) {
      case "peto": {
        const oldPetoCamp = await PetoCamp.findById(campMemberCard.campModelId);
        if (!oldPetoCamp) {
          continue;
        }
        const oldPart = await Part.findById(oldPetoCamp.partId);
        if (!oldPart || oldPart._id.equals(part._id)) {
          continue;
        }
        await user.updateOne({
          peeCampIds: swop(oldPetoCamp._id, newPetoCamp._id, user.petoCampIds),
        });
        oldPart.petoShirtSize.set(
          campMemberCard.size,
          calculate(oldPart.peeShirtSize.get(campMemberCard.size), 0, 1)
        );
        oldPart.mapCampMemberCardIdByUserId.delete(user?.id);
        await oldPart.updateOne({
          petoCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldPart.petoCampMemberCardIds
          ), /////////////
          petoIds: swop(user._id, null, oldPart.petoIds),
          mapCampMemberCardIdByUserId: oldPart.mapCampMemberCardIdByUserId,
          petoShirtSize: oldPart.petoShirtSize,
        });
        part.petoIds.push(user._id);
        part.petoShirtSize.set(
          campMemberCard.size,
          calculate(part.petoShirtSize.get(campMemberCard.size), 1, 0)
        );
        part.petoCampMemberCardIds.push(campMemberCard._id);
        await campMemberCard.updateOne({ campModelId: newPetoCamp._id });
        if (campMemberCard.haveBottle) {
          await oldPart.updateOne({
            petoHaveBottleIds: swop(user._id, null, oldPart.petoHaveBottleIds),
          });
          part.petoHaveBottleIds.push(user._id);
        }
        part.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
        await oldPetoCamp.updateOne({
          petoIds: swop(user._id, null, oldPetoCamp.petoIds),
          petoCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldPetoCamp.petoCampMemberCardIds
          ),
        });
        if (campMemberCard.healthIssueId) {
          await oldPart.updateOne({
            petoHeathIssueIds: swop(
              campMemberCard.healthIssueId,
              null,
              oldPart.petoHeathIssueIds
            ),
            petoCampMemberCardHaveHeathIssueIds: swop(
              campMemberCard._id,
              null,
              oldPart.petoCampMemberCardHaveHeathIssueIds
            ),
          });
          part.petoCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          part.petoHeathIssueIds.push(campMemberCard.healthIssueId);
        }
        if (campMemberCard.sleepAtCamp) {
          await oldPart.updateOne({
            petoSleepIds: swop(user._id, null, oldPart.petoSleepIds),
          });
          part.petoSleepIds.push(user._id);
        }
        if (oldPart.isAuth) {
          await user.updateOne({
            authPartIds: swop(oldPart._id, null, user.authPartIds),
          });
        }
        if (part.isAuth) {
          await user.updateOne({
            authPartIds: swop(null, oldPart._id, user.authPartIds),
          });
        }
        newPetoCamp.petoIds.push(user._id);
        await newPetoCamp.updateOne({
          petoIds: newPetoCamp.petoIds,
          petoCampMemberCardIds: newPetoCamp.petoCampMemberCardIds,
        });
        await part.updateOne({
          mapCampMemberCardIdByUserId: part.mapCampMemberCardIdByUserId,
          petoHeathIssueIds: part.petoHeathIssueIds,
          petoIds: part.petoIds,
          petoCampMemberCardIds: part.petoCampMemberCardIds,
          petoCampMemberCardHaveHeathIssueIds:
            part.petoCampMemberCardHaveHeathIssueIds,
          petoHaveBottleIds: part.petoHaveBottleIds,
          petoSleepIds: part.petoSleepIds,
        });
        break;
      }
      case "pee": {
        const oldPeeCamp = await PeeCamp.findById(campMemberCard.campModelId);
        if (!oldPeeCamp) {
          continue;
        }
        const oldPart = await Part.findById(oldPeeCamp.partId);
        if (!oldPart || oldPart._id.equals(part._id)) {
          continue;
        }
        const newPeeCamp = await PeeCamp.findById(
          part.mapPeeCampIdByBaanId.get(oldPeeCamp.baanId?.toString() as string)
        );
        if (!newPeeCamp) {
          continue;
        }
        await user.updateOne({
          peeCampIds: swop(oldPeeCamp._id, newPeeCamp._id, user.peeCampIds),
        });
        oldPart.peeShirtSize.set(
          campMemberCard.size,
          calculate(oldPart.peeShirtSize.get(campMemberCard.size), 0, 1)
        );
        await oldPart.updateOne({
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldPart.peeCampMemberCardIds
          ),
          peeIds: swop(user._id, null, oldPart.peeIds),
          peeShirtSize: oldPart.peeShirtSize,
        });
        part.peeIds.push(user._id);
        part.peeShirtSize.set(
          campMemberCard.size,
          calculate(part.peeShirtSize.get(campMemberCard.size), 1, 0)
        );
        part.peeCampMemberCardIds.push(campMemberCard._id);
        await campMemberCard.updateOne({ campModelId: newPeeCamp._id });
        if (campMemberCard.haveBottle) {
          await oldPart.updateOne({
            peeHaveBottleIds: swop(user._id, null, oldPart.peeHaveBottleIds),
          });
          part.peeHaveBottleIds.push(user._id);
        }
        oldPart.mapCampMemberCardIdByUserId.delete(user.id);
        part.mapCampMemberCardIdByUserId.set(user.id, campMemberCard._id);
        if (campMemberCard.healthIssueId) {
          await oldPart.updateOne({
            peeHeathIssueIds: swop(
              campMemberCard.healthIssueId,
              null,
              oldPart.peeHeathIssueIds
            ),
            peeCampMemberCardHaveHeathIssueIds: swop(
              campMemberCard._id,
              null,
              oldPart.peeCampMemberCardHaveHeathIssueIds
            ),
          });
          part.peeHeathIssueIds.push(campMemberCard.healthIssueId);
          part.peeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
        }
        if (campMemberCard.sleepAtCamp) {
          await oldPart.updateOne({
            peeSleepIds: swop(user._id, null, oldPart.peeSleepIds),
          });
          part.peeSleepIds.push(user._id);
        }
        if (oldPart.isAuth) {
          await user.updateOne({
            authPartIds: swop(oldPart._id, null, user.authPartIds),
          });
        }
        if (part.isAuth) {
          await user.updateOne({
            authPartIds: swop(null, oldPart._id, user.authPartIds),
          });
        }
        await newPeeCamp.updateOne({
          peeCampMemberCardIds: swop(
            null,
            campMemberCard._id,
            newPeeCamp.peeCampMemberCardIds
          ),
          peeIds: swop(null, user._id, newPeeCamp.peeIds),
        });
        await oldPeeCamp.updateOne({
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            oldPeeCamp.peeCampMemberCardIds
          ),
          peeIds: swop(user._id, null, oldPeeCamp.peeIds),
        });
        await part.updateOne({
          peeHeathIssueIds: part.peeHeathIssueIds,
          mapCampMemberCardIdByUserId: part.mapCampMemberCardIdByUserId,
          peeIds: part.peeIds,
          peeCampMemberCardIds: part.peeCampMemberCardIds,
          peeShirtSize: part.peeShirtSize,
          peeCampMemberCardHaveHeathIssueIds:
            part.peeCampMemberCardHaveHeathIssueIds,
          peeHaveBottleIds: part.peeHaveBottleIds,
          peeSleepIds: part.peeSleepIds,
        });
        break;
      }
    }
  }
  return true;
}
export async function getNongsFromBaanId(
  req: express.Request,
  res: express.Response
) {
  const out = await getNongsFromBaanIdRaw(stringToId(req.params.id));
  res.status(200).json(out);
}
async function getNongsFromBaanIdRaw(baanId: Id) {
  const out: ShowMember[] = [];
  const baan = await Baan.findById(baanId);
  if (!baan) {
    return [];
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    return [];
  }
  let i = 0;
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
    let j = 0;
    const likeSongs: string[] = [];
    const {
      name,
      lastname,
      nickname,
      _id,
      email,
      tel,
      group,
      gender,
      studentId,
      likeSongIds,
    } = user;
    while (j < likeSongIds.length) {
      const song = await Song.findById(likeSongs[j++]);
      if (!song) {
        continue;
      }
      likeSongs.push(song.name);
    }
    let isWearing = false;
    let spicy = false;
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (heathIssue) {
      isWearing = heathIssue.isWearing;
      spicy = heathIssue.spicy;
    }
    out.push({
      name,
      nickname,
      lastname,
      _id,
      shirtSize: campMemberCard.size,
      email,
      studentId,
      sleep: campMemberCard.sleepAtCamp,
      tel,
      gender,
      group,
      healthIssueId: campMemberCard.healthIssueId,
      haveBottle: campMemberCard.haveBottle,
      likeSongs,
      isWearing,
      spicy,
      id: camp.nongMapIdGtoL.get(_id.toString()) as number,
      campMemberCardId: campMemberCard._id,
    });
  }
  return out;
}
export async function getPeesFromBaanId(
  req: express.Request,
  res: express.Response
) {
  const out = await getPeesFromBaanIdRaw(stringToId(req.params.id));
  res.status(200).json(out);
}
async function getPeesFromBaanIdRaw(baanId: Id) {
  const out: ShowMember[] = [];
  const baan = await Baan.findById(baanId);
  if (!baan) {
    return [];
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    return [];
  }
  let i = 0;
  while (i < baan.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const user = await User.findById(campMemberCard.userId);
    if (!user) {
      continue;
    }
    let j = 0;
    const likeSongs: string[] = [];
    const {
      name,
      lastname,
      nickname,
      _id,
      email,
      tel,
      group,
      gender,
      studentId,
      likeSongIds,
    } = user;
    while (j < likeSongIds.length) {
      const song = await Song.findById(likeSongs[j++]);
      if (!song) {
        continue;
      }
      likeSongs.push(song.name);
    }
    let isWearing = false;
    let spicy = false;
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (heathIssue) {
      isWearing = heathIssue.isWearing;
      spicy = heathIssue.spicy;
    }
    out.push({
      name,
      nickname,
      lastname,
      _id,
      shirtSize: campMemberCard.size,
      email,
      studentId,
      sleep: campMemberCard.sleepAtCamp,
      tel,
      gender,
      group,
      healthIssueId: campMemberCard.healthIssueId,
      haveBottle: campMemberCard.haveBottle,
      likeSongs,
      isWearing,
      spicy,
      id: camp.peeMapIdGtoL.get(_id.toString()) as number,
      campMemberCardId: campMemberCard._id,
    });
  }
  return out;
}
export async function getPeesFromPartId(
  req: express.Request,
  res: express.Response
) {
  const out = await getPeesFromPartIdRaw(stringToId(req.params.id));
  res.status(200).json(out);
}
async function getPeesFromPartIdRaw(partId: Id) {
  const out: ShowMember[] = [];
  const part = await Part.findById(partId);
  if (!part) {
    return [];
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    return [];
  }
  let i = 0;
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
    let j = 0;
    const likeSongs: string[] = [];
    const {
      name,
      lastname,
      nickname,
      _id,
      email,
      tel,
      group,
      gender,
      studentId,
      likeSongIds,
    } = user;
    while (j < likeSongIds.length) {
      const song = await Song.findById(likeSongs[j++]);
      if (!song) {
        continue;
      }
      likeSongs.push(song.name);
    }
    let isWearing = false;
    let spicy = false;
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (heathIssue) {
      isWearing = heathIssue.isWearing;
      spicy = heathIssue.spicy;
    }
    out.push({
      name,
      nickname,
      lastname,
      _id,
      shirtSize: campMemberCard.size,
      email,
      studentId,
      sleep: campMemberCard.sleepAtCamp,
      tel,
      gender,
      group,
      healthIssueId: campMemberCard.healthIssueId,
      haveBottle: campMemberCard.haveBottle,
      likeSongs,
      isWearing,
      spicy,
      id: camp.peeMapIdGtoL.get(_id.toString()) as number,
      campMemberCardId: campMemberCard._id,
    });
  }
  return out;
}
export async function getPetosFromPartId(
  req: express.Request,
  res: express.Response
) {
  const out = await getPetosFromPartIdRaw(stringToId(req.params.id));
  res.status(200).json(out);
}
async function getPetosFromPartIdRaw(partId: Id) {
  const out: ShowMember[] = [];
  const part = await Part.findById(partId);
  if (!part) {
    return [];
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    return [];
  }
  let i = 0;
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
    let j = 0;
    const likeSongs: string[] = [];
    const {
      name,
      lastname,
      nickname,
      _id,
      email,
      tel,
      group,
      gender,
      studentId,
      likeSongIds,
    } = user;
    while (j < likeSongIds.length) {
      const song = await Song.findById(likeSongs[j++]);
      if (!song) {
        continue;
      }
      likeSongs.push(song.name);
    }
    let isWearing = false;
    let spicy = false;
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (heathIssue) {
      isWearing = heathIssue.isWearing;
      spicy = heathIssue.spicy;
    }
    out.push({
      name,
      nickname,
      lastname,
      _id,
      shirtSize: campMemberCard.size,
      email,
      studentId,
      sleep: campMemberCard.sleepAtCamp,
      tel,
      gender,
      group,
      healthIssueId: campMemberCard.healthIssueId,
      haveBottle: campMemberCard.haveBottle,
      likeSongs,
      isWearing,
      spicy,
      id: camp.peeMapIdGtoL.get(_id.toString()) as number,
      campMemberCardId: campMemberCard._id,
    });
  }
  return out;
}
export async function getLinkRegister(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const campId: string = req.params.id;
  const camp = await Camp.findById(campId);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  res.status(200).json({ link: camp.nongPendingIds.get(user.id) });
}
export async function getImpotentPartIdBCRP(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return [];
  }
  return [
    camp.partBoardId,
    camp.partCoopId,
    camp.partRegisterId,
    camp.partPeeBaanId,
    camp.partWelfareId,
    camp.partMedId,
    camp.partPlanId,
  ] as Id[];
}
export async function getActionPlan(
  req: express.Request,
  res: express.Response
) {
  try {
    const actionPlan: InterActionPlan | null = await ActionPlan.findById(
      req.params.id
    );
    if (!actionPlan) {
      sendRes(res, false);
      return;
    }
    const {
      action,
      partId,
      placeIds,
      start,
      end,
      headId,
      body,
      partName,
      _id,
    } = actionPlan;
    const user = await User.findById(headId);
    let k = 0;
    const placeName: string[] = [];
    while (k < placeIds.length) {
      const place = await Place.findById(placeIds[k++]);
      const building = await Building.findById(place?.buildingId);
      placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
    }
    const show: showActionPlan = {
      action,
      partId,
      placeIds,
      start,
      end,
      headId,
      body,
      headName: user?.nickname as string,
      headTel: user?.tel as string,
      partName,
      placeName,
      _id,
    };
    res.status(200).json(show);
  } catch (err) {
    console.log(err);
  }
}
export async function getWorkingItemByPartId(
  req: express.Request,
  res: express.Response
) {
  try {
    const part = await Part.findById(req.params.id);
    const data: InterWorkingItem[] = [];
    if (!part) {
      sendRes(res, false);
      return;
    }
    const user = await getUser(req);
    const camp = await Camp.findById(part.campId);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllTrackingSheet &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let j = 0;
    while (j < part.workItemIds.length) {
      const workItem: InterWorkingItem | null = await WorkItem.findById(
        part.workItemIds[j++]
      );
      if (!workItem) {
        continue;
      }
      const {
        name,
        link,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        password,
        partName,
      } = workItem;
      const isMatch = await bcrypt.compare(user.linkHash, password);
      if (isMatch) {
        data.push({
          link,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      } else {
        data.push({
          link: null,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      }
    }
    const buffer: SuccessBase<InterWorkingItem[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
export async function createWorkingItem(
  req: express.Request,
  res: express.Response
) {
  const create: CreateWorkingItem = req.body;
  const hospital = await WorkItem.create(create);
  const user = await getUser(req);
  const part = await Part.findById(create.partId);
  const camp = await Camp.findById(part?.campId);
  await part?.updateOne({
    workItemIds: swop(null, hospital._id, part.workItemIds),
  });
  await camp?.updateOne({
    workItemIds: swop(null, hospital._id, camp.workItemIds),
  });
  await hospital.updateOne({ partName: part?.partName });
  if (create.fromId) {
    const from = await WorkItem.findById(create.fromId);
    await from?.updateOne({
      linkOutIds: swop(null, hospital._id, from.linkOutIds),
    });
  }
  await hospital.updateOne({ createBy: user?._id, partName: part?.partName });
  res.status(200).json(hospital);
}
export async function updateWorkingItem(
  req: express.Request,
  res: express.Response
) {
  try {
    const { status, link, name } = req.body;

    const hospital = await WorkItem.findById(req.params.id);
    if (!hospital) {
      sendRes(res, false);
      return;
    }
    await hospital.updateOne({ status, link, name });
    if (!hospital) {
      sendRes(res, false);
      return;
    }
    res.status(200).json(hospital);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function deleteWorkingItem(
  req: express.Request,
  res: express.Response
) {
  try {
    await deleteWorkingItemRaw(stringToId(req.params.id));
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
export async function getWorkingItems(
  req: express.Request,
  res: express.Response
) {
  try {
    const data: InterWorkingItem[] = [];
    const user = await getUser(req);
    if (!user) {
      sendRes(res, false);
      return;
    }
    if (user.filterIds.length == 0) {
      let i = 0;
      while (i < user.registerIds.length) {
        const camp = await Camp.findById(user.registerIds[i++]);
        if (!camp) {
          continue;
        }
        let j = 0;
        while (j < camp.workItemIds.length) {
          const workItem: InterWorkingItem | null = await WorkItem.findById(
            camp.workItemIds[j++]
          );
          if (!workItem) {
            continue;
          }
          data.push(workItem);
        }
      }
    } else {
      let i = 0;
      while (i < user.filterIds.length) {
        const camp = await Camp.findById(user.filterIds[i++]);
        if (!camp) {
          continue;
        }
        let j = 0;
        while (j < camp.workItemIds.length) {
          const workItem: InterWorkingItem | null = await WorkItem.findById(
            camp.workItemIds[j++]
          );
          if (!workItem) {
            continue;
          }
          const {
            name,
            link,
            status,
            partId,
            linkOutIds,
            fromId,
            createBy,
            _id,
            password,
            partName,
          } = workItem;
          const isMatch = await bcrypt.compare(user.linkHash, password);
          if (isMatch) {
            data.push({
              link,
              status,
              partId,
              linkOutIds,
              fromId,
              createBy,
              _id,
              partName,
              password,
              name,
            });
          } else {
            data.push({
              link: null,
              status,
              partId,
              linkOutIds,
              fromId,
              createBy,
              _id,
              partName,
              password,
              name,
            });
          }
        }
      }
    }
    const buffer: SuccessBase<InterWorkingItem[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function getWorkingItem(
  req: express.Request,
  res: express.Response
) {
  try {
    const workItem: InterWorkingItem | null = await WorkItem.findById(
      req.params.id
    );
    const user = await getUser(req);
    if (!workItem || !user) {
      sendRes(res, false);
      return;
    }
    let data: InterWorkingItem;
    const {
      name,
      link,
      status,
      partId,
      linkOutIds,
      fromId,
      createBy,
      _id,
      password,
      partName,
    } = workItem;
    const isMatch = await bcrypt.compare(user.linkHash, password);
    if (isMatch) {
      data = {
        link,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        partName,
        password,
        name,
      };
    } else {
      data = {
        link: null,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        partName,
        password,
        name,
      };
    }
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
}
export async function getShowRegisters(
  req: express.Request,
  res: express.Response
) {
  const out = await getShowRegistersRaw(stringToId(req.params.id));
  if (!out) {
    sendRes(res, false);
    return;
  }
  res.status(200).json(out);
}
async function getShowRegistersRaw(campId: Id) {
  const camp: InterCampBack | null = await Camp.findById(campId);
  if (!camp) {
    return null;
  }
  const buff = mapObjectIdToMyMap(camp.peePassIds);
  let i = 0;
  const out: ShowRegister[] = [];
  while (i < buff.length) {
    const user = await User.findById(buff[i].key);
    const part = await Part.findById(buff[i++].value);
    if (!user || !part) {
      continue;
    }
    out.push({
      //fullName: `ชื่อจริง ${user.name} นามสกุล ${user.lastname} ชื่อเล่น ${user.nickname}`,
      name: user.name,
      lastname: user.lastname,
      nickname: user.nickname,
      userId: user._id,
      partId: part._id,
      partName: part.partName,
    });
  }
  return out;
}
export async function getAllUserCamp(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const out: MyMap[] = [];
  if (!user) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < user.nongCampIds.length) {
    const nongCamp = await NongCamp.findById(user.nongCampIds[i++]);
    if (!nongCamp) {
      continue;
    }
    const camp = await Camp.findById(nongCamp.campId);
    if (!camp) {
      continue;
    }
    out.push({ key: camp._id, value: camp.campName });
  }
  i = 0;
  while (i < user.peeCampIds.length) {
    const peeCamp = await PeeCamp.findById(user.peeCampIds[i++]);
    if (!peeCamp) {
      continue;
    }
    const camp = await Camp.findById(peeCamp.campId);
    if (!camp) {
      continue;
    }
    out.push({ key: camp._id, value: camp.campName });
  }
  i = 0;
  while (i < user.petoCampIds.length) {
    const petoCamp = await PetoCamp.findById(user.petoCampIds[i++]);
    if (!petoCamp) {
      continue;
    }
    const camp = await Camp.findById(petoCamp.campId);
    if (!camp) {
      continue;
    }
    out.push({ key: camp._id, value: camp.campName });
  }
  res.status(200).json(out);
}
export async function getAllWelfare(
  req: express.Request,
  res: express.Response
) {
  const camp: InterCampBack | null = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const nongHealths: HeathIssuePack[] = [];
  const peeHealths: HeathIssuePack[] = [];
  const petoHealths: HeathIssuePack[] = [];
  const baanWelfares: WelfarePack[] = [];
  const partWelfares: WelfarePack[] = [];
  const baanHaveBottles: CampNumberData[] = [];
  const partHaveBottles: CampNumberData[] = [];
  const baanSpicyS: CampNumberData[] = [];
  const partSpicyS: CampNumberData[] = [];
  const baanHalalS: CampNumberData[] = [];
  const partHalalS: CampNumberData[] = [];
  const baanVegetarians: CampNumberData[] = [];
  const partVegetarians: CampNumberData[] = [];
  const baanVegans: CampNumberData[] = [];
  const partVegans: CampNumberData[] = [];
  const baanIsWearings: CampNumberData[] = [];
  const partIsWearings: CampNumberData[] = [];
  let campNongSpicyS = 0;
  let campPeeSpicyS = 0;
  let campPetoSpicyS = 0;
  let campNongHalalS = 0;
  let campPeeHalalS = 0;
  let campPetoHalalS = 0;
  let campNongVegetarians = 0;
  let campPeeVegetarians = 0;
  let campPetoVegetarians = 0;
  let campNongVegans = 0;
  let campPeeVegans = 0;
  let campPetoVegans = 0;
  let campNongIsWearings = 0;
  let campPeeIsWearings = 0;
  let campPetoIsWearings = 0;
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan: InterBaanBack | null = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    const welfareBaan: WelfarePack = {
      name: `${camp.groupName}${baan.name}`,
      nongHealths: [],
      peeHealths: [],
      petoHealths: [],
      nongSize: sizeMapToJson(baan.nongShirtSize),
      peeSize: sizeMapToJson(baan.peeShirtSize),
      petoSize: startJsonSize(),
    };
    let baanNongSpicyS = 0;
    let baanPeeSpicyS = 0;
    let baanNongHalalS = 0;
    let baanPeeHalalS = 0;
    let baanNongVegetarians = 0;
    let baanPeeVegetarians = 0;
    let baanNongVegans = 0;
    let baanPeeVegans = 0;
    let baanNongIsWearings = 0;
    let baanPeeIsWearings = 0;
    let j = 0;
    while (j < baan.nongCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.nongCampMemberCardHaveHeathIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      const user = await User.findById(campMemberCard.userId);
      if (!heathIssue || !user) {
        continue;
      }
      const buffer: HeathIssuePack = {
        user,
        heathIssue,
        campMemberCardId: campMemberCard._id,
      };
      welfareBaan.nongHealths = ifIsTrue(
        isWelfareValid(buffer),
        buffer,
        welfareBaan.nongHealths,
        nongHealths
      );
      campNongSpicyS = ifIsPlus(heathIssue.spicy, campNongSpicyS);
      baanNongSpicyS = ifIsPlus(heathIssue.spicy, baanNongSpicyS);
      campNongHalalS = ifIsPlus(
        heathIssue.foodLimit == "อิสลาม",
        campNongHalalS
      );
      baanNongHalalS = ifIsPlus(
        heathIssue.foodLimit == "อิสลาม",
        baanNongHalalS
      );
      campNongVegetarians = ifIsPlus(
        heathIssue.foodLimit == "มังสวิรัติ",
        campNongVegetarians
      );
      baanNongVegetarians = ifIsPlus(
        heathIssue.foodLimit == "มังสวิรัติ",
        baanNongVegetarians
      );
      campNongVegans = ifIsPlus(heathIssue.foodLimit == "เจ", campNongVegans);
      baanNongVegans = ifIsPlus(heathIssue.foodLimit == "เจ", baanNongVegans);
      campNongIsWearings = ifIsPlus(heathIssue.isWearing, campNongIsWearings);
      baanNongIsWearings = ifIsPlus(heathIssue.isWearing, baanNongIsWearings);
    }
    j = 0;
    while (j < baan.peeCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.peeCampMemberCardHaveHeathIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      const user = await User.findById(campMemberCard.userId);
      if (!heathIssue || !user) {
        continue;
      }
      const buffer: HeathIssuePack = {
        user,
        heathIssue,
        campMemberCardId: campMemberCard._id,
      };
      welfareBaan.peeHealths = ifIsTrue(
        isWelfareValid(buffer),
        buffer,
        welfareBaan.peeHealths,
        peeHealths
      );
      campPeeSpicyS = ifIsPlus(heathIssue.spicy, campPeeSpicyS);
      baanPeeSpicyS = ifIsPlus(heathIssue.spicy, baanPeeSpicyS);
      campPeeHalalS = ifIsPlus(heathIssue.foodLimit == "อิสลาม", campPeeHalalS);
      baanPeeHalalS = ifIsPlus(heathIssue.foodLimit == "อิสลาม", baanPeeHalalS);
      campPeeVegetarians = ifIsPlus(
        heathIssue.foodLimit == "มังสวิรัติ",
        campPeeVegetarians
      );
      baanPeeVegetarians = ifIsPlus(
        heathIssue.foodLimit == "มังสวิรัติ",
        baanPeeVegetarians
      );
      campPeeVegans = ifIsPlus(heathIssue.foodLimit == "เจ", campPeeVegans);
      baanPeeVegans = ifIsPlus(heathIssue.foodLimit == "เจ", baanPeeVegans);
      campPeeIsWearings = ifIsPlus(heathIssue.isWearing, campPeeIsWearings);
      baanPeeIsWearings = ifIsPlus(heathIssue.isWearing, baanPeeIsWearings);
    }
    baanWelfares.push(welfareBaan);
    baanHaveBottles.push({
      name: baan.name,
      nongNumber: baan.nongHaveBottleIds.length,
      peeNumber: baan.peeHaveBottleIds.length,
      petoNumber: 0,
    });
    baanSpicyS.push({
      name: baan.name,
      nongNumber: baanNongSpicyS,
      peeNumber: baanPeeSpicyS,
      petoNumber: 0,
    });
    baanHalalS.push({
      name: baan.name,
      nongNumber: baanNongHalalS,
      peeNumber: baanPeeHalalS,
      petoNumber: 0,
    });
    baanVegetarians.push({
      name: baan.name,
      nongNumber: baanNongVegetarians,
      peeNumber: baanPeeVegetarians,
      petoNumber: 0,
    });
    baanVegans.push({
      name: baan.name,
      nongNumber: baanNongVegans,
      peeNumber: baanPeeVegans,
      petoNumber: 0,
    });
    baanIsWearings.push({
      name: baan.name,
      nongNumber: baanNongIsWearings,
      peeNumber: baanPeeIsWearings,
      petoNumber: 0,
    });
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part: InterPartBack | null = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    const welfarePart: WelfarePack = {
      name: `ฝ่าย${part.partName}`,
      nongHealths: [],
      peeHealths: [],
      petoHealths: [],
      nongSize: startJsonSize(),
      peeSize: sizeMapToJson(part.peeShirtSize),
      petoSize: sizeMapToJson(part.petoShirtSize),
    };
    let partPeeSpicyS = 0;
    let partPetoSpicyS = 0;
    let partPeeHalalS = 0;
    let partPetoHalalS = 0;
    let partPeeVegetarians = 0;
    let partPetoVegetarians = 0;
    let partPeeVegans = 0;
    let partPetoVegans = 0;
    let partPeeIsWearings = 0;
    let partPetoIsWearings = 0;
    let j = 0;
    while (j < part.petoCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.petoCampMemberCardHaveHeathIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      const user = await User.findById(campMemberCard.userId);
      if (!heathIssue || !user) {
        continue;
      }
      const buffer: HeathIssuePack = {
        user,
        heathIssue,
        campMemberCardId: campMemberCard._id,
      };
      welfarePart.petoHealths = ifIsTrue(
        isWelfareValid(buffer),
        buffer,
        welfarePart.petoHealths,
        petoHealths
      );
      campPetoSpicyS = ifIsPlus(heathIssue.spicy, campPetoSpicyS);
      partPetoSpicyS = ifIsPlus(heathIssue.spicy, partPetoSpicyS);
      campPetoHalalS = ifIsPlus(
        heathIssue.foodLimit == "อิสลาม",
        campPetoHalalS
      );
      partPetoHalalS = ifIsPlus(
        heathIssue.foodLimit == "อิสลาม",
        partPetoHalalS
      );
      campPetoVegetarians = ifIsPlus(
        heathIssue.foodLimit == "มังสวิรัติ",
        campPetoVegetarians
      );
      partPetoVegetarians = ifIsPlus(
        heathIssue.foodLimit == "มังสวิรัติ",
        partPetoVegetarians
      );
      campPetoVegans = ifIsPlus(heathIssue.foodLimit == "เจ", campPetoVegans);
      partPetoVegans = ifIsPlus(heathIssue.foodLimit == "เจ", partPetoVegans);
      campPetoIsWearings = ifIsPlus(heathIssue.isWearing, campPetoIsWearings);
      partPetoIsWearings = ifIsPlus(heathIssue.isWearing, partPetoIsWearings);
    }
    j = 0;
    while (j < part.peeHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.peeCampMemberCardHaveHeathIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const heathIssue = await HeathIssue.findById(
        campMemberCard.healthIssueId
      );
      const user = await User.findById(campMemberCard.userId);
      if (!user || !heathIssue) {
        continue;
      }
      const buffer: HeathIssuePack = {
        user,
        heathIssue,
        campMemberCardId: campMemberCard._id,
      };
      welfarePart.peeHealths = ifIsTrue(
        isWelfareValid(buffer),
        buffer,
        welfarePart.peeHealths
      );
      partPeeSpicyS = ifIsPlus(heathIssue.spicy, partPeeSpicyS);
      partPeeHalalS = ifIsPlus(heathIssue.foodLimit == "อิสลาม", partPeeHalalS);
      partPeeVegetarians = ifIsPlus(
        heathIssue.foodLimit == "มังสวิรัติ",
        partPeeVegetarians
      );
      partPeeVegans = ifIsPlus(heathIssue.foodLimit == "เจ", partPeeVegans);
      partPeeIsWearings = ifIsPlus(heathIssue.isWearing, partPeeIsWearings);
    }
    partWelfares.push(welfarePart);
    partHaveBottles.push({
      name: part.partName,
      nongNumber: 0,
      peeNumber: part.peeHaveBottleIds.length,
      petoNumber: part.petoHaveBottleIds.length,
    });
    partSpicyS.push({
      name: part.partName,
      nongNumber: 0,
      peeNumber: partPeeSpicyS,
      petoNumber: partPetoSpicyS,
    });
    partHalalS.push({
      name: part.partName,
      nongNumber: 0,
      peeNumber: partPeeHalalS,
      petoNumber: partPetoHalalS,
    });
    partVegetarians.push({
      name: part.partName,
      nongNumber: 0,
      peeNumber: partPeeVegetarians,
      petoNumber: partPetoVegetarians,
    });
    partVegans.push({
      name: part.partName,
      nongNumber: 0,
      peeNumber: partPeeVegans,
      petoNumber: partPetoVegans,
    });
    partIsWearings.push({
      name: part.partName,
      nongNumber: 0,
      peeNumber: partPeeIsWearings,
      petoNumber: partPetoIsWearings,
    });
  }
  const meals: InterMeal[] = [];
  i = 0;
  while (i < camp.mealIds.length) {
    const meal = await Meal.findById(camp.mealIds[i++]);
    if (!meal) {
      continue;
    }
    meals.push(meal);
  }
  const buffer: CampWelfarePack = {
    isHavePeto:
      camp.memberStructure == "nong->highSchool,pee->1year,peto->2upYear",
    partWelfares,
    baanWelfares,
    groupName: camp.groupName,
    campWelfare: {
      nongSize: sizeMapToJson(camp.nongShirtSize),
      peeSize: sizeMapToJson(camp.peeShirtSize),
      petoSize: sizeMapToJson(camp.petoShirtSize),
      name: camp.campName,
      nongHealths,
      peeHealths,
      petoHealths,
    },
    baanHaveBottles,
    partHaveBottles,
    campBottleNumber: {
      nongNumber: camp.nongHaveBottleIds.length,
      peeNumber: camp.peeHaveBottleIds.length,
      petoNumber: camp.petoHaveBottleIds.length,
      name: camp.campName,
    },
    baanHalalS,
    baanSpicyS,
    baanVegans,
    baanVegetarians,
    partHalalS,
    partSpicyS,
    partVegans,
    partVegetarians,
    campSpicyNumber: {
      name: camp.campName,
      nongNumber: campNongSpicyS,
      peeNumber: campPeeSpicyS,
      petoNumber: campPetoSpicyS,
    },
    campHalalNumber: {
      name: camp.campName,
      nongNumber: campNongHalalS,
      peeNumber: campPeeHalalS,
      petoNumber: campPetoHalalS,
    },
    campVegetarianNumber: {
      name: camp.campName,
      nongNumber: campNongVegetarians,
      peeNumber: campPeeVegetarians,
      petoNumber: campPetoVegetarians,
    },
    campVeganNumber: {
      name: camp.campName,
      nongNumber: campNongVegans,
      peeNumber: campPeeVegans,
      petoNumber: campPetoVegans,
    },
    partIsWearings,
    baanIsWearings,
    campWearingNumber: {
      name: camp.campName,
      nongNumber: campNongIsWearings,
      peeNumber: campPeeIsWearings,
      petoNumber: campPetoIsWearings,
    },
    meals,
    _id: camp._id,
  };
  res.status(200).json(buffer);
}
export async function getAllPlanData(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  const baanDatas: GetBaansForPlan[] = [];
  const partDatas: GetPartForPlan[] = [];
  const baanBoySleeps: CampNumberData[] = [];
  const baanGirlSleeps: CampNumberData[] = [];
  const partBoySleeps: CampNumberData[] = [];
  const partGirlSleeps: CampNumberData[] = [];
  const baanSleepDatas: CampSleepDataContainer[] = [];
  const partSleepDatas: CampSleepDataContainer[] = [];
  let nongBoySleep: number = 0;
  let nongGirlSleep: number = 0;
  let peeBoySleep: number = 0;
  let peeGirlSleep: number = 0;
  let petoBoySleep: number = 0;
  let petoGirlSleep: number = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    const boy = await Place.findById(baan.boySleepPlaceId);
    const girl = await Place.findById(baan.girlSleepPlaceId);
    const normal = await Place.findById(baan.normalPlaceId);
    const nongBoys: BasicUser[] = [];
    const nongGirls: BasicUser[] = [];
    const peeBoys: BasicUser[] = [];
    const peeGirls: BasicUser[] = [];
    let j = 0;
    while (j < baan.nongSleepIds.length) {
      const user = await User.findById(baan.nongSleepIds[j++]);
      if (!user) {
        continue;
      }
      ifIsTrue(user.gender == "Male", user, nongBoys);
      ifIsTrue(user.gender == "Female", user, nongGirls);
    }
    j = 0;
    while (j < baan.peeSleepIds.length) {
      const user = await User.findById(baan.peeSleepIds[j++]);
      if (!user) {
        continue;
      }
      ifIsTrue(user.gender == "Male", user, peeBoys);
      ifIsTrue(user.gender == "Female", user, peeGirls);
    }
    baanDatas.push({
      boy,
      girl,
      name: baan.name,
      normal,
      fullName: baan.fullName,
      _id: baan._id,
    });
    baanBoySleeps.push({
      nongNumber: nongBoys.length,
      peeNumber: peeBoys.length,
      petoNumber: 0,
      name: baan.name,
    });
    baanGirlSleeps.push({
      nongNumber: nongGirls.length,
      peeNumber: peeGirls.length,
      petoNumber: 0,
      name: baan.name,
    });
    baanSleepDatas.push({
      name: baan.name,
      nongBoys,
      nongGirls,
      peeBoys,
      peeGirls,
      petoBoys: [],
      petoGirls: [],
    });
    nongBoySleep += nongBoys.length;
    nongGirlSleep += nongGirls.length;
    peeBoySleep += peeBoys.length;
    peeGirlSleep += peeGirls.length;
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    const petoBoys: BasicUser[] = [];
    const petoGirls: BasicUser[] = [];
    const peeBoys: BasicUser[] = [];
    const peeGirls: BasicUser[] = [];
    let j = 0;
    while (j < part.petoSleepIds.length) {
      const user = await User.findById(part.petoSleepIds[j++]);
      if (!user) {
        continue;
      }
      ifIsTrue(user.gender == "Male", user, petoBoys);
      ifIsTrue(user.gender == "Female", user, petoGirls);
    }
    j = 0;
    while (j < part.peeSleepIds.length) {
      const user = await User.findById(part.peeSleepIds[j++]);
      if (!user) {
        continue;
      }
      ifIsTrue(user.gender == "Male", user, peeBoys);
      ifIsTrue(user.gender == "Female", user, peeGirls);
    }
    const place = await Place.findById(part.placeId);
    partDatas.push({ place, name: part.partName, _id: part._id });
    partBoySleeps.push({
      nongNumber: 0,
      peeNumber: peeBoys.length,
      petoNumber: petoBoys.length,
      name: part.partName,
    });
    partGirlSleeps.push({
      nongNumber: 0,
      peeNumber: peeGirls.length,
      petoNumber: petoGirls.length,
      name: part.partName,
    });
    partSleepDatas.push({
      name: part.partName,
      nongBoys: [],
      nongGirls: [],
      peeBoys,
      peeGirls,
      petoBoys,
      petoGirls,
    });
    petoBoySleep += petoBoys.length;
    petoGirlSleep += petoGirls.length;
  }
  const buffer: GetAllPlanData = {
    partDatas,
    baanDatas,
    name: camp.campName,
    _id: camp._id,
    groupName: camp.groupName,
    isOverNightCamp: camp.nongSleepModel != "ไม่มีการค้างคืน",
    isHavePeto:
      camp.memberStructure == "nong->highSchool,pee->1year,peto->2upYear",
    baanSleepDatas,
    partSleepDatas,
    baanBoySleeps,
    baanGirlSleeps,
    partBoySleeps,
    partGirlSleeps,
    boySleepNumber: {
      name: camp.campName,
      nongNumber: nongBoySleep,
      peeNumber: peeBoySleep,
      petoNumber: petoBoySleep,
    },
    girlSleepNumber: {
      name: camp.campName,
      nongNumber: nongGirlSleep,
      peeNumber: peeGirlSleep,
      petoNumber: petoGirlSleep,
    },
  };
  res.status(200).json(buffer);
}
export async function planUpdateCamp(
  req: express.Request,
  res: express.Response
) {
  const update: UpdateAllPlanData = req.body;
  const user = await getUser(req);
  const camp = await Camp.findById(update._id);
  if (!user || !camp) {
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
      if (
        !peeCamp.partId.equals(camp.partBoardId) &&
        !peeCamp.partId.equals(camp.partPlanId)
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
    case "peto": {
      const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
      if (!petoCamp) {
        sendRes(res, false);
        return;
      }
      if (
        petoCamp.partId?.toString() != camp.partBoardId?.toString() &&
        petoCamp.partId?.toString() != camp.partPlanId?.toString()
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
  }
  let i = 0;
  while (i < update.baanDatas.length) {
    const updateBaan = update.baanDatas[i++];
    const baan = await Baan.findById(updateBaan._id);
    if (!baan) {
      continue;
    }
    const { link, name, fullName, nongSendMessage } = baan;
    await updateBaanRaw({
      baanId: baan._id,
      boySleepPlaceId: updateBaan.boyId,
      girlSleepPlaceId: updateBaan.girlId,
      name,
      nongSendMessage,
      normalPlaceId: updateBaan.normalId,
      link,
      fullName,
    });
  }
  i = 0;
  while (i < update.partDatas.length) {
    const updatePart = update.partDatas[i++];
    const part = await Part.findById(updatePart._id);
    if (!part) {
      continue;
    }
    const newPlace = await Place.findById(updatePart.placeId);
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
  }
  sendRes(res, true);
}
export async function editQuestion(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const edit: EditQuestionPack = req.body;
  const camp = await Camp.findById(edit.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const pusher = await getPusherServer(camp.pusherId);
  const systemInfo = getSystemInfoRaw();
  if (
    !user ||
    (user.role != "admin" && !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    res.status(403).json({ success: false });
    return;
  }
  let { choiceQuestionIds, textQuestionIds } = camp;
  for (const {
    question,
    a,
    b,
    c,
    d,
    e,
    scoreA,
    scoreB,
    scoreC,
    scoreD,
    scoreE,
    correct,
    order,
    _id,
  } of edit.choices) {
    if (!_id) {
      const newChoice = await ChoiceQuestion.create({
        question,
        a,
        b,
        c,
        d,
        e,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        campId: camp._id,
        correct,
        order,
      });
      choiceQuestionIds = swop(null, newChoice._id, choiceQuestionIds);
      if (!pusher) {
        continue;
      }
      await pusher.trigger(
        `${systemInfo.choiceQuestionText}${camp._id}`,
        systemInfo.newText,
        newChoice
      );
    } else {
      const choiceQuestion = await ChoiceQuestion.findById(_id);
      if (!choiceQuestion) {
        continue;
      }
      if (
        choiceQuestion.question == question &&
        choiceQuestion.a == a &&
        choiceQuestion.b == b &&
        choiceQuestion.c == c &&
        choiceQuestion.d == d &&
        choiceQuestion.e == e &&
        choiceQuestion.scoreA == scoreA &&
        choiceQuestion.scoreB == scoreB &&
        choiceQuestion.scoreC == scoreC &&
        choiceQuestion.scoreD == scoreD &&
        choiceQuestion.scoreE == scoreE &&
        choiceQuestion.correct == correct &&
        choiceQuestion.order == order
      ) {
        continue;
      }
      await choiceQuestion.updateOne({
        question,
        a,
        b,
        c,
        d,
        e,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        correct,
        order,
      });
      if (!pusher) {
        continue;
      }
      const buffer: TriggerChoiceQuestion = {
        _id,
        question,
        a,
        b,
        c,
        d,
        e,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        correct,
        order,
      };
      await pusher.trigger(
        `${systemInfo.choiceQuestionText}${camp._id}`,
        systemInfo.updateText,
        buffer
      );
    }
  }
  for (const { _id, question, score, order } of edit.texts) {
    if (!_id) {
      const newText = await TextQuestion.create({
        question,
        score,
        campId: camp._id,
        order,
      });
      textQuestionIds = swop(null, newText._id, textQuestionIds);
      if (!pusher) {
        continue;
      }
      pusher.trigger(
        `${systemInfo.textQuestionText}${camp._id}`,
        systemInfo.newText,
        newText
      );
    } else {
      const textQuestion = await TextQuestion.findById(_id);
      if (!textQuestion) {
        continue;
      }
      if (
        textQuestion.question == question &&
        textQuestion.score == score &&
        textQuestion.order == order
      ) {
        continue;
      }
      await textQuestion.updateOne({ question, score, order });
      if (!pusher) {
        continue;
      }
      const buffer: TriggerTextQuestion = {
        _id,
        question,
        score,
        order,
      };
      await pusher.trigger(
        `${systemInfo.textQuestionText}${camp._id}`,
        systemInfo.updateText,
        buffer
      );
    }
  }
  await camp.updateOne({ textQuestionIds, choiceQuestionIds });
  sendRes(res, true);
}
export async function getAllQuestion(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const questions = await getAllQuestionRaw(
    stringToId(req.params.id),
    user._id
  );
  if (!questions) {
    sendRes(res, false);
    return;
  }
  res.status(200).json(questions);
}
async function getAllQuestionRaw(
  campId: Id,
  userId: Id
): Promise<GetAllQuestion | null> {
  const user = await User.findById(userId);
  const camp = await Camp.findById(campId);
  if (!camp || !user) {
    return null;
  }
  const texts: GetTextQuestion[] = [];
  const choices: GetChoiceQuestion[] = [];
  if (camp.mapAnswerPackIdByUserId.has(user._id.toString())) {
    const answerPack = await AnswerContainer.findById(
      camp.mapAnswerPackIdByUserId.get(user._id.toString())
    );
    if (answerPack) {
      const textQuestionIds: Id[] = [];
      for (const textAnswerId of answerPack.textAnswerIds) {
        const textAnswer = await TextAnswer.findById(textAnswerId);
        if (!textAnswer) {
          continue;
        }
        const text = await TextQuestion.findById(textAnswer.questionId);
        if (!text) {
          continue;
        }
        textQuestionIds.push(text._id);
        const { question, _id, campId, answerIds, score, order } = text;
        texts.push({
          question,
          _id,
          campId,
          answer: textAnswer.answer,
          answerIds,
          score,
          order,
          answerId: textAnswer._id,
          answerScore: textAnswer.score,
        });
      }
      const textRemain = removeDuplicate(camp.textQuestionIds, textQuestionIds);
      for (const textId of textRemain) {
        const text = await TextQuestion.findById(textId);
        if (!text) {
          continue;
        }
        const { question, _id, campId, answerIds, score, order } = text;
        texts.push({
          question,
          _id,
          campId,
          answer: "-",
          answerIds,
          score,
          order,
          answerId: null,
          answerScore: 0,
        });
      }
      const choiceQuestionIds: Id[] = [];
      for (const choiceAnswerId of answerPack.choiceAnswerIds) {
        const choiceAnswer = await ChoiceAnswer.findById(choiceAnswerId);
        if (!choiceAnswer) {
          continue;
        }
        const choice = await ChoiceQuestion.findById(choiceAnswer.questionId);
        if (!choice) {
          continue;
        }
        choiceQuestionIds.push(choice._id);
        const {
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          correct,
          order,
          answerIds,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
        } = choice;
        choices.push({
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          correct,
          order,
          answer: choiceAnswer.answer,
          answerIds,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
          answerId: choiceAnswer._id,
        });
      }
      const choiceRemain = removeDuplicate(
        camp.choiceQuestionIds,
        choiceQuestionIds
      );
      for (const choiceId of choiceRemain) {
        const choice = await ChoiceQuestion.findById(choiceId);
        if (!choice) {
          continue;
        }
        const {
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
          correct,
          order,
          answerIds,
        } = choice;
        choices.push({
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
          correct,
          order,
          answer: "-",
          answerIds,
          answerId: null,
        });
      }
    }
  } else {
    for (const textId of camp.textQuestionIds) {
      const text = await TextQuestion.findById(textId);
      if (!text) {
        continue;
      }
      const { question, _id, campId, answerIds, score, order } = text;
      texts.push({
        question,
        _id,
        campId,
        answer: "-",
        answerIds,
        score,
        order,
        answerId: null,
        answerScore: 0,
      });
    }
    for (const choiceId of camp.choiceQuestionIds) {
      const choice = await ChoiceQuestion.findById(choiceId);
      if (!choice) {
        continue;
      }
      const {
        campId,
        question,
        a,
        b,
        c,
        d,
        e,
        _id,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        nongAnswerA,
        nongAnswerB,
        nongAnswerC,
        nongAnswerD,
        nongAnswerE,
        peeAnswerA,
        peeAnswerB,
        peeAnswerC,
        peeAnswerD,
        peeAnswerE,
        correct,
        order,
        answerIds,
      } = choice;
      choices.push({
        campId,
        question,
        a,
        b,
        c,
        d,
        e,
        _id,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        nongAnswerA,
        nongAnswerB,
        nongAnswerC,
        nongAnswerD,
        nongAnswerE,
        peeAnswerA,
        peeAnswerB,
        peeAnswerC,
        peeAnswerD,
        peeAnswerE,
        correct,
        order,
        answer: "-",
        answerIds,
        answerId: null,
      });
    }
  }
  const pusherData = await PusherData.findById(camp.pusherId);
  const buffer: GetAllQuestion = {
    choices,
    texts,
    canAnswerTheQuestion: camp.canAnswerTheQuestion,
    pusherData: getPusherClient(pusherData),
  };
  return buffer;
}
export async function answerAllQuestion(
  answer: AnswerPack,
  userId: Id,
  role: RoleCamp
) {
  const camp = await Camp.findById(answer.campId);
  const user = await User.findById(userId);
  if (!camp || !user) {
    return;
  }
  const choiceAnswerIds: Id[] = [];
  const textAnswerIds: Id[] = [];
  let answerContainer = await AnswerContainer.findById(
    camp.mapAnswerPackIdByUserId.get(user._id.toString())
  );
  if (!answerContainer) {
    answerContainer = await AnswerContainer.create({
      campId: camp._id,
      userId: user._id,
      role,
    });
    switch (role) {
      case "nong": {
        await user.updateOne({
          nongAnswerPackIds: swop(
            null,
            answerContainer._id,
            user.nongAnswerPackIds
          ),
        });
        camp.mapAnswerPackIdByUserId.set(
          user._id.toString(),
          answerContainer._id
        );
        await camp.updateOne({
          nongAnswerPackIds: swop(
            null,
            answerContainer._id,
            camp.nongAnswerPackIds
          ),
          mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
        });
        break;
      }
      case "pee": {
        await user.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            user.peeAnswerPackIds
          ),
        });
        camp.mapAnswerPackIdByUserId.set(
          user._id.toString(),
          answerContainer._id
        );
        await camp.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            camp.peeAnswerPackIds
          ),
          mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
          peeAnswerIds: swop(null, user._id, camp.peeAnswerIds),
        });
        break;
      }
      case "peto": {
        await user.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            user.peeAnswerPackIds
          ),
        });
        camp.mapAnswerPackIdByUserId.set(
          user._id.toString(),
          answerContainer._id
        );
        await camp.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            camp.peeAnswerPackIds
          ),
          mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
          peeAnswerIds: swop(null, user._id, camp.peeAnswerIds),
        });
        break;
      }
    }
  }
  for (const textAnswerPack of answer.textAnswers) {
    const question = await TextQuestion.findById(textAnswerPack.questionId);
    if (!question) {
      continue;
    }
    let textAnswer = await TextAnswer.findById(textAnswerPack.answerId);
    if (!textAnswer) {
      textAnswer = await TextAnswer.create({
        answer: textAnswerPack.answer,
        userId: user._id,
        questionId: question._id,
        containerId: answerContainer._id,
      });
      await question.updateOne({
        answerIds: swop(null, textAnswer._id, question.answerIds),
      });
    } else {
      await textAnswer.updateOne({ answer: textAnswerPack.answer });
    }
    textAnswerIds.push(textAnswer._id);
  }
  for (const choiceAnswerPack of answer.choiceAnswers) {
    const question1 = await ChoiceQuestion.findById(
      choiceAnswerPack.questionId
    );
    if (!question1) {
      continue;
    }
    let choiceAnswer = await ChoiceAnswer.findById(choiceAnswerPack.answerId);
    let score: number;
    switch (choiceAnswerPack.answer) {
      case "A": {
        score = question1.scoreA;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerA: question1.nongAnswerA + 1 });
        } else {
          await question1.updateOne({ peeAnswerA: question1.peeAnswerA + 1 });
        }
        break;
      }
      case "B": {
        score = question1.scoreB;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerB: question1.nongAnswerB + 1 });
        } else {
          await question1.updateOne({ peeAnswerB: question1.peeAnswerB + 1 });
        }
        break;
      }
      case "C": {
        score = question1.scoreC;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerC: question1.nongAnswerC + 1 });
        } else {
          await question1.updateOne({ peeAnswerC: question1.peeAnswerC + 1 });
        }
        break;
      }
      case "D": {
        score = question1.scoreD;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerD: question1.nongAnswerD + 1 });
        } else {
          await question1.updateOne({ peeAnswerD: question1.peeAnswerD + 1 });
        }
        break;
      }
      case "E": {
        score = question1.scoreE;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerE: question1.nongAnswerE + 1 });
        } else {
          await question1.updateOne({ peeAnswerE: question1.peeAnswerE + 1 });
        }
        break;
      }
      case "-": {
        score = 0;
        break;
      }
    }
    const question2 = await ChoiceQuestion.findById(question1._id);
    if (!question2) {
      continue;
    }
    if (!choiceAnswer) {
      choiceAnswer = await ChoiceAnswer.create({
        campId: camp._id,
        answer: choiceAnswerPack.answer,
        score,
        questionId: question2._id,
        userId: user._id,
        containerId: answerContainer._id,
      });
      await question2.updateOne({
        answerIds: swop(null, choiceAnswer._id, question2.answerIds),
      });
    } else {
      switch (choiceAnswer.answer) {
        case "A": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerA: question2.nongAnswerA - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerA: question2.peeAnswerA - 1 });
          }
          break;
        }
        case "B": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerB: question2.nongAnswerB - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerB: question2.peeAnswerB - 1 });
          }
          break;
        }
        case "C": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerC: question2.nongAnswerC - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerC: question2.peeAnswerC - 1 });
          }
          break;
        }
        case "D": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerD: question2.nongAnswerD - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerD: question2.peeAnswerD - 1 });
          }
          break;
        }
        case "E": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerE: question2.nongAnswerE - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerE: question2.peeAnswerE - 1 });
          }
          break;
        }
        case "-": {
          break;
        }
      }
      await choiceAnswer.updateOne({ score, answer: choiceAnswerPack.answer });
    }
    choiceAnswerIds.push(choiceAnswer._id);
  }
  await answerContainer.updateOne({
    choiceAnswerIds,
    textAnswerIds,
  });
}
export async function deleteChoiceQuestion(
  req: express.Request,
  res: express.Response
) {
  const question = await ChoiceQuestion.findById(req.params.id);
  if (!question) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(question.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  await camp.updateOne({
    choiceQuestionIds: swop(question._id, null, camp.choiceQuestionIds),
  });
  let i = 0;
  while (i < question.answerIds.length) {
    const answer = await ChoiceAnswer.findById(question.answerIds[i++]);
    if (!answer) {
      continue;
    }
    const answerContainer = await AnswerContainer.findById(answer.containerId);
    if (!answerContainer) {
      continue;
    }
    await answerContainer.updateOne({
      choiceAnswerIds: swop(answer._id, null, answerContainer.choiceAnswerIds),
    });
    await answer.deleteOne();
  }
  await question.deleteOne();
  sendRes(res, true);
}
export async function deleteTextQuestion(
  req: express.Request,
  res: express.Response
) {
  const question = await TextQuestion.findById(req.params.id);
  if (!question) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(question.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  await camp.updateOne({
    textQuestionIds: swop(question._id, null, camp.textQuestionIds),
  });
  let i = 0;
  while (i < question.answerIds.length) {
    const answer = await TextAnswer.findById(question.answerIds[i++]);
    if (!answer) {
      continue;
    }
    const answerContainer = await AnswerContainer.findById(answer.containerId);
    if (!answerContainer) {
      continue;
    }
    await answerContainer.updateOne({
      textAnswerIds: swop(answer._id, null, answerContainer.textAnswerIds),
    });
    await answer.deleteOne();
  }
  await question.deleteOne();
  sendRes(res, true);
}
export async function peeAnswerQuestion(
  req: express.Request,
  res: express.Response
) {
  const answer: AnswerPack = req.body;
  const camp = await Camp.findById(answer.campId);
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
  await answerAllQuestion(answer, user._id, campMemberCard.role);
  sendRes(res, true);
}
export async function plusActionPlan(
  req: express.Request,
  res: express.Response
) {
  const input: { campId: Id; plus: number } = req.body;
  const user = await getUser(req);
  const camp = await Camp.findById(input.campId);
  if (
    !user ||
    !camp ||
    (!camp.peeIds.includes(user._id) && !camp.petoIds.includes(user._id))
  ) {
    sendRes(res, false);
    return;
  }
  await camp.updateOne({
    actionPlanOffset: camp.actionPlanOffset + input.plus,
  });
  sendRes(res, true);
}
export async function getAllAnswerAndQuestion(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (
    !camp ||
    !user ||
    (camp.nongIds.includes(user._id) &&
      !(
        camp.canNongSeeAllAnswer &&
        (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
      ))
  ) {
    sendRes(res, false);
    return;
  }
  const nongsAnswers: UserAndAllQuestionPack[] = [];
  const peeAnswers: UserAndAllQuestionPack[] = [];
  const mainChoices: InterChoiceQuestion[] = [];
  const mainTexts: InterTextQuestion[] = [];
  const nongPendingAnswers: UserAndAllQuestionPack[] = [];
  const nongPassAnswers: UserAndAllQuestionPack[] = [];
  const nongSureAnswers: UserAndAllQuestionPack[] = [];
  const nongPaidAnswers: UserAndAllQuestionPack[] = [];
  const nongInterviewAnswers: UserAndAllQuestionPack[] = [];
  for (const userId of camp.nongIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongsAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const userId of camp.peeAnswerIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      peeAnswers.push({
        user,
        questions,
      });
    }
  }
  const nongPendingIds: Id[] = [];
  camp.nongPendingIds.forEach((v, k) => {
    nongPendingIds.push(stringToId(k));
  });
  for (const userId of nongPendingIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongPendingAnswers.push({
        user,
        questions,
      });
    }
  }
  const nongInterviewIds: Id[] = [];
  camp.nongInterviewIds.forEach((v, k) => {
    nongInterviewIds.push(stringToId(k));
  });
  for (const userId of nongInterviewIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongInterviewAnswers.push({
        user,
        questions,
      });
    }
  }
  const nongPassIds: Id[] = [];
  camp.nongPassIds.forEach((v, k) => {
    nongPassIds.push(stringToId(k));
  });
  for (const userId of removeDuplicate(nongPassIds, camp.nongPaidIds)) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongPassAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const userId of camp.nongPaidIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongPaidAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const userId of camp.nongSureIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongSureAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const id of camp.choiceQuestionIds) {
    const question = await ChoiceQuestion.findById(id);
    if (question) {
      mainChoices.push(question);
    }
  }
  for (const id of camp.textQuestionIds) {
    const question = await TextQuestion.findById(id);
    if (question) {
      mainTexts.push(question);
    }
  }
  const pusherData = await PusherData.findById(camp.pusherId);
  const buffer: GetAllAnswerAndQuestion = {
    nongInterviewAnswers,
    nongPaidAnswers,
    nongPassAnswers,
    nongPendingAnswers,
    nongsAnswers,
    nongSureAnswers,
    mainChoices,
    mainTexts,
    peeAnswers,
    success: true,
    groupName: camp.groupName,
    pusherData,
    systemInfo: getSystemInfoRaw(),
    canScoring: camp.lockChangeQuestion && !camp.canAnswerTheQuestion,
  };
  res.status(200).json(buffer);
}
export async function scoreTextQuestions(
  req: express.Request,
  res: express.Response
) {
  const input: ScoreTextQuestions = req.body;
  const camp = await Camp.findById(input.campId);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCard || campMemberCard.role == "nong") {
    sendRes(res, false);
    return;
  }
  for (const i1 of input.scores) {
    for (const { id, score } of i1) {
      await TextAnswer.findByIdAndUpdate(id, { score });
    }
  }
  sendRes(res, true);
}

function isHaveExtra(input: HeathIssuePack): boolean {
  return input.heathIssue.chronicDisease != "" || input.heathIssue.extra != "";
}
export async function getHealthIssueForAct(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const nongHealths: HeathIssuePack[] = [];
  const peeHealths: HeathIssuePack[] = [];
  const petoHealths: HeathIssuePack[] = [];
  const baanHealthIssuePacks: ShowHealthIssuePack[] = [];
  const partHealthIssuePacks: ShowHealthIssuePack[] = [];
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    const welfareBaan: ShowHealthIssuePack = {
      name: `${camp.groupName}${baan.name}`,
      nongHealths: await getHealthIssuePack(
        baan.nongCampMemberCardHaveHeathIssueIds,
        isHaveExtra,
        nongHealths
      ),
      peeHealths: await getHealthIssuePack(
        baan.peeCampMemberCardHaveHeathIssueIds,
        isHaveExtra,
        peeHealths
      ),
      petoHealths: [],
    };
    baanHealthIssuePacks.push(welfareBaan);
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    const welfarePart: ShowHealthIssuePack = {
      name: `ฝ่าย${part.partName}`,
      nongHealths: [],
      peeHealths: await getHealthIssuePack(
        part.peeCampMemberCardHaveHeathIssueIds,
        isHaveExtra
      ),
      petoHealths: await getHealthIssuePack(
        part.petoCampMemberCardHaveHeathIssueIds,
        isHaveExtra,
        petoHealths
      ),
    };
    partHealthIssuePacks.push(welfarePart);
  }
  const buffer: CampHealthIssuePack = {
    isHavePeto:
      camp.memberStructure == "nong->highSchool,pee->1year,peto->2upYear",
    baanHealthIssuePacks,
    partHealthIssuePacks,
    groupName: camp.groupName,
    campHealthIssuePack: {
      nongHealths,
      peeHealths,
      petoHealths,
      name: camp.campName,
    },
  };
  res.status(200).json(buffer);
}
function isMedicalValid(input: HeathIssuePack): boolean {
  return (
    input.heathIssue.medicine != "" ||
    input.heathIssue.extra != "" ||
    input.heathIssue.chronicDisease != "" ||
    input.heathIssue.isWearing
  );
}
function isCoopValid(input: HeathIssuePack): boolean {
  return (
    input.heathIssue.extra != "" ||
    input.heathIssue.chronicDisease != "" ||
    input.heathIssue.isWearing
  );
}
export async function getMedicalHealthIssue(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const nongHealths: HeathIssuePack[] = [];
  const peeHealths: HeathIssuePack[] = [];
  const petoHealths: HeathIssuePack[] = [];
  const baanHealthIssuePacks: ShowHealthIssuePack[] = [];
  const partHealthIssuePacks: ShowHealthIssuePack[] = [];
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    const welfareBaan: ShowHealthIssuePack = {
      name: `${camp.groupName}${baan.name}`,
      nongHealths: await getHealthIssuePack(
        baan.nongCampMemberCardHaveHeathIssueIds,
        isMedicalValid,
        nongHealths
      ),
      peeHealths: await getHealthIssuePack(
        baan.peeCampMemberCardHaveHeathIssueIds,
        isMedicalValid,
        peeHealths
      ),
      petoHealths: [],
    };
    baanHealthIssuePacks.push(welfareBaan);
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    const welfarePart: ShowHealthIssuePack = {
      name: `ฝ่าย${part.partName}`,
      nongHealths: [],
      peeHealths: await getHealthIssuePack(
        part.peeCampMemberCardHaveHeathIssueIds,
        isMedicalValid
      ),
      petoHealths: await getHealthIssuePack(
        part.petoCampMemberCardHaveHeathIssueIds,
        isMedicalValid,
        petoHealths
      ),
    };
    partHealthIssuePacks.push(welfarePart);
  }
  const buffer: CampHealthIssuePack = {
    isHavePeto:
      camp.memberStructure == "nong->highSchool,pee->1year,peto->2upYear",
    baanHealthIssuePacks,
    partHealthIssuePacks,
    groupName: camp.groupName,
    campHealthIssuePack: {
      nongHealths,
      peeHealths,
      petoHealths,
      name: camp.campName,
    },
  };
  res.status(200).json(buffer);
}
export async function getCoopData(req: express.Request, res: express.Response) {
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
  const boy = await Place.findById(baan.boySleepPlaceId);
  const girl = await Place.findById(baan.girlSleepPlaceId);
  const normal = await Place.findById(baan.normalPlaceId);
  const nongHealths = await getHealthIssuePack(
    baan.nongCampMemberCardHaveHeathIssueIds,
    isCoopValid
  );
  const peeHealths = await getHealthIssuePack(
    baan.peeCampMemberCardHaveHeathIssueIds,
    isCoopValid
  );
  const buffer: GetCoopData = {
    baan,
    camp,
    boy,
    girl,
    normal,
    nongHealths,
    peeHealths,
  };
  res.status(200).json(buffer);
}
export async function getAllNongRegister(
  req: express.Request,
  res: express.Response
) {
  const out = getAllNongRegisterRaw(stringToId(req.params.id));
  if (!out) {
    sendRes(res, false);
    return;
  }
  res.status(200).json(out);
}
async function getAllNongRegisterRaw(campId: Id) {
  const camp: InterCampBack | null = await Camp.findById(campId);
  if (!camp) {
    return null;
  }
  interface Buffer {
    userId: Id;
    link: string;
  }
  const interviewBuffers: Buffer[] = [];
  const pendingBuffers: Buffer[] = [];
  const passBuffers: Buffer[] = [];
  const paidBuffers: Buffer[] = [];
  const sureBuffers: Buffer[] = [];
  const { interviews, pendings, passs, paids, sures }: AllNongRegister = {
    interviews: [],
    pendings: [],
    passs: [],
    paids: [],
    sures: [],
  };
  camp.nongPendingIds.forEach((link, userId) => {
    pendingBuffers.push({ link, userId });
  });
  camp.nongInterviewIds.forEach((link, userId) => {
    interviewBuffers.push({ link, userId });
  });
  camp.nongPassIds.forEach((link, userId) => {
    passBuffers.push({ link, userId });
  });
  camp.nongPaidIds.forEach((userId) => {
    paidBuffers.push({ link: camp.nongPassIds.get(userId) as string, userId });
  });
  camp.nongSureIds.forEach((userId) => {
    sureBuffers.push({ link: "", userId });
  });
  let i = 0;
  while (i < pendingBuffers.length) {
    const { userId, link } = pendingBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    pendings.push({ user, localId, link });
  }
  while (i < interviewBuffers.length) {
    const { userId, link } = interviewBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    interviews.push({ user, localId, link });
  }
  while (i < passBuffers.length) {
    const { userId, link } = passBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    passs.push({ user, localId, link });
  }
  while (i < paidBuffers.length) {
    const { userId, link } = paidBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    paids.push({ user, localId, link });
  }
  while (i < sureBuffers.length) {
    const { userId, link } = sureBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    sures.push({ user, localId, link });
  }
  const out: AllNongRegister = { interviews, pendings, passs, paids, sures };
  return out;
}
export async function getActionPlanByCampId(
  req: express.Request,
  res: express.Response
) {
  try {
    const camp = await Camp.findById(req.params.id);
    const data: showActionPlan[] = [];
    const user = await getUser(req);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllActionPlan &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let j = 0;
    while (j <= camp.actionPlanIds.length) {
      const actionPlan: InterActionPlan | null = await ActionPlan.findById(
        camp.actionPlanIds[j++]
      );
      if (!actionPlan) {
        continue;
      }
      const {
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        partName,
        _id,
      } = actionPlan;
      const user = await User.findById(headId);
      if (!user) {
        continue;
      }
      let k = 0;
      const placeName: string[] = [];
      while (k < placeIds.length) {
        const place = await Place.findById(placeIds[k++]);
        const building = await Building.findById(place?.buildingId);
        placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
      }
      data.push({
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        headName: user.nickname,
        headTel: user.tel,
        partName,
        placeName,
        _id,
      });
    }
    data.sort((a, b) => a.start.getTime() - b.start.getTime());
    const buffer: SuccessBase<showActionPlan[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
export async function getWorkingItemByCampId(
  req: express.Request,
  res: express.Response
) {
  try {
    const camp = await Camp.findById(req.params.id);
    const data: InterWorkingItem[] = [];
    const user = await getUser(req);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllTrackingSheet &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let j = 0;
    while (j < camp.workItemIds.length) {
      const workItem: InterWorkingItem | null = await WorkItem.findById(
        camp.workItemIds[j++]
      );
      if (!workItem) {
        continue;
      }
      const {
        name,
        link,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        password,
        partName,
      } = workItem;
      const isMatch = await bcrypt.compare(user.linkHash, password);
      if (isMatch) {
        data.push({
          link,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      } else {
        data.push({
          link: null,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      }
    }
    const buffer: SuccessBase<InterWorkingItem[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
export async function getParts(req: express.Request, res: express.Response) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (
    !camp ||
    !user ||
    (camp.nongIds.includes(user._id) &&
      !(user.role != "nong" || camp.canNongAccessDataWithRoleNong))
  ) {
    sendRes(res, false);
    return;
  }
  const parts: BasicPart[] = [];
  let i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    parts.push(part);
  }
  res.status(200).json(parts);
}
async function getMealsByHealthIssue(
  healthIssue: HeathIssueBody | null,
  mealIds: Id[],
  campMemberCard: InterCampMemberCard
) {
  const output: GetMeals[] = [];
  let i = 0;
  while (i < mealIds.length) {
    let j = 0;
    const meal = await Meal.findById(mealIds[i++]);
    const whiteLists: InterFood[] = [];
    const blackLists: InterFood[] = [];
    if (!meal) {
      continue;
    }
    if (!healthIssue) {
      while (j < meal.foodIds.length) {
        const food = await Food.findById(meal.foodIds[j++]);
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
      while (j < meal.foodIds.length) {
        const food = await Food.findById(meal.foodIds[j++]);
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
    output.push({
      time: meal.time,
      whiteLists,
      blackLists,
    });
  }
  return output;
}
export async function getNongCampData(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (!user || !camp) {
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
  async function getShowPlace(placeId: Id | null): Promise<ShowPlace | null> {
    if (placeId) {
      const place = await Place.findById(placeId);
      if (!place) {
        return null;
      }
      const building = await Building.findById(place.buildingId);
      if (!building) {
        return null;
      }
      return {
        _id: place._id,
        buildingName: building.name,
        floor: place.floor,
        room: place.room,
      };
    } else {
      return null;
    }
  }
  const boy: ShowPlace | null = await getShowPlace(baan.boySleepPlaceId);
  const girl: ShowPlace | null = await getShowPlace(baan.girlSleepPlaceId);
  const normal: ShowPlace | null = await getShowPlace(baan.normalPlaceId);
  const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
  const meals = await getMealsByHealthIssue(
    healthIssue,
    camp.mealIds,
    campMemberCard
  );
  const nongs = await getNongsFromBaanIdRaw(baan._id);
  const pees = await getPeesFromBaanIdRaw(baan._id);
  let displayOffset: UpdateTimeOffsetRaw | null = await TimeOffset.findById(
    user.displayOffsetId
  );
  if (!displayOffset) {
    displayOffset = {
      day: 0,
      hour: 0,
      minute: 0,
    };
  }
  const buffer: GetNongData = {
    baan,
    camp,
    boy,
    girl,
    normal,
    nongs,
    pees,
    meals,
    campMemberCard,
    healthIssue: healthIssue
      ? healthIssue
      : {
          food: "",
          medicine: "",
          chronicDisease: "",
          isWearing: false,
          spicy: false,
          foodConcern: "",
          foodLimit: "ไม่มีข้อจำกัดด้านความเชื่อ",
          extra: "",
        },
    user,
    displayOffset,
  };
  res.status(200).json(buffer);
}
export async function getPeeCampData(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (!user || !camp) {
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
  const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
  if (!peeCamp) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(peeCamp.baanId);
  const part = await Part.findById(peeCamp.partId);
  if (!baan || !part) {
    sendRes(res, false);
    return;
  }
  async function getShowPlace(placeId: Id | null): Promise<ShowPlace | null> {
    if (placeId) {
      const place = await Place.findById(placeId);
      if (!place) {
        return null;
      }
      const building = await Building.findById(place.buildingId);
      if (!building) {
        return null;
      }
      return {
        _id: place._id,
        buildingName: building.name,
        floor: place.floor,
        room: place.room,
      };
    } else {
      return null;
    }
  }
  const boy: ShowPlace | null = await getShowPlace(baan.boySleepPlaceId);
  const girl: ShowPlace | null = await getShowPlace(baan.girlSleepPlaceId);
  const normal: ShowPlace | null = await getShowPlace(baan.normalPlaceId);
  const partPlace = await getShowPlace(part.placeId);
  const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
  const meals = await getMealsByHealthIssue(
    healthIssue,
    camp.mealIds,
    campMemberCard
  );
  const nongBaans = await getNongsFromBaanIdRaw(baan._id);
  const peeBaans = await getPeesFromBaanIdRaw(baan._id);
  const peeParts = await getPeesFromPartIdRaw(part._id);
  const petoParts = await getPetosFromPartIdRaw(part._id);
  let displayOffset: UpdateTimeOffsetRaw | null = await TimeOffset.findById(
    user.displayOffsetId
  );
  if (!displayOffset) {
    displayOffset = {
      day: 0,
      hour: 0,
      minute: 0,
    };
  }
  let selectOffset: UpdateTimeOffsetRaw | null = await TimeOffset.findById(
    user.selectOffsetId
  );
  if (!selectOffset) {
    selectOffset = {
      day: 0,
      hour: 0,
      minute: 0,
    };
  }
  const buffer: GetPeeData = {
    baan,
    camp,
    part,
    boy,
    girl,
    normal,
    partPlace,
    nongBaans,
    peeBaans,
    meals,
    campMemberCard,
    healthIssue: healthIssue
      ? healthIssue
      : {
          food: "",
          medicine: "",
          chronicDisease: "",
          isWearing: false,
          spicy: false,
          foodConcern: "",
          foodLimit: "ไม่มีข้อจำกัดด้านความเชื่อ",
          extra: "",
        },
    user,
    displayOffset,
    selectOffset,
    petoParts,
    peeParts,
  };
  res.status(200).json(buffer);
}
export async function getPetoCampData(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (!user || !camp) {
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
  const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
  if (!petoCamp) {
    sendRes(res, false);
    return;
  }
  const part = await Part.findById(petoCamp.partId);
  if (!part) {
    sendRes(res, false);
    return;
  }
  async function getShowPlace(placeId: Id | null): Promise<ShowPlace | null> {
    if (placeId) {
      const place = await Place.findById(placeId);
      if (!place) {
        return null;
      }
      const building = await Building.findById(place.buildingId);
      if (!building) {
        return null;
      }
      return {
        _id: place._id,
        buildingName: building.name,
        floor: place.floor,
        room: place.room,
      };
    } else {
      return null;
    }
  }
  const partPlace = await getShowPlace(part.placeId);
  const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
  const meals = await getMealsByHealthIssue(
    healthIssue,
    camp.mealIds,
    campMemberCard
  );
  const pees = await getPeesFromPartIdRaw(part._id);
  const petos = await getPetosFromPartIdRaw(part._id);
  let displayOffset: UpdateTimeOffsetRaw | null = await TimeOffset.findById(
    user.displayOffsetId
  );
  if (!displayOffset) {
    displayOffset = {
      day: 0,
      hour: 0,
      minute: 0,
    };
  }
  let selectOffset: UpdateTimeOffsetRaw | null = await TimeOffset.findById(
    user.selectOffsetId
  );
  if (!selectOffset) {
    selectOffset = {
      day: 0,
      hour: 0,
      minute: 0,
    };
  }
  const buffer: GetPetoData = {
    camp,
    part,
    partPlace,
    meals,
    campMemberCard,
    healthIssue: healthIssue
      ? healthIssue
      : {
          food: "",
          medicine: "",
          chronicDisease: "",
          isWearing: false,
          spicy: false,
          foodConcern: "",
          foodLimit: "ไม่มีข้อจำกัดด้านความเชื่อ",
          extra: "",
        },
    user,
    displayOffset,
    selectOffset,
    petos,
    pees,
  };
  res.status(200).json(buffer);
}

export async function getPartForUpdate(
  req: express.Request,
  res: express.Response
) {
  const part = await Part.findById(req.params.id);
  if (!part) {
    sendRes(res, false);
    return;
  }
  const place = await Place.findById(part.placeId);
  const buffer: GetPartForPlan = {
    name: part.partName,
    place,
    _id: part._id,
  };
  res.status(200).json(buffer);
}
export async function getRegisterData(
  req: express.Request,
  res: express.Response
) {
  const out = await getRegisterDataRaw(stringToId(req.params.id));
  if (!out) {
    sendRes(res, false);
    return;
  }
  res.status(200).json(out);
}
async function getRegisterDataRaw(campId: Id): Promise<RegisterData | null> {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return null;
  }
  let i = 0;
  const regisParts: RegisPart[] = [];
  const regisBaans: RegisBaan[] = [];
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    regisBaans.push({
      baan,
      pees: await getPeesFromBaanIdRaw(baan._id),
      nongs: await getNongsFromBaanIdRaw(baan._id),
    });
  }
  i = 0;
  const partMap: MyMap[] = [];
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    regisParts.push({
      part,
      pees: await getPeesFromPartIdRaw(part._id),
      petos: await getPetosFromPartIdRaw(part._id),
    });
    partMap.push({ key: part._id, value: part.partName });
  }
  const peeRegisters = await getShowRegistersRaw(camp._id);
  const nongRegister = await getAllNongRegisterRaw(camp._id);
  if (!peeRegisters || !nongRegister) {
    return null;
  }
  const pusherData = await PusherData.findById(camp.pusherId);
  return {
    partBoardIdString: camp.partBoardId?.toString() || "",
    partRegisterIdString: camp.partRegisterId?.toString() || "",
    partMap,
    peeRegisters,
    nongRegister,
    camp,
    regisBaans,
    regisParts,
    pusher: getPusherClient(pusherData),
    systemInfo: getSystemInfoRaw(),
  };
}
export async function triggerRegister(campId: Id, pusherId: Id | null) {
  const data = getRegisterDataRaw(campId);
  if (!data) {
    return;
  }
  const pusherServer = await getPusherServer(pusherId);
  if (!pusherServer) {
    return;
  }
  await pusherServer.trigger(
    `register${campId}`,
    getSystemInfoRaw().manageText,
    data
  );
}
export async function getPusherServer(
  pusherId: Id | null
): Promise<Pusher | null> {
  const pusherData = await PusherData.findById(pusherId);
  if (!pusherData) {
    return null;
  }
  return new Pusher(pusherData);
}
export async function getPusherData(
  req: express.Request,
  res: express.Response
) {
  try {
    const pusherData = await PusherData.findById(req.params.id);
    res.status(200).json(pusherData);
  } catch {
    res.status(400).json(null);
  }
}
export async function getCampState(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const camp = await Camp.findById(req.params.id);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  const questions = await getAllQuestionRaw(camp._id, user._id);
  if (!questions) {
    sendRes(res, false);
    return;
  }
  let out: CampState;
  if (camp.nongIds.includes(user._id)) {
    out = { camp, questions, state: "nong", link: "", user };
  } else if (camp.peeIds.includes(user._id)) {
    out = { camp, questions, state: "pee", link: "", user };
  } else if (camp.petoIds.includes(user._id)) {
    out = { camp, questions, state: "peto", link: "", user };
  } else if (camp.nongPendingIds.has(user._id.toString())) {
    out = {
      camp,
      questions,
      state: "pending",
      link: camp.nongPendingIds.get(user._id.toString()) || "",
      user,
    };
  } else if (camp.nongInterviewIds.has(user._id.toString())) {
    out = {
      camp,
      questions,
      state: "interview",
      link: camp.nongInterviewIds.get(user._id.toString()) || "",
      user,
    };
  } else if (camp.nongPassIds.has(user._id.toString())) {
    out = {
      camp,
      questions,
      state: "pass",
      link: camp.nongPassIds.get(user._id.toString()) || "",
      user,
    };
  } else if (camp.nongPaidIds.includes(user._id)) {
    out = {
      camp,
      questions,
      state: "paid",
      link: camp.nongPassIds.get(user._id.toString()) || "",
      user,
    };
  } else if (camp.nongSureIds.includes(user._id)) {
    out = { camp, questions, state: "sure", link: "", user };
  } else if (camp.peePassIds.has(user._id.toString())) {
    out = {
      camp,
      questions,
      state: "peePass",
      link: camp.peePassIds.get(user._id.toString())?.toString() || "",
      user,
    };
  } else {
    out = { camp, questions, state: "notRegister", link: "", user };
  }
  res.status(200).json(out);
}
