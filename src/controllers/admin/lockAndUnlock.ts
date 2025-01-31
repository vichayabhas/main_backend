import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import Food from "../../models/Food";
import HeathIssue from "../../models/HeathIssue";
import { Id, Size } from "../../models/interface";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import User from "../../models/User";
import {
  swop,
  startSize,
  startJsonSize,
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
export async function lockDataPee(campId: Id) {
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
export async function lockDataPeto(campId: Id) {
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
export async function unlockDataNong(campId: Id) {
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
export async function unlockDataPee(campId: Id) {
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
export async function unlockDataPeto(campId: Id) {
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
