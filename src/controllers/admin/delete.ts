import { getUser } from "../../middleware/auth";
import ActionPlan from "../../models/ActionPlan";
import AnswerContainer from "../../models/AnswerContainer";
import Baan from "../../models/Baan";
import Building from "../../models/Building";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import CampStyle from "../../models/CampStyle";
import Chat from "../../models/Chat";
import ChoiceAnswer from "../../models/ChoiceAnswer";
import ChoiceQuestion from "../../models/ChoiceQuestion";
import Food from "../../models/Food";
import HeathIssue from "../../models/HeathIssue";
import ImageAndDescription from "../../models/ImageAndDescription";
import ImageAndDescriptionContainer from "../../models/ImageAndDescriptionContainer";
import { Id, InterCampBack } from "../../models/interface";
import LostAndFound from "../../models/LostAndFound";
import Meal from "../../models/Meal";
import NameContainer from "../../models/NameContainer";
import NongCamp from "../../models/NongCamp";
import Part from "../../models/Part";
import PartNameContainer from "../../models/PartNameContainer";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import Place from "../../models/Place";
import Song from "../../models/Song";
import TextAnswer from "../../models/TextAnswer";
import TextQuestion from "../../models/TextQuestion";
import User from "../../models/User";
import WorkItem from "../../models/WorkItem";
import { deleteWorkingItemRaw } from "./main";
import { stringToId, swop, sendRes, calculate } from "../setup";
import { revalidationHeathIssues } from "../user";
import express from "express";
import { deleteChatRaw } from "../randomThing/chat";
import JobAssign from "../../models/JobAssign";
import TimeRegister from "../../models/TimeRegister";
import BaanJob from "../../models/BaanJob";
import Mirror from "../../models/Mirror";
import SubGroup from "../../models/SubGroup";
import GroupContainer from "../../models/GroupContainer";
import { removeMemberFromSubGroupRaw } from "../camp/subGroup";
import Item from "../../models/Item";
import Order from "../../models/Order";
import CampScore from "../../models/CampScore";
import ScoreContainer from "../../models/ScoreContainer";

