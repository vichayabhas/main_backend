import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import Food from "../../models/Food";
import HeathIssue from "../../models/HeathIssue";
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
import { revalidationHeathIssues } from "../user";

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
}
export async function unlockDataNong(campId: Id) {
  const camp = await Camp.findById(campId);
  if (!camp) {
    return;
  }
  let i = 0;
  while (i < camp.baanIds.length) {
    const baan = await Baan.findByIdAndUpdate(camp.baanIds[i++], {
      nongHeathIssueIds: [],
      nongShirtSize: startSize(),
      nongSleepIds: [],
      nongCampMemberCardHaveHeathIssueIds: [],
      nongHaveBottleIds: [],
    });
    if (!baan) {
      continue;
    }
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
      if (!heathIssue) {
        continue;
      }
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
      await campMemberCard.updateOne({
        healthIssueId: null,
        whiteListFoodIds: [],
        blackListFoodIds: [],
      });
    }
    await revalidationHeathIssues(baan.nongHeathIssueIds);
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
          baanNongCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: heathIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, baanNongSleepIds);
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
      peeHeathIssueIds: [],
      peeShirtSize: startSize(),
      peeSleepIds: [],
      peeCampMemberCardHaveHeathIssueIds: [],
      peeHaveBottleIds: [],
    });
    if (!baan) {
      continue;
    }
    let j = 0;
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
      if (!heathIssue) {
        continue;
      }
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
      await campMemberCard.updateOne({
        healthIssueId: null,
        whiteListFoodIds: [],
        blackListFoodIds: [],
      });
    }
    await revalidationHeathIssues(baan.peeHeathIssueIds);
  }
  i = 0;
  while (i < camp.partIds.length) {
    await Part.findByIdAndUpdate(camp.partIds[i++], {
      peeHeathIssueIds: [],
      peeShirtSize: startSize(),
      peeSleepIds: [],
      peeCampMemberCardHaveHeathIssueIds: [],
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
          partPeeHeathIssueIds.push(heathIssue._id);
          baanPeeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          partPeeCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: heathIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, baanPeeSleepIds, partPeeSleepIds);
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
      petoHeathIssueIds: [],
      petoShirtSize: startSize(),
      petoSleepIds: [],
      petoHaveBottleIds: [],
      petoCampMemberCardHaveHeathIssueIds: [],
    });
    if (!part) {
      continue;
    }
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
      if (!heathIssue) {
        continue;
      }
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
      await campMemberCard.updateOne({
        healthIssueId: null,
        whiteListFoodIds: [],
        blackListFoodIds: [],
      });
    }
    await revalidationHeathIssues(part.petoHeathIssueIds);
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
        const heathIssue = await HeathIssue.findById(user.healthIssueId);
        if (heathIssue) {
          await heathIssue.updateOne({
            campMemberCardIds: swop(
              null,
              campMemberCard._id,
              heathIssue.campMemberCardIds
            ),
          });
          partPetoHeathIssueIds.push(heathIssue._id);
          partPetoCampMemberCardHaveHeathIssueIds.push(campMemberCard._id);
          await campMemberCard.updateOne({ healthIssueId: heathIssue._id });
        }
      }
      ifIsTrue(sleepAtCamp, user._id, partPetoSleepIds);
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
}
