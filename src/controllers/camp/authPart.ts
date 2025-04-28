import express from "express";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import {
  Id,
  RegisterData,
  RegisPart,
  RegisBaan,
  MyMap,
  AllNongRegister,
  InterCampBack,
  BasicUser,
  CampHealthIssuePack,
  CampNumberData,
  CampSleepDataContainer,
  CampWelfarePack,
  GetAllPlanData,
  GetBaansForPlan,
  GetCoopData,
  GetPartForPlan,
  HeathIssuePack,
  InterBaanBack,
  InterMeal,
  InterPartBack,
  ShowHealthIssuePack,
  ShowRegister,
  UpdateAllPlanData,
  WelfarePack,
  UpdateBaanOut,
  UpdatePartOut,
  PlanUpdateOut,
} from "../../models/interface";
import Part from "../../models/Part";
import {
  stringToId,
  sendRes,
  ifIsPlus,
  ifIsTrue,
  mapObjectIdToMyMap,
  sizeMapToJson,
  startJsonSize,
  swop,
  isIdEqual,
} from "../setup";
import User from "../../models/User";
import { getUser } from "../../middleware/auth";
import Building from "../../models/Building";
import CampMemberCard from "../../models/CampMemberCard";
import HeathIssue from "../../models/HeathIssue";
import Meal from "../../models/Meal";
import NongCamp from "../../models/NongCamp";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import Place from "../../models/Place";
import { updateBaanRaw } from "../admin/main";
import { isWelfareValid } from "../user";
import {
  getAuthTypes,
  getNongsFromBaanIdRaw,
  getPeesFromBaanIdRaw,
  getPeesFromPartIdRaw,
  getPetosFromPartIdRaw,
} from "./getCampData";
import { getHealthIssuePack } from "../randomThing/meal";
import { getBaanJobsRaw } from "./jobAssign";
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

