import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import Food from "../../models/Food";
import HealthIssue from "../../models/HealthIssue";
import { Id, Size } from "../../models/interface";
import Meal from "../../models/Meal";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import User from "../../models/User";
import {
  swop,
  startSize,
  sizeMapToJson,
  ifIsTrue,
  sizeJsonMod,
  jsonToMapSize,
} from "../setup";
import { revalidationHealthIssues } from "../user";

export async function lockDataNong(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    let j = 0;
    while (j < baan.nongCampMemberCardHaveHealthIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.nongCampMemberCardHaveHealthIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const healthIssue = await HealthIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!healthIssue) {
        continue;
      }
      await healthIssue.updateOne({
        campIds: swop(null, camp._id, healthIssue.campIds),
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          healthIssue.campMemberCardIds
        ),
      });
    }
  }
}
export async function lockDataPee(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    let j = 0;
    while (j < baan.peeCampMemberCardHaveHealthIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.peeCampMemberCardHaveHealthIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const healthIssue = await HealthIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!healthIssue) {
        continue;
      }
      await healthIssue.updateOne({
        campIds: swop(null, camp._id, healthIssue.campIds),
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          healthIssue.campMemberCardIds
        ),
      });
    }
  }
}
export async function lockDataPeto(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    let j = 0;
    while (j < part.petoCampMemberCardHaveHealthIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.petoCampMemberCardHaveHealthIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const healthIssue = await HealthIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!healthIssue) {
        continue;
      }
      await healthIssue.updateOne({
        campIds: swop(null, camp._id, healthIssue.campIds),
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          healthIssue.campMemberCardIds
        ),
      });
    }
  }
}
export async function unlockDataNong(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findByIdAndUpdate(camp.baanIds[i++], {
      nongHealthIssueIds: [],
      nongShirtSize: startSize(),
      nongSleepIds: [],
      nongCampMemberCardHaveHealthIssueIds: [],
      nongHaveBottleIds: [],
    });
    if (!baan) {
      continue;
    }
    let j = 0;
    while (j < baan.nongCampMemberCardHaveHealthIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.nongCampMemberCardHaveHealthIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const healthIssue = await HealthIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!healthIssue) {
        continue;
      }
      await healthIssue.updateOne({
        campIds: swop(camp._id, null, healthIssue.campIds),
      });
      await campMemberCard.updateOne({
        healthIssueId: null,
        whiteListFoodIds: [],
        blackListFoodIds: [],
      });
    }
    await revalidationHealthIssues(baan.nongHealthIssueIds);
  }
  i = 0;
  while (i < camp.mealIds.length) {
    const meal = await Meal.findById(camp.mealIds[i++]);
    if (!meal) {
      continue;
    }
    let j = 0;
    while (j < meal.foodIds.length) {
      Food.findByIdAndUpdate(meal.foodIds[j++], {
        nongCampMemberCardIds: [],
      });
    }
  }
  i = 0;
  while (i < camp.nongModelIds.length) {
    const nongCamp = await NongCamp.findById(camp.nongModelIds[i++]);
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
    const baanNongHealthIssueIds = baan.nongHealthIssueIds;
    const baanNongCampMemberCardHaveHealthIssueIds =
      baan.nongCampMemberCardHaveHealthIssueIds;
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
      await campMemberCard.updateOne({
        haveBottle: user.haveBottle,
        size: user.shirtSize,
        sleepAtCamp,
      });
      ifIsTrue(user.haveBottle, user._id, baanNongHaveBottleIds);
      sizeJsonMod(user.shirtSize, 1, baanNongShirtSize);
      if (user.healthIssueId) {
        const healthIssue = await HealthIssue.findById(user.healthIssueId);
        if (healthIssue) {
          await healthIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              healthIssue.campMemberCardIds
            ),
          });
          baanNongHealthIssueIds.push(healthIssue._id);
          baanNongCampMemberCardHaveHealthIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: healthIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, baanNongSleepIds);
    }
    await baan.updateOne({
      nongHealthIssueIds: baanNongHealthIssueIds,
      nongShirtSize: jsonToMapSize(baanNongShirtSize),
      nongSleepIds: baanNongSleepIds,
      nongCampMemberCardHaveHealthIssueIds:
        baanNongCampMemberCardHaveHealthIssueIds,
      nongHaveBottleIds: baanNongHaveBottleIds,
    });
  }
}
export async function unlockDataPee(campId: Id) {
  const camp = await Camp.findByIdAndUpdate(campId, {
    peeShirtSize: startSize(),
    peeSleepIds: [],
    peeHaveBottleIds: [],
  });
  if (!camp) {
    return;
  }

  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findByIdAndUpdate(camp.baanIds[i++], {
      peeHealthIssueIds: [],
      peeShirtSize: startSize(),
      peeSleepIds: [],
      peeCampMemberCardHaveHealthIssueIds: [],
      peeHaveBottleIds: [],
    });
    if (!baan) {
      continue;
    }
    let j = 0;
    while (j < baan.peeCampMemberCardHaveHealthIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.peeCampMemberCardHaveHealthIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const healthIssue = await HealthIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!healthIssue) {
        continue;
      }
      await healthIssue.updateOne({
        campIds: swop(camp._id, null, healthIssue.campIds),
      });
      await campMemberCard.updateOne({
        healthIssueId: null,
        whiteListFoodIds: [],
        blackListFoodIds: [],
      });
    }
    await revalidationHealthIssues(baan.peeHealthIssueIds);
  }
  i = 0;
  while (i < camp.partIds.length) {
    await Part.findByIdAndUpdate(camp.partIds[i++], {
      peeHealthIssueIds: [],
      peeShirtSize: startSize(),
      peeSleepIds: [],
      peeCampMemberCardHaveHealthIssueIds: [],
      peeHaveBottleIds: [],
    });
  }
  i = 0;
  while (i < camp.mealIds.length) {
    const meal = await Meal.findById(camp.mealIds[i++]);
    if (!meal) {
      continue;
    }
    let j = 0;
    while (j < meal.foodIds.length) {
      Food.findByIdAndUpdate(meal.foodIds[j++], {
        peeCampMemberCardIds: [],
      });
    }
  }
  i = 0;

  while (i < camp.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(camp.peeModelIds[i++]);
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
    const baanPeeHealthIssueIds = baan.peeHealthIssueIds;
    const baanPeeCampMemberCardHaveHealthIssueIds =
      baan.peeCampMemberCardHaveHealthIssueIds;
    const partPeeSleepIds = part.peeSleepIds;
    const partPeeShirtSize = sizeMapToJson(
      part.peeShirtSize as Map<Size, number>
    );
    const partPeeHaveBottleIds = part.peeHaveBottleIds;
    const partPeeHealthIssueIds = part.peeHealthIssueIds;
    const partPeeCampMemberCardHaveHealthIssueIds =
      part.peeCampMemberCardHaveHealthIssueIds;
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
      switch (camp.peeSleepModel) {
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
        partPeeHaveBottleIds
      );
      sizeJsonMod(user.shirtSize, 1, baanPeeShirtSize);
      sizeJsonMod(user.shirtSize, 1, partPeeShirtSize);
      if (user.healthIssueId) {
        const healthIssue = await HealthIssue.findById(user.healthIssueId);
        if (healthIssue) {
          await healthIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              healthIssue.campMemberCardIds
            ),
          });
          baanPeeHealthIssueIds.push(healthIssue._id);
          partPeeHealthIssueIds.push(healthIssue._id);
          baanPeeCampMemberCardHaveHealthIssueIds.push(campMemberCard._id);
          partPeeCampMemberCardHaveHealthIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: healthIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, baanPeeSleepIds, partPeeSleepIds);
    }
    await baan.updateOne({
      peeHealthIssueIds: baanPeeHealthIssueIds,
      peeShirtSize: jsonToMapSize(baanPeeShirtSize),
      peeSleepIds: baanPeeSleepIds,
      peeCampMemberCardHaveHealthIssueIds:
        baanPeeCampMemberCardHaveHealthIssueIds,
      peeHaveBottleIds: baanPeeHaveBottleIds,
    });
    await part.updateOne({
      peeHealthIssueIds: partPeeHealthIssueIds,
      peeShirtSize: jsonToMapSize(partPeeShirtSize),
      peeSleepIds: partPeeSleepIds,
      peeCampMemberCardHaveHealthIssueIds:
        partPeeCampMemberCardHaveHealthIssueIds,
      peeHaveBottleIds: partPeeHaveBottleIds,
    });
  }
}
export async function unlockDataPeto(campId: Id) {
  const camp = await Camp.findByIdAndUpdate(campId, {
    petoShirtSize: startSize(),
    petoSleepIds: [],
    petoHaveBottleIds: [],
  });
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findByIdAndUpdate(camp.partIds[i++], {
      petoHealthIssueIds: [],
      petoShirtSize: startSize(),
      petoSleepIds: [],
      petoHaveBottleIds: [],
      petoCampMemberCardHaveHealthIssueIds: [],
    });
    if (!part) {
      continue;
    }
    let j = 0;
    while (j < part.petoCampMemberCardHaveHealthIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.petoCampMemberCardHaveHealthIssueIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const healthIssue = await HealthIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!healthIssue) {
        continue;
      }
      await healthIssue.updateOne({
        campIds: swop(camp._id, null, healthIssue.campIds),
      });
      await campMemberCard.updateOne({
        healthIssueId: null,
        whiteListFoodIds: [],
        blackListFoodIds: [],
      });
    }
    await revalidationHealthIssues(part.petoHealthIssueIds);
  }
  i = 0;
  while (i < camp.mealIds.length) {
    const meal = await Meal.findById(camp.mealIds[i++]);
    if (!meal) {
      continue;
    }
    let j = 0;
    while (j < meal.foodIds.length) {
      Food.findByIdAndUpdate(meal.foodIds[j++], {
        petoCampMemberCardIds: [],
      });
    }
  }
  i = 0;
  while (i < camp.petoModelIds.length) {
    const petoCamp = await PetoCamp.findById(camp.petoModelIds[i++]);
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
    const partPetoHealthIssueIds = part.petoHealthIssueIds;
    const partPetoCampMemberCardHaveHealthIssueIds =
      part.petoCampMemberCardHaveHealthIssueIds;
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
      switch (camp.peeSleepModel) {
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
      ifIsTrue(user.haveBottle, user._id, partPetoHaveBottleIds);
      sizeJsonMod(user.shirtSize, 1, partPetoShirtSize);
      if (user.healthIssueId) {
        const healthIssue = await HealthIssue.findById(user.healthIssueId);
        if (healthIssue) {
          await healthIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              healthIssue.campMemberCardIds
            ),
          });
          partPetoHealthIssueIds.push(healthIssue._id);
          partPetoCampMemberCardHaveHealthIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: healthIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, partPetoSleepIds);
    }
    await part.updateOne({
      petoHealthIssueIds: partPetoHealthIssueIds,
      petoShirtSize: jsonToMapSize(partPetoShirtSize),
      petoSleepIds: partPetoSleepIds,
      petoCampMemberCardHaveHealthIssueIds:
        partPetoCampMemberCardHaveHealthIssueIds,
      petoHaveBottleIds: partPetoHaveBottleIds,
    });
  }
}
