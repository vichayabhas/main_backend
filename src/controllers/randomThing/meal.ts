import express from "express";
import { getUser } from "../../middleware/auth";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import Food from "../../models/Food";
import HeathIssue from "../../models/HeathIssue";
import {
  CreateMeal,
  Id,
  CreateFood,
  HeathIssuePack,
  GetFoodForUpdate,
  UpdateFood,
  InterFood,
  GetMeals,
  UpdateMeal,
} from "../../models/interface";
import Meal from "../../models/Meal";
import User from "../../models/User";
import { getAuthTypes } from "../camp/getCampData";
import {
  sendRes,
  swop,
  resOk,
  ifIsTrue,
  removeDuplicate,
  stringToId,
} from "../setup";
import { isFoodValid } from "../user";

export async function createMeal(req: express.Request, res: express.Response) {
  const input: CreateMeal = req.body;
  const user = await getUser(req);
  const camp = await Camp.findById(input.campId);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  const meal = await Meal.create(input);
  await camp.updateOne({ mealIds: swop(null, meal._id, camp.mealIds) });
  res.status(201).json(resOk);
}
export async function createFood(req: express.Request, res: express.Response) {
  const input: CreateFood = req.body;
  const user = await getUser(req);
  const camp = await Camp.findById(input.campId);
  const meal = await Meal.findById(input.mealId);
  if (!user || !camp || !meal) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  const food = await Food.create(input);
  await camp.updateOne({ foodIds: swop(null, food._id, camp.foodIds) });
  await meal.updateOne({ foodIds: swop(null, food._id, meal.foodIds) });
  res.status(201).json(resOk);
}
export async function getFoodForUpdate(
  req: express.Request,
  res: express.Response
) {
  const food = await Food.findById(req.params.id);
  if (!food) {
    sendRes(res, false);
    return;
  }
  const meal = await Meal.findById(food.mealId);
  const camp = await Camp.findById(food.campId);
  if (!camp || !meal) {
    sendRes(res, false);
    return;
  }

  const nongHealths: HeathIssuePack[] =
    camp.nongDataLock && meal.roles.includes("nong")
      ? await getHealthIssuePack(
          camp.nongCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const peeHealths: HeathIssuePack[] =
    camp.peeDataLock && meal.roles.includes("pee")
      ? await getHealthIssuePack(
          camp.peeCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const petoHealths: HeathIssuePack[] =
    camp.petoDataLock && meal.roles.includes("peto")
      ? await getHealthIssuePack(
          camp.petoCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const {
    isWhiteList,
    name,
    lists,
    _id,
    isSpicy,
    nongCampMemberCardIds,
    peeCampMemberCardIds,
    petoCampMemberCardIds,
    listPriority,
  } = food;
  const buffer: GetFoodForUpdate = {
    name,
    nongHealths,
    peeHealths,
    petoHealths,
    lists,
    _id,
    isSpicy,
    camp,
    isWhiteList,
    time: meal.time,
    nongCampMemberCardIds,
    peeCampMemberCardIds,
    petoCampMemberCardIds,
    listPriority,
  };
  res.status(200).json(buffer);
}
export async function getHealthIssuePack(
  campMemberCardIds: Id[],
  isValid: (input: HeathIssuePack) => boolean,
  optionalArray?: HeathIssuePack[]
) {
  let i = 0;
  const healthPacks: HeathIssuePack[] = [];
  while (i < campMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      campMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    const user = await User.findById(campMemberCard.userId);
    if (!heathIssue || !user) {
      continue;
    }
    const buffer: HeathIssuePack = {
      user,
      heathIssue,
      campMemberCardId: campMemberCard._id,
    };
    ifIsTrue(isValid(buffer), buffer, healthPacks, optionalArray);
  }
  return healthPacks;
}
export async function updateFood(req: express.Request, res: express.Response) {
  const input: UpdateFood = req.body;
  const user = await getUser(req);
  const food = await Food.findById(input._id);
  if (!user || !food) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(food.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  if (input.isWhiteList == food.isWhiteList) {
    const removeNong = removeDuplicate(
      food.nongCampMemberCardIds,
      input.nongCampMemberCardIds
    );
    const addNong = removeDuplicate(
      input.nongCampMemberCardIds,
      food.nongCampMemberCardIds
    );
    const removePee = removeDuplicate(
      food.peeCampMemberCardIds,
      input.peeCampMemberCardIds
    );
    const addPee = removeDuplicate(
      input.peeCampMemberCardIds,
      food.peeCampMemberCardIds
    );
    const removePeto = removeDuplicate(
      food.petoCampMemberCardIds,
      input.petoCampMemberCardIds
    );
    const addPeto = removeDuplicate(
      input.petoCampMemberCardIds,
      food.petoCampMemberCardIds
    );
    let {
      nongCampMemberCardIds,
      nongIds,
      nongHeathIssueIds,
      peeCampMemberCardIds,
      peeIds,
      peeHeathIssueIds,
      petoCampMemberCardIds,
      petoIds,
      petoHeathIssueIds,
    } = food;
    let i = 0;
    while (i < removeNong.length) {
      const campMemberCard = await CampMemberCard.findById(removeNong[i++]);
      if (!campMemberCard) {
        continue;
      }
      nongIds = swop(campMemberCard.userId, null, nongIds);
      nongCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        nongCampMemberCardIds
      );
      nongHeathIssueIds = swop(
        campMemberCard.healthIssueId,
        null,
        nongHeathIssueIds
      );
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < addNong.length) {
      const campMemberCard = await CampMemberCard.findById(addNong[i++]);
      if (!campMemberCard) {
        continue;
      }
      nongIds = swop(null, campMemberCard.userId, nongIds);
      nongCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        nongCampMemberCardIds
      );
      nongHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        nongHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < removePee.length) {
      const campMemberCard = await CampMemberCard.findById(removePee[i++]);
      if (!campMemberCard) {
        continue;
      }
      peeIds = swop(campMemberCard.userId, null, peeIds);
      peeCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        peeCampMemberCardIds
      );
      peeHeathIssueIds = swop(
        campMemberCard.healthIssueId,
        null,
        peeHeathIssueIds
      );
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < addPee.length) {
      const campMemberCard = await CampMemberCard.findById(addPee[i++]);
      if (!campMemberCard) {
        continue;
      }
      peeIds = swop(null, campMemberCard.userId, peeIds);
      peeCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        peeCampMemberCardIds
      );
      peeHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        peeHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < removePeto.length) {
      const campMemberCard = await CampMemberCard.findById(removePeto[i++]);
      if (!campMemberCard) {
        continue;
      }
      petoIds = swop(campMemberCard.userId, null, petoIds);
      petoCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        petoCampMemberCardIds
      );
      petoHeathIssueIds = swop(
        campMemberCard.healthIssueId,
        null,
        petoHeathIssueIds
      );
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < addPeto.length) {
      const campMemberCard = await CampMemberCard.findById(addPeto[i++]);
      if (!campMemberCard) {
        continue;
      }
      petoIds = swop(null, campMemberCard.userId, petoIds);
      petoCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        petoCampMemberCardIds
      );
      petoHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        petoHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    const { name, lists } = input;
    await food.updateOne({
      nongCampMemberCardIds,
      nongIds,
      nongHeathIssueIds,
      peeCampMemberCardIds,
      peeIds,
      peeHeathIssueIds,
      petoCampMemberCardIds,
      petoIds,
      petoHeathIssueIds,
      name,
      lists,
    });
  } else {
    let nongCampMemberCardIds: Id[] = [];
    let nongIds: Id[] = [];
    let nongHeathIssueIds: Id[] = [];
    let peeCampMemberCardIds: Id[] = [];
    let peeIds: Id[] = [];
    let peeHeathIssueIds: Id[] = [];
    let petoCampMemberCardIds: Id[] = [];
    let petoIds: Id[] = [];
    let petoHeathIssueIds: Id[] = [];
    let i = 0;
    while (i < food.nongCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        food.nongCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < input.nongCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        input.nongCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      nongIds = swop(null, campMemberCard.userId, nongIds);
      nongCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        nongCampMemberCardIds
      );
      nongHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        nongHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < food.peeCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        food.peeCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < input.peeCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        input.peeCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      peeIds = swop(null, campMemberCard.userId, peeIds);
      peeCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        peeCampMemberCardIds
      );
      peeHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        peeHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < food.petoCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        food.petoCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      if (food.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            food._id,
            null,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            food._id,
            null,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    i = 0;
    while (i < input.petoCampMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        input.petoCampMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      petoIds = swop(null, campMemberCard.userId, petoIds);
      petoCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        petoCampMemberCardIds
      );
      petoHeathIssueIds = swop(
        null,
        campMemberCard.healthIssueId,
        petoHeathIssueIds
      );
      if (input.isWhiteList) {
        await campMemberCard.updateOne({
          whiteListFoodIds: swop(
            null,
            food._id,
            campMemberCard.whiteListFoodIds
          ),
        });
      } else {
        await campMemberCard.updateOne({
          blackListFoodIds: swop(
            null,
            food._id,
            campMemberCard.blackListFoodIds
          ),
        });
      }
    }
    const { name, isWhiteList, lists } = input;
    await food.updateOne({
      nongCampMemberCardIds,
      nongIds,
      nongHeathIssueIds,
      peeCampMemberCardIds,
      peeIds,
      peeHeathIssueIds,
      petoCampMemberCardIds,
      petoIds,
      petoHeathIssueIds,
      name,
      isWhiteList,
      lists,
    });
  }
  sendRes(res, true);
}
export async function getMealByUser(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const meal = await getMealByUserRaw(user._id, stringToId(req.params.id));
  if (!meal) {
    sendRes(res, false);
    return;
  }
  res.status(200).json(meal);
}
export async function getMealByUserRaw(userId: Id, mealId: Id) {
  const user = await User.findById(userId);
  const meal = await Meal.findById(mealId);
  if (!user || !meal) {
    return null;
  }
  const camp = await Camp.findById(meal.campId);
  if (!camp) {
    return null;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCard) {
    return null;
  }
  const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
  const whiteLists: InterFood[] = [];
  const blackLists: InterFood[] = [];
  let i = 0;
  if (!healthIssue) {
    while (i < meal.foodIds.length) {
      const food = await Food.findById(meal.foodIds[i++]);
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
    while (i < meal.foodIds.length) {
      const food = await Food.findById(meal.foodIds[i++]);
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
  const buffer: GetMeals = {
    time: meal.time,
    whiteLists,
    blackLists,
  };
  return buffer;
}
async function deleteFoodRaw(foodId: Id): Promise<boolean> {
  const food = await Food.findById(foodId);
  if (!food) {
    return false;
  }
  const camp = await Camp.findById(food.campId);
  const meal = await Meal.findById(food.mealId);
  if (!camp || !meal) {
    return false;
  }
  await camp.updateOne({ foodIds: swop(food._id, null, camp.foodIds) });
  await meal.updateOne({ foodIds: swop(food._id, null, meal.foodIds) });
  let i = 0;
  while (i < food.nongCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      food.nongCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    if (food.isWhiteList) {
      await campMemberCard.updateOne({
        whiteListFoodIds: swop(food._id, null, campMemberCard.whiteListFoodIds),
      });
    } else {
      await campMemberCard.updateOne({
        blackListFoodIds: swop(food._id, null, campMemberCard.blackListFoodIds),
      });
    }
  }
  i = 0;
  while (i < food.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      food.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    if (food.isWhiteList) {
      await campMemberCard.updateOne({
        whiteListFoodIds: swop(food._id, null, campMemberCard.whiteListFoodIds),
      });
    } else {
      await campMemberCard.updateOne({
        blackListFoodIds: swop(food._id, null, campMemberCard.blackListFoodIds),
      });
    }
  }
  i = 0;
  while (i < food.petoCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      food.petoCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    if (food.isWhiteList) {
      await campMemberCard.updateOne({
        whiteListFoodIds: swop(food._id, null, campMemberCard.whiteListFoodIds),
      });
    } else {
      await campMemberCard.updateOne({
        blackListFoodIds: swop(food._id, null, campMemberCard.blackListFoodIds),
      });
    }
  }
  await food.deleteOne();
  return true;
}
export async function deleteFood(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const food = await Food.findById(req.params.id);
  if (!user || !food) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(food.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  const success = await deleteFoodRaw(food._id);
  sendRes(res, success);
}
export async function deleteMeal(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const meal = await Meal.findById(req.params.id);
  if (!user || !meal) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(meal.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  await camp.updateOne({ mealIds: swop(meal._id, null, camp.mealIds) });
  let i = 0;
  const foodIds = meal.foodIds.map((e) => e);
  while (i < foodIds.length) {
    await deleteFoodRaw(foodIds[i++]);
  }
  await meal.deleteOne();
  sendRes(res, true);
}
export async function getFoods(req: express.Request, res: express.Response) {
  const meal = await Meal.findById(req.params.id);
  if (!meal) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  const foods: InterFood[] = [];
  while (i < meal.foodIds.length) {
    const food = await Food.findById(meal.foodIds[i++]);
    if (!food) {
      continue;
    }
    foods.push(food);
  }
  res.status(200).json(foods);
}
export async function getMeal(req: express.Request, res: express.Response) {
  const meal = await Meal.findById(req.params.id);
  res.status(200).json(meal);
}
export async function updateMeal(req: express.Request, res: express.Response) {
  const input: UpdateMeal = req.body;
  const user = await getUser(req);
  const meal = await Meal.findById(input.mealId);
  if (!user || !meal) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(meal.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("สวัสดิการ") &&
      !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    sendRes(res, false);
    return;
  }
  await meal.updateOne({ time: input.time, roles: input.roles });
}
