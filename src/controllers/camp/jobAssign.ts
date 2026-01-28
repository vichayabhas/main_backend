import express from "express";
import {
  BasicUser,
  CreateJobAssign,
  GetJob,
  Id,
  InterTimeRegister,
  RegisterJob,
  TriggerJob,
  UpdateJobAssign,
} from "../../models/interface";
import { getUser } from "../../middleware/auth";
import { ifIsTrue, sendRes, swop } from "../setup";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import PeeCamp from "../../models/PeeCamp";
import Part from "../../models/Part";
import PetoCamp from "../../models/PetoCamp";
import JobAssign from "../../models/JobAssign";
import Baan from "../../models/Baan";
import BaanJob from "../../models/BaanJob";
import TimeRegister from "../../models/TimeRegister";
import User from "../../models/User";
// export async function createJob
// export async function getBaanJobsRaw
// export async function getPartJobsRaw
// export async function updateJobAssign
// export async function registerJob
export async function createJob(req: express.Request, res: express.Response) {
  const { types, refId, reqType, male, female, sum, name }: CreateJobAssign =
    req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  switch (types) {
    case "baan": {
      const camp = await Camp.findById(refId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const campMemberCard = await CampMemberCard.findById(
        camp.mapCampMemberCardIdByUserId.get(user._id.toString()),
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
          const part = await Part.findById(peeCamp.partId);
          if (
            !part ||
            (!part.auths.includes("หัวหน้าพี่เลี้ยง") &&
              !(part._id.toString() == camp.partBoardId?.toString()))
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
          const part = await Part.findById(petoCamp.partId);
          if (
            !part ||
            (!part.auths.includes("หัวหน้าพี่เลี้ยง") &&
              !(part._id.toString() == camp.partBoardId?.toString()))
          ) {
            sendRes(res, false);
            return;
          }
          break;
        }
      }
      let maleMod: number;
      let femaleMod: number;
      let sumMod: number;
      switch (reqType) {
        case "ไม่กำหนด": {
          femaleMod = 0;
          maleMod = 0;
          sumMod = sum;
          break;
        }
        case "ให้ความสำคัญ": {
          femaleMod = female;
          maleMod = male;
          sumMod = male + female;
          break;
        }
        case "เท่านั้น": {
          femaleMod = female;
          maleMod = male;
          sumMod = male + female;
          break;
        }
      }
      const buffer: CreateJobAssign = {
        refId,
        reqType,
        female: femaleMod,
        male: maleMod,
        name,
        types,
        sum: sumMod,
      };
      const memberIds: Id[] = [];
      const job = await JobAssign.create(buffer);
      let i = 0;
      while (i < camp.baanIds.length) {
        const baan = await Baan.findById(camp.baanIds[i++]);
        if (!baan) {
          continue;
        }
        const baanJob = await BaanJob.create({
          baanId: baan._id,
          jobId: job._id,
        });
        await baan.updateOne({ jobIds: swop(null, baanJob._id, baan.jobIds) });
        memberIds.push(baanJob._id);
      }
      await job.updateOne({ memberIds });
      await camp.updateOne({ jobIds: swop(null, job._id, camp.jobIds) });
      i = 0;
      const outputs: TriggerJob[] = [];
      while (i < camp.baanIds.length) {
        const baan = await Baan.findById(camp.baanIds[i++]);
        if (!baan) {
          continue;
        }
        const jobs = await getBaanJobsRaw(baan.jobIds, null);
        outputs.push({ jobs, event: "updateBaanJob", roomId: baan._id });
      }
      res.status(200).json(outputs);
      return;
    }
    case "part": {
      const part = await Part.findById(refId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      const camp = await Camp.findById(part.campId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const campMemberCard = await CampMemberCard.findById(
        camp.mapCampMemberCardIdByUserId.get(user._id.toString()),
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
          if (!(part._id.toString() == peeCamp.partId.toString())) {
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
          if (!(part._id.toString() == petoCamp.partId?.toString())) {
            sendRes(res, false);
            return;
          }
          break;
        }
      }
      let maleMod: number;
      let femaleMod: number;
      let sumMod: number;
      switch (reqType) {
        case "ไม่กำหนด": {
          femaleMod = 0;
          maleMod = 0;
          sumMod = sum;
          break;
        }
        case "ให้ความสำคัญ": {
          femaleMod = female;
          maleMod = male;
          sumMod = male + female;
          break;
        }
        case "เท่านั้น": {
          femaleMod = female;
          maleMod = male;
          sumMod = male + female;
          break;
        }
      }
      const buffer: CreateJobAssign = {
        refId,
        reqType,
        female: femaleMod,
        male: maleMod,
        name,
        types,
        sum: sumMod,
      };
      const job = await JobAssign.create(buffer);
      const jobIds = swop(null, job._id, part.jobIds);
      await part.updateOne({ jobIds });
      const jobs = await getPartJobsRaw(jobIds, null);
      const out: TriggerJob = {
        jobs,
        event: "updatePartJob",
        roomId: part._id,
      };
      res.status(200).json([out]);
    }
  }
}
export async function getBaanJobsRaw(
  jobIds: Id[],
  userId: Id | null,
): Promise<GetJob[]> {
  interface BasicUserWithTime {
    user: BasicUser;
    time: Date;
  }
  const out: GetJob[] = [];
  let i = 0;
  while (i < jobIds.length) {
    const baanJob = await BaanJob.findById(jobIds[i++]);
    if (!baanJob) {
      continue;
    }
    const job = await JobAssign.findById(baanJob.jobId);
    if (!job) {
      continue;
    }
    const passMales: BasicUser[] = [];
    const failMales: BasicUser[] = [];
    const passFemales: BasicUser[] = [];
    const failFemales: BasicUser[] = [];
    const maleRaws: BasicUserWithTime[] = [];
    const femaleRaws: BasicUserWithTime[] = [];
    const allRaws: BasicUserWithTime[] = [];
    const timeRegisters: InterTimeRegister[] = [];
    let timeRegisterId: Id | null = null;
    let j = 0;
    while (j < baanJob.memberIds.length) {
      const timeRegister = await TimeRegister.findById(baanJob.memberIds[j++]);
      if (!timeRegister) {
        continue;
      }
      const campMemberCard = await CampMemberCard.findById(
        timeRegister.campMemberCardId,
      );
      if (!campMemberCard) {
        continue;
      }
      timeRegisters.push(timeRegister);
      const user = await User.findById(campMemberCard.userId);
      if (!user) {
        continue;
      }
      if (user._id.toString() == userId?.toString()) {
        timeRegisterId = timeRegister._id;
      }
      allRaws.push({ user, time: timeRegister.time });
      ifIsTrue(
        user.gender == "Male",
        { user, time: timeRegister.time },
        maleRaws,
      );
      ifIsTrue(
        user.gender == "Female",
        { user, time: timeRegister.time },
        femaleRaws,
      );
      switch (job.reqType) {
        case "ไม่กำหนด": {
          const sorted = allRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          let k = 0;
          while (k < sorted.length && k < job.sum) {
            const buffer = sorted[k++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          while (k < sorted.length) {
            const buffer = sorted[k++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          break;
        }
        case "เท่านั้น": {
          const sortedMales = maleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          const sortedFemales = femaleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          let m = 0;
          while (m < sortedMales.length && m < job.male) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          while (m < sortedMales.length) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          let f = 0;
          while (f < sortedFemales.length && f < job.female) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          while (f < sortedFemales.length) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          break;
        }
        case "ให้ความสำคัญ": {
          const sortedMales = maleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          const sortedFemales = femaleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          let m = 0;
          while (m < sortedMales.length && m < job.male) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          let f = 0;
          while (f < sortedFemales.length && f < job.female) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          let m2 = m;
          let f2 = f;
          while (f2 < job.female && m < sortedMales.length) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
            f2++;
          }
          while (m2 < job.male && f < sortedFemales.length) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
            m2++;
          }
          while (m < sortedMales.length) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          while (f < sortedFemales.length) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          break;
        }
      }
    }
    const { male, female, name, sum, reqType } = job;
    out.push({
      male,
      female,
      name,
      _id: baanJob._id,
      failFemales,
      failMales,
      passFemales,
      passMales,
      sum,
      reqType,
      timeRegisterId,
      timeRegisters,
    });
  }
  return out;
}
export async function getPartJobsRaw(
  jobIds: Id[],
  userId: Id | null,
): Promise<GetJob[]> {
  interface BasicUserWithTime {
    user: BasicUser;
    time: Date;
  }
  const out: GetJob[] = [];
  let i = 0;
  while (i < jobIds.length) {
    const job = await JobAssign.findById(jobIds[i++]);
    if (!job) {
      continue;
    }
    const passMales: BasicUser[] = [];
    const failMales: BasicUser[] = [];
    const passFemales: BasicUser[] = [];
    const failFemales: BasicUser[] = [];
    const maleRaws: BasicUserWithTime[] = [];
    const femaleRaws: BasicUserWithTime[] = [];
    const allRaws: BasicUserWithTime[] = [];
    const timeRegisters: InterTimeRegister[] = [];
    let timeRegisterId: Id | null = null;
    let j = 0;
    while (j < job.memberIds.length) {
      const timeRegister = await TimeRegister.findById(job.memberIds[j++]);
      if (!timeRegister) {
        continue;
      }
      const campMemberCard = await CampMemberCard.findById(
        timeRegister.campMemberCardId,
      );
      if (!campMemberCard) {
        continue;
      }
      const user = await User.findById(campMemberCard.userId);
      if (!user) {
        continue;
      }
      timeRegisters.push(timeRegister);
      if (user._id.toString() == userId?.toString()) {
        timeRegisterId = timeRegister._id;
      }
      allRaws.push({ user, time: timeRegister.time });
      ifIsTrue(
        user.gender == "Male",
        { user, time: timeRegister.time },
        maleRaws,
      );
      ifIsTrue(
        user.gender == "Female",
        { user, time: timeRegister.time },
        femaleRaws,
      );
      switch (job.reqType) {
        case "ไม่กำหนด": {
          const sorted = allRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          let k = 0;
          while (k < sorted.length && k < job.sum) {
            const buffer = sorted[k++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          while (k < sorted.length) {
            const buffer = sorted[k++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          break;
        }
        case "เท่านั้น": {
          const sortedMales = maleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          const sortedFemales = femaleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          let m = 0;
          while (m < sortedMales.length && m < job.male) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          while (m < sortedMales.length) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          let f = 0;
          while (f < sortedFemales.length && f < job.female) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          while (f < sortedFemales.length) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          break;
        }
        case "ให้ความสำคัญ": {
          const sortedMales = maleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          const sortedFemales = femaleRaws.sort(
            (a, b) => a.time.getTime() - b.time.getTime(),
          );
          let m = 0;
          while (m < sortedMales.length && m < job.male) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          let f = 0;
          while (f < sortedFemales.length && f < job.female) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
          }
          let m2 = m;
          let f2 = f;
          while (f2 < job.female && m < sortedMales.length) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
            f2++;
          }
          while (m2 < job.male && f < sortedFemales.length) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, passMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, passFemales);
            m2++;
          }
          while (m < sortedMales.length) {
            const buffer = sortedMales[m++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          while (f < sortedFemales.length) {
            const buffer = sortedFemales[f++];
            ifIsTrue(buffer.user.gender == "Male", buffer.user, failMales);
            ifIsTrue(buffer.user.gender == "Female", buffer.user, failFemales);
          }
          break;
        }
      }
    }
    const { male, female, name, _id, sum, reqType } = job;
    out.push({
      male,
      female,
      name,
      _id,
      failFemales,
      failMales,
      passFemales,
      passMales,
      sum,
      reqType,
      timeRegisterId,
      timeRegisters,
    });
  }
  return out;
}
export async function updateJobAssign(
  req: express.Request,
  res: express.Response,
) {
  const input: UpdateJobAssign = req.body;
  const { name, reqType, _id, types } = input;
  let { male, female, sum } = input;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  switch (types) {
    case "baan": {
      const baanJob = await BaanJob.findById(_id);
      if (!baanJob) {
        sendRes(res, false);
        return;
      }
      const job = await JobAssign.findById(baanJob.jobId);
      if (!job) {
        sendRes(res, false);
        return;
      }
      const camp = await Camp.findById(job.refId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const campMemberCard = await CampMemberCard.findById(
        camp.mapCampMemberCardIdByUserId.get(user._id.toString()),
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
          const part = await Part.findById(peeCamp.partId);
          if (
            !part ||
            (!part.auths.includes("หัวหน้าพี่เลี้ยง") &&
              !(part._id.toString() == camp.partBoardId?.toString()))
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
          const part = await Part.findById(petoCamp.partId);
          if (
            !part ||
            (!part.auths.includes("หัวหน้าพี่เลี้ยง") &&
              !(part._id.toString() == camp.partBoardId?.toString()))
          ) {
            sendRes(res, false);
            return;
          }
          break;
        }
      }
      if (reqType == "ไม่กำหนด") {
        male = 0;
        female = 0;
      } else {
        sum = male + female;
      }
      await job.updateOne({ name, male, female, sum, reqType });
      let i = 0;
      const outputs: TriggerJob[] = [];
      while (i < camp.baanIds.length) {
        const baan = await Baan.findById(camp.baanIds[i++]);
        if (!baan) {
          continue;
        }
        const jobs = await getBaanJobsRaw(baan.jobIds, null);
        outputs.push({ jobs, event: "updateBaanJob", roomId: baan._id });
      }
      res.status(200).json(outputs);
      return;
    }
    case "part": {
      const job = await JobAssign.findById(_id);
      if (!job) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(job.refId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      const camp = await Camp.findById(part.campId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const campMemberCard = await CampMemberCard.findById(
        camp.mapCampMemberCardIdByUserId.get(user._id.toString()),
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
          if (!(part._id.toString() == peeCamp.partId.toString())) {
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
          if (!(part._id.toString() == petoCamp.partId?.toString())) {
            sendRes(res, false);
            return;
          }
          break;
        }
      }
      if (reqType == "ไม่กำหนด") {
        male = 0;
        female = 0;
      } else {
        sum = male + female;
      }
      await job.updateOne({ name, male, female, sum, reqType });
      const jobs = await getPartJobsRaw(part.jobIds, null);
      const out: TriggerJob = {
        jobs,
        event: "updatePartJob",
        roomId: part._id,
      };
      res.status(200).json([out]);
      break;
    }
  }
}
export async function registerJob(req: express.Request, res: express.Response) {
  const input: RegisterJob = req.body;
  const user = await getUser(req);
  const campMemberCard = await CampMemberCard.findById(input.campMemberCardId);

  if (
    !user ||
    !campMemberCard ||
    user._id.toString() != campMemberCard.userId.toString() ||
    (campMemberCard.role == "peto" && input.types == "baan")
  ) {
    sendRes(res, false);
    return;
  }
  let { partJobIds, baanJobIds } = campMemberCard;
  let i = 0;
  const successIds: Id[] = [];
  switch (input.types) {
    case "baan": {
      const baan = await Baan.findById(input.fromId);
      if (!baan) {
        sendRes(res, false);
        return;
      }
      while (i < input.addJobIds.length) {
        const baanJob = await BaanJob.findById(input.addJobIds[i++]);
        if (!baanJob) {
          continue;
        }
        const job = await JobAssign.findById(baanJob.jobId);
        if (!job || job.types == "part") {
          continue;
        }
        successIds.push(job._id);
        if (baanJob.userIds.includes(user._id)) {
          continue;
        }
        const timeRegister = await TimeRegister.create({
          refId: baanJob._id,
          campMemberCardId: campMemberCard._id,
        });
        await baanJob.updateOne({
          memberIds: swop(null, timeRegister._id, baanJob.memberIds),
          userIds: swop(null, user._id, baanJob.userIds),
        });
        baanJobIds.push(timeRegister._id);
      }
      i = 0;
      while (i < input.removeTimeRegisterIds.length) {
        const timeRegister = await TimeRegister.findById(
          input.removeTimeRegisterIds[i++],
        );
        if (!timeRegister) {
          continue;
        }
        const baanJob = await BaanJob.findById(timeRegister.refId);
        if (!baanJob) {
          continue;
        }
        await baanJob.updateOne({
          userIds: swop(user._id, null, baanJob.userIds),
          memberIds: swop(timeRegister._id, null, baanJob.memberIds),
        });
        baanJobIds = swop(timeRegister._id, null, baanJobIds);
        await timeRegister.deleteOne();
      }
      await campMemberCard.updateOne({ baanJobIds });
      const jobs = await getBaanJobsRaw(baan.jobIds, null);
      const out: TriggerJob = {
        jobs,
        event: "updateBaanJob",
        roomId: baan._id,
      };
      res.status(200).json(out);
      return;
    }
    case "part": {
      const part = await Part.findById(input.fromId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      while (i < input.addJobIds.length) {
        const job = await JobAssign.findById(input.addJobIds[i++]);
        if (!job || job.types == "baan") {
          continue;
        }
        successIds.push(job._id);
        if (job.userIds.includes(user._id)) {
          continue;
        }
        const timeRegister = await TimeRegister.create({
          refId: job._id,
          campMemberCardId: campMemberCard._id,
        });
        await job.updateOne({
          memberIds: swop(null, timeRegister._id, job.memberIds),
          userIds: swop(null, user._id, job.userIds),
        });
        partJobIds.push(timeRegister._id);
      }
      i = 0;
      while (i < input.removeTimeRegisterIds.length) {
        const timeRegister = await TimeRegister.findById(
          input.removeTimeRegisterIds[i++],
        );
        if (!timeRegister) {
          continue;
        }
        const job = await JobAssign.findById(timeRegister.refId);
        if (!job) {
          continue;
        }
        await job.updateOne({
          userIds: swop(user._id, null, job.userIds),
          memberIds: swop(timeRegister._id, null, job.memberIds),
        });
        partJobIds = swop(timeRegister._id, null, partJobIds);
        await timeRegister.deleteOne();
      }
      await campMemberCard.updateOne({ partJobIds });
      const jobs = await getPartJobsRaw(part.jobIds, null);
      const out: TriggerJob = {
        jobs,
        event: "updatePartJob",
        roomId: part._id,
      };
      res.status(200).json(out);
      return;
    }
  }
}
export async function deleteBaanJob(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  const baanJob = await BaanJob.findById(req.params.id);
  if (!baanJob || !user) {
    sendRes(res, false);
    return;
  }
  const job = await JobAssign.findById(baanJob.jobId);
  if (!job) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(job.refId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString()),
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
      const part = await Part.findById(peeCamp.partId);
      if (
        !part ||
        (!part.auths.includes("หัวหน้าพี่เลี้ยง") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
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
      const part = await Part.findById(petoCamp.partId);
      if (
        !part ||
        (!part.auths.includes("หัวหน้าพี่เลี้ยง") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
  }
  let i = 0;
  while (i < job.memberIds.length) {
    const baanJob = await BaanJob.findById(job.memberIds[i++]);
    if (!baanJob) {
      continue;
    }
    let j = 0;
    while (j < baanJob.memberIds.length) {
      const timeRegister = await TimeRegister.findById(baanJob.memberIds[j++]);
      if (!timeRegister) {
        continue;
      }
      const campMemberCard = await CampMemberCard.findById(
        timeRegister.campMemberCardId,
      );
      if (!campMemberCard) {
        continue;
      }
      await campMemberCard.updateOne({
        baanJobIds: swop(timeRegister._id, null, campMemberCard.baanJobIds),
      });
      await timeRegister.deleteOne();
    }
    const baan = await Baan.findById(baanJob.baanId);
    if (!baan) {
      continue;
    }
    await baan.updateOne({ jobIds: swop(baanJob._id, null, baan.jobIds) });
    await baanJob.deleteOne();
  }
  await camp.updateOne({ jobIds: swop(job._id, null, camp.jobIds) });
  await job.deleteOne();
  i = 0;
  const outputs: TriggerJob[] = [];
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    const jobs = await getBaanJobsRaw(baan.jobIds, null);
    outputs.push({ jobs, event: "updateBaanJob", roomId: baan._id });
  }
  res.status(200).json(outputs);
}
export async function deletePartJob(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  const job = await JobAssign.findById(req.params.id);
  if (!job || !user) {
    sendRes(res, false);
    return;
  }
  const part = await Part.findById(job.refId);
  if (!part) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString()),
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
      if (!(part._id.toString() == peeCamp.partId.toString())) {
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
      if (!(part._id.toString() == petoCamp.partId?.toString())) {
        sendRes(res, false);
        return;
      }
      break;
    }
  }
  let i = 0;
  while (i < job.memberIds.length) {
    const timeRegister = await TimeRegister.findById(job.memberIds[i++]);
    if (!timeRegister) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      timeRegister.campMemberCardId,
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      partJobIds: swop(timeRegister._id, null, campMemberCard.partJobIds),
    });
    await timeRegister.deleteOne();
  }
  const jobIds = swop(job._id, null, part.jobIds);
  await part.updateOne({ jobIds });
  await job.deleteOne();
  const jobs = await getPartJobsRaw(jobIds, null);
  const out: TriggerJob = {
    jobs,
    event: "updatePartJob",
    roomId: part._id,
  };
  res.status(200).json(out);
}
