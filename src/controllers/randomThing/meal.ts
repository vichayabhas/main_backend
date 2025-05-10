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
  GetMealForUpdate,
  InterMeal,
  FoodLimit,
  foodLimits,
  TriggerCampMemberCard,
  BasicCamp,
  UpdateMealOut,
  UpdateFoodOut,
  CreateMealOut,
  CreateFoodOut,
} from "../../models/interface";
import Meal from "../../models/Meal";
import User from "../../models/User";
import { getAuthTypes, getMealsByHealthIssue } from "../camp/getCampData";
import { sendRes, swop, ifIsTrue, removeDuplicate, stringToId } from "../setup";
import { isFoodValid } from "../user";
import TimeOffset from "../../models/TimeOffset";
import Baan from "../../models/Baan";
import Part from "../../models/Part";

async function getMealTrigger(
  mealIds: Id[],
  campMemberCardIds1: Id[],
  campMemberCardIds2: Id[],
  campMemberCardIds3: Id[],
  inputs: TriggerCampMemberCard[]
): Promise<TriggerCampMemberCard[]> {
  const outputs = inputs;
  const campMemberCardIds = campMemberCardIds1.concat(
    campMemberCardIds2,
    campMemberCardIds3
  );
  let i = 0;
  while (i < campMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      campMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    const meals = await getMealsByHealthIssue(
      healthIssue,
      mealIds,
      campMemberCard
    );
    outputs.push({ meals, campMemberCardId: campMemberCard._id });
  }
  return outputs;
}
async function getMealTriggerByCampRaw(camp: BasicCamp) {
  let i = 0;
  const campMemberCardIds: Id[] = [];
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    campMemberCardIds.push(
      ...baan.nongCampMemberCardIds,
      ...baan.peeCampMemberCardIds
    );
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    campMemberCardIds.push(...part.petoCampMemberCardIds);
  }
  const outputs = await getMealTrigger(
    camp.mealIds,
    campMemberCardIds,
    [],
    [],
    []
  );
  return outputs;
}
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
  const mealIds = swop(null, meal._id, camp.mealIds);
  await camp.updateOne({ mealIds });
  const meals: InterMeal[] = [];
  let i = 0;
  while (i < mealIds.length) {
    const meal = await Meal.findById(mealIds[i++]);
    if (!meal) {
      continue;
    }
    meals.push(meal);
  }
  const triggers = await getMealTriggerByCampRaw(camp);
  const buffer: CreateMealOut = { meals, triggers };
  res.status(201).json(buffer);
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
  const foodIds = swop(null, food._id, meal.foodIds);
  await meal.updateOne({ foodIds });
  const foods: InterFood[] = [];
  let i = 0;
  while (i < foodIds.length) {
    const food = await Food.findById(foodIds[i++]);
    if (!food) {
      continue;
    }
    foods.push(food);
  }
  const triggers = await getMealTriggerByCampRaw(camp);
  const buffer: CreateFoodOut = { foods, triggers };
  res.status(201).json(buffer);
}
export async function getFoodForUpdate(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const food = await Food.findById(req.params.id);
  if (!food || !user) {
    sendRes(res, false);
    return;
  }
  const displayOffset = await TimeOffset.findById(user.displayOffsetId);
  const meal = await Meal.findById(food.mealId);
  const camp = await Camp.findById(food.campId);
  if (!camp || !meal || !displayOffset) {
    sendRes(res, false);
    return;
  }
  const nongCampMemberCardHaveHeathIssueIds: Id[] = [];
  const peeCampMemberCardHaveHeathIssueIds: Id[] = [];
  const petoCampMemberCardHaveHeathIssueIds: Id[] = [];
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    nongCampMemberCardHaveHeathIssueIds.push(
      ...baan.nongCampMemberCardHaveHeathIssueIds
    );
    peeCampMemberCardHaveHeathIssueIds.push(
      ...baan.peeCampMemberCardHaveHeathIssueIds
    );
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    petoCampMemberCardHaveHeathIssueIds.push(
      ...part.petoCampMemberCardHaveHeathIssueIds
    );
  }
  const nongHealths: HeathIssuePack[] =
    camp.nongDataLock && meal.roles.includes("nong")
      ? await getHealthIssuePack(
          nongCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const peeHealths: HeathIssuePack[] =
    camp.peeDataLock && meal.roles.includes("pee")
      ? await getHealthIssuePack(
          peeCampMemberCardHaveHeathIssueIds,
          isFoodValid
        )
      : [];
  const petoHealths: HeathIssuePack[] =
    camp.petoDataLock && meal.roles.includes("peto")
      ? await getHealthIssuePack(
          petoCampMemberCardHaveHeathIssueIds,
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
    displayOffset,
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
    let { nongCampMemberCardIds, peeCampMemberCardIds, petoCampMemberCardIds } =
      food;
    let i = 0;
    while (i < removeNong.length) {
      const campMemberCard = await CampMemberCard.findById(removeNong[i++]);
      if (!campMemberCard) {
        continue;
      }
      nongCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        nongCampMemberCardIds
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
      nongCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        nongCampMemberCardIds
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
      peeCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        peeCampMemberCardIds
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
      peeCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        peeCampMemberCardIds
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
      petoCampMemberCardIds = swop(
        campMemberCard._id,
        null,
        petoCampMemberCardIds
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
      petoCampMemberCardIds = swop(
        null,
        campMemberCard._id,
        petoCampMemberCardIds
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
    const { name, lists, isSpicy, listPriority } = input;
    i = 0;
    const changeList: FoodLimit[] = [];
    while (i < foodLimits.length) {
      const foodLimit = foodLimits[i++];
      if (lists.includes(foodLimit) == food.lists.includes(foodLimit)) {
        changeList.push(foodLimit);
      }
    }
    const changeListPriority = food.listPriority == listPriority;
    const changeSpicy = food.isSpicy == isSpicy;
    await food.updateOne({
      nongCampMemberCardIds,
      peeCampMemberCardIds,
      petoCampMemberCardIds,
      name,
      lists,
      listPriority,
      isSpicy,
    });
    const triggers: TriggerCampMemberCard[] = [];
    const nongChangeCampMemberCardIds = addNong.concat(removeNong);
    const peeChangeCampMemberCardIds = addPee.concat(removePee);
    const petoChangeCampMemberCardIds = addPeto.concat(removePeto);
    const nongCampMemberCardHaveHeathIssueIds: Id[] = [];
    const peeCampMemberCardHaveHeathIssueIds: Id[] = [];
    const petoCampMemberCardHaveHeathIssueIds: Id[] = [];
    i = 0;
    while (i < camp.baanIds.length) {
      const baan = await Baan.findById(camp.baanIds[i++]);
      if (!baan) {
        continue;
      }
      nongCampMemberCardHaveHeathIssueIds.push(
        ...baan.nongCampMemberCardHaveHeathIssueIds
      );
      peeCampMemberCardHaveHeathIssueIds.push(
        ...baan.peeCampMemberCardHaveHeathIssueIds
      );
    }
    i = 0;
    while (i < camp.partIds.length) {
      const part = await Part.findById(camp.partIds[i++]);
      if (!part) {
        continue;
      }
      petoCampMemberCardHaveHeathIssueIds.push(
        ...part.petoCampMemberCardHaveHeathIssueIds
      );
    }
    if (changeListPriority || !listPriority) {
      const nongHealthCampMemberCardIds = removeDuplicate(
        nongCampMemberCardHaveHeathIssueIds,
        nongChangeCampMemberCardIds
      );
      const peeHealthCampMemberCardIds = removeDuplicate(
        peeCampMemberCardHaveHeathIssueIds,
        peeChangeCampMemberCardIds
      );
      const petoHealthCampMemberCardIds = removeDuplicate(
        petoCampMemberCardHaveHeathIssueIds,
        petoChangeCampMemberCardIds
      );
      const healthCampMemberCardIds = nongHealthCampMemberCardIds.concat(
        peeHealthCampMemberCardIds,
        petoHealthCampMemberCardIds
      );
      i = 0;
      if (changeListPriority) {
        while (i < healthCampMemberCardIds.length) {
          const healthCampMemberCard = await CampMemberCard.findById(
            healthCampMemberCardIds[i++]
          );
          if (!healthCampMemberCard) {
            continue;
          }
          const healthIssue = await HeathIssue.findById(
            healthCampMemberCard.healthIssueId
          );
          if (!healthIssue) {
            continue;
          }
          if (
            (!healthIssue.spicy || (!changeSpicy && !input.isSpicy)) &&
            !changeList.includes(healthIssue.foodLimit) &&
            !input.lists.includes(healthIssue.foodLimit)
          ) {
            continue;
          }
          const meals = await getMealsByHealthIssue(
            healthIssue,
            camp.mealIds,
            healthCampMemberCard
          );
          triggers.push({
            meals,
            campMemberCardId: healthCampMemberCard._id,
          });
        }
      } else {
        while (i < healthCampMemberCardIds.length) {
          const healthCampMemberCard = await CampMemberCard.findById(
            healthCampMemberCardIds[i++]
          );
          if (!healthCampMemberCard) {
            continue;
          }
          const healthIssue = await HeathIssue.findById(
            healthCampMemberCard.healthIssueId
          );
          if (!healthIssue) {
            continue;
          }
          if (
            (!healthIssue.spicy || !changeSpicy) &&
            !changeList.includes(healthIssue.foodLimit)
          ) {
            continue;
          }
          const meals = await getMealsByHealthIssue(
            healthIssue,
            camp.mealIds,
            healthCampMemberCard
          );
          triggers.push({
            meals,
            campMemberCardId: healthCampMemberCard._id,
          });
        }
      }
      await getMealTrigger(
        camp.mealIds,
        nongChangeCampMemberCardIds,
        peeChangeCampMemberCardIds,
        petoChangeCampMemberCardIds,
        triggers
      );
    }
    const data = await Food.findById(food._id);
    if (!data) {
      sendRes(res, false);
      return;
    }
    const buffer: UpdateFoodOut = { food: data, triggers };
    res.status(200).json(buffer);
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
    const { name, isWhiteList, lists, listPriority } = input;
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
      listPriority,
    });
    const triggerOuts = await getMealTriggerByCampRaw(camp);
    res.status(200).json(triggerOuts);
  }
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
  const data = await Meal.findById(meal._id);
  if (!data) {
    sendRes(res, false);
    return;
  }
  const triggers = await getMealTriggerByCampRaw(camp);
  const buffer: UpdateMealOut = { meal: data, triggers };
  res.status(200).json(buffer);
}
export async function getMealForUpdate(
  req: express.Request,
  res: express.Response
) {
  const meal = await Meal.findById(req.params.id);
  const user = await getUser(req);
  if (!user || !meal) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(meal.campId);
  const selectOffset = await TimeOffset.findById(user.selectOffsetId);
  const displayOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!selectOffset || !displayOffset || !camp) {
    sendRes(res, false);
    return;
  }
  const foods: InterFood[] = [];
  let i = 0;
  while (i < meal.foodIds.length) {
    const food = await Food.findById(meal.foodIds[i++]);
    if (!food) {
      continue;
    }
    foods.push(food);
  }
  const buffer: GetMealForUpdate = {
    foods,
    meal,
    camp,
    displayOffset,
    selectOffset,
  };
  res.status(200).json(buffer);
}
/**
   * export interface GetMealForUpdate {
     foods: InterFood[];
     meal: InterMeal;
     camp: BasicCamp;
     selectOffset: UpdateTimeOffsetRaw;
     displayOffset: UpdateTimeOffsetRaw;
   }
   */
