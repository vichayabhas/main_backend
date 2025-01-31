import express from "express";
import { getUser } from "../../middleware/auth";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import { Id, InterCampBack } from "../../models/interface";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import User from "../../models/User";
import { sendRes, swop, calculate } from "../setup";
import { getAuthTypes } from "./getCampData";

export async function changeBaan(req: express.Request, res: express.Response) {
  const { userIds, baanId }: { userIds: Id[]; baanId: Id } = req.body;
  const user = await getUser(req);
  const baan = await Baan.findById(baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp: InterCampBack | null = await Camp.findById(baan.campId);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (
    !auths ||
    (!auths.includes("ทะเบียน") && !user.authPartIds.includes(camp.partBoardId))
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
        if (oldPart.auths.length) {
          await user.updateOne({
            authPartIds: swop(oldPart._id, null, user.authPartIds),
          });
        }
        if (part.auths.length) {
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
        if (oldPart.auths.length) {
          await user.updateOne({
            authPartIds: swop(oldPart._id, null, user.authPartIds),
          });
        }
        if (part.auths.length) {
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
