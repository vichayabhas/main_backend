import { getUser } from "../../middleware/auth";
import ActionPlan from "../../models/ActionPlan";
import Building from "../../models/Building";
import Camp from "../../models/Camp";
import {
  showActionPlan,
  InterActionPlan,
  SuccessBase,
  CreateActionPlan,
  UpdateActionPlan,
} from "../../models/interface";
import Part from "../../models/Part";
import Place from "../../models/Place";
import User from "../../models/User";
import { sendRes, swop, removeDuplicate } from "../setup";
import express from "express";

export async function getActionPlanByPartId(
  req: express.Request,
  res: express.Response
) {
  try {
    const part = await Part.findById(req.params.id);
    const data: showActionPlan[] = [];
    const user = await getUser(req);
    if (!part) {
      sendRes(res, false);
      return;
    }
    const camp = await Camp.findById(part.campId);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllActionPlan &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let i = 0;
    while (i < part.actionPlanIds.length) {
      const actionPlan: InterActionPlan | null = await ActionPlan.findById(
        part.actionPlanIds[i++]
      );
      if (!actionPlan) {
        continue;
      }
      const {
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        partName,
        _id,
      } = actionPlan;
      const user = await User.findById(headId);
      if (!user) {
        continue;
      }
      let j = 0;
      const placeName: string[] = [];
      while (j < placeIds.length) {
        const place = await Place.findById(placeIds[j++]);
        const building = await Building.findById(place?.buildingId);
        placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
      }
      data.push({
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        headName: user.nickname,
        headTel: user.tel,
        partName,
        placeName,
        _id,
      });
    }
    data.sort((a, b) => a.start.getTime() - b.start.getTime());
    const buffer: SuccessBase<showActionPlan[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
export async function createActionPlan(
  req: express.Request,
  res: express.Response
) {
  const create: CreateActionPlan = req.body;
  const hospital = await ActionPlan.create(create);
  const part = await Part.findById(create.partId);
  const camp = await Camp.findById(part?.campId);
  await part?.updateOne({
    actionPlanIds: swop(null, hospital._id, part.actionPlanIds),
  });
  await camp?.updateOne({
    actionPlanIds: swop(null, hospital._id, camp.actionPlanIds),
  });
  await hospital.updateOne({ partName: part?.partName });
  let i = 0;
  while (i < hospital.placeIds.length) {
    const place = await Place.findById(create.placeIds[i++]);
    const building = await Building.findById(place?.buildingId);
    await place?.updateOne({
      actionPlanIds: swop(null, hospital._id, place.actionPlanIds),
    });
    await building?.updateOne({
      actionPlanIds: swop(null, hospital._id, building.actionPlanIds),
    });
  }
  res.status(200).json(hospital);
}
export async function updateActionPlan(
  req: express.Request,
  res: express.Response
) {
  try {
    const actionPlan = await ActionPlan.findById(req.params.id);
    if (!actionPlan) {
      sendRes(res, false);
      return;
    }
    let i = 0;
    const update: UpdateActionPlan = req.body;
    const removes = removeDuplicate(actionPlan.placeIds, update.placeIds);
    const adds = removeDuplicate(update.placeIds, actionPlan.placeIds);
    while (i < removes.length) {
      const place = await Place.findById(removes[i++]);
      if (!place) {
        continue;
      }
      const building = await Building.findById(place.buildingId);
      if (!building) {
        continue;
      }
      await place.updateOne({
        actionPlanIds: swop(actionPlan._id, null, place.actionPlanIds),
      });
      await building?.updateOne({
        actionPlanIds: swop(actionPlan._id, null, building.actionPlanIds),
      });
    }
    while (i < adds.length) {
      const place = await Place.findById(adds[i++]);
      if (!place) {
        continue;
      }
      const building = await Building.findById(place.buildingId);
      if (!building) {
        continue;
      }
      await place.updateOne({
        actionPlanIds: swop(null, actionPlan._id, place.actionPlanIds),
      });
      await building.updateOne({
        actionPlanIds: swop(null, actionPlan._id, building.actionPlanIds),
      });
    }
    await actionPlan.updateOne(update);
    sendRes(res, true);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function deleteActionPlan(
  req: express.Request,
  res: express.Response
) {
  try {
    const hospital = await ActionPlan.findById(req.params.id);
    if (!hospital) {
      res.status(400).json({
        success: false,
      });
      return;
    }
    const part = await Part.findById(hospital.partId);
    if (!part) {
      sendRes(res, false);
      return;
    }
    const buf = swop(hospital._id, null, part.actionPlanIds);
    await part?.updateOne({ actionPlanIds: buf });
    const camp = await Camp.findById(part.campId);
    await camp?.updateOne({
      actionPlanIds: swop(hospital._id, null, camp.actionPlanIds),
    });
    let i = 0;
    while (i < hospital.placeIds.length) {
      const place = await Place.findById(hospital.placeIds[i++]);
      const building = await Building.findById(place?.buildingId);
      await place?.updateOne({
        actionPlanIds: swop(hospital._id, null, place.actionPlanIds),
      });
      await building?.updateOne({
        actionPlanIds: swop(hospital._id, null, building.actionPlanIds),
      });
    }

    await hospital?.deleteOne();
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
export async function getActionPlans(
  req: express.Request,
  res: express.Response
) {
  try {
    const data: showActionPlan[] = [];
    const user = await getUser(req);
    if (!user) {
      sendRes(res, false);
      return;
    }
    if (user.filterIds.length == 0) {
      let i = 0;
      while (i < user.registerIds.length) {
        const camp = await Camp.findById(user.registerIds[i++]);
        if (!camp) {
          continue;
        }
        let j = 0;
        while (j < camp.actionPlanIds.length) {
          const actionPlan: InterActionPlan | null = await ActionPlan.findById(
            camp.actionPlanIds[j++]
          );
          if (!actionPlan) {
            continue;
          }
          const {
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            partName,
            _id,
          } = actionPlan;
          const user = await User.findById(headId);
          if (!user) {
            continue;
          }
          let k = 0;
          const placeName: string[] = [];
          while (k < placeIds.length) {
            const place = await Place.findById(placeIds[k++]);
            const building = await Building.findById(place?.buildingId);
            placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
          }
          data.push({
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            headName: user.nickname,
            headTel: user.tel,
            partName,
            placeName,
            _id,
          });
        }
      }
    } else {
      let i = 0;
      while (i < user.filterIds.length) {
        const camp = await Camp.findById(user.filterIds[i++]);
        if (!camp) {
          continue;
        }
        let j = 0;
        while (j < camp.actionPlanIds.length) {
          const actionPlan: InterActionPlan | null = await ActionPlan.findById(
            camp.actionPlanIds[j++]
          );
          if (!actionPlan) {
            continue;
          }
          const {
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            partName,
            _id,
          } = actionPlan;
          const user = await User.findById(headId);
          if (!user) {
            continue;
          }
          let k = 0;
          const placeName: string[] = [];
          while (k < placeIds.length) {
            const place = await Place.findById(placeIds[k++]);
            const building = await Building.findById(place?.buildingId);
            placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
          }
          data.push({
            action,
            partId,
            placeIds,
            start,
            end,
            headId,
            body,
            headName: user.nickname,
            headTel: user.tel,
            partName,
            placeName,
            _id,
          });
        }
      }
    }
    data.sort((a, b) => a.start.getTime() - b.start.getTime());
    const buffer: SuccessBase<showActionPlan[]> = { data, success: true };
    res.status(200).json(buffer);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}

export async function getActionPlan(
  req: express.Request,
  res: express.Response
) {
  try {
    const actionPlan: InterActionPlan | null = await ActionPlan.findById(
      req.params.id
    );
    if (!actionPlan) {
      sendRes(res, false);
      return;
    }
    const {
      action,
      partId,
      placeIds,
      start,
      end,
      headId,
      body,
      partName,
      _id,
    } = actionPlan;
    const user = await User.findById(headId);
    let i = 0;
    const placeName: string[] = [];
    while (i < placeIds.length) {
      const place = await Place.findById(placeIds[i++]);
      const building = await Building.findById(place?.buildingId);
      placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
    }
    const show: showActionPlan = {
      action,
      partId,
      placeIds,
      start,
      end,
      headId,
      body,
      headName: user?.nickname as string,
      headTel: user?.tel as string,
      partName,
      placeName,
      _id,
    };
    res.status(200).json(show);
  } catch (err) {
    console.log(err);
  }
}

export async function getActionPlanByCampId(
  req: express.Request,
  res: express.Response
) {
  try {
    const camp = await Camp.findById(req.params.id);
    const data: showActionPlan[] = [];
    const user = await getUser(req);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllActionPlan &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let i = 0;
    while (i <= camp.actionPlanIds.length) {
      const actionPlan: InterActionPlan | null = await ActionPlan.findById(
        camp.actionPlanIds[i++]
      );
      if (!actionPlan) {
        continue;
      }
      const {
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        partName,
        _id,
      } = actionPlan;
      const user = await User.findById(headId);
      if (!user) {
        continue;
      }
      let j = 0;
      const placeName: string[] = [];
      while (j < placeIds.length) {
        const place = await Place.findById(placeIds[j++]);
        const building = await Building.findById(place?.buildingId);
        placeName.push(`${building?.name} ${place?.floor} ${place?.room}`);
      }
      data.push({
        action,
        partId,
        placeIds,
        start,
        end,
        headId,
        body,
        headName: user.nickname,
        headTel: user.tel,
        partName,
        placeName,
        _id,
      });
    }
    data.sort((a, b) => a.start.getTime() - b.start.getTime());
    const buffer: SuccessBase<showActionPlan[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
