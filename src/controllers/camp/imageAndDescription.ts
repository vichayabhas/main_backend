import { getUser } from "../../middleware/auth";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import ImageAndDescription from "../../models/ImageAndDescription";
import ImageAndDescriptionContainer from "../../models/ImageAndDescriptionContainer";
import {
  CreateImageAndDescriptionContainer,
  Id,
  ShowImageAndDescriptions,
  InterImageAndDescription,
  EditImageAndDescriptionContainer,
  GetImageAndDescriptionsPackForUpdate,
} from "../../models/interface";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import PetoCamp from "../../models/PetoCamp";
import { sendRes, removeDuplicate, swop } from "../setup";
import express from "express";

export async function createImageAndDescriptionContainer(
  req: express.Request,
  res: express.Response
) {
  const { baanId, children, types, name }: CreateImageAndDescriptionContainer =
    req.body;
  const baan = await Baan.findById(baanId);
  const user = await getUser(req);
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
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (
        part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง") &&
        baan._id.toString() == peeCamp.baanId.toString()
      ) {
        break;
      }
      sendRes(res, false);
      return;
    }
    case "peto": {
      const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
      if (!petoCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(petoCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง")) {
        break;
      }
      sendRes(res, false);
      return;
    }
  }
  const childIds: Id[] = [];
  const container = await ImageAndDescriptionContainer.create({
    baanId,
    types,
    name,
  });
  for (const { imageUrl, description, order } of children) {
    const child = await ImageAndDescription.create({
      imageUrl,
      description,
      order,
      containerId: container._id,
    });
    childIds.push(child._id);
  }
  await container.updateOne({ childIds });
  await baan.updateOne({
    imageAndDescriptionContainerIds: swop(
      null,
      container._id,
      baan.imageAndDescriptionContainerIds
    ),
  });
  sendRes(res, true);
}
export async function getImageAndDescriptionsRaw(
  imageAndDescriptionContainerIds: Id[]
) {
  let i = 0;
  const out: ShowImageAndDescriptions[] = [];
  while (i < imageAndDescriptionContainerIds.length) {
    const container = await ImageAndDescriptionContainer.findById(
      imageAndDescriptionContainerIds[i++]
    );
    if (!container) {
      continue;
    }
    const { name, types, _id, childIds, baanId } = container;
    const baan = await Baan.findById(baanId);
    if (!baan) {
      continue;
    }
    const children: InterImageAndDescription[] = [];
    let j = 0;
    while (j < childIds.length) {
      const imageAndDescription = await ImageAndDescription.findById(
        childIds[j++]
      );
      if (!imageAndDescription) {
        continue;
      }
      children.push(imageAndDescription);
    }
    out.push({ name, types, _id, children, baanId });
  }
  return out;
}
export async function editImageAndDescription(
  req: express.Request,
  res: express.Response
) {
  const { types, name, _id, children }: EditImageAndDescriptionContainer =
    req.body;
  const container = await ImageAndDescriptionContainer.findById(_id);
  if (!container) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  const user = await getUser(req);
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
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (
        part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง") &&
        baan._id.toString() == peeCamp.baanId.toString()
      ) {
        break;
      }
      sendRes(res, false);
      return;
    }
    case "peto": {
      const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
      if (!petoCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(petoCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง")) {
        break;
      }
      sendRes(res, false);
      return;
    }
  }
  let i = 0;
  const ids: Id[] = [];
  while (i < children.length) {
    const { _id: childId, imageUrl, description, order } = children[i++];
    let imageAndDescription = await ImageAndDescription.findByIdAndUpdate(
      childId,
      { imageUrl, description, order }
    );
    if (!imageAndDescription) {
      imageAndDescription = await ImageAndDescription.create({
        imageUrl,
        description,
        order,
      });
    }
    ids.push(imageAndDescription._id);
  }
  const removeIds = removeDuplicate(container.childIds, ids);
  i = 0;
  while (i < removeIds.length) {
    await ImageAndDescription.findByIdAndDelete(removeIds[i++]);
  }
  await container.updateOne({ types, name, childIds: ids });
}
export async function deleteImageAndDescryption(
  req: express.Request,
  res: express.Response
) {
  const container = await ImageAndDescriptionContainer.findById(req.params.id);
  if (!container) {
    sendRes(res, false);
    return;
  }
  const baan = await Baan.findById(container.baanId);
  const user = await getUser(req);
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
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (
        part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง") &&
        baan._id.toString() == peeCamp.baanId.toString()
      ) {
        break;
      }
      sendRes(res, false);
      return;
    }
    case "peto": {
      const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
      if (!petoCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(petoCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง")) {
        break;
      }
      sendRes(res, false);
      return;
    }
  }
  let i = 0;
  while (i < container.childIds.length) {
    await ImageAndDescription.findByIdAndDelete(container.childIds[i++]);
  }
  await baan.updateOne({
    imageAndDescriptionContainerIds: swop(
      container._id,
      null,
      baan.imageAndDescriptionContainerIds
    ),
  });
  await container.deleteOne();
  sendRes(res, true);
}
export async function getImageAndDescriptions(
  req: express.Request,
  res: express.Response
) {
  const baan = await Baan.findById(req.params.id);
  if (!baan) {
    sendRes(res, false);
    return;
  }
  const user = await getUser(req);
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
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (
        part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง") &&
        baan._id.toString() == peeCamp.baanId.toString()
      ) {
        break;
      }
      sendRes(res, false);
      return;
    }
    case "peto": {
      const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
      if (!petoCamp) {
        sendRes(res, false);
        return;
      }
      const part = await Part.findById(petoCamp.partId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      if (part._id.toString() == camp.partBoardId?.toString()) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้ทุกบ้าน")) {
        break;
      }
      if (part.auths.includes("แก้ไขรูปภาพและคำอธิบายได้เฉพาะบ้านตัวเอง")) {
        break;
      }
      sendRes(res, false);
      return;
    }
  }
  const imageAndDescryptionContainers = await getImageAndDescriptionsRaw(
    baan.imageAndDescriptionContainerIds
  );
  const out: GetImageAndDescriptionsPackForUpdate = {
    imageAndDescryptionContainers,
    baan,
    isOverNight: camp.nongSleepModel != "ไม่มีการค้างคืน",
  };
  res.status(200).json(out);
}
