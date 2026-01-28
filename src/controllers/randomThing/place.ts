import express from "express";
import Building from "../../models/Building";
import {
  GetAllPlaceDataSetup,
  InterPlace,
  ShowPlace,
} from "../../models/interface";
import Place from "../../models/Place";
import { swop, sendRes } from "../setup";

export async function getAllBuilding(
  req: express.Request,
  res: express.Response,
) {
  const buildings = await Building.find();
  res.status(200).json(buildings);
}
export async function createPlace(req: express.Request, res: express.Response) {
  const { room, buildingId, floor } = req.body;
  const place = await Place.create({ room, buildingId, floor });
  const building = await Building.findById(buildingId);
  await building?.updateOne({
    placeIds: swop(null, place._id, building.placeIds),
  });
  res.status(201).json(place);
}
export async function saveDeletePlace(
  req: express.Request,
  res: express.Response,
) {
  const place = await Place.findById(req.params.id);
  if (
    place?.actionPlanIds.length ||
    place?.boySleepBaanIds.length ||
    place?.girlSleepBaanIds.length ||
    place?.normalBaanIds.length ||
    place?.fridayActIds.length ||
    place?.partIds.length ||
    place?.lostAndFoundIds.length
  ) {
    return res.status(400).json({ success: false });
  }
  await place?.deleteOne();
  res.status(200).json({ success: true });
}
export async function createBuilding(
  req: express.Request,
  res: express.Response,
) {
  const building = await Building.create({ name: req.params.id });
  res.status(201).json(building);
}
export async function saveDeleteBuilding(
  req: express.Request,
  res: express.Response,
) {
  const building = await Building.findById(req.params.id);
  if (building?.placeIds.length) {
    return res.status(400).json({ success: false });
  }
  await building?.deleteOne();
  sendRes(res, true);
}
export async function getPlaces(req: express.Request, res: express.Response) {
  const building = await Building.findById(req.params.id);
  if (!building) {
    sendRes(res, false);
    return;
  }
  const places: InterPlace[] = [];
  let i = 0;
  while (i < building.placeIds.length) {
    const place = await Place.findById(building.placeIds[i++]);
    if (place) {
      places.push(place.toObject());
    }
  }
  res.status(200).json(places);
}
export async function getPlace(req: express.Request, res: express.Response) {
  const place = await Place.findById(req.params.id);
  res.status(200).json(place);
}
export async function getBuilding(req: express.Request, res: express.Response) {
  const building = await Building.findById(req.params.id);
  res.status(200).json(building);
}

export async function getShowPlace(
  req: express.Request,
  res: express.Response,
) {
  const place = await Place.findById(req.params.id);
  if (!place) {
    sendRes(res, false);
    return;
  }
  const building = await Building.findById(place.buildingId);
  if (!building) {
    sendRes(res, false);
    return;
  }
  const showPlace: ShowPlace = {
    _id: place._id,
    buildingName: building.name,
    floor: place.floor,
    room: place.room,
  };
  res.status(200).json(showPlace);
}
export async function getAllPlaceDataSetups(
  req: express.Request,
  res: express.Response,
) {
  const buildings = await Building.find();
  const data: GetAllPlaceDataSetup[] = [];
  let i = 0;
  while (i < buildings.length) {
    const {
      _id,
      name,
      normalBaanIds,
      boySleepBaanIds,
      girlSleepBaanIds,
      partIds,
      placeIds,
      actionPlanIds,
      fridayActIds,
      lostAndFoundIds,
    } = buildings[i++];
    let j = 0;
    const places: InterPlace[] = [];
    while (j < placeIds.length) {
      const place = await Place.findById(placeIds[j++]);
      if (!place) {
        continue;
      }
      places.push(place);
    }
    data.push({
      partIds,
      placeIds,
      places,
      _id,
      name,
      normalBaanIds,
      boySleepBaanIds,
      girlSleepBaanIds,
      actionPlanIds,
      fridayActIds,
      lostAndFoundIds,
    });
  }
  res.status(200).json(data);
}
