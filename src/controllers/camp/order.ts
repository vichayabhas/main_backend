import express from "express";
import { getUser } from "../../middleware/auth";
import {
  BasicCamp,
  CreateItem,
  CreateOrder,
  GetOrderForAdmin,
  Id,
  InterItem,
  ShowOrder,
  TriggerOrder,
  UpdateItem,
} from "../../models/interface";
import Camp from "../../models/Camp";
import { ifIsHave, sendRes, swop } from "../setup";
import { getAuthTypes, getShowPlaceRaw } from "./getCampData";
import Item from "../../models/Item";
import Order from "../../models/Order";
import CampMemberCard from "../../models/CampMemberCard";
import User from "../../models/User";
import Part from "../../models/Part";
import Baan from "../../models/Baan";
import TimeOffset from "../../models/TimeOffset";
//*export async function getItemsRaw
//*export async function createItem
//*export async function getOrdersRaw
//*export async function createOrder
//*export async function updateItem
//*export async function deleteItem
//*export async function deleteOrder
//*export async function getOrderForAdmin
//*export async function completeOrder
async function getOrdersFromCamp(camp: BasicCamp) {
  let i = 0;
  const orderIds: Id[] = [];
  while (i < camp.baanIds.length) {
    const baan = await Baan.findById(camp.baanIds[i++]);
    if (!baan) {
      continue;
    }
    orderIds.push(...baan.orderIds);
  }
  i = 0;
  while (i < camp.partIds.length) {
    const part = await Part.findById(camp.partIds[i++]);
    if (!part) {
      continue;
    }
    orderIds.push(...part.orderIds);
  }
  return await getOrdersRaw(orderIds);
}
export async function getItemsRaw(itemIds: readonly Id[]) {
  let i = 0;
  const items: InterItem[] = [];
  while (i < itemIds.length) {
    const item = await Item.findById(itemIds[i++]);
    if (!item) {
      continue;
    }
    items.push(item);
  }
  return items;
}
export async function createItem(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const input: CreateItem = req.body;
  const camp = await Camp.findById(input.campId);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths || !auths.includes("สามารถจัดการของได้")) {
    sendRes(res, false);
    return;
  }
  const item = await Item.create(input);
  const itemIds = swop(null, item._id, camp.itemIds);
  await camp.updateOne({ itemIds });
  const items = await getItemsRaw(itemIds);
  res.status(201).json(items);
}
export async function getOrdersRaw(orderIds: Id[]) {
  let i = 0;
  const orders: ShowOrder[] = [];
  while (i < orderIds.length) {
    const order = await Order.findById(orderIds[i++]);
    if (!order) {
      continue;
    }
    const {
      _id,
      placeId,
      itemId,
      count,
      campMemberCardId,
      time,
      types,
      fromId,
      isComplete,
    } = order;
    const item = await Item.findById(itemId);
    const place = await getShowPlaceRaw(placeId);
    const campMemberCard = await CampMemberCard.findById(campMemberCardId);
    if (!item || !place || !campMemberCard) {
      continue;
    }
    const fromUser = await User.findById(campMemberCard.userId);
    if (!fromUser) {
      continue;
    }
    let fromName: string;
    switch (types) {
      case "part": {
        const part = await Part.findById(fromId);
        if (!part) {
          continue;
        }
        fromName = `ฝ่าย${part.partName}`;
        break;
      }
      case "baan": {
        const baan = await Baan.findById(fromId);
        if (!baan) {
          continue;
        }
        const camp = await Camp.findById(baan.campId);
        if (!camp) {
          continue;
        }
        fromName = `${camp.groupName}${baan.name}`;
      }
    }
    orders.push({
      _id,
      place,
      campMemberCardId,
      count,
      time,
      types,
      fromName,
      fromUser,
      item,
      isComplete,
    });
  }
  return orders;
}
export async function createOrder(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const input: CreateOrder = req.body;
  const item = await Item.findById(input.itemId);
  if (!item || !user || item.remain < input.count) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(input.campMemberCardId);
  if (
    !campMemberCard ||
    campMemberCard.userId.toString() != user._id.toString()
  ) {
    sendRes(res, false);
    return;
  }
  switch (input.types) {
    case "part": {
      const part = await Part.findById(input.fromId);
      if (!part) {
        sendRes(res, false);
        return;
      }
      const camp = await Camp.findById(part.campId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const order = await Order.create(input);
      const campMemberCardOrderIds = ifIsHave(
        order._id,
        campMemberCard.orderIds,
      );
      const fromOrderIds = ifIsHave(order._id, part.orderIds);
      await campMemberCard.updateOne({ orderIds: campMemberCardOrderIds });
      await part.updateOne({ orderIds: fromOrderIds });
      const campMemberCardOrders = await getOrdersRaw(campMemberCardOrderIds);
      const fromOrders = await getOrdersRaw(fromOrderIds);
      const campOrders = await getOrdersFromCamp(camp);
      await item.updateOne({
        orderIds: ifIsHave(order._id, item.orderIds),
        remain: item.remain - order.count,
      });
      const items = await getItemsRaw(camp.itemIds);
      const buffer: TriggerOrder = {
        campId: camp._id,
        campMemberCardId: campMemberCard._id,
        campMemberCardOrders,
        fromId: part._id,
        fromOrders,
        campOrders,
        items,
        types: "part",
      };
      res.status(201).json(buffer);
      return;
    }
    case "baan": {
      const baan = await Baan.findById(input.fromId);
      if (!baan) {
        sendRes(res, false);
        return;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const order = await Order.create(input);
      const campMemberCardOrderIds = ifIsHave(
        order._id,
        campMemberCard.orderIds,
      );
      const fromOrderIds = ifIsHave(order._id, baan.orderIds);
      await campMemberCard.updateOne({ orderIds: campMemberCardOrderIds });
      await baan.updateOne({ orderIds: fromOrderIds });
      const campMemberCardOrders = await getOrdersRaw(campMemberCardOrderIds);
      const fromOrders = await getOrdersRaw(fromOrderIds);
      const campOrders = await getOrdersFromCamp(camp);
      await item.updateOne({
        orderIds: ifIsHave(order._id, item.orderIds),
        remain: item.remain - order.count,
      });
      const items = await getItemsRaw(camp.itemIds);
      const buffer: TriggerOrder = {
        campId: camp._id,
        campMemberCardId: campMemberCard._id,
        campMemberCardOrders,
        fromId: baan._id,
        fromOrders,
        campOrders,
        items,
        types: "baan",
      };
      res.status(201).json(buffer);
      return;
    }
  }
}
export async function updateItem(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const {
    _id,
    name,
    canNongOrder,
    imageLink,
    remain,
    canNongSee,
    canNongSeeOrder,
  }: UpdateItem = req.body;
  const item = await Item.findById(_id);
  if (!item || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(item.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths || !auths.includes("สามารถจัดการของได้")) {
    sendRes(res, false);
    return;
  }
  await item.updateOne({
    name,
    canNongOrder,
    canNongSee,
    imageLink,
    remain,
    canNongSeeOrder,
  });
  const data = await getItemsRaw(camp.itemIds);
  res.status(200).json(data);
}
export async function deleteItem(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const item = await Item.findById(req.params.id);
  if (!item || !user) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(item.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths || !auths.includes("สามารถจัดการของได้")) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < item.orderIds.length) {
    const order = await Order.findById(item.orderIds[i++]);
    if (!order) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      order.campMemberCardId,
    );
    if (!campMemberCard) {
      continue;
    }
    switch (order.types) {
      case "part": {
        const partOrder = await Part.findById(order.fromId);
        if (!partOrder) {
          continue;
        }
        await partOrder.updateOne({
          orderIds: swop(order._id, null, partOrder.orderIds),
        });
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
    await campMemberCard.updateOne({
      orderIds: swop(order._id, null, campMemberCard.orderIds),
    });
    await order.deleteOne();
  }
  const itemIds = swop(item._id, null, camp.itemIds);
  await item.deleteOne();
  const data = await getItemsRaw(itemIds);
  res.status(200).json(data);
}
export async function deleteOrder(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  const order = await Order.findById(req.params.id);
  if (!order || !user) {
    sendRes(res, false);
    return;
  }
  const item = await Item.findById(order.itemId);
  if (!item) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(item.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths || !auths.includes("สามารถจัดการของได้")) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(order.campMemberCardId);
  if (!campMemberCard) {
    sendRes(res, false);
    return;
  }
  switch (order.types) {
    case "part": {
      const from = await Part.findById(order.fromId);
      if (!from) {
        sendRes(res, false);
        return;
      }
      const fromOrderIds = swop(order._id, null, from.orderIds);
      await from.updateOne({
        orderIds: fromOrderIds,
      });
      const campMemberCardOrderIds = swop(
        order._id,
        null,
        campMemberCard.orderIds,
      );
      await campMemberCard.updateOne({
        orderIds: campMemberCardOrderIds,
      });
      await item.updateOne({ orderIds: swop(order._id, null, item.orderIds) });
      await order.deleteOne();
      const campMemberCardOrders = await getOrdersRaw(campMemberCardOrderIds);
      const fromOrders = await getOrdersRaw(fromOrderIds);
      const campOrders = await getOrdersFromCamp(camp);
      await item.updateOne({
        orderIds: ifIsHave(order._id, item.orderIds),
        remain: item.remain - order.count,
      });
      const items = await getItemsRaw(camp.itemIds);
      const buffer: TriggerOrder = {
        campId: camp._id,
        campMemberCardId: campMemberCard._id,
        campMemberCardOrders,
        fromId: from._id,
        fromOrders,
        campOrders,
        items,
        types: "part",
      };
      res.status(201).json(buffer);
      return;
    }
    case "baan": {
      const from = await Baan.findById(order.fromId);
      if (!from) {
        sendRes(res, false);
        return;
      }
      const fromOrderIds = swop(order._id, null, from.orderIds);
      await from.updateOne({
        orderIds: fromOrderIds,
      });
      const campMemberCardOrderIds = swop(
        order._id,
        null,
        campMemberCard.orderIds,
      );
      await campMemberCard.updateOne({
        orderIds: campMemberCardOrderIds,
      });
      await item.updateOne({ orderIds: swop(order._id, null, item.orderIds) });
      await order.deleteOne();
      const campMemberCardOrders = await getOrdersRaw(campMemberCardOrderIds);
      const fromOrders = await getOrdersRaw(fromOrderIds);
      const campOrders = await getOrdersFromCamp(camp);
      await item.updateOne({
        orderIds: ifIsHave(order._id, item.orderIds),
        remain: item.remain - order.count,
      });
      const items = await getItemsRaw(camp.itemIds);
      const buffer: TriggerOrder = {
        campId: camp._id,
        campMemberCardId: campMemberCard._id,
        campMemberCardOrders,
        fromId: from._id,
        fromOrders,
        campOrders,
        items,
        types: "baan",
      };
      res.status(201).json(buffer);
      return;
    }
  }
}
export async function getOrderForAdmin(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  const camp = await Camp.findById(req.params.id);
  if (!user || !camp) {
    sendRes(res, false);
    return;
  }
  const displayOffset = await TimeOffset.findById(user.displayOffsetId);
  if (!displayOffset) {
    sendRes(res, false);
    return;
  }
  const items = await getItemsRaw(camp.itemIds);
  const orders = await getOrdersFromCamp(camp);
  const buffer: GetOrderForAdmin = {
    displayOffset,
    items,
    orders,
    camp,
  };
  res.status(200).json(buffer);
}
export async function completeOrder(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  const order = await Order.findById(req.params.id);
  if (!order || !user) {
    sendRes(res, false);
    return;
  }
  const item = await Item.findById(order.itemId);
  if (!item) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(item.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths || !auths.includes("สามารถจัดการของได้")) {
    sendRes(res, false);
    return;
  }
  await order.updateOne({ isComplete: true });
  const campMemberCard = await CampMemberCard.findById(order.campMemberCardId);
  if (!campMemberCard) {
    sendRes(res, false);
    return;
  }
  switch (order.types) {
    case "part": {
      const from = await Part.findById(order.fromId);
      if (!from) {
        sendRes(res, false);
        return;
      }
      const camp = await Camp.findById(from.campId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const campMemberCardOrders = await getOrdersRaw(campMemberCard.orderIds);
      const fromOrders = await getOrdersRaw(from.orderIds);
      const campOrders = await getOrdersFromCamp(camp);
      const items = await getItemsRaw(camp.itemIds);
      const buffer: TriggerOrder = {
        campId: camp._id,
        campMemberCardId: campMemberCard._id,
        campMemberCardOrders,
        fromId: from._id,
        fromOrders,
        campOrders,
        items,
        types: "part",
      };
      res.status(200).json(buffer);
      return;
    }
    case "baan": {
      const from = await Baan.findById(order.fromId);
      if (!from) {
        sendRes(res, false);
        return;
      }
      const camp = await Camp.findById(from.campId);
      if (!camp) {
        sendRes(res, false);
        return;
      }
      const campMemberCardOrders = await getOrdersRaw(campMemberCard.orderIds);
      const fromOrders = await getOrdersRaw(from.orderIds);
      const campOrders = await getOrdersFromCamp(camp);
      const items = await getItemsRaw(camp.itemIds);
      const buffer: TriggerOrder = {
        campId: camp._id,
        campMemberCardId: campMemberCard._id,
        campMemberCardOrders,
        fromId: from._id,
        fromOrders,
        campOrders,
        items,
        types: "baan",
      };
      res.status(200).json(buffer);
      return;
    }
  }
}