export async function getRegisterDataRaw(
  campId: Id
): Promise<RegisterData | null> {
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
  return {
    partBoardIdString: camp.partBoardId?.toString() || "",
    partMap,
    peeRegisters,
    nongRegister,
    camp,
    regisBaans,
    regisParts,
  };
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
  i = 0;
  while (i < interviewBuffers.length) {
    const { userId, link } = interviewBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    interviews.push({ user, localId, link });
  }
  i = 0;
  while (i < passBuffers.length) {
    const { userId, link } = passBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    passs.push({ user, localId, link });
  }
  i = 0;
  while (i < paidBuffers.length) {
    const { userId, link } = paidBuffers[i++];
    const localId = camp.nongMapIdGtoL.get(userId)?.toString() as string;
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    paids.push({ user, localId, link });
  }
  i = 0;
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
  const name = camp.campName;
  const buffer: CampWelfarePack = {
    partWelfares,
    baanWelfares,
    campWelfare: {
      nongSize: sizeMapToJson(camp.nongShirtSize),
      peeSize: sizeMapToJson(camp.peeShirtSize),
      petoSize: sizeMapToJson(camp.petoShirtSize),
      name,
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
      name,
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
      name,
      nongNumber: campNongSpicyS,
      peeNumber: campPeeSpicyS,
      petoNumber: campPetoSpicyS,
    },
    campHalalNumber: {
      name,
      nongNumber: campNongHalalS,
      peeNumber: campPeeHalalS,
      petoNumber: campPetoHalalS,
    },
    campVegetarianNumber: {
      name,
      nongNumber: campNongVegetarians,
      peeNumber: campPeeVegetarians,
      petoNumber: campPetoVegetarians,
    },
    campVeganNumber: {
      name,
      nongNumber: campNongVegans,
      peeNumber: campPeeVegans,
      petoNumber: campPetoVegans,
    },
    partIsWearings,
    baanIsWearings,
    campWearingNumber: {
      name,
      nongNumber: campNongIsWearings,
      peeNumber: campPeeIsWearings,
      petoNumber: campPetoIsWearings,
    },
    meals,
    camp,
  };
  res.status(200).json(buffer);
}
function addSleepMember(
  user: BasicUser,
  boys: BasicUser[],
  girls: BasicUser[]
) {
  switch (user.gender) {
    case "Male": {
      boys.push(user);
      return;
    }
    case "Female": {
      girls.push(user);
      return;
    }
  }
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
      addSleepMember(user, nongBoys, nongGirls);
    }
    j = 0;
    while (j < baan.peeSleepIds.length) {
      const user = await User.findById(baan.peeSleepIds[j++]);
      if (!user) {
        continue;
      }
      addSleepMember(user, peeBoys, peeGirls);
    }
    baanDatas.push({
      boy,
      girl,
      normal,
      baan,
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
      addSleepMember(user, petoBoys, petoGirls);
    }
    j = 0;
    while (j < part.peeSleepIds.length) {
      const user = await User.findById(part.peeSleepIds[j++]);
      if (!user) {
        continue;
      }
      addSleepMember(user, peeBoys, peeGirls);
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
  const name = camp.campName;
  const buffer: GetAllPlanData = {
    partDatas,
    baanDatas,
    baanSleepDatas,
    partSleepDatas,
    baanBoySleeps,
    baanGirlSleeps,
    partBoySleeps,
    partGirlSleeps,
    boySleepNumber: {
      name,
      nongNumber: nongBoySleep,
      peeNumber: peeBoySleep,
      petoNumber: petoBoySleep,
    },
    girlSleepNumber: {
      name,
      nongNumber: nongGirlSleep,
      peeNumber: peeGirlSleep,
      petoNumber: petoGirlSleep,
    },
    camp,
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
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths || !auths.includes("แผน")) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  const baanDatas: GetBaansForPlan[] = [];
  const partDatas: GetPartForPlan[] = [];
  const baanTriggers: UpdateBaanOut[] = [];
  const partTriggers: UpdatePartOut[] = [];
  while (i < update.baanDatas.length) {
    const updateBaan = update.baanDatas[i++];
    const baan = await Baan.findById(updateBaan._id);
    if (!baan) {
      continue;
    }
    const {
      link,
      name,
      fullName,
      nongSendMessage,
      canReadMirror,
      canWriteMirror,
    } = baan;
    const boy = await Place.findById(updateBaan.boyId);
    const girl = await Place.findById(updateBaan.girlId);
    const normal = await Place.findById(updateBaan.normalId);
    baanDatas.push({ boy, girl, normal, baan });
    if (
      isIdEqual(baan.boySleepPlaceId, updateBaan.boyId) &&
      isIdEqual(baan.girlSleepPlaceId, updateBaan.girlId) &&
      isIdEqual(baan.normalPlaceId, updateBaan.normalId)
    ) {
      continue;
    }
    const data = await updateBaanRaw({
      baanId: baan._id,
      boySleepPlaceId: updateBaan.boyId,
      girlSleepPlaceId: updateBaan.girlId,
      name,
      nongSendMessage,
      normalPlaceId: updateBaan.normalId,
      link,
      fullName,
      canReadMirror,
      canWriteMirror,
    });
    if (!data) {
      continue;
    }
    baanTriggers.push(data);
  }
  i = 0;
  while (i < update.partDatas.length) {
    const updatePart = update.partDatas[i++];
    const part = await Part.findById(updatePart._id);
    if (!part) {
      continue;
    }
    const newPlace = await Place.findById(updatePart.placeId);
    const { _id } = part;
    partDatas.push({ _id, place: newPlace, name: part.partName });
    if (isIdEqual(updatePart.placeId, part.placeId)) {
      continue;
    }
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
    await part.updateOne({ placeId: newPlace ? newPlace._id : null });
    partTriggers.push({ place: newPlace, _id });
  }
  const { boyZoneLadyZoneState } = update;
  await camp.updateOne({ boyZoneLadyZoneState });
  const buffer: PlanUpdateOut = {
    partTriggers,
    baanTriggers,
    planTrigger: {
      baanDatas,
      partDatas,
      boyZoneLadyZoneState,
    },
  };
  res.status(200).json(buffer);
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
    baanHealthIssuePacks,
    partHealthIssuePacks,
    campHealthIssuePack: {
      nongHealths,
      peeHealths,
      petoHealths,
      name: camp.campName,
    },
    camp,
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
    baanHealthIssuePacks,
    partHealthIssuePacks,
    campHealthIssuePack: {
      nongHealths,
      peeHealths,
      petoHealths,
      name: camp.campName,
    },
    camp,
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
  const baanJobs = await getBaanJobsRaw(baan.jobIds, null);
  const nongs = await getNongsFromBaanIdRaw(baan._id);
  const pees = await getPeesFromBaanIdRaw(baan._id);
  const buffer: GetCoopData = {
    baan,
    camp,
    boy,
    girl,
    normal,
    nongHealths,
    peeHealths,
    baanJobs,
    pees,
    nongs,
  };
  res.status(200).json(buffer);
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
