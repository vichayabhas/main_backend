import { getUser } from "../../middleware/auth";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import GroupContainer from "../../models/GroupContainer";
import HealthIssue from "../../models/HealthIssue";
import {
  BasicUser,
  CreateGroupContainer,
  CreateSubGroup,
  CreateSubGroupByAnyone,
  FoodLimit,
  GetGroupContainer,
  GetGroupContainerForAdmin,
  GetSubGroup,
  GroupContainerPack,
  GroupGenderType,
  GroupRoleType,
  HealthIssueBody,
  Id,
  InterCampMemberCard,
  InterGroupContainer,
  InterSubGroup,
  RegisterGroup,
  SubGroupGenderType,
  SubGroupRoleType,
  UpdateGroupContainer,
  UpdateSubGroup,
} from "../../models/interface";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import SubGroup from "../../models/SubGroup";
import User from "../../models/User";
import { ifIsTrue, removeDuplicate, sendRes, swop } from "../setup";
import express from "express";
import { getAuthTypes } from "./getCampData";
//*export async function removeMemberFromSubGroupRaw
//*export async function createGroupContainer
//*export async function createSubGroup
//*export async function getGroupContainerRaw
//*export async function updateGroupContainer
//*export async function updateSubGroup
//*export async function deleteGroupContainer
//*export async function deleteSubGroup
//*export async function getGroupContainerForAdmin
export async function removeMemberFromSubGroupRaw(
  campMemberCardId: Id,
  subGroupId: Id
) {
  const subGroup = await SubGroup.findById(subGroupId);
  if (!subGroup) {
    return;
  }
  const groupContainer = await GroupContainer.findById(subGroup.containerId);
  if (!groupContainer) {
    return;
  }
  if (subGroup.campMemberCardIds.length == 1) {
    if (groupContainer.roleType == "เลือกพี่หรือน้องตามคนแรก") {
      if (groupContainer.genderType == "เลือกเพศตามคนแรก") {
        await subGroup.updateOne({
          campMemberCardIds: swop(
            campMemberCardId,
            null,
            subGroup.campMemberCardIds
          ),
          genderType: "คละเพศ",
          roleType: "คละพี่และน้อง",
        });
      } else {
        await subGroup.updateOne({
          campMemberCardIds: swop(
            campMemberCardId,
            null,
            subGroup.campMemberCardIds
          ),
          roleType: "คละพี่และน้อง",
        });
      }
    } else {
      if (groupContainer.genderType == "เลือกเพศตามคนแรก") {
        await subGroup.updateOne({
          campMemberCardIds: swop(
            campMemberCardId,
            null,
            subGroup.campMemberCardIds
          ),
          genderType: "คละเพศ",
        });
      } else {
        await subGroup.updateOne({
          campMemberCardIds: swop(
            campMemberCardId,
            null,
            subGroup.campMemberCardIds
          ),
        });
      }
    }
  } else {
    await subGroup.updateOne({
      campMemberCardIds: swop(
        campMemberCardId,
        null,
        subGroup.campMemberCardIds
      ),
    });
  }
}

