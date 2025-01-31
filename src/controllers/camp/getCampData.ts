import express from "express";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import {
  InterCampBack,
  BasicBaan,
  InterCampFront,
  Id,
  ShowMember,
  GetMeals,
  GetNongData,
  GetPartForPlan,
  GetPeeData,
  GetPetoData,
  HeathIssueBody,
  InterCampMemberCard,
  InterFood,
  ShowPlace,
  UpdateTimeOffsetRaw,
  AuthType,
  BasicPart,
  CampState,
  ShowImageAndDescriptions,
} from "../../models/interface";
import NameContainer from "../../models/NameContainer";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PartNameContainer from "../../models/PartNameContainer";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import { sendRes, conCampBackToFront, resError, stringToId } from "../setup";
import CampMemberCard from "../../models/CampMemberCard";
import HeathIssue from "../../models/HeathIssue";
import Song from "../../models/Song";
import User from "../../models/User";
import Pusher from "pusher";
import { getUser } from "../../middleware/auth";
import Building from "../../models/Building";
import Food from "../../models/Food";
import Meal from "../../models/Meal";
import Place from "../../models/Place";
import PusherData from "../../models/PusherData";
import TimeOffset from "../../models/TimeOffset";
import { getAllQuestionRaw } from "./questionAndAnswer";
import { getImageAndDescriptionsRaw } from "./imageAndDescription";
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

export async function getNongsFromBaanId(
  req: express.Request,
  res: express.Response
) {
  const out = await getNongsFromBaanIdRaw(stringToId(req.params.id));
  res.status(200).json(out);
}
export async function getNongsFromBaanIdRaw(baanId: Id) {
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
export async function getPeesFromBaanIdRaw(baanId: Id) {
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
export async function getPeesFromPartIdRaw(partId: Id) {
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
export async function getPetosFromPartIdRaw(partId: Id) {
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
                if (
                  !food.isSpicy &&
                  food.lists.includes("อิสลาม") &&
                  !food.listPriority
                ) {
                  whiteLists.push(food);
                } else {
                  blackLists.push(food);
                }
              } else {
                if (food.lists.includes("อิสลาม") && !food.listPriority) {
                  whiteLists.push(food);
                } else {
                  blackLists.push(food);
                }
              }
              break;
            }
            case "มังสวิรัติ": {
              if (healthIssue.spicy) {
                if (
                  !food.isSpicy &&
                  food.lists.includes("มังสวิรัติ") &&
                  !food.listPriority
                ) {
                  whiteLists.push(food);
                } else {
                  blackLists.push(food);
                }
              } else {
                if (food.lists.includes("มังสวิรัติ") && !food.listPriority) {
                  whiteLists.push(food);
                } else {
                  blackLists.push(food);
                }
              }
              break;
            }
            case "เจ": {
              if (healthIssue.spicy) {
                if (
                  !food.isSpicy &&
                  food.lists.includes("เจ") &&
                  !food.listPriority
                ) {
                  whiteLists.push(food);
                } else {
                  blackLists.push(food);
                }
              } else {
                if (food.lists.includes("เจ") && !food.listPriority) {
                  whiteLists.push(food);
                } else {
                  blackLists.push(food);
                }
              }
              break;
            }
            case "ไม่มีข้อจำกัดด้านความเชื่อ": {
              if (healthIssue.spicy) {
                if (food.isSpicy || food.listPriority) {
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
  const imageAndDescriptions: ShowImageAndDescriptions[] =
    await getImageAndDescriptionsRaw(baan.imageAndDescriptionContainerIds);
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
    imageAndDescriptions,
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
export async function getAuthTypes(
  userId: Id,
  campId: Id
): Promise<AuthType[] | null> {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return null;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(userId.toString())
  );
  if (!campMemberCard) {
    return null;
  }
  switch (campMemberCard.role) {
    case "nong":
      return null;
    case "pee": {
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        return null;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        return null;
      }
      return part.auths;
    }
    case "peto": {
      const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
      if (!petoCamp) {
        return null;
      }
      const part = await Part.findById(petoCamp.partId);
      if (!part) {
        return null;
      }
      return part.auths;
    }
  }
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
