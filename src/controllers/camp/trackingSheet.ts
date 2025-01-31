import { getUser } from "../../middleware/auth";
import Camp from "../../models/Camp";
import {
  InterWorkingItem,
  SuccessBase,
  CreateWorkingItem,
} from "../../models/interface";
import Part from "../../models/Part";
import WorkItem from "../../models/WorkItem";
import { deleteWorkingItemRaw } from "../admin/main";
import { sendRes, swop, stringToId } from "../setup";
import bcrypt from "bcrypt";
import express from "express";

export async function getWorkingItemByPartId(
  req: express.Request,
  res: express.Response
) {
  try {
    const part = await Part.findById(req.params.id);
    const data: InterWorkingItem[] = [];
    if (!part) {
      sendRes(res, false);
      return;
    }
    const user = await getUser(req);
    const camp = await Camp.findById(part.campId);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllTrackingSheet &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let j = 0;
    while (j < part.workItemIds.length) {
      const workItem: InterWorkingItem | null = await WorkItem.findById(
        part.workItemIds[j++]
      );
      if (!workItem) {
        continue;
      }
      const {
        name,
        link,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        password,
        partName,
      } = workItem;
      const isMatch = await bcrypt.compare(user.linkHash, password);
      if (isMatch) {
        data.push({
          link,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      } else {
        data.push({
          link: null,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      }
    }
    const buffer: SuccessBase<InterWorkingItem[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
export async function createWorkingItem(
  req: express.Request,
  res: express.Response
) {
  const create: CreateWorkingItem = req.body;
  const hospital = await WorkItem.create(create);
  const user = await getUser(req);
  const part = await Part.findById(create.partId);
  const camp = await Camp.findById(part?.campId);
  await part?.updateOne({
    workItemIds: swop(null, hospital._id, part.workItemIds),
  });
  await camp?.updateOne({
    workItemIds: swop(null, hospital._id, camp.workItemIds),
  });
  await hospital.updateOne({ partName: part?.partName });
  if (create.fromId) {
    const from = await WorkItem.findById(create.fromId);
    await from?.updateOne({
      linkOutIds: swop(null, hospital._id, from.linkOutIds),
    });
  }
  await hospital.updateOne({ createBy: user?._id, partName: part?.partName });
  res.status(200).json(hospital);
}
export async function updateWorkingItem(
  req: express.Request,
  res: express.Response
) {
  try {
    const { status, link, name } = req.body;

    const hospital = await WorkItem.findById(req.params.id);
    if (!hospital) {
      sendRes(res, false);
      return;
    }
    await hospital.updateOne({ status, link, name });
    if (!hospital) {
      sendRes(res, false);
      return;
    }
    res.status(200).json(hospital);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function deleteWorkingItem(
  req: express.Request,
  res: express.Response
) {
  try {
    await deleteWorkingItemRaw(stringToId(req.params.id));
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
export async function getWorkingItems(
  req: express.Request,
  res: express.Response
) {
  try {
    const data: InterWorkingItem[] = [];
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
        while (j < camp.workItemIds.length) {
          const workItem: InterWorkingItem | null = await WorkItem.findById(
            camp.workItemIds[j++]
          );
          if (!workItem) {
            continue;
          }
          data.push(workItem);
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
        while (j < camp.workItemIds.length) {
          const workItem: InterWorkingItem | null = await WorkItem.findById(
            camp.workItemIds[j++]
          );
          if (!workItem) {
            continue;
          }
          const {
            name,
            link,
            status,
            partId,
            linkOutIds,
            fromId,
            createBy,
            _id,
            password,
            partName,
          } = workItem;
          const isMatch = await bcrypt.compare(user.linkHash, password);
          if (isMatch) {
            data.push({
              link,
              status,
              partId,
              linkOutIds,
              fromId,
              createBy,
              _id,
              partName,
              password,
              name,
            });
          } else {
            data.push({
              link: null,
              status,
              partId,
              linkOutIds,
              fromId,
              createBy,
              _id,
              partName,
              password,
              name,
            });
          }
        }
      }
    }
    const buffer: SuccessBase<InterWorkingItem[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch {
    res.status(400).json({
      success: false,
    });
  }
}
export async function getWorkingItem(
  req: express.Request,
  res: express.Response
) {
  try {
    const workItem: InterWorkingItem | null = await WorkItem.findById(
      req.params.id
    );
    const user = await getUser(req);
    if (!workItem || !user) {
      sendRes(res, false);
      return;
    }
    let data: InterWorkingItem;
    const {
      name,
      link,
      status,
      partId,
      linkOutIds,
      fromId,
      createBy,
      _id,
      password,
      partName,
    } = workItem;
    const isMatch = await bcrypt.compare(user.linkHash, password);
    if (isMatch) {
      data = {
        link,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        partName,
        password,
        name,
      };
    } else {
      data = {
        link: null,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        partName,
        password,
        name,
      };
    }
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
}

export async function getWorkingItemByCampId(
  req: express.Request,
  res: express.Response
) {
  try {
    const camp = await Camp.findById(req.params.id);
    const data: InterWorkingItem[] = [];
    const user = await getUser(req);
    if (
      !camp ||
      !user ||
      (camp.nongIds.includes(user._id) &&
        !(
          camp.canNongSeeAllTrackingSheet &&
          (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
        ))
    ) {
      sendRes(res, false);
      return;
    }
    let j = 0;
    while (j < camp.workItemIds.length) {
      const workItem: InterWorkingItem | null = await WorkItem.findById(
        camp.workItemIds[j++]
      );
      if (!workItem) {
        continue;
      }
      const {
        name,
        link,
        status,
        partId,
        linkOutIds,
        fromId,
        createBy,
        _id,
        password,
        partName,
      } = workItem;
      const isMatch = await bcrypt.compare(user.linkHash, password);
      if (isMatch) {
        data.push({
          link,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      } else {
        data.push({
          link: null,
          status,
          partId,
          linkOutIds,
          fromId,
          createBy,
          _id,
          partName,
          password,
          name,
        });
      }
    }
    const buffer: SuccessBase<InterWorkingItem[]> = {
      data,
      success: true,
    };
    res.status(200).json(buffer);
  } catch (err) {
    console.log(err);
  }
}