export async function forceDeleteCamp(
  req: express.Request,
  res: express.Response
) {
  const campId = req.params.id;
  await forceDeleteCampRaw(stringToId(campId), res);
}
async function forceDeleteCampRaw(campId: Id, res: express.Response | null) {
  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res?.status(400).json({ success: false });
    }
    await CampStyle.findByIdAndDelete(camp.campStyleId);
    let i = 0;
    while (i < camp.boardIds.length) {
      const user = await User.findById(camp.boardIds[i++]);
      if (!user) {
        continue;
      }
      const news = swop(camp._id, null, user.authorizeIds);
      await user.updateOne({
        authorizeIds: news,
        authPartIds: swop(camp.partBoardId as Id, null, user.authPartIds),
      });
    }
    i = 0;
    while (i < camp.nongModelIds.length) {
      const nongCamp = await NongCamp.findById(camp.nongModelIds[i++]);
      if (!nongCamp) {
        continue;
      }
      let j = 0;
      while (j < nongCamp.nongIds.length) {
        const user = await User.findById(nongCamp.nongIds[j++]);
        if (!user) {
          continue;
        }
        await user.updateOne({
          nongCampIds: swop(nongCamp._id, null, user.nongCampIds),
        });
      }
      await nongCamp.deleteOne();
    }
    i = 0;
    while (i < camp.peeModelIds.length) {
      const peeCamp = await PeeCamp.findById(camp.peeModelIds[i++]);
      if (!peeCamp) {
        continue;
      }
      let j = 0;
      while (j < peeCamp.peeIds.length) {
        const user = await User.findById(peeCamp.peeIds[j++]);
        if (!user) {
          continue;
        }
        await user.updateOne({
          peeCampIds: swop(peeCamp._id, null, user.peeCampIds),
        });
      }
      await peeCamp.deleteOne();
    }
    i = 0;
    while (i < camp.petoModelIds.length) {
      const petoCamp = await PetoCamp.findById(camp.petoModelIds[i++]);
      if (!petoCamp) {
        continue;
      }
      let j = 0;
      while (j < petoCamp.petoIds.length) {
        const user = await User.findById(petoCamp.petoIds[j++]);
        if (!user) {
          continue;
        }
        await user.updateOne({
          petoCampIds: swop(petoCamp._id, null, user.petoCampIds),
        });
      }
      await petoCamp.deleteOne();
    }
    i = 0;
    while (i < camp.baanIds.length) {
      const baan = await Baan.findById(camp.baanIds[i++]);
      if (!baan) {
        continue;
      }
      let j = 0;
      while (j < baan.songIds.length) {
        const song = await Song.findById(baan.songIds[j++]);
        if (!song) {
          continue;
        }
        await song.updateOne({ baanIds: swop(baan._id, null, song.baanIds) });
      }
      const boyP = await Place.findById(baan.boySleepPlaceId);
      if (boyP) {
        await boyP.updateOne({
          boySleepBaanIds: swop(baan._id, null, boyP.boySleepBaanIds),
        });
        const boyB = await Building.findById(boyP.buildingId);
        if (boyB) {
          await boyB.updateOne({
            boySleepBaanIds: swop(baan._id, null, boyB.boySleepBaanIds),
          });
        }
      }
      const girlP = await Place.findById(baan.girlSleepPlaceId);
      if (girlP) {
        await girlP.updateOne({
          girlSleepBaanIds: swop(baan._id, null, girlP.girlSleepBaanIds),
        });
        const girlB = await Building.findById(girlP.buildingId);
        if (girlB) {
          await girlB.updateOne({
            girlSleepBaanIds: swop(baan._id, null, girlB.girlSleepBaanIds),
          });
        }
      }
      const normalP = await Place.findById(baan.normalPlaceId);
      if (normalP) {
        await normalP.updateOne({
          normalBaanIds: swop(baan._id, null, normalP.normalBaanIds),
        });
        const normalB = await Building.findById(normalP.buildingId);
        if (normalB) {
          await normalB.updateOne({
            normalBaanIds: swop(baan._id, null, normalB.normalBaanIds),
          });
        }
      }
      await CampStyle.findByIdAndDelete(baan.styleId);
      j = 0;
      while (j < baan.nongChatIds.length) {
        await Chat.findByIdAndDelete(baan.nongChatIds[j++]);
      }
      j = 0;
      while (j < baan.peeChatIds.length) {
        await Chat.findByIdAndDelete(baan.peeChatIds[j++]);
      }
      j = 0;
      while (j < baan.imageAndDescriptionContainerIds.length) {
        const imageAndDescriptionContainer =
          await ImageAndDescriptionContainer.findById(
            baan.imageAndDescriptionContainerIds[j++]
          );
        if (!imageAndDescriptionContainer) {
          continue;
        }
        let k = 0;
        while (k < imageAndDescriptionContainer.childIds.length) {
          await ImageAndDescription.findByIdAndDelete(
            imageAndDescriptionContainer.childIds[k++]
          );
        }
        await imageAndDescriptionContainer.deleteOne();
      }
      j = 0;
      while (j < baan.jobIds.length) {
        await BaanJob.findByIdAndDelete(baan.jobIds[j++]);
      }
      j = 0;
      while (j < baan.mirrorIds.length) {
        await Mirror.findByIdAndDelete(baan.mirrorIds[j++]);
      }
      j = 0;
      while (j < baan.groupContainerIds.length) {
        const container = await GroupContainer.findById(
          baan.groupContainerIds[j++]
        );
        if (!container) {
          continue;
        }
        let k = 0;
        while (k < container.subGroupIds.length) {
          await SubGroup.findByIdAndDelete(container.subGroupIds[k++]);
        }
      }
      j = 0;
      if (camp.nongDataLock) {
        while (j < baan.nongHeathIssueIds.length) {
          const heathIssue = await HeathIssue.findById(
            baan.nongHeathIssueIds[j++]
          );
          if (!heathIssue) {
            continue;
          }
          await heathIssue.updateOne({
            campIds: swop(camp._id, null, heathIssue.campIds),
          });
        }
      } else {
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
            campMemberCardIds: swop(
              campMemberCard._id,
              null,
              heathIssue.campMemberCardIds
            ),
          });
        }
      }
      j = 0;
      if (camp.peeDataLock) {
        while (i < baan.peeHeathIssueIds.length) {
          const heathIssue = await HeathIssue.findById(
            baan.peeHeathIssueIds[j++]
          );
          if (!heathIssue) {
            continue;
          }
          await heathIssue.updateOne({
            campIds: swop(camp._id, null, heathIssue.campIds),
          });
        }
      } else {
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
            campMemberCardIds: swop(
              campMemberCard._id,
              null,
              heathIssue.campMemberCardIds
            ),
          });
        }
      }
      await revalidationHeathIssues(baan.nongHeathIssueIds);
      await revalidationHeathIssues(baan.peeHeathIssueIds);
      j = 0;
      while (j < baan.peeCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          baan.peeCampMemberCardIds[j++]
        );
        const user = await User.findById(campMemberCard?.userId);
        if (!user || !campMemberCard) {
          continue;
        }
        let k = 0;
        while (k < campMemberCard.baanJobIds.length) {
          await TimeRegister.findByIdAndDelete(campMemberCard.baanJobIds[k++]);
        }
        k = 0;
        while (k < campMemberCard.partJobIds.length) {
          await TimeRegister.findByIdAndDelete(campMemberCard.partJobIds[k++]);
        }
        k = 0;
        while (k < campMemberCard.mirrorSenderIds.length) {
          await Mirror.findByIdAndDelete(campMemberCard.mirrorSenderIds[k++]);
        }
        await user.updateOne({
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            user.campMemberCardIds
          ),
          filterIds: swop(camp._id, null, user.filterIds),
          registerIds: swop(camp._id, null, user.registerIds),
        });
        await campMemberCard.deleteOne();
      }
      j = 0;
      while (j < baan.nongCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          baan.nongCampMemberCardIds[j++]
        );
        if (!campMemberCard) {
          continue;
        }
        const user = await User.findById(campMemberCard.userId);
        if (!user) {
          continue;
        }
        await user.updateOne({
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            user.campMemberCardIds
          ),
        });
        let k = 0;
        while (k < campMemberCard.chatIds.length) {
          await Chat.findByIdAndDelete(campMemberCard.chatIds[k++]);
        }
        await campMemberCard.deleteOne();
      }
      await baan.deleteOne();
    }
    await CampStyle.findByIdAndDelete(camp.campStyleId);

    i = 0;
    while (i < camp.partIds.length) {
      const part = await Part.findById(camp.partIds[i++]);
      if (!part) {
        continue;
      }
      const partNameContainer = await PartNameContainer.findById(part?.nameId);
      await partNameContainer?.updateOne({
        partIds: swop(part._id, null, partNameContainer.partIds),
        campIds: swop(camp._id, null, partNameContainer.campIds),
      });
      let j = 0;
      while (j < part.chatIds.length) {
        await Chat.findByIdAndDelete(part.chatIds[j++]);
      }
      if (part.auths.length) {
        j = 0;
        while (j < part.peeIds.length) {
          const user = await User.findById(part.peeIds[j++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(part._id, null, user.authPartIds),
            authorizeIds: swop(camp._id, null, user.authorizeIds),
          });
        }
        j = 0;
        while (j < part.petoIds.length) {
          const user = await User.findById(part.petoIds[j++]);
          if (!user) {
            continue;
          }
          await user.updateOne({
            authPartIds: swop(part._id, null, user.authPartIds),
            authorizeIds: swop(camp._id, null, user.authorizeIds),
          });
        }
      }
      j = 0;
      while (j < part.jobIds.length) {
        await JobAssign.findByIdAndDelete(part.jobIds[j++]);
      }
      j = 0;
      if (camp.petoDataLock) {
        while (j < part.petoHeathIssueIds.length) {
          const heathIssue = await HeathIssue.findById(
            part.petoHeathIssueIds[j++]
          );
          if (!heathIssue) {
            continue;
          }
          await heathIssue.updateOne({
            campIds: swop(camp._id, null, heathIssue.campIds),
          });
        }
      } else {
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
            campMemberCardIds: swop(
              campMemberCard._id,
              null,
              heathIssue.campMemberCardIds
            ),
          });
        }
      }

      j = 0;
      while (j < part.petoCampMemberCardIds.length) {
        const campMemberCard = await CampMemberCard.findById(
          part.petoCampMemberCardIds[j++]
        );
        const user = await User.findById(campMemberCard?.userId);
        if (!user || !campMemberCard) {
          continue;
        }
        await user.updateOne({
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            user.campMemberCardIds
          ),
          filterIds: swop(camp._id, null, user.filterIds),
          registerIds: swop(camp._id, null, user.registerIds),
        });
        await campMemberCard.deleteOne();
      }
      j = 0;
      while (j < part.workItemIds.length) {
        await WorkItem.findByIdAndDelete(part.workItemIds[j++]);
      }
      j = 0;
      while (j < part.actionPlanIds.length) {
        const actionPlan = await ActionPlan.findById(part.actionPlanIds[j++]);
        if (!actionPlan) {
          continue;
        }
        let k = 0;
        while (k < actionPlan.placeIds.length) {
          const place = await Place.findById(actionPlan.placeIds[k++]);
          if (!place) {
            continue;
          }
          await place.updateOne({
            actionPlanIds: swop(actionPlan._id, null, place.actionPlanIds),
          });
          const building = await Building.findById(place.buildingId);
          if (!building) {
            continue;
          }
          await building.updateOne({
            actionPlanIds: swop(actionPlan._id, null, building.actionPlanIds),
          });
        }
        await actionPlan.deleteOne();
      }
      await part.deleteOne();
    }
    i = 0;
    while (i < camp.lostAndFoundIds.length) {
      await LostAndFound.findByIdAndUpdate(camp.lostAndFoundIds[i++], {
        campId: null,
      });
    }
    const name = await NameContainer.findById(camp.nameId);
    if (name) {
      await name.updateOne({ campIds: swop(camp._id, null, name.campIds) });
    }
    i = 0;
    while (i < camp.nongAnswerPackIds.length) {
      const answerPack = await AnswerContainer.findById(
        camp.nongAnswerPackIds[i++]
      );
      if (!answerPack) {
        continue;
      }
      const user = await User.findById(answerPack.userId);
      if (!user) {
        continue;
      }
      await user.updateOne({
        nongAnswerPackIds: swop(answerPack._id, null, user.nongAnswerPackIds),
      });
      await answerPack.deleteOne();
    }
    i = 0;
    while (i < camp.peeAnswerPackIds.length) {
      const answerPack = await AnswerContainer.findById(
        camp.peeAnswerPackIds[i++]
      );
      if (!answerPack) {
        continue;
      }
      const user = await User.findById(answerPack.userId);
      if (!user) {
        continue;
      }
      await user.updateOne({
        peeAnswerPackIds: swop(answerPack._id, null, user.peeAnswerPackIds),
      });
      await answerPack.deleteOne();
    }
    i = 0;
    while (i < camp.choiceQuestionIds.length) {
      const choiceQuestion = await ChoiceQuestion.findById(
        camp.choiceQuestionIds[i++]
      );
      if (!choiceQuestion) {
        continue;
      }
      let j = 0;
      while (j < choiceQuestion.answerIds.length) {
        await ChoiceAnswer.findByIdAndDelete(choiceQuestion.answerIds[j++]);
      }
    }
    i = 0;
    while (i < camp.textQuestionIds.length) {
      const textQuestion = await TextQuestion.findById(
        camp.textQuestionIds[i++]
      );
      if (!textQuestion) {
        continue;
      }
      let j = 0;
      while (j < textQuestion.answerIds.length) {
        await ChoiceAnswer.findByIdAndDelete(textQuestion.answerIds[j++]);
      }
    }
    i = 0;
    while (i < camp.mealIds.length) {
      const meal = await Meal.findById(camp.mealIds[i++]);
      if (!meal) {
        continue;
      }
      let j = 0;
      while (j < meal.foodIds.length) {
        await Food.findByIdAndDelete(meal.foodIds[j++]);
      }
      await meal.deleteOne();
    }
    i = 0;
    while (i < camp.jobIds.length) {
      await JobAssign.findByIdAndDelete(camp.jobIds[i++]);
    }
    i = 0;
    while (i < camp.itemIds.length) {
      const item = await Item.findById(camp.itemIds[i++]);
      if (!item) {
        continue;
      }
      let j = 0;
      while (j < item.orderIds.length) {
        await Order.findByIdAndDelete(item.orderIds[j++]);
      }
      await item.deleteOne();
    }
    i = 0;
    while (i < camp.scoreIds.length) {
      const score = await CampScore.findById(camp.scoreIds[i++]);
      if (!score) {
        continue;
      }
      const container = await ScoreContainer.findById(score.containerId);
      if (!container) {
        continue;
      }
      await container.updateOne({
        campScoreIds: swop(score._id, null, container.campScoreIds),
      });
      await score.deleteOne();
    }
    await camp.deleteOne();
    res?.status(200).json({ success: true });
  } catch {
    res?.status(400).json({ success: false });
  }
}
export async function saveDeleteCamp(
  req: express.Request,
  res: express.Response
) {
  const campId: string = req.params.id;
  const camp: InterCampBack | null = await Camp.findById(campId);
  if (!camp) {
    res.status(400).json({
      success: false,
      message: "no camp",
    });
    return;
  }
  if (
    camp.nongPaidIds.length ||
    camp.nongPassIds.size ||
    camp.nongInterviewIds.size ||
    camp.peeIds.length + camp.petoIds.length > camp.boardIds.length ||
    camp.partIds.length > 8 ||
    camp.baanIds.length > 19 ||
    camp.peePassIds.size
  ) {
    res
      .status(400)
      .json({ success: false, message: "this camp is not save to delete" });
    return;
  }
  forceDeleteCampRaw(camp._id, res);
}
export async function addCampName(req: express.Request, res: express.Response) {
  try {
    const name = await NameContainer.create({ name: req.params.id });
    res.status(201).json(name);
  } catch (err) {
    console.log(err);
    sendRes(res, false);
  }
}
export async function saveDeleteCampName(
  req: express.Request,
  res: express.Response
) {
  try {
    const hospital = await NameContainer.findById(req.params.id);
    if (hospital?.campIds.length) {
      return res
        .status(400)
        .json({ success: false, massage: "this not safe to delete" });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function forceDeleteCampName(
  req: express.Request,
  res: express.Response
) {
  const name = await NameContainer.findById(req.params.id);
  if (!name) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < name.campIds.length) {
    await forceDeleteCampRaw(name.campIds[i++], null);
  }
  await name.deleteOne();
  res.status(200).json({ success: true });
}
export async function forceDeleteBaan(
  req: express.Request,
  res: express.Response
) {
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
  let nongIds = camp.nongIds;
  let peeModelIds = camp.peeModelIds;
  let peeIds = camp.peeIds;
  let baanOrderIds = baan.orderIds;
  let i = 0;
  if (camp.nongDataLock) {
    while (i < baan.nongCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.nongCampMemberCardHaveHeathIssueIds[i++]
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
      await clearHealthIssue(campMemberCard._id);
    }
  } else {
    while (i < baan.nongCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        baan.nongCampMemberCardHaveHeathIssueIds[i++]
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
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
      await clearHealthIssue(campMemberCard._id);
    }
  }
  i = 0;
  while (i < baan.peeCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const part = await Part.findById(peeCamp.partId);
    if (!part) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    if (camp.peeDataLock) {
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
    } else {
      await heathIssue.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
    }
    await part.updateOne({
      peeHeathIssueIds: swop(heathIssue._id, null, part.peeHeathIssueIds),
      peeCampMemberCardHaveHeathIssueIds: swop(
        campMemberCard._id,
        null,
        part.peeCampMemberCardHaveHeathIssueIds
      ),
    });
    await clearHealthIssue(campMemberCard._id);
  }
  i = 0;
  while (i < baan.songIds.length) {
    const song = await Song.findById(baan.songIds[i++]);
    await song?.updateOne({ baanIds: swop(baan._id, null, song.baanIds) });
  }
  i = 0;
  while (i < baan.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(baan.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    const part = await Part.findById(peeCamp.partId);
    if (!part) {
      continue;
    }
    let j = 0;
    while (j < peeCamp.peeIds.length) {
      const user = await User.findById(peeCamp.peeIds[j++]);
      if (!user) {
        continue;
      }
      const peeCampIds = swop(peeCamp._id, null, user.peeCampIds);
      await user.updateOne({ peeCampIds });
      if (part.auths.length) {
        await user.updateOne({
          authorizeIds: swop(camp._id, null, user.authorizeIds),
          authPartIds: swop(part._id, null, user.authPartIds),
        });
      }
    }
    peeModelIds = swop(peeCamp._id, null, peeModelIds);
  }
  const nongCamp = await NongCamp.findById(baan.nongModelId);
  if (!nongCamp) {
    sendRes(res, false);
    return;
  }
  i = 0;
  while (i < nongCamp.nongIds.length) {
    const user = await User.findById(nongCamp.nongIds[i++]);
    if (!user) {
      continue;
    }
    await user.updateOne({
      nongCampIds: swop(nongCamp._id, null, user.nongCampIds),
    });
    nongIds = swop(user._id, null, nongIds);
  }
  await nongCamp.deleteOne();
  const boyP = await Place.findById(baan.boySleepPlaceId);
  if (boyP) {
    await boyP.updateOne({
      boySleepBaanIds: swop(baan._id, null, boyP.boySleepBaanIds),
    });
    const boyB = await Building.findById(boyP.buildingId);
    if (boyB) {
      await boyB.updateOne({
        boySleepBaanIds: swop(baan._id, null, boyB.boySleepBaanIds),
      });
    }
  }
  const girlP = await Place.findById(baan.girlSleepPlaceId);
  if (girlP) {
    await girlP.updateOne({
      girlSleepBaanIds: swop(baan._id, null, girlP.girlSleepBaanIds),
    });
    const girlB = await Building.findById(girlP.buildingId);
    if (girlB) {
      await girlB.updateOne({
        girlSleepBaanIds: swop(baan._id, null, girlB.girlSleepBaanIds),
      });
    }
  }
  const normalP = await Place.findById(baan.normalPlaceId);
  if (normalP) {
    await normalP.updateOne({
      normalBaanIds: swop(baan._id, null, normalP.normalBaanIds),
    });
    const normalB = await Building.findById(normalP.buildingId);
    if (normalB) {
      await normalB.updateOne({
        normalBaanIds: swop(baan._id, null, normalB.normalBaanIds),
      });
    }
  }
  while (i < baan.mirrorIds.length) {
    const mirror = await Mirror.findById(baan.mirrorIds[i++]);
    if (!mirror) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      mirror.senderCampMemberCardId
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      mirrorBaanIds: swop(mirror._id, null, campMemberCard.mirrorBaanIds),
    });
    await mirror.deleteOne();
  }

  i = 0;
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
    await user.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    let j = 0;
    while (j < campMemberCard.allChatIds.length) {
      const chat = await Chat.findById(campMemberCard.allChatIds[j++]);
      if (!chat) {
        continue;
      }
      await chat.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          chat.campMemberCardIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    j = 0;
    while (j < campMemberCard.mirrorBaanIds.length) {
      const mirror = await Mirror.findById(campMemberCard.mirrorBaanIds[j++]);
      if (!mirror) {
        continue;
      }
      const receiverBaan = await Baan.findById(mirror.receiverId);
      if (!receiverBaan) {
        continue;
      }
      await receiverBaan.updateOne({
        mirrorIds: swop(mirror._id, null, receiverBaan.mirrorIds),
      });
    }
    j = 0;
    while (j < campMemberCard.mirrorReceiverIds.length) {
      const mirror = await Mirror.findById(
        campMemberCard.mirrorReceiverIds[j++]
      );
      if (!mirror) {
        continue;
      }
      const otherCampMemberCard = await CampMemberCard.findById(
        mirror.senderCampMemberCardId
      );
      if (!otherCampMemberCard) {
        continue;
      }
      await otherCampMemberCard.updateOne({
        mirrorSenderIds: swop(
          mirror._id,
          null,
          otherCampMemberCard.mirrorSenderIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.mirrorSenderIds.length) {
      const mirror = await Mirror.findById(campMemberCard.mirrorSenderIds[j++]);
      if (!mirror) {
        continue;
      }
      const otherCampMemberCard = await CampMemberCard.findById(
        mirror.receiverId
      );
      if (!otherCampMemberCard) {
        continue;
      }
      await otherCampMemberCard.updateOne({
        mirrorReceiverIds: swop(
          mirror._id,
          null,
          otherCampMemberCard.mirrorReceiverIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.orderIds.length) {
      const order = await Order.findById(campMemberCard.orderIds[j++]);
      if (!order) {
        continue;
      }
      if (order.fromId.toString() == baan._id.toString()) {
        baanOrderIds = swop(order._id, null, baanOrderIds);
      } else {
        const baanOrder = await Baan.findById(order.fromId);
        if (!baanOrder) {
          continue;
        }
        await baanOrder.updateOne({
          orderIds: swop(order._id, null, baanOrder.orderIds),
        });
      }
      await order.deleteOne();
    }
    await removeAnswer(user._id, camp._id);
    await campMemberCard.deleteOne();
  }
  i = 0;
  while (i < baan.peeCampMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      baan.peeCampMemberCardIds[i++]
    );
    if (!campMemberCard) {
      return;
    }
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const part = await Part.findById(peeCamp.partId);
    const user = await User.findById(campMemberCard.userId);
    if (!user || !part) {
      continue;
    }
    if (baan.peeHaveBottleIds.includes(user._id)) {
      await part.updateOne({
        peeHaveBottleIds: swop(user._id, null, part.peeHaveBottleIds),
      });
    }
    const p = swop(user._id, null, part.peeIds);
    await part.updateOne({ peeIds: p });
    peeIds = swop(user._id, null, peeIds);
    await user.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    if (campMemberCard.sleepAtCamp) {
      await part.updateOne({
        peeSleepIds: swop(user._id, null, part.peeSleepIds),
      });
    }
    part.peeShirtSize.set(
      campMemberCard.size,
      calculate(part.peeShirtSize.get(campMemberCard.size), 0, 1)
    );
    await part.updateOne({
      peeCampMemberCardIds: swop(
        campMemberCard._id,
        null,
        part.peeCampMemberCardIds
      ),
      peeShirtSize: part.peeShirtSize,
    });
    let j = 0;
    while (j < campMemberCard.allChatIds.length) {
      const chat = await Chat.findById(campMemberCard.allChatIds[j++]);
      if (!chat) {
        continue;
      }
      await chat.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          chat.campMemberCardIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    if (camp.peeAnswerIds.includes(user._id)) {
      await removeAnswer(user._id, camp._id);
    }
    j = 0;
    while (j < campMemberCard.baanJobIds.length) {
      await TimeRegister.findByIdAndDelete(campMemberCard.baanJobIds[j++]);
    }
    j = 0;
    while (j < campMemberCard.partJobIds.length) {
      const timeRegister = await TimeRegister.findById(
        campMemberCard.partJobIds[j++]
      );
      if (!timeRegister) {
        continue;
      }
      const job = await JobAssign.findById(timeRegister.refId);
      if (!job) {
        continue;
      }
      await job.updateOne({
        memberIds: swop(timeRegister._id, null, job.memberIds),
        userIds: swop(campMemberCard.userId, null, job.userIds),
      });
      await timeRegister.deleteOne();
    }
    j = 0;
    while (j < campMemberCard.mirrorBaanIds.length) {
      const mirror = await Mirror.findById(campMemberCard.mirrorBaanIds[j++]);
      if (!mirror) {
        continue;
      }
      const receiverBaan = await Baan.findById(mirror.receiverId);
      if (!receiverBaan) {
        continue;
      }
      await receiverBaan.updateOne({
        mirrorIds: swop(mirror._id, null, receiverBaan.mirrorIds),
      });
    }
    j = 0;
    while (j < campMemberCard.mirrorReceiverIds.length) {
      const mirror = await Mirror.findById(
        campMemberCard.mirrorReceiverIds[j++]
      );
      if (!mirror) {
        continue;
      }
      const otherCampMemberCard = await CampMemberCard.findById(
        mirror.senderCampMemberCardId
      );
      if (!otherCampMemberCard) {
        continue;
      }
      await otherCampMemberCard.updateOne({
        mirrorSenderIds: swop(
          mirror._id,
          null,
          otherCampMemberCard.mirrorSenderIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.mirrorSenderIds.length) {
      const mirror = await Mirror.findById(campMemberCard.mirrorSenderIds[j++]);
      if (!mirror) {
        continue;
      }
      const otherCampMemberCard = await CampMemberCard.findById(
        mirror.receiverId
      );
      if (!otherCampMemberCard) {
        continue;
      }
      await otherCampMemberCard.updateOne({
        mirrorReceiverIds: swop(
          mirror._id,
          null,
          otherCampMemberCard.mirrorReceiverIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.orderIds.length) {
      const order = await Order.findById(campMemberCard.orderIds[j++]);
      if (!order) {
        continue;
      }
      switch (order.types) {
        case "part": {
          const partOrder = await Part.findById(order.fromId);
          if (!partOrder) {
            continue;
          }
          await partOrder.updateOne({
            orderIds: swop(order._id, null, part.orderIds),
          });
          break;
        }
        case "baan": {
          if (order.fromId.toString() == baan._id.toString()) {
            baanOrderIds = swop(order._id, null, baanOrderIds);
          } else {
            const baanOrder = await Baan.findById(order.fromId);
            if (!baanOrder) {
              continue;
            }
            await baanOrder.updateOne({
              orderIds: swop(order._id, null, baanOrder.orderIds),
            });
          }
          break;
        }
      }
      await order.deleteOne();
    }
    await CampMemberCard.findByIdAndDelete(campMemberCard._id);
  }
  i = 0;
  while (i < baan.peeModelIds.length) {
    await PeeCamp.findByIdAndDelete(baan.peeModelIds[i++]);
  }
  i = 0;
  while (i < baan.imageAndDescriptionContainerIds.length) {
    const imageAndDescriptionContainer =
      await ImageAndDescriptionContainer.findById(
        baan.imageAndDescriptionContainerIds[i++]
      );
    if (!imageAndDescriptionContainer) {
      continue;
    }
    let j = 0;
    while (j < imageAndDescriptionContainer.childIds.length) {
      await ImageAndDescription.findByIdAndDelete(
        imageAndDescriptionContainer.childIds[j++]
      );
    }
    await imageAndDescriptionContainer.deleteOne();
  }
  i = 0;
  while (i < baan.jobIds.length) {
    const baanJob = await BaanJob.findById(baan.jobIds[i++]);
    if (!baanJob) {
      continue;
    }
    const job = await JobAssign.findById(baanJob.jobId);
    if (!job) {
      continue;
    }
    await job.updateOne({ memberIds: swop(baanJob._id, null, job.memberIds) });
  }
  i = 0;
  while (i < baan.groupContainerIds.length) {
    const container = await GroupContainer.findById(
      baan.groupContainerIds[i++]
    );
    if (!container) {
      continue;
    }
    let j = 0;
    while (j < container.subGroupIds.length) {
      await SubGroup.findByIdAndDelete(container.subGroupIds[j++]);
    }
  }
  i = 0;
  while (i < baanOrderIds.length) {
    const order = await Order.findById(baanOrderIds[i++]);
    if (!order) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      order.campMemberCardId
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      orderIds: swop(order._id, null, campMemberCard.orderIds),
    });
    await order.deleteOne();
  }
  await camp.updateOne({
    nongIds,
    peeIds,
    peeModelIds,
    baanIds: swop(baan._id, null, camp.baanIds),
    nongModelIds: swop(baan.nongModelId as Id, null, camp.nongModelIds),
  });
  await CampStyle.findByIdAndDelete(baan.styleId);
  await baan.deleteOne();
  res.status(200).json({ success: true });
}
export async function saveDeleteBaan(
  req: express.Request,
  res: express.Response
) {
  const baan = await Baan.findById(req.params.id);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  if (
    !user ||
    (user.role != "admin" && !user.authPartIds.includes(camp.partBoardId as Id))
  ) {
    return res.status(403).json({ success: false });
  }
  if (
    baan.nongIds.length ||
    baan.peeIds.length ||
    baan.songIds.length ||
    baan.nongChatIds.length ||
    baan.peeChatIds.length
  ) {
    return res
      .status(400)
      .json({ success: false, message: "this baan is not save to delete" });
  }
  let peeModelIds = camp.peeModelIds;
  let i = 0;
  while (i < baan.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(baan.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    peeModelIds = swop(peeCamp._id, null, peeModelIds);
    peeCamp.deleteOne();
  }
  const boyP = await Place.findById(baan.boySleepPlaceId);
  if (boyP) {
    await boyP.updateOne({
      boySleepBaanIds: swop(baan._id, null, boyP.boySleepBaanIds),
    });
    const boyB = await Building.findById(boyP.buildingId);
    if (boyB) {
      await boyB.updateOne({
        boySleepBaanIds: swop(baan._id, null, boyB.boySleepBaanIds),
      });
    }
  }
  const girlP = await Place.findById(baan.girlSleepPlaceId);
  if (girlP) {
    await girlP.updateOne({
      girlSleepBaanIds: swop(baan._id, null, girlP.girlSleepBaanIds),
    });
    const girlB = await Building.findById(girlP.buildingId);
    if (girlB) {
      await girlB.updateOne({
        girlSleepBaanIds: swop(baan._id, null, girlB.girlSleepBaanIds),
      });
    }
  }
  const normalP = await Place.findById(baan?.normalPlaceId);
  if (normalP) {
    await normalP.updateOne({
      normalBaanIds: swop(baan._id, null, normalP.normalBaanIds),
    });
    const normalB = await Building.findById(normalP.buildingId);
    if (normalB) {
      await normalB.updateOne({
        normalBaanIds: swop(baan._id, null, normalB.normalBaanIds),
      });
    }
  }
  await camp.updateOne({
    nongModelIds: swop(baan.nongModelId as Id, null, camp.nongModelIds),
    peeModelIds,
  });
  await NongCamp.findByIdAndDelete(baan.nongModelId);
  await CampStyle.findByIdAndDelete(baan.styleId);
  await baan.deleteOne();
  res.status(200).json({ success: true });
}
export async function saveDeletePart(
  req: express.Request,
  res: express.Response
) {
  const part = await Part.findById(req.params.id);
  if (!part) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(part.campId);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  if (
    !user ||
    (user.role != "admin" &&
      !user.authPartIds.includes(camp.partBoardId as Id)) ||
    part.auths.length ||
    part._id.equals(camp.partPeeBaanId)
  ) {
    return res.status(403).json({ success: false });
  }
  if (
    part.petoIds.length ||
    part.peeIds.length ||
    part.actionPlanIds.length ||
    part.workItemIds.length ||
    part.chatIds
  ) {
    return res
      .status(400)
      .json({ success: false, message: "this baan is not save to delete" });
  }
  let i = 0;
  while (i < part.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(part.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    camp.updateOne({ peeModelIds: swop(peeCamp._id, null, camp.peeModelIds) });
    peeCamp?.deleteOne();
  }
  camp.updateOne({
    petoModelIds: swop(part.petoModelId as Id, null, camp.petoModelIds),
  });
  await PetoCamp.findByIdAndDelete(part?.petoModelId);
  part.deleteOne();
  res.status(200).json({ success: true });
}
export async function forceDeletePart(
  req: express.Request,
  res: express.Response
) {
  forceDeletePartRaw(stringToId(req.params.id));
  res.status(200).json({ success: true });
}
async function forceDeletePartRaw(partId: Id) {
  const part = await Part.findById(partId);
  if (!part) {
    return;
  }
  const camp = await Camp.findById(part.campId);
  if (!camp) {
    return;
  }
  let petoIds = camp.petoIds;
  let peeIds = camp.peeIds;
  let peeModelIds = camp.peeModelIds;

  let partOrderIds = part.orderIds;
  let i = 0;
  while (i < part.peeCampMemberCardHaveHeathIssueIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      part.peeCampMemberCardHaveHeathIssueIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const baan = await Baan.findById(peeCamp.partId);
    if (!baan) {
      continue;
    }
    const heathIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
    if (!heathIssue) {
      continue;
    }
    if (camp.peeDataLock) {
      await heathIssue.updateOne({
        campIds: swop(camp._id, null, heathIssue.campIds),
      });
    } else {
      await heathIssue.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
    }
    await clearHealthIssue(campMemberCard._id);
    await baan.updateOne({
      peeHeathIssueIds: swop(heathIssue._id, null, baan.peeHeathIssueIds),
      peeCampMemberCardHaveHeathIssueIds: swop(
        campMemberCard._id,
        null,
        baan.peeCampMemberCardHaveHeathIssueIds
      ),
    });
  }
  i = 0;
  if (camp.petoDataLock) {
    while (i < part.petoCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.petoCampMemberCardHaveHeathIssueIds[i++]
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
      await clearHealthIssue(campMemberCard._id);
    }
  } else {
    while (i < part.petoCampMemberCardHaveHeathIssueIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        part.petoCampMemberCardHaveHeathIssueIds[i++]
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
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          heathIssue.campMemberCardIds
        ),
      });
      await clearHealthIssue(campMemberCard._id);
    }
  }
  i = 0;
  while (i < part.actionPlanIds.length) {
    const actionPlan = await ActionPlan.findById(part.actionPlanIds[i++]);
    if (!actionPlan) {
      continue;
    }
    let j = 0;
    while (j < actionPlan.placeIds.length) {
      const place = await Place.findById(actionPlan.placeIds[j++]);
      if (!place) {
        continue;
      }
      await place.updateOne({
        actionPlanIds: swop(actionPlan._id, null, place.actionPlanIds),
      });
      const building = await Building.findById(place.buildingId);
      if (!building) {
        continue;
      }
      await building.updateOne({
        actionPlanIds: swop(actionPlan._id, null, building.actionPlanIds),
      });
    }
  }
  i = 0;
  while (i < part.workItemIds.length) {
    const workItem = await WorkItem.findById(part.workItemIds[i++]);
    if (!workItem) {
      continue;
    }
    if (workItem.fromId) {
      const from = await WorkItem.findById(workItem.fromId);
      if (from) {
        await from.updateOne({
          linkOutIds: swop(workItem._id, null, from.linkOutIds),
        });
      }
    }
    await deleteWorkingItemRaw(workItem._id);
  }
  i = 0;
  while (i < part.peeModelIds.length) {
    const peeCamp = await PeeCamp.findById(part.peeModelIds[i++]);
    if (!peeCamp) {
      continue;
    }
    const baan = await Baan.findById(peeCamp.baanId);
    if (!baan) {
      continue;
    }
    let j = 0;
    while (j < peeCamp.peeIds.length) {
      const user = await User.findById(peeCamp.peeIds[j++]);
      if (!user) {
        continue;
      }
      await user.updateOne({
        peeCampIds: swop(peeCamp._id, null, user.peeCampIds),
      });
    }
    peeModelIds = swop(peeCamp._id, null, peeModelIds);
  }
  const petoCamp = await PetoCamp.findById(part.petoModelId);
  if (!petoCamp) {
    return;
  }
  i = 0;
  while (i < petoCamp?.petoIds.length) {
    const user = await User.findById(petoCamp.petoIds);
    if (!user) {
      continue;
    }
    petoIds = swop(user._id, null, petoIds);
    await user.updateOne({
      petoCampIds: swop(petoCamp._id, null, user.petoCampIds),
    });
  }
  i = 0;
  while (i < part.chatIds.length) {
    await deleteChatRaw(part.chatIds[i++]);
  }
  petoCamp.deleteOne();
  i = 0;
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
    await user.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    let j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    j = 0;
    while (j < campMemberCard.partJobIds.length) {
      await TimeRegister.findByIdAndDelete(campMemberCard.partJobIds[j++]);
    }
    j = 0;
    while (j < campMemberCard.orderIds.length) {
      const order = await Order.findById(campMemberCard.orderIds[j++]);
      if (!order) {
        continue;
      }
      if (order.fromId.toString() == part._id.toString()) {
        partOrderIds = swop(order._id, null, partOrderIds);
      } else {
        const partOrder = await Part.findById(order.fromId);
        if (!partOrder) {
          continue;
        }
        await partOrder.updateOne({
          orderIds: swop(order._id, null, partOrder.orderIds),
        });
      }
      await order.deleteOne();
    }
    campMemberCard?.deleteOne();
    if (camp.peeAnswerIds.includes(user._id)) {
      await removeAnswer(user._id, camp._id);
    }
  }
  i = 0;
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
    await user?.updateOne({
      campMemberCardIds: swop(campMemberCard._id, null, user.campMemberCardIds),
    });
    const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
    if (!peeCamp) {
      continue;
    }
    const baan = await Baan.findById(peeCamp.baanId);
    if (!baan) {
      continue;
    }
    if (part.peeHaveBottleIds.includes(user._id)) {
      await baan.updateOne({
        peeHaveBottleIds: swop(user._id, null, baan.peeHaveBottleIds),
      });
    }
    await baan.updateOne({});
    peeIds = swop(user._id, null, peeIds);
    if (campMemberCard.sleepAtCamp) {
      await baan.updateOne({
        peeSleepIds: swop(user._id, null, baan.peeSleepIds),
      });
    }
    baan.updateOne({
      peeCampMemberCardIds: swop(
        campMemberCard?._id,
        null,
        part.peeCampMemberCardIds
      ),
      peeIds: swop(user._id, null, baan.peeIds),
    });
    baan.peeShirtSize.set(
      campMemberCard.size,
      calculate(baan.peeShirtSize.get(campMemberCard.size), 0, 1)
    );
    let j = 0;
    while (j < campMemberCard.allChatIds.length) {
      const chat = await Chat.findById(campMemberCard.allChatIds[j++]);
      if (!chat) {
        continue;
      }
      await chat.updateOne({
        campMemberCardIds: swop(
          campMemberCard._id,
          null,
          chat.campMemberCardIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.ownChatIds.length) {
      await deleteChatRaw(campMemberCard.ownChatIds[j++]);
    }
    if (camp.peeAnswerIds.includes(user._id)) {
      await removeAnswer(user._id, camp._id);
    }
    j = 0;
    while (j < campMemberCard.baanJobIds.length) {
      const timeRegister = await TimeRegister.findById(
        campMemberCard.baanJobIds[j++]
      );
      if (!timeRegister) {
        continue;
      }
      const baanJob = await BaanJob.findById(timeRegister.refId);
      if (!baanJob) {
        continue;
      }
      await baanJob.updateOne({
        memberIds: swop(timeRegister._id, null, baanJob.memberIds),
        userIds: swop(campMemberCard.userId, null, baanJob.userIds),
      });
      await timeRegister.deleteOne();
    }
    j = 0;
    while (j < campMemberCard.partJobIds.length) {
      await TimeRegister.findByIdAndDelete(campMemberCard.partJobIds[j++]);
    }
    j = 0;
    while (j < campMemberCard.mirrorBaanIds.length) {
      const mirror = await Mirror.findById(campMemberCard.mirrorBaanIds[j++]);
      if (!mirror) {
        continue;
      }
      const receiverBaan = await Baan.findById(mirror.receiverId);
      if (!receiverBaan) {
        continue;
      }
      await receiverBaan.updateOne({
        mirrorIds: swop(mirror._id, null, receiverBaan.mirrorIds),
      });
    }
    j = 0;
    while (j < campMemberCard.mirrorReceiverIds.length) {
      const mirror = await Mirror.findById(
        campMemberCard.mirrorReceiverIds[j++]
      );
      if (!mirror) {
        continue;
      }
      const otherCampMemberCard = await CampMemberCard.findById(
        mirror.senderCampMemberCardId
      );
      if (!otherCampMemberCard) {
        continue;
      }
      await otherCampMemberCard.updateOne({
        mirrorSenderIds: swop(
          mirror._id,
          null,
          otherCampMemberCard.mirrorSenderIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.mirrorSenderIds.length) {
      const mirror = await Mirror.findById(campMemberCard.mirrorSenderIds[j++]);
      if (!mirror) {
        continue;
      }
      const otherCampMemberCard = await CampMemberCard.findById(
        mirror.receiverId
      );
      if (!otherCampMemberCard) {
        continue;
      }
      await otherCampMemberCard.updateOne({
        mirrorReceiverIds: swop(
          mirror._id,
          null,
          otherCampMemberCard.mirrorReceiverIds
        ),
      });
    }
    j = 0;
    while (j < campMemberCard.subGroupIds.length) {
      await removeMemberFromSubGroupRaw(
        campMemberCard._id,
        campMemberCard.subGroupIds[j++]
      );
    }
    j = 0;
    while (j < campMemberCard.orderIds.length) {
      const order = await Order.findById(campMemberCard.orderIds[j++]);
      if (!order) {
        continue;
      }
      switch (order.types) {
        case "part": {
          if (order.fromId.toString() == part._id.toString()) {
            partOrderIds = swop(order._id, null, partOrderIds);
          } else {
            const partOrder = await Part.findById(order.fromId);
            if (!partOrder) {
              continue;
            }
            await partOrder.updateOne({
              orderIds: swop(order._id, null, partOrder.orderIds),
            });
          }
          break;
        }
        case "baan": {
          const baanOrder = await Baan.findById(order.fromId);
          if (!baanOrder) {
            continue;
          }
          await baanOrder.updateOne({
            orderIds: swop(order._id, null, baanOrder.orderIds),
          });
        }
      }
      await order.deleteOne();
    }
    await campMemberCard.deleteOne();
    await baan.updateOne({ peeShirtSize: baan.peeShirtSize });
  }
  i = 0;
  while (i < part.peeModelIds.length) {
    await PeeCamp.findByIdAndDelete(part.peeModelIds[i++]);
  }
  i = 0;
  while (i < part.jobIds.length) {
    await JobAssign.findByIdAndDelete(part.jobIds[i++]);
  }
  i = 0;
  while (i < partOrderIds.length) {
    const order = await Order.findById(partOrderIds[i++]);
    if (!order) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      order.campMemberCardId
    );
    if (!campMemberCard) {
      continue;
    }    await campMemberCard.updateOne({
      orderIds: swop(order._id, null, campMemberCard.orderIds),
    });
    await order.deleteOne();
  }
  await camp.updateOne({
    partIds: swop(part._id, null, camp.partIds),
    petoModelIds: swop(part.petoModelId as Id, null, camp.petoModelIds),
    peeModelIds,
    petoIds,
    peeIds,
  });
  if (part.auths.length) {
    let j = 0;
    while (j < part.peeIds.length) {
      const user = await User.findById(part.peeIds[j++]);
      if (!user) {
        continue;
      }
      await user.updateOne({
        authPartIds: swop(part._id, null, user.authPartIds),
        authorizeIds: swop(camp._id, null, user.authorizeIds),
      });
    }
    j = 0;
    while (j < part.petoIds.length) {
      const user = await User.findById(part.petoIds[j++]);
      if (!user) {
        continue;
      }
      await user.updateOne({
        authPartIds: swop(part._id, null, user.authPartIds),
        authorizeIds: swop(camp._id, null, user.authorizeIds),
      });
    }
  }
  await part.deleteOne();
}
export async function addPartName(req: express.Request, res: express.Response) {
  const name = await PartNameContainer.create({ name: req.params.id });
  res.status(201).json(name);
}
export async function saveDeletePartName(
  req: express.Request,
  res: express.Response
) {
  try {
    const hospital = await PartNameContainer.findById(req.params.id);
    res.status(400).json({
      success: false,
    });
    if (hospital?.campIds.length) {
      return res
        .status(400)
        .json({ success: false, massage: "this not safe to delete" });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function forceDeletePartName(
  req: express.Request,
  res: express.Response
) {
  const partNameContainer = await PartNameContainer.findById(req.params.id);
  if (!partNameContainer) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < partNameContainer.partIds.length) {
    await forceDeletePartRaw(partNameContainer.partIds[i++]);
  }
  res.status(200).json({ success: true });
}
async function removeAnswer(userId: Id, campId: Id) {
  const camp = await Camp.findById(campId);
  const user = await User.findById(userId);
  if (!camp || !user) {
    return;
  }
  const answerContainer = await AnswerContainer.findById(
    camp.mapAnswerPackIdByUserId.get(user._id.toString())
  );
  if (!answerContainer) {
    return;
  }
  const role = answerContainer.role;
  let i = 0;
  while (i < answerContainer.choiceAnswerIds.length) {
    const choiceAnswer = await ChoiceAnswer.findById(
      answerContainer.choiceAnswerIds[i++]
    );
    if (!choiceAnswer) {
      continue;
    }
    const choiceQuestion = await ChoiceQuestion.findById(
      choiceAnswer.questionId
    );
    if (!choiceQuestion) {
      continue;
    }
    switch (choiceAnswer.answer) {
      case "A": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerA: choiceQuestion.nongAnswerA - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerA: choiceQuestion.peeAnswerA - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "B": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerB: choiceQuestion.nongAnswerB - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerB: choiceQuestion.peeAnswerB - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "C": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerC: choiceQuestion.nongAnswerC - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerC: choiceQuestion.peeAnswerC - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "D": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerD: choiceQuestion.nongAnswerD - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerD: choiceQuestion.peeAnswerD - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "E": {
        if (role == "nong") {
          await choiceQuestion.updateOne({
            nongAnswerE: choiceQuestion.nongAnswerE - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        } else {
          await choiceQuestion.updateOne({
            peeAnswerE: choiceQuestion.peeAnswerE - 1,
            answerIds: swop(choiceAnswer._id, null, choiceQuestion.answerIds),
          });
        }
        break;
      }
      case "-": {
        break;
      }
    }
    await choiceAnswer.deleteOne();
  }
  i = 0;
  while (i < answerContainer.textAnswerIds.length) {
    const textAnswer = await TextAnswer.findById(
      answerContainer.textAnswerIds[i++]
    );
    if (!textAnswer) {
      continue;
    }
    const textQuestion = await TextQuestion.findById(textAnswer.questionId);
    if (!textQuestion) {
      continue;
    }
    await textQuestion.updateOne({
      answerIds: swop(textAnswer._id, null, textQuestion.answerIds),
    });
  }
  camp.mapAnswerPackIdByUserId.delete(user._id.toString());
  if (role == "nong") {
    await camp.updateOne({
      mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
      nongAnswerPackIds: swop(
        answerContainer._id,
        null,
        camp.nongAnswerPackIds
      ),
    });
    await user.updateOne({
      nongAnswerPackIds: swop(
        answerContainer._id,
        null,
        user.nongAnswerPackIds
      ),
    });
  } else {
    await camp.updateOne({
      mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
      peeAnswerPackIds: swop(answerContainer._id, null, camp.peeAnswerPackIds),
      peeAnswerIds: swop(user._id, null, camp.peeAnswerIds),
    });
    await user.updateOne({
      peeAnswerPackIds: swop(answerContainer._id, null, user.peeAnswerPackIds),
    });
  }
  await answerContainer.deleteOne();
}
async function clearHealthIssue(campMemberCardId: Id) {
  const campMemberCard = await CampMemberCard.findById(campMemberCardId);
  if (!campMemberCard) {
    return;
  }
  const healthIssue = await HeathIssue.findById(campMemberCard.healthIssueId);
  if (!healthIssue) {
    return;
  }
  const user = await User.findById(healthIssue.userId);
  if (!user) {
    return;
  }
  let i = 0;
  switch (campMemberCard.role) {
    case "nong": {
      while (i < campMemberCard.whiteListFoodIds.length) {
        const food = await Food.findById(campMemberCard.whiteListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          // nongIds: swop(user._id, null, food.nongIds),
          nongCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.nongCampMemberCardIds
          ),
          // nongHeathIssueIds: swop(
          //   healthIssue._id,
          //   null,
          //   food.nongCampMemberCardIds
          // ),
        });
      }
      i = 0;
      while (i < campMemberCard.blackListFoodIds.length) {
        const food = await Food.findById(campMemberCard.blackListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          // nongIds: swop(user._id, null, food.nongIds),
          nongCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.nongCampMemberCardIds
          ),
          // nongHeathIssueIds: swop(
          //   healthIssue._id,
          //   null,
          //   food.nongCampMemberCardIds
          // ),
        });
      }
      break;
    }
    case "pee": {
      while (i < campMemberCard.whiteListFoodIds.length) {
        const food = await Food.findById(campMemberCard.whiteListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          // peeIds: swop(user._id, null, food.peeIds),
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.peeCampMemberCardIds
          ),
          // peeHeathIssueIds: swop(healthIssue._id, null, food.peeHeathIssueIds),
        });
      }
      i = 0;
      while (i < campMemberCard.blackListFoodIds.length) {
        const food = await Food.findById(campMemberCard.blackListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          // peeIds: swop(user._id, null, food.peeIds),
          peeCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.peeCampMemberCardIds
          ),
          // peeHeathIssueIds: swop(healthIssue._id, null, food.peeHeathIssueIds),
        });
      }
      break;
    }
    case "peto": {
      while (i < campMemberCard.whiteListFoodIds.length) {
        const food = await Food.findById(campMemberCard.whiteListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          // petoIds: swop(user._id, null, food.petoIds),
          petoCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.petoCampMemberCardIds
          ),
          // petoHeathIssueIds: swop(
          //   healthIssue._id,
          //   null,
          //   food.petoHeathIssueIds
          // ),
        });
      }
      i = 0;
      while (i < campMemberCard.blackListFoodIds.length) {
        const food = await Food.findById(campMemberCard.blackListFoodIds[i++]);
        if (!food) {
          continue;
        }
        await food.updateOne({
          // petoIds: swop(user._id, null, food.petoIds),
          petoCampMemberCardIds: swop(
            campMemberCard._id,
            null,
            food.petoCampMemberCardIds
          ),
          // petoHeathIssueIds: swop(
          //   healthIssue._id,
          //   null,
          //   food.petoHeathIssueIds
          // ),
        });
      }
      break;
    }
  }
  if (
    !healthIssue._id.equals(user.healthIssueId) &&
    healthIssue.campIds.length == 0
  ) {
    await healthIssue.deleteOne();
  }
}
