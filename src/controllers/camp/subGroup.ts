import { getUser } from "../../middleware/auth";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import GroupContainer from "../../models/GroupContainer";
import {
  BasicUser,
  CreateGroupContainer,
  CreateSubGroup,
  GetGroupContainer,
  GetGroupContainerForAdmin,
  GetSubGroup,
  GroupGenderType,
  GroupRoleType,
  Id,
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
import { sendRes, swop } from "../setup";
import express from "express";
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
      sendRes(res, false);
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
      sendRes(res, false);
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
    while (i < start + count + 1) {
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
    });
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
