import Camp from "../../models/Camp";
import { ifIsTrue, sendRes, startSize, stringToId, swop } from "../setup";
import express from "express";
import { getUser } from "../../middleware/auth";
import { Id } from "../../models/interface";
import Baan from "../../models/Baan";
import CampMemberCard from "../../models/CampMemberCard";
import HeathIssue from "../../models/HeathIssue";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import User from "../../models/User";
import { answerAllQuestion } from "./questionAndAnswer";
import { getRegisterDataRaw } from "./authPart";
export async function interview(req: express.Request, res: express.Response) {
  const { members, campId } = req.body;
  await interviewRaw(members, campId);
  const newData = await getRegisterDataRaw(campId);
  res.status(200).json(newData);
}
async function interviewRaw(members: Id[], campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return 0;
  }
  let i = 0;
  while (i < members.length) {
    camp.nongInterviewIds.set(
      members[i].toString(),
      camp.nongPendingIds.get(members[i].toString()) as string
    );
    camp.nongPendingIds.delete(members[i++].toString());
  }
  await camp.updateOne({
    nongPendingIds: camp.nongPendingIds,
    nongInterviewIds: camp.nongInterviewIds,
  });
}
async function passRaw(members: Id[], campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return 0;
  }
  let i = 0;
  while (i < members.length) {
    camp.nongPassIds.set(
      members[i].toString(),
      camp.nongInterviewIds.get(members[i].toString()) as string
    );
    camp.nongInterviewIds.delete(members[i++].toString());
    if (camp.registerModel === "noPaid") {
      //camp.nongPaidIds.push(members[i - 1])
    }
  }
  await camp.updateOne({
    nongPassIds: camp.nongPassIds,
    nongInterviewIds: camp.nongInterviewIds,
    //nongPaidIds:camp.nongPaidIds
  });
}
export async function paid(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const camp = await Camp.findById(req.params.id);
  if (!camp || !user || !camp.nongPassIds.has(user._id.toString())) {
    sendRes(res, false);
    return;
  }
  if (camp.registerModel === "noPaid") {
    camp.nongPassIds.delete(user._id.toString());
    await camp.updateOne({
      nongSureIds: swop(null, user._id, camp.nongSureIds),
      nongPassIds: camp.nongPassIds,
    });
  } else {
    await camp.updateOne({
      nongPaidIds: swop(null, user._id, camp.nongPaidIds),
    });
  }
  const newData = await getRegisterDataRaw(camp._id);
  res.status(200).json(newData);
}
export async function sure(req: express.Request, res: express.Response) {
  const { members, campId }: { members: Id[]; campId: Id } = req.body;
  const camp = await Camp.findById(campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const nongSureIds = camp.nongSureIds;
  let nongPaidIds = camp.nongPaidIds;

  let i = 0;
  while (i < members.length) {
    if (!camp.nongPaidIds.includes(stringToId(members[i].toString()))) {
      i++;
      continue;
    }
    camp.nongPassIds.delete(members[i].toString());
    nongPaidIds = swop(members[i], null, nongPaidIds);
    nongSureIds.push(members[i++]);
  }
  await camp.updateOne({
    nongPaidIds,
    nongSureIds,
    nongPassIds: camp.nongPassIds,
  });
  const newData = await getRegisterDataRaw(camp._id);
  res.status(200).json(newData);
}
export async function pass(req: express.Request, res: express.Response) {
  const { campId, members } = req.body;
  const camp = await Camp.findById(campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  if (camp.registerModel !== "all") {
    await interviewRaw(members, campId);
  }
  await passRaw(members, campId);
  const newData = await getRegisterDataRaw(camp._id);
  res.status(200).json(newData);
}
export async function kickPee(req: express.Request, res: express.Response) {
  // const { campId, members } = req.body;
  // const camp = await Camp.findById(campId);
  // if (!camp) {
  //   sendRes(res, false);
  //   return;
  // }
  // const im = await getImpotentPartIdBCRP(camp._id);
  // await changePartRaw(members, im[3]);
  sendRes(res, true);
}
export async function kickNong(req: express.Request, res: express.Response) {
  const { members, campId }: { members: Id[]; campId: Id } = req.body;
  const camp = await Camp.findById(campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  let { nongPaidIds } = camp;
  while (i < members.length) {
    camp.nongInterviewIds.delete(members[i].toString());
    camp.nongPendingIds.delete(members[i].toString());
    camp.nongPassIds.delete(members[i].toString());
    camp.outRoundIds.push(members[i]);
    nongPaidIds = swop(members[i++], null, nongPaidIds);
  }
  await camp.updateOne({
    nongPendingIds: camp.nongPendingIds,
    nongInterviewIds: camp.nongInterviewIds,
    nongPaidIds,
    nongPassIds: camp.nongPassIds,
    outRoundIds: camp.outRoundIds,
  });
  sendRes(res, true);
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
      baan.nongIds.push(user._id);
      camp.nongIds.push(user._id);
      nongCamp.nongIds.push(user._id);
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
      await user.updateOne({
        nongCampIds: user.nongCampIds,
        campMemberCardIds: user.campMemberCardIds,
      });
    }
    size.forEach((v, k) => {
      camp.nongShirtSize.set(k, (camp.nongShirtSize.get(k) as number) + v);
      baan.nongShirtSize.set(k, (baan.nongShirtSize.get(k) as number) + v);
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
    if (part.auths.length) {
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
        authPartIds: ifIsTrue(
          part.auths.length > 0,
          part._id,
          user.authPartIds
        ),
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
      authPartIds: ifIsTrue(part.auths.length > 0, part._id, user.authPartIds),
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