export async function createGroupContainer(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const {
    baanId,
    canAnybodyCreateSubGroup,
    genderType,
    name,
    roleType,
  }: CreateGroupContainer = req.body;
  const baan = await Baan.findById(baanId);
  if (!baan || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
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
  switch (campMemberCard.role) {
    case "nong": {
      sendRes(res, false);
      return;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(campMemberCard.campModelId);
      if (!campModel || campModel.baanId.toString() != baan._id.toString()) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
    case "peto": {
      const campModel = await PetoCamp.findById(campMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
  }
  const container = await GroupContainer.create({
    baanId,
    genderType,
    name,
    isDefault: !baan.defaultGroupId,
    canAnybodyCreateSubGroup,
    roleType,
  });
  const groupContainerIds = swop(null, container._id, baan.groupContainerIds);
  if (!baan.defaultGroupId) {
    await baan.updateOne({
      defaultGroupId: container._id,
      groupContainerIds,
    });
  } else {
    await baan.updateOne({ groupContainerIds });
  }
  const groups: GetGroupContainer[] = [];
  let i = 0;
  while (i < groupContainerIds.length) {
    const group = await getGroupContainerRaw(groupContainerIds[i++]);
    if (!group) {
      continue;
    }
    groups.push(group);
  }
  res.status(201).json(groups);
}
export async function createSubGroup(
  req: express.Request,
  res: express.Response
) {
  const {
    containerId,
    limit,
    name,
    isMany,
    count,
    start,
    gender,
    role,
  }: CreateSubGroup = req.body;
  const container = await GroupContainer.findById(containerId);
  const user = await getUser(req);
  if (!container || !user) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
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
  switch (campMemberCard.role) {
    case "nong": {
      sendRes(res, false);
      return;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(campMemberCard.campModelId);
      if (!campModel || campModel.baanId.toString() != baan._id.toString()) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
    case "peto": {
      const campModel = await PetoCamp.findById(campMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
  }
  await createSubGroupRaw({
    gender,
    role,
    isMany,
    start,
    count,
    containerId,
    limit,
    name,
  });
  const groups: GetGroupContainer[] = [];
  let i = 0;
  while (i < baan.groupContainerIds.length) {
    const group = await getGroupContainerRaw(baan.groupContainerIds[i++]);
    if (!group) {
      continue;
    }
    groups.push(group);
  }
  res.status(201).json(groups);
}
export async function getGroupContainerRaw(
  containerId: Id | null
): Promise<GetGroupContainer | null> {
  const container = await GroupContainer.findById(containerId);
  if (!container) {
    return null;
  }
  const subGroups: GetSubGroup[] = [];
  let i = 0;
  const {
    baanId,
    subGroupIds,
    genderType,
    roleType,
    canAnybodyCreateSubGroup,
    name,
    isDefault,
    _id,
    userIds,
  } = container;
  while (i < subGroupIds.length) {
    const subGroup = await SubGroup.findById(subGroupIds[i++]);
    if (!subGroup) {
      continue;
    }
    const users: BasicUser[] = [];
    const {
      campMemberCardIds,
      name,
      roleType,
      containerId,
      limit,
      genderType,
      _id,
      isWearing,
      foodLimit,
      spicy,
    } = subGroup;
    let j = 0;
    while (j < campMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        campMemberCardIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      const user = await User.findById(campMemberCard.userId);
      if (!user) {
        continue;
      }
      users.push(user);
    }
    subGroups.push({
      users,
      name,
      limit,
      containerId,
      campMemberCardIds,
      genderType,
      _id,
      roleType,
      spicy,
      isWearing,
      foodLimit,
    });
  }
  const baan = await Baan.findById(baanId);
  if (!baan) {
    return null;
  }
  const peesThatNotInGroup: BasicUser[] = [];
  const nongsThatNotInGroup: BasicUser[] = [];
  const peesThatNotInGroupId = removeDuplicate(baan.peeIds, userIds);
  const nongsThatNotInGroupId = removeDuplicate(baan.nongIds, userIds);
  i = 0;
  while (i < nongsThatNotInGroupId.length) {
    const user = await User.findById(nongsThatNotInGroupId[i++]);
    if (!user) {
      continue;
    }
    nongsThatNotInGroup.push(user);
  }
  i = 0;
  while (i < peesThatNotInGroupId.length) {
    const user = await User.findById(peesThatNotInGroupId[i++]);
    if (!user) {
      continue;
    }
    peesThatNotInGroup.push(user);
  }
  return {
    subGroups,
    subGroupIds,
    baanId,
    name,
    genderType,
    roleType,
    isDefault,
    canAnybodyCreateSubGroup,
    _id,
    userIds,
    peesThatNotInGroup,
    nongsThatNotInGroup,
  };
}
export async function updateGroupContainer(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const {
    _id,
    name,
    canAnybodyCreateSubGroup,
    isDefault,
  }: UpdateGroupContainer = req.body;
  const container = await GroupContainer.findById(_id);
  if (!container) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (!baan || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
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
  switch (campMemberCard.role) {
    case "nong": {
      sendRes(res, false);
      return;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(campMemberCard.campModelId);
      if (!campModel || campModel.baanId.toString() != baan._id.toString()) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
    case "peto": {
      const campModel = await PetoCamp.findById(campMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
  }
  if (isDefault) {
    await container.updateOne({ name, canAnybodyCreateSubGroup, isDefault });
    await GroupContainer.findByIdAndUpdate(baan.defaultGroupId, {
      isDefault: false,
    });
    await baan.updateOne({ defaultGroupId: container._id });
  }
  await container.updateOne({ name, canAnybodyCreateSubGroup });
  const groups: GetGroupContainer[] = [];
  let i = 0;
  while (i < baan.groupContainerIds.length) {
    const group = await getGroupContainerRaw(baan.groupContainerIds[i++]);
    if (!group) {
      continue;
    }
    groups.push(group);
  }
  res.status(200).json(groups);
}
export async function updateSubGroup(
  req: express.Request,
  res: express.Response
) {
  const { limit, name, _id }: UpdateSubGroup = req.body;
  const subGroup = await SubGroup.findById(_id);
  if (!subGroup) {
    sendRes(res, false);
    return;
  }
  const container = await GroupContainer.findById(subGroup.containerId);
  const user = await getUser(req);
  if (!container || !user) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  if (!container.canAnybodyCreateSubGroup) {
    const camp = await Camp.findById(baan.campId);
    if (!camp) {
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
    switch (campMemberCard.role) {
      case "nong": {
        sendRes(res, false);
        return;
      }
      case "pee": {
        const campModel = await PeeCamp.findById(campMemberCard.campModelId);
        if (!campModel || campModel.baanId.toString() != baan._id.toString()) {
          sendRes(res, false);
          return;
        }
        const part = await Part.findById(campModel.partId);
        if (
          !part ||
          (!part.auths.includes("แก้ไขกลุ่มได้") &&
            !(part._id.toString() == camp.partBoardId?.toString()))
        ) {
          sendRes(res, false);
          return;
        }
        break;
      }
      case "peto": {
        const campModel = await PetoCamp.findById(campMemberCard.campModelId);
        if (!campModel) {
          sendRes(res, false);
          return;
        }
        const part = await Part.findById(campModel.partId);
        if (
          !part ||
          (!part.auths.includes("แก้ไขกลุ่มได้") &&
            !(part._id.toString() == camp.partBoardId?.toString()))
        ) {
          sendRes(res, false);
          return;
        }
        break;
      }
    }
  }
  await subGroup.updateOne({ name, limit });
  const groups: GetGroupContainer[] = [];
  let i = 0;
  while (i < baan.groupContainerIds.length) {
    const group = await getGroupContainerRaw(baan.groupContainerIds[i++]);
    if (!group) {
      continue;
    }
    groups.push(group);
  }
  res.status(200).json(groups);
}
export async function deleteGroupContainer(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const container = await GroupContainer.findById(req.params.id);
  if (!container) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (!baan || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
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
  switch (campMemberCard.role) {
    case "nong": {
      sendRes(res, false);
      return;
    }
    case "pee": {
      const campModel = await PeeCamp.findById(campMemberCard.campModelId);
      if (!campModel || campModel.baanId.toString() != baan._id.toString()) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
    case "peto": {
      const campModel = await PetoCamp.findById(campMemberCard.campModelId);
      if (!campModel) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(campModel.partId);
      if (
        !part ||
        (!part.auths.includes("แก้ไขกลุ่มได้") &&
          !(part._id.toString() == camp.partBoardId?.toString()))
      ) {
        sendRes(res, false);
        return;
      }
      break;
    }
  }
  let i = 0;
  while (i < container.subGroupIds.length) {
    const subGroup = await SubGroup.findById(container.subGroupIds[i++]);
    if (!subGroup) {
      continue;
    }
    let j = 0;
    while (j < subGroup.campMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        subGroup.campMemberCardIds[j++]
      );
      if (!campMemberCard) {
        continue;
      }
      await campMemberCard.updateOne({
        subGroupIds: swop(subGroup._id, null, campMemberCard.subGroupIds),
      });
    }
    await subGroup.deleteOne();
  }
  const groupContainerIds = swop(container._id, null, baan.groupContainerIds);
  await baan.updateOne({ groupContainerIds });
  await container.deleteOne();
  const groups: GetGroupContainer[] = [];
  i = 0;
  while (i < groupContainerIds.length) {
    const group = await getGroupContainerRaw(groupContainerIds[i++]);
    if (!group) {
      continue;
    }
    groups.push(group);
  }
  res.status(200).json(groups);
}
export async function deleteSubGroup(
  req: express.Request,
  res: express.Response
) {
  const subGroup = await SubGroup.findById(req.params.id);
  if (!subGroup) {
    sendRes(res, false);
    return;
  }
  const container = await GroupContainer.findById(subGroup.containerId);
  const user = await getUser(req);
  if (!container || !user) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  if (!container.canAnybodyCreateSubGroup) {
    const camp = await Camp.findById(baan.campId);
    if (!camp) {
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
    switch (campMemberCard.role) {
      case "nong": {
        sendRes(res, false);
        return;
      }
      case "pee": {
        const campModel = await PeeCamp.findById(campMemberCard.campModelId);
        if (!campModel || campModel.baanId.toString() != baan._id.toString()) {
          sendRes(res, false);
          return;
        }
        const part = await Part.findById(campModel.partId);
        if (
          !part ||
          (!part.auths.includes("แก้ไขกลุ่มได้") &&
            !(part._id.toString() == camp.partBoardId?.toString()))
        ) {
          sendRes(res, false);
          return;
        }
        break;
      }
      case "peto": {
        const campModel = await PetoCamp.findById(campMemberCard.campModelId);
        if (!campModel) {
          sendRes(res, false);
          return;
        }
        const part = await Part.findById(campModel.partId);
        if (
          !part ||
          (!part.auths.includes("แก้ไขกลุ่มได้") &&
            !(part._id.toString() == camp.partBoardId?.toString()))
        ) {
          sendRes(res, false);
          return;
        }
        break;
      }
    }
  }
  let i = 0;
  let userIds = container.userIds;
  while (i < subGroup.campMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      subGroup.campMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    await campMemberCard.updateOne({
      subGroupIds: swop(subGroup._id, null, campMemberCard.subGroupIds),
    });
    userIds = swop(campMemberCard.userId, null, userIds);
  }
  await container.updateOne({
    subGroupIds: swop(subGroup._id, null, container.subGroupIds),
    userIds,
  });
  await subGroup.deleteOne();
  const groups: GetGroupContainer[] = [];
  i = 0;
  while (i < baan.groupContainerIds.length) {
    const group = await getGroupContainerRaw(baan.groupContainerIds[i++]);
    if (!group) {
      continue;
    }
    groups.push(group);
  }
  res.status(200).json(groups);
}
export async function getGroupContainerForAdmin(
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
  const groups: GetGroupContainer[] = [];
  let i = 0;
  while (i < baan.groupContainerIds.length) {
    const group = await getGroupContainerRaw(baan.groupContainerIds[i++]);
    if (!group) {
      continue;
    }
    groups.push(group);
  }
  const buffer: GetGroupContainerForAdmin = {
    groups,
    baan,
    camp,
  };
  res.status(200).json(buffer);
}

export async function registerGroup(
  req: express.Request,
  res: express.Response
) {
  const input: RegisterGroup = req.body;
  const user = await getUser(req);
  const campMemberCard = await CampMemberCard.findById(input.campMemberCardId);
  const container = await GroupContainer.findById(input.containerId);
  if (
    !campMemberCard ||
    !user ||
    campMemberCard.userId.toString() != user._id.toString() ||
    !container
  ) {
    sendRes(res, false);
    return;
  }
  const add = await SubGroup.findById(input.addId);
  const remove = await SubGroup.findById(input.removeId);
  let { subGroupIds } = campMemberCard;
  while (true) {
    if (!add) {
      if (!remove) {
        break;
      } else {
        if (remove.containerId.toString() != container._id.toString()) {
          break;
        }
        await registerRemoveSubGroupRaw(campMemberCard, container, remove._id);
        await container.updateOne({
          userIds: swop(user._id, null, container.userIds),
        });
        subGroupIds = swop(remove._id, null, campMemberCard.subGroupIds);
      }
    } else {
      if (!remove) {
        if (
          add.containerId.toString() != container._id.toString() ||
          container.userIds.includes(user._id)
        ) {
          break;
        }
        await registerAddSubGroupRaw(campMemberCard, user, container, add._id);
        await container.updateOne({
          userIds: swop(null, user._id, container.userIds),
        });
        subGroupIds = swop(null, add._id, campMemberCard.subGroupIds);
      } else {
        if (
          remove.containerId.toString() != container._id.toString() ||
          add.containerId.toString() != container._id.toString() ||
          add._id.toString() == remove._id.toString()
        ) {
          break;
        }
        if (add.limit == add.campMemberCardIds.length) {
          break;
        }
        await registerAddSubGroupRaw(campMemberCard, user, container, add._id);
        await registerRemoveSubGroupRaw(campMemberCard, container, remove._id);
        subGroupIds = swop(remove._id, add._id, campMemberCard.subGroupIds);
      }
    }
    break;
  }
  await campMemberCard.updateOne({ subGroupIds });
  const group = await getGroupContainerRaw(container._id);
  if (!group) {
    sendRes(res, false);
    return;
  }
  const output: GroupContainerPack = { group, subGroupIds };
  res.status(200).json(output);
}
async function createSubGroupRaw(input: CreateSubGroup) {
  const { gender, role, isMany, start, count, containerId, limit, name } =
    input;
  const container = await GroupContainer.findById(containerId);
  if (!container) {
    return;
  }
  let genderTypeRaw: GroupGenderType | SubGroupGenderType =
    container.genderType;
  let roleTypeRaw: GroupRoleType | SubGroupRoleType = container.roleType;
  if (genderTypeRaw == "เลือกเพศตามคนแรก") {
    genderTypeRaw = "คละเพศ";
  }
  if (roleTypeRaw == "เลือกพี่หรือน้องตามคนแรก") {
    roleTypeRaw = "คละพี่และน้อง";
  }
  if (genderTypeRaw == "กำหนดตอนสร้างกลุ่มย่อย") {
    if (!gender) {
      return;
    }
    switch (gender) {
      case "male": {
        genderTypeRaw = "ชายเท่านั้น";
        break;
      }
      case "female": {
        genderTypeRaw = "หญิงเท่านั้น";
      }
    }
  }
  if (roleTypeRaw == "กำหนดตอนสร้างกลุ่มย่อย") {
    if (!role) {
      return;
    }
    switch (role) {
      case "nong": {
        roleTypeRaw = "น้องเท่านั้น";
        break;
      }
      case "pee": {
        roleTypeRaw = "พี่เท่านั้น";
        break;
      }
    }
  }
  const genderType: SubGroupGenderType = genderTypeRaw;
  const roleType: SubGroupRoleType = roleTypeRaw;
  const subGroupIds = container.subGroupIds;
  if (isMany) {
    let i = start;
    while (i < start + count) {
      const subGroup = await SubGroup.create({
        containerId: container._id,
        genderType,
        roleType,
        limit,
        name: `${name} ${i++}`,
      });
      subGroupIds.push(subGroup._id);
    }
  } else {
    const subGroup = await SubGroup.create({
      containerId: container._id,
      genderType,
      roleType,
      limit,
      name,
    });
    subGroupIds.push(subGroup._id);
  }
  await container.updateOne({ subGroupIds });
}
export async function createSubGroupByAnyone(
  req: express.Request,
  res: express.Response
) {
  const { containerId, limit, gender, role, name }: CreateSubGroupByAnyone =
    req.body;
  const user = await getUser(req);
  const container = await GroupContainer.findById(containerId);
  if (!container || !container.canAnybodyCreateSubGroup || !user) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (
    !baan ||
    (!baan.nongIds.includes(user._id) && !baan.peeIds.includes(user._id))
  ) {
    sendRes(res, false);
    return;
  }
  await createSubGroupRaw({
    containerId,
    limit,
    gender,
    role,
    start: 0,
    count: 0,
    isMany: false,
    name,
  });
  const group = await getGroupContainerRaw(container._id);
  res.status(200).json(group);
}
export async function updateSubGroupByAnyone(
  req: express.Request,
  res: express.Response
) {
  const { limit, name, _id }: UpdateSubGroup = req.body;
  const user = await getUser(req);
  const subGroup = await SubGroup.findById(_id);
  if (!subGroup) {
    sendRes(res, false);
    return;
  }
  const container = await GroupContainer.findById(subGroup.containerId);
  if (!container || !container.canAnybodyCreateSubGroup || !user) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (
    !baan ||
    (!baan.nongIds.includes(user._id) && !baan.peeIds.includes(user._id))
  ) {
    sendRes(res, false);
    return;
  }
  await subGroup.updateOne({ limit, name });
  const group = await getGroupContainerRaw(container._id);
  res.status(200).json(group);
}
async function registerAddSubGroupRaw(
  campMemberCard: InterCampMemberCard,
  user: BasicUser,
  container: InterGroupContainer,
  addId: Id
) {
  const add = await SubGroup.findById(addId);
  if (campMemberCard.role == "peto" || !add) {
    return false;
  }
  const empty = add.campMemberCardIds.length == 0;
  if (
    (add.roleType == "น้องเท่านั้น" && campMemberCard.role == "pee") ||
    (add.roleType == "พี่เท่านั้น" && campMemberCard.role == "nong")
  ) {
    return false;
  }
  if (
    (add.genderType == "ชายเท่านั้น" && user.gender == "Female") ||
    (add.genderType == "หญิงเท่านั้น" && user.gender == "Male")
  ) {
    return false;
  }
  let roleType: SubGroupRoleType;
  let genderType: SubGroupGenderType;
  switch (campMemberCard.role) {
    case "nong": {
      roleType = "น้องเท่านั้น";
      break;
    }
    case "pee": {
      roleType = "พี่เท่านั้น";
      break;
    }
  }
  switch (user.gender) {
    case "Male": {
      genderType = "ชายเท่านั้น";
      break;
    }
    case "Female": {
      genderType = "หญิงเท่านั้น";
      break;
    }
  }
  let healthIssue: HealthIssueBody | null = await HealthIssue.findById(
    campMemberCard.healthIssueId
  );
  if (!healthIssue) {
    healthIssue = {
      isWearing: false,
      spicy: false,
      food: "",
      foodConcern: "",
      foodLimit: "ไม่มีข้อจำกัดด้านความเชื่อ",
      medicine: "",
      chronicDisease: "",
      extra: "",
    };
  }
  const isWearing = healthIssue.isWearing && (empty || add.isWearing);
  const spicy = healthIssue.spicy && (empty || add.spicy);
  let foodLimit: FoodLimit;
  if (healthIssue.foodLimit == add.foodLimit || empty) {
    foodLimit = healthIssue.foodLimit;
  } else {
    foodLimit = "ไม่มีข้อจำกัดด้านความเชื่อ";
  }
  if (container.roleType == "เลือกพี่หรือน้องตามคนแรก") {
    if (container.genderType == "เลือกเพศตามคนแรก") {
      await add.updateOne({
        roleType,
        genderType,
        campMemberCardIds: swop(
          null,
          campMemberCard._id,
          add.campMemberCardIds
        ),
        spicy,
        isWearing,
        foodLimit,
      });
    } else {
      await add.updateOne({
        roleType,
        campMemberCardIds: swop(
          null,
          campMemberCard._id,
          add.campMemberCardIds
        ),
        spicy,
        isWearing,
        foodLimit,
      });
    }
  } else {
    if (container.genderType == "เลือกเพศตามคนแรก") {
      await add.updateOne({
        genderType,
        campMemberCardIds: swop(
          null,
          campMemberCard._id,
          add.campMemberCardIds
        ),
        spicy,
        isWearing,
        foodLimit,
      });
    } else {
      await add.updateOne({
        campMemberCardIds: swop(
          null,
          campMemberCard._id,
          add.campMemberCardIds
        ),
        spicy,
        isWearing,
        foodLimit,
      });
    }
  }
  return true;
}
async function registerRemoveSubGroupRaw(
  campMemberCard: InterCampMemberCard,
  container: InterGroupContainer,
  removeId: Id
) {
  const remove = await SubGroup.findById(removeId);
  if (!remove) {
    return;
  }
  const roleType: SubGroupRoleType = "คละพี่และน้อง";
  const genderType: SubGroupGenderType = "คละเพศ";
  if (remove.campMemberCardIds.length == 1) {
    if (container.roleType == "เลือกพี่หรือน้องตามคนแรก") {
      if (container.genderType == "เลือกเพศตามคนแรก") {
        await remove.updateOne({
          roleType,
          genderType,
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            remove.campMemberCardIds
          ),
        });
      } else {
        await remove.updateOne({
          roleType,
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            remove.campMemberCardIds
          ),
        });
      }
    } else {
      if (container.genderType == "เลือกเพศตามคนแรก") {
        await remove.updateOne({
          genderType,
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            remove.campMemberCardIds
          ),
        });
      } else {
        await remove.updateOne({
          campMemberCardIds: swop(
            campMemberCard._id,
            null,
            remove.campMemberCardIds
          ),
        });
      }
    }
  } else {
    await remove.updateOne({
      campMemberCardIds: swop(
        campMemberCard._id,
        null,
        remove.campMemberCardIds
      ),
    });
  }
  await revalidateSubGroup(remove._id);
}
export async function revalidateSubGroup(subGroupId: Id) {
  const subGroup = await SubGroup.findById(subGroupId);
  if (!subGroup) {
    return;
  }
  if (!subGroup.campMemberCardIds.length) {
    const foodLimit: FoodLimit = "ไม่มีข้อจำกัดด้านความเชื่อ";
    await subGroup.updateOne({ isWearing: false, spicy: false, foodLimit });
    return;
  }
  const firstCampMemberCard = await CampMemberCard.findById(
    subGroup.campMemberCardIds[0]
  );
  if (!firstCampMemberCard) {
    return;
  }
  const firstHealthIssue = await HealthIssue.findById(
    firstCampMemberCard.healthIssueId
  );
  if (!firstHealthIssue) {
    const foodLimit: FoodLimit = "ไม่มีข้อจำกัดด้านความเชื่อ";
    await subGroup.updateOne({ isWearing: false, spicy: false, foodLimit });
    return;
  }
  let { isWearing, spicy, foodLimit } = firstHealthIssue;
  let i = 1;
  while (i < subGroup.campMemberCardIds.length) {
    const campMemberCard = await CampMemberCard.findById(
      subGroup.campMemberCardIds[i++]
    );
    if (!campMemberCard) {
      continue;
    }
    const healthIssue = await HealthIssue.findById(campMemberCard.healthIssueId);
    if (!healthIssue) {
      const foodLimit: FoodLimit = "ไม่มีข้อจำกัดด้านความเชื่อ";
      await subGroup.updateOne({ isWearing: false, spicy: false, foodLimit });
      return;
    }
    if (healthIssue.isWearing != isWearing) {
      isWearing = false;
    }
    if (healthIssue.spicy != spicy) {
      spicy = false;
    }
    if (foodLimit != healthIssue.foodLimit) {
      foodLimit = "ไม่มีข้อจำกัดด้านความเชื่อ";
    }
  }
  await subGroup.updateOne({ isWearing, spicy, foodLimit });
}
function recycleSubGroup(inputs: InterSubGroup[], compares: InterSubGroup[]) {
  return inputs.filter((v) => !compares.includes(v));
}

function getSuitableSubGroups(inputs: InterSubGroup[], count: number) {
  const out: InterSubGroup[] = [];
  inputs.sort((a, b) => b.limit - a.limit);
  function backtrack(
    index: number,
    current: InterSubGroup[],
    total: number
  ): boolean {
    if (total === count) {
      out.push(...current);
      return true;
    }
    if (total > count || index >= inputs.length) return false;
    // Try including this group
    if (
      backtrack(
        index + 1,
        [...current, inputs[index]],
        total + inputs[index].limit
      )
    ) {
      return true;
    }
    // Try excluding this group
    return backtrack(index + 1, current, total);
  }
  if (backtrack(0, [], 0)) {
    return out;
  }
  let i = 0;
  while (i < inputs.length && count >= inputs[i].limit) {
    out.push(inputs[i]);
    count = count - inputs[i++].limit;
  }
  if (count == 0 || i >= inputs.length) {
    return out;
  }
  while (i < inputs.length && count <= inputs[i].limit) {
    i++;
  }
  out.push(inputs[i - 1]);
  return out;
}
async function addAllToGroup(
  campMemberCards: InterCampMemberCard[],
  subGroups: InterSubGroup[],
  container: InterGroupContainer,
  userIds: Id[]
) {
  let subGroupIndex = 0;
  let campMemberCardIndex = 0;
  while (
    campMemberCardIndex < campMemberCards.length &&
    subGroupIndex < subGroups.length
  ) {
    let runMemberIndex = 0;
    const subGroup = subGroups[subGroupIndex++];
    while (
      runMemberIndex < subGroup.limit &&
      campMemberCardIndex < campMemberCards.length
    ) {
      runMemberIndex++;
      const campMemberCard = campMemberCards[campMemberCardIndex++];
      const user = await User.findById(campMemberCard.userId);
      if (!user) {
        continue;
      }
      await registerAddSubGroupRaw(
        campMemberCard,
        user,
        container,
        subGroup._id
      );
      await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
        subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
      });
      userIds = swop(null, user._id, userIds);
    }
  }
  return userIds;
}
export async function autoAddToNearestGroup(
  req: express.Request,
  res: express.Response
) {
  const container = await GroupContainer.findById(req.params.id);
  const user = await getUser(req);
  if (!user || !container) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  let userIds = container.userIds;
  const camp = await Camp.findById(baan.campId);
  const auth = await getAuthTypes(user._id, baan.campId);
  if (
    !auth ||
    !camp ||
    (!camp.boardIds.includes(user._id) && !auth.includes("แก้ไขกลุ่มได้"))
  ) {
    sendRes(res, false);
    return;
  }
  if (container.genderType != "คละเพศ") {
    const wearingBoyCampMemberCards: InterCampMemberCard[] = [];
    const wearingBoySubGroups: InterSubGroup[] = [];
    const wearingGirlCampMemberCards: InterCampMemberCard[] = [];
    const wearingGirlSubGroups: InterSubGroup[] = [];
    const emptySubGroup: InterSubGroup[] = [];
    const emptyBoySubGroup: InterSubGroup[] = [];
    const emptyGirlSubGroup: InterSubGroup[] = [];
    let i = 0;
    while (i < container.subGroupIds.length) {
      const subGroup = await SubGroup.findById(container.subGroupIds[i++]);
      if (!subGroup) {
        continue;
      }
      if (subGroup.isWearing) {
        ifIsTrue(
          subGroup.genderType == "ชายเท่านั้น",
          subGroup,
          wearingBoySubGroups
        );
        ifIsTrue(
          subGroup.genderType == "หญิงเท่านั้น",
          subGroup,
          wearingGirlSubGroups
        );
      }
      if (!subGroup.campMemberCardIds.length) {
        ifIsTrue(
          subGroup.genderType == "ชายเท่านั้น",
          subGroup,
          emptyBoySubGroup
        );
        ifIsTrue(
          subGroup.genderType == "หญิงเท่านั้น",
          subGroup,
          emptyGirlSubGroup
        );
        ifIsTrue(subGroup.genderType == "คละเพศ", subGroup, emptySubGroup);
      }
    }
    i = 0;
    const memberIds = baan.nongCampMemberCardHaveHealthIssueIds.concat(
      baan.peeCampMemberCardHaveHealthIssueIds
    );
    while (i < memberIds.length) {
      const campMemberCard = await CampMemberCard.findById(memberIds[i++]);
      if (!campMemberCard) {
        continue;
      }
      if (userIds.includes(campMemberCard.userId)) {
        continue;
      }
      const healthIssue = await HealthIssue.findById(
        campMemberCard.healthIssueId
      );
      if (!healthIssue) {
        continue;
      }
      if (healthIssue.isWearing) {
        const user = await User.findById(campMemberCard.userId);
        if (!user) {
          continue;
        }
        ifIsTrue(
          user.gender == "Male",
          campMemberCard,
          wearingBoyCampMemberCards
        );
        ifIsTrue(
          user.gender == "Female",
          campMemberCard,
          wearingGirlCampMemberCards
        );
      }
    }
    const bufferBoys: InterCampMemberCard[] = [];
    const bufferGirls: InterCampMemberCard[] = [];
    let girlIndex = 0;
    let boyIndex = 0;
    let bufferBoyIndex = 0;
    let bufferGirlIndex = 0;
    i = 0;
    while (i < wearingBoySubGroups.length) {
      const bufferLimit = bufferBoys.length;
      const subGroup = wearingBoySubGroups[i++];
      let memberInSubGroupIndex = subGroup.campMemberCardIds.length - 1;
      while (
        bufferBoyIndex < bufferLimit &&
        memberInSubGroupIndex < subGroup.campMemberCardIds.length
      ) {
        const campMemberCard = bufferBoys[bufferBoyIndex++];
        const user = await User.findById(campMemberCard.userId);
        if (!user) {
          continue;
        }
        const success = await registerAddSubGroupRaw(
          campMemberCard,
          user,
          container,
          subGroup._id
        );
        if (success) {
          memberInSubGroupIndex++;
          await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
            subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
          });
          userIds = swop(null, user._id, userIds);
        } else {
          bufferBoys.push(campMemberCard);
        }
      }
      while (
        boyIndex < wearingBoyCampMemberCards.length &&
        memberInSubGroupIndex < subGroup.campMemberCardIds.length
      ) {
        const campMemberCard = wearingBoyCampMemberCards[boyIndex++];
        const user = await User.findById(campMemberCard.userId);
        if (!user) {
          continue;
        }
        const success = await registerAddSubGroupRaw(
          campMemberCard,
          user,
          container,
          subGroup._id
        );
        if (success) {
          memberInSubGroupIndex++;
          await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
            subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
          });
          userIds = swop(null, user._id, userIds);
        } else {
          bufferBoys.push(campMemberCard);
        }
      }
    }
    i = 0;
    while (i < wearingGirlSubGroups.length) {
      const bufferLimit = bufferGirls.length;
      const subGroup = wearingGirlSubGroups[i++];
      let memberInSubGroupIndex = subGroup.campMemberCardIds.length - 1;
      while (
        bufferGirlIndex < bufferLimit &&
        memberInSubGroupIndex < subGroup.campMemberCardIds.length
      ) {
        const campMemberCard = bufferGirls[bufferGirlIndex++];
        const user = await User.findById(campMemberCard.userId);
        if (!user) {
          continue;
        }
        const success = await registerAddSubGroupRaw(
          campMemberCard,
          user,
          container,
          subGroup._id
        );
        if (success) {
          memberInSubGroupIndex++;
          await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
            subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
          });
          userIds = swop(null, user._id, userIds);
        } else {
          bufferGirls.push(campMemberCard);
        }
      }
      while (
        girlIndex < wearingGirlCampMemberCards.length &&
        memberInSubGroupIndex < subGroup.campMemberCardIds.length
      ) {
        const campMemberCard = wearingGirlCampMemberCards[girlIndex++];
        const user = await User.findById(campMemberCard.userId);
        if (!user) {
          continue;
        }
        const success = await registerAddSubGroupRaw(
          campMemberCard,
          user,
          container,
          subGroup._id
        );
        if (success) {
          memberInSubGroupIndex++;
          await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
            subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
          });
          userIds = swop(null, user._id, userIds);
        } else {
          bufferGirls.push(campMemberCard);
        }
      }
    }
    if (container.genderType == "กำหนดตอนสร้างกลุ่มย่อย") {
      switch (container.roleType) {
        case "กำหนดตอนสร้างกลุ่มย่อย": {
          const nongBoys: InterCampMemberCard[] = [];
          const nongGirls: InterCampMemberCard[] = [];
          const peeBoys: InterCampMemberCard[] = [];
          const peeGirls: InterCampMemberCard[] = [];
          while (bufferBoyIndex < bufferBoys.length) {
            const campMemberCard = bufferBoys[bufferBoyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (boyIndex < wearingBoyCampMemberCards.length) {
            const campMemberCard = wearingBoyCampMemberCards[boyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (bufferGirlIndex < bufferGirls.length) {
            const campMemberCard = bufferGirls[bufferGirlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          while (girlIndex < wearingGirlCampMemberCards.length) {
            const campMemberCard = wearingGirlCampMemberCards[girlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          const nongBoySubGroups: InterSubGroup[] = [];
          const nongGirlSubGroups: InterSubGroup[] = [];
          const peeBoySubGroups: InterSubGroup[] = [];
          const peeGirlSubGroups: InterSubGroup[] = [];
          for (const subGroup of emptyBoySubGroup) {
            ifIsTrue(
              subGroup.roleType == "น้องเท่านั้น",
              subGroup,
              nongBoySubGroups
            );
            ifIsTrue(
              subGroup.roleType == "พี่เท่านั้น",
              subGroup,
              peeBoySubGroups
            );
          }
          for (const subGroup of emptyGirlSubGroup) {
            ifIsTrue(
              subGroup.roleType == "น้องเท่านั้น",
              subGroup,
              nongGirlSubGroups
            );
            ifIsTrue(
              subGroup.roleType == "พี่เท่านั้น",
              subGroup,
              peeGirlSubGroups
            );
          }
          const nongBoySuitSubGroups: InterSubGroup[] = getSuitableSubGroups(
            nongBoySubGroups,
            nongBoys.length
          );
          const nongGirlSuitSubGroups: InterSubGroup[] = getSuitableSubGroups(
            nongGirlSubGroups,
            nongGirls.length
          );
          const peeBoySuitSubGroups: InterSubGroup[] = getSuitableSubGroups(
            peeBoySubGroups,
            peeBoys.length
          );
          const peeGirlSuitSubGroups: InterSubGroup[] = getSuitableSubGroups(
            peeGirlSubGroups,
            peeGirls.length
          );
          userIds = await addAllToGroup(
            peeBoys,
            peeBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            peeGirls,
            peeGirlSuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongBoys,
            nongBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongGirls,
            nongGirlSuitSubGroups,
            container,
            userIds
          );
          break;
        }
        case "คละพี่และน้อง": {
          const boys: InterCampMemberCard[] = [];
          const girls: InterCampMemberCard[] = [];
          while (bufferBoyIndex < bufferBoys.length) {
            const campMemberCard = bufferBoys[bufferBoyIndex++];
            boys.push(campMemberCard);
          }
          while (boyIndex < wearingBoyCampMemberCards.length) {
            const campMemberCard = wearingBoyCampMemberCards[boyIndex++];
            boys.push(campMemberCard);
          }
          while (bufferGirlIndex < bufferGirls.length) {
            const campMemberCard = bufferGirls[bufferGirlIndex++];
            girls.push(campMemberCard);
          }
          while (girlIndex < wearingGirlCampMemberCards.length) {
            const campMemberCard = wearingGirlCampMemberCards[girlIndex++];
            girls.push(campMemberCard);
          }
          const boySubGroups = getSuitableSubGroups(
            emptyBoySubGroup,
            boys.length
          );
          const girlSubGroup = getSuitableSubGroups(
            emptyGirlSubGroup,
            girls.length
          );
          userIds = await addAllToGroup(boys, boySubGroups, container, userIds);
          userIds = await addAllToGroup(
            girls,
            girlSubGroup,
            container,
            userIds
          );
          break;
        }
        case "เลือกพี่หรือน้องตามคนแรก": {
          const nongBoys: InterCampMemberCard[] = [];
          const nongGirls: InterCampMemberCard[] = [];
          const peeBoys: InterCampMemberCard[] = [];
          const peeGirls: InterCampMemberCard[] = [];
          while (bufferBoyIndex < bufferBoys.length) {
            const campMemberCard = bufferBoys[bufferBoyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (boyIndex < wearingBoyCampMemberCards.length) {
            const campMemberCard = wearingBoyCampMemberCards[boyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (bufferGirlIndex < bufferGirls.length) {
            const campMemberCard = bufferGirls[bufferGirlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          while (girlIndex < wearingGirlCampMemberCards.length) {
            const campMemberCard = wearingGirlCampMemberCards[girlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          const nongBoySuitSubGroups = getSuitableSubGroups(
            emptyBoySubGroup,
            nongBoys.length
          );
          const nongGirlSuitSubGroups = getSuitableSubGroups(
            emptyGirlSubGroup,
            nongGirls.length
          );
          const boyRemain = recycleSubGroup(
            emptyBoySubGroup,
            nongBoySuitSubGroups
          );
          const girlRemain = recycleSubGroup(
            emptyGirlSubGroup,
            nongGirlSuitSubGroups
          );
          const peeBoySuitSubGroups = getSuitableSubGroups(
            boyRemain,
            peeBoys.length
          );
          const peeGirlSuitSubGroups = getSuitableSubGroups(
            girlRemain,
            peeGirls.length
          );
          userIds = await addAllToGroup(
            peeBoys,
            peeBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            peeGirls,
            peeGirlSuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongBoys,
            nongBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongGirls,
            nongGirlSuitSubGroups,
            container,
            userIds
          );
          break;
        }
      }
    } else {
      switch (container.roleType) {
        case "กำหนดตอนสร้างกลุ่มย่อย": {
          const nongBoys: InterCampMemberCard[] = [];
          const nongGirls: InterCampMemberCard[] = [];
          const peeBoys: InterCampMemberCard[] = [];
          const peeGirls: InterCampMemberCard[] = [];
          while (bufferBoyIndex < bufferBoys.length) {
            const campMemberCard = bufferBoys[bufferBoyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (boyIndex < wearingBoyCampMemberCards.length) {
            const campMemberCard = wearingBoyCampMemberCards[boyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (bufferGirlIndex < bufferGirls.length) {
            const campMemberCard = bufferGirls[bufferGirlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          while (girlIndex < wearingGirlCampMemberCards.length) {
            const campMemberCard = wearingGirlCampMemberCards[girlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          const peeSubGroups: InterSubGroup[] = [];
          const nongSubGroups: InterSubGroup[] = [];
          for (const subGroup of emptySubGroup) {
            ifIsTrue(
              subGroup.roleType == "น้องเท่านั้น",
              subGroup,
              nongSubGroups
            );
            ifIsTrue(
              subGroup.roleType == "พี่เท่านั้น",
              subGroup,
              peeSubGroups
            );
          }
          const nongGirlSuitSubGroups = getSuitableSubGroups(
            nongSubGroups,
            nongGirls.length
          );
          const peeGirlSuitSubGroups = getSuitableSubGroups(
            peeSubGroups,
            peeGirls.length
          );
          const nongRemain = recycleSubGroup(
            nongSubGroups,
            nongGirlSuitSubGroups
          );
          const peeRemain = recycleSubGroup(peeSubGroups, peeGirlSuitSubGroups);
          const nongBoySuitSubGroups = getSuitableSubGroups(
            nongRemain,
            nongBoys.length
          );
          const peeBoySuitSubGroups = getSuitableSubGroups(
            peeRemain,
            peeBoys.length
          );
          userIds = await addAllToGroup(
            peeBoys,
            peeBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            peeGirls,
            peeGirlSuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongBoys,
            nongBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongGirls,
            nongGirlSuitSubGroups,
            container,
            userIds
          );
          break;
        }
        case "คละพี่และน้อง": {
          const boys: InterCampMemberCard[] = [];
          const girls: InterCampMemberCard[] = [];
          while (bufferBoyIndex < bufferBoys.length) {
            const campMemberCard = bufferBoys[bufferBoyIndex++];
            boys.push(campMemberCard);
          }
          while (boyIndex < wearingBoyCampMemberCards.length) {
            const campMemberCard = wearingBoyCampMemberCards[boyIndex++];
            boys.push(campMemberCard);
          }
          while (bufferGirlIndex < bufferGirls.length) {
            const campMemberCard = bufferGirls[bufferGirlIndex++];
            girls.push(campMemberCard);
          }
          while (girlIndex < wearingGirlCampMemberCards.length) {
            const campMemberCard = wearingGirlCampMemberCards[girlIndex++];
            girls.push(campMemberCard);
          }
          const girlSubGroup = getSuitableSubGroups(
            emptySubGroup,
            girls.length
          );
          const remain = recycleSubGroup(emptySubGroup, girlSubGroup);
          const boySubGroups = getSuitableSubGroups(remain, boys.length);
          userIds = await addAllToGroup(boys, boySubGroups, container, userIds);
          userIds = await addAllToGroup(
            girls,
            girlSubGroup,
            container,
            userIds
          );
          break;
        }
        case "เลือกพี่หรือน้องตามคนแรก": {
          const nongBoys: InterCampMemberCard[] = [];
          const nongGirls: InterCampMemberCard[] = [];
          const peeBoys: InterCampMemberCard[] = [];
          const peeGirls: InterCampMemberCard[] = [];
          while (bufferBoyIndex < bufferBoys.length) {
            const campMemberCard = bufferBoys[bufferBoyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (boyIndex < wearingBoyCampMemberCards.length) {
            const campMemberCard = wearingBoyCampMemberCards[boyIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongBoys);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeBoys);
          }
          while (bufferGirlIndex < bufferGirls.length) {
            const campMemberCard = bufferGirls[bufferGirlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          while (girlIndex < wearingGirlCampMemberCards.length) {
            const campMemberCard = wearingGirlCampMemberCards[girlIndex++];
            ifIsTrue(campMemberCard.role == "nong", campMemberCard, nongGirls);
            ifIsTrue(campMemberCard.role == "pee", campMemberCard, peeGirls);
          }
          const nongGirlSuitSubGroups = getSuitableSubGroups(
            emptySubGroup,
            nongGirls.length
          );
          const remain1 = recycleSubGroup(
            emptySubGroup,
            nongGirlSuitSubGroups
          );
          const nongBoySuitSubGroups = getSuitableSubGroups(
            remain1,
            nongBoys.length
          );
          const remain2 = recycleSubGroup(remain1, nongBoySuitSubGroups);
          const peeGirlSuitSubGroups = getSuitableSubGroups(
            remain2,
            peeGirls.length
          );
          const remain3 = recycleSubGroup(remain2, peeGirlSuitSubGroups);
          const peeBoySuitSubGroups = getSuitableSubGroups(
            remain3,
            peeBoys.length
          );
          userIds = await addAllToGroup(
            peeBoys,
            peeBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            peeGirls,
            peeGirlSuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongBoys,
            nongBoySuitSubGroups,
            container,
            userIds
          );
          userIds = await addAllToGroup(
            nongGirls,
            nongGirlSuitSubGroups,
            container,
            userIds
          );
          break;
        }
      }
    }
  } else {
    switch (container.roleType) {
      case "กำหนดตอนสร้างกลุ่มย่อย": {
        const spicyNongSubGroups: InterSubGroup[] = [];
        const spicyPeeSubGroups: InterSubGroup[] = [];
        const spicyPeeCampMemberCards: InterCampMemberCard[] = [];
        const spicyNongCampMemberCards: InterCampMemberCard[] = [];
        const emptyNongSubGroups: InterSubGroup[] = [];
        const emptyPeeSubGroups: InterSubGroup[] = [];
        let i = 0;
        while (i < container.subGroupIds.length) {
          const subGroup = await SubGroup.findById(container.subGroupIds[i++]);
          if (!subGroup) {
            continue;
          }
          ifIsTrue(
            subGroup.spicy && subGroup.roleType == "พี่เท่านั้น",
            subGroup,
            spicyPeeSubGroups
          );
          ifIsTrue(
            subGroup.spicy && subGroup.roleType == "น้องเท่านั้น",
            subGroup,
            spicyNongSubGroups
          );
          ifIsTrue(
            subGroup.campMemberCardIds.length == 0 &&
              subGroup.roleType == "พี่เท่านั้น",
            subGroup,
            emptyPeeSubGroups
          );
          ifIsTrue(
            subGroup.campMemberCardIds.length == 0 &&
              subGroup.roleType == "น้องเท่านั้น",
            subGroup,
            emptyNongSubGroups
          );
        }
        i = 0;
        while (i < baan.nongCampMemberCardHaveHealthIssueIds.length) {
          const campMemberCard = await CampMemberCard.findById(
            baan.nongCampMemberCardHaveHealthIssueIds[i++]
          );
          if (!campMemberCard || userIds.includes(campMemberCard.userId)) {
            continue;
          }
          const healthIssue = await HealthIssue.findById(
            campMemberCard.healthIssueId
          );
          if (!healthIssue) {
            continue;
          }
          ifIsTrue(
            healthIssue.spicy && campMemberCard.role == "nong",
            campMemberCard,
            spicyNongCampMemberCards
          );
          ifIsTrue(
            healthIssue.spicy && campMemberCard.role == "pee",
            campMemberCard,
            spicyPeeCampMemberCards
          );
        }
        let peeIndex = 0;
        let nongIndex = 0;
        i = 0;
        while (i < spicyPeeSubGroups.length) {
          const subGroup = spicyPeeSubGroups[i++];
          let memberInSubGroupIndex = subGroup.campMemberCardIds.length - 1;
          while (
            peeIndex < spicyPeeCampMemberCards.length &&
            memberInSubGroupIndex < subGroup.campMemberCardIds.length
          ) {
            const campMemberCard = spicyPeeCampMemberCards[peeIndex++];
            const user = await User.findById(campMemberCard.userId);
            if (!user) {
              continue;
            }
            await registerAddSubGroupRaw(
              campMemberCard,
              user,
              container,
              subGroup._id
            );
            memberInSubGroupIndex++;
            await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
              subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
            });
            userIds = swop(null, user._id, userIds);
          }
        }
        i = 0;
        while (i < spicyNongSubGroups.length) {
          const subGroup = spicyNongSubGroups[i++];
          let memberInSubGroupIndex = subGroup.campMemberCardIds.length - 1;
          while (
            nongIndex < spicyNongCampMemberCards.length &&
            memberInSubGroupIndex < subGroup.campMemberCardIds.length
          ) {
            const campMemberCard = spicyNongCampMemberCards[nongIndex++];
            const user = await User.findById(campMemberCard.userId);
            if (!user) {
              continue;
            }
            await registerAddSubGroupRaw(
              campMemberCard,
              user,
              container,
              subGroup._id
            );
            memberInSubGroupIndex++;
            await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
              subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
            });
            userIds = swop(null, user._id, userIds);
          }
        }
        const nongs: InterCampMemberCard[] = [];
        const pees: InterCampMemberCard[] = [];
        while (nongIndex < spicyNongCampMemberCards.length) {
          nongs.push(spicyNongCampMemberCards[nongIndex++]);
        }
        while (peeIndex < spicyPeeCampMemberCards.length) {
          pees.push(spicyPeeCampMemberCards[peeIndex++]);
        }
        const peeSuitSubGroups = getSuitableSubGroups(
          emptyPeeSubGroups,
          pees.length
        );
        const nongSuitSubGroups = getSuitableSubGroups(
          emptyNongSubGroups,
          nongs.length
        );
        userIds = await addAllToGroup(
          pees,
          peeSuitSubGroups,
          container,
          userIds
        );
        userIds = await addAllToGroup(
          nongs,
          nongSuitSubGroups,
          container,
          userIds
        );
        break;
      }
      case "คละพี่และน้อง": {
        const spicySubGroups: InterSubGroup[] = [];
        const spicyCampMemberCards: InterCampMemberCard[] = [];
        const emptySubGroups: InterSubGroup[] = [];
        let i = 0;
        while (i < container.subGroupIds.length) {
          const subGroup = await SubGroup.findById(container.subGroupIds[i++]);
          if (!subGroup) {
            continue;
          }
          ifIsTrue(subGroup.spicy, subGroup, spicySubGroups);
          ifIsTrue(
            !subGroup.campMemberCardIds.length,
            subGroup,
            emptySubGroups
          );
        }
        i = 0;
        const memberIds = baan.nongCampMemberCardHaveHealthIssueIds.concat(
          baan.peeCampMemberCardHaveHealthIssueIds
        );
        while (i < memberIds.length) {
          const campMemberCard = await CampMemberCard.findById(memberIds[i++]);
          if (!campMemberCard || userIds.includes(campMemberCard.userId)) {
            continue;
          }
          const healthIssue = await HealthIssue.findById(
            campMemberCard.healthIssueId
          );
          if (!healthIssue) {
            continue;
          }
          ifIsTrue(healthIssue.spicy, campMemberCard, spicyCampMemberCards);
        }
        let index = 0;
        i = 0;
        while (i < spicySubGroups.length) {
          const subGroup = spicySubGroups[i++];
          let memberInSubGroupIndex = subGroup.campMemberCardIds.length - 1;
          while (
            index < spicyCampMemberCards.length &&
            memberInSubGroupIndex < subGroup.campMemberCardIds.length
          ) {
            const campMemberCard = spicyCampMemberCards[index++];
            const user = await User.findById(campMemberCard.userId);
            if (!user) {
              continue;
            }
            await registerAddSubGroupRaw(
              campMemberCard,
              user,
              container,
              subGroup._id
            );
            memberInSubGroupIndex++;
            await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
              subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
            });
            userIds = swop(null, user._id, userIds);
          }
        }
        const remainCampMemberCards: InterCampMemberCard[] = [];
        while (index < spicyCampMemberCards.length) {
          remainCampMemberCards.push(spicyCampMemberCards[index++]);
        }
        const suitSubGroup = getSuitableSubGroups(
          emptySubGroups,
          remainCampMemberCards.length
        );
        userIds = await addAllToGroup(
          remainCampMemberCards,
          suitSubGroup,
          container,
          userIds
        );
        break;
      }
      case "เลือกพี่หรือน้องตามคนแรก": {
        const spicyNongSubGroups: InterSubGroup[] = [];
        const spicyPeeSubGroups: InterSubGroup[] = [];
        const spicyPeeCampMemberCards: InterCampMemberCard[] = [];
        const spicyNongCampMemberCards: InterCampMemberCard[] = [];
        const emptySubGroups: InterSubGroup[] = [];
        let i = 0;
        while (i < container.subGroupIds.length) {
          const subGroup = await SubGroup.findById(container.subGroupIds[i++]);
          if (!subGroup) {
            continue;
          }
          ifIsTrue(
            subGroup.spicy && subGroup.roleType == "พี่เท่านั้น",
            subGroup,
            spicyPeeSubGroups
          );
          ifIsTrue(
            subGroup.spicy && subGroup.roleType == "น้องเท่านั้น",
            subGroup,
            spicyNongSubGroups
          );
          ifIsTrue(
            subGroup.campMemberCardIds.length == 0 &&
              subGroup.roleType == "พี่เท่านั้น",
            subGroup,
            emptySubGroups
          );
        }
        i = 0;
        while (i < baan.nongCampMemberCardHaveHealthIssueIds.length) {
          const campMemberCard = await CampMemberCard.findById(
            baan.nongCampMemberCardHaveHealthIssueIds[i++]
          );
          if (!campMemberCard || userIds.includes(campMemberCard.userId)) {
            continue;
          }
          const healthIssue = await HealthIssue.findById(
            campMemberCard.healthIssueId
          );
          if (!healthIssue) {
            continue;
          }
          ifIsTrue(
            healthIssue.spicy && campMemberCard.role == "nong",
            campMemberCard,
            spicyNongCampMemberCards
          );
          ifIsTrue(
            healthIssue.spicy && campMemberCard.role == "pee",
            campMemberCard,
            spicyPeeCampMemberCards
          );
        }
        let peeIndex = 0;
        let nongIndex = 0;
        i = 0;
        while (i < spicyPeeSubGroups.length) {
          const subGroup = spicyPeeSubGroups[i++];
          let memberInSubGroupIndex = subGroup.campMemberCardIds.length - 1;
          while (
            peeIndex < spicyPeeCampMemberCards.length &&
            memberInSubGroupIndex < subGroup.campMemberCardIds.length
          ) {
            const campMemberCard = spicyPeeCampMemberCards[peeIndex++];
            const user = await User.findById(campMemberCard.userId);
            if (!user) {
              continue;
            }
            await registerAddSubGroupRaw(
              campMemberCard,
              user,
              container,
              subGroup._id
            );
            memberInSubGroupIndex++;
            await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
              subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
            });
            userIds = swop(null, user._id, userIds);
          }
        }
        i = 0;
        while (i < spicyNongSubGroups.length) {
          const subGroup = spicyNongSubGroups[i++];
          let memberInSubGroupIndex = subGroup.campMemberCardIds.length - 1;
          while (
            nongIndex < spicyNongCampMemberCards.length &&
            memberInSubGroupIndex < subGroup.campMemberCardIds.length
          ) {
            const campMemberCard = spicyNongCampMemberCards[nongIndex++];
            const user = await User.findById(campMemberCard.userId);
            if (!user) {
              continue;
            }
            await registerAddSubGroupRaw(
              campMemberCard,
              user,
              container,
              subGroup._id
            );
            memberInSubGroupIndex++;
            await CampMemberCard.findByIdAndUpdate(campMemberCard._id, {
              subGroupIds: swop(null, subGroup._id, campMemberCard.subGroupIds),
            });
            userIds = swop(null, user._id, userIds);
          }
        }
        const nongs: InterCampMemberCard[] = [];
        const pees: InterCampMemberCard[] = [];
        while (nongIndex < spicyNongCampMemberCards.length) {
          nongs.push(spicyNongCampMemberCards[nongIndex++]);
        }
        while (peeIndex < spicyPeeCampMemberCards.length) {
          pees.push(spicyPeeCampMemberCards[peeIndex++]);
        }
        const nongSuitSubGroups = getSuitableSubGroups(
          emptySubGroups,
          nongs.length
        );
        const remain = recycleSubGroup(emptySubGroups, nongSuitSubGroups);
        const peeSuitSubGroups = getSuitableSubGroups(remain, pees.length);

        userIds = await addAllToGroup(
          pees,
          peeSuitSubGroups,
          container,
          userIds
        );
        userIds = await addAllToGroup(
          nongs,
          nongSuitSubGroups,
          container,
          userIds
        );
        break;
      }
    }
  }
  await container.updateOne({ userIds });
  sendRes(res, true);
}
