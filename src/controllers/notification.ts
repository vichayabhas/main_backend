import express from "express";
import { getUser } from "../middleware/auth";
import { GetNotification, ReceiveAirQuality } from "../models/interface";
import Part from "../models/Part";
import Camp from "../models/Camp";
import Baan from "../models/Baan";
import CampMemberCard from "../models/CampMemberCard";
import NongCamp from "../models/NongCamp";
import PeeCamp from "../models/PeeCamp";
import PetoCamp from "../models/PetoCamp";
export async function getNotification(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const notification: GetNotification[] = [];
  let i = 0;
  if (user) {
    if (user.mode == "pee") {
      while (i < user.authPartIds.length) {
        const part = await Part.findById(user.authPartIds[i++]);
        if (!part) {
          continue;
        }
        const camp = await Camp.findById(part.campId);
        if (!camp) {
          continue;
        }
        if (part.auths.includes("ทะเบียน")) {
          let j = 0;
          while (j < camp.baanIds.length) {
            const baan = await Baan.findById(camp.baanIds[j++]);
            if (!baan) {
              continue;
            }
            if (baan.peeIds.length == 0 && baan.nongIds.length > 0) {
              notification.push({
                id: baan._id.toString(),
                countDown: 600,
                message: `${camp.groupName}${baan.name} มี${camp.nongCall} โดยไม่มีพี่${camp.groupName} จากค่าย${camp.campName}`,
                notificationEveryMinute: 10,
                types: "เตือนมีน้องอยู่โดยไม่มีพี่",
              });
            }
          }
        }
      }
      //mode pee
    }
    //login
    i = 0;
    while (i < user.campMemberCardIds.length) {
      const campMemberCard = await CampMemberCard.findById(
        user.campMemberCardIds[i++]
      );
      if (!campMemberCard) {
        continue;
      }
      switch (campMemberCard.role) {
        case "nong": {
          const nongCamp = await NongCamp.findById(campMemberCard.campModelId);
          if (!nongCamp) {
            continue;
          }
          const baan = await Baan.findById(nongCamp.baanId);
          if (!baan) {
            continue;
          }
          notification.push(
            {
              types: "น้องคุยส่วนตัวกับพี่",
              id: campMemberCard._id.toString(),
              message: "",
              notificationEveryMinute: -1,
              countDown: 1,
            },
            {
              types: "คุยกันในบ้าน",
              countDown: 1,
              notificationEveryMinute: -1,
              message: "",
              id: baan._id.toString(),
            }
          );
          break;
        }
        case "pee": {
          const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
          if (!peeCamp) {
            continue;
          }
          const baan = await Baan.findById(peeCamp.baanId);
          const part = await Part.findById(peeCamp.partId);
          const camp = await Camp.findById(peeCamp.campId);
          if (!baan || !part || !camp) {
            continue;
          }
          notification.push(
            {
              id: baan._id.toString(),
              countDown: 1,
              message: "",
              notificationEveryMinute: -1,
              types: "คุยกันในบ้าน",
            },
            {
              id: baan._id.toString(),
              countDown: 1,
              message: "",
              notificationEveryMinute: -1,
              types: "น้องคุยส่วนตัวกับพี่",
            },
            {
              id: camp.partPeeBaanId?.toString() || "",
              countDown: 1,
              message: "",
              notificationEveryMinute: -1,
              types: "พี่บ้านคุยกัน",
            }
          );
          if (user.mode == "pee") {
            if (user.notifyOnlyYourPart) {
              notification.push({
                id: part._id.toString(),
                countDown: 1,
                message: "",
                notificationEveryMinute: -1,
                types: "คุยกันในฝ่าย",
              });
            } else {
              notification.push({
                id: peeCamp.campId.toString(),
                countDown: 1,
                message: "",
                notificationEveryMinute: -1,
                types: "คุยกันในฝ่าย",
              });
            }
            notification.push({
              id: peeCamp.baanId.toString(),
              countDown: 1,
              message: "",
              notificationEveryMinute: -1,
              types: "พี่คุยกันในบ้าน",
            });
          }
          break;
        }
        case "peto": {
          const petoCamp = await PetoCamp.findById(campMemberCard.campModelId);
          if (!petoCamp) {
            continue;
          }
          const camp = await Camp.findById(petoCamp.campId);
          const part = await Part.findById(petoCamp.partId);
          if (!part || !camp) {
            continue;
          }
          notification.push({
            id: camp.partPeeBaanId?.toString() as string,
            countDown: 1,
            message: "",
            notificationEveryMinute: -1,
            types: "พี่บ้านคุยกัน",
          });
          if (user.mode == "pee") {
            if (user.notifyOnlyYourPart) {
              notification.push({
                id: part._id.toString(),
                countDown: 1,
                message: "",
                notificationEveryMinute: -1,
                types: "คุยกันในฝ่าย",
              });
            } else {
              notification.push({
                id: petoCamp.campId.toString(),
                countDown: 1,
                message: "",
                notificationEveryMinute: -1,
                types: "คุยกันในฝ่าย",
              });
            }
          }
          break;
        }
      }
    }
  }
  const fetchData = await fetch(
    "https://website-api.airvisual.com/v1/stations/s7ygLWXNth22qrdZH/measurements?units.temperature=celsius&units",
    {
      cache: "no-store",
    }
  );
  const data: ReceiveAirQuality = await fetchData.json();
  data.measurements.hourly.filter((item) => {
    return !!item.aqi && !!item.pm25;
  });
  const airQuality =
    data.measurements.hourly[data.measurements.hourly.length - 1];
  notification.push({
    id: "",
    countDown:
      airQuality.aqi > 100 ||
      (airQuality.pm25 && airQuality.pm25.concentration > 50)
        ? 3600
        : -1,
    message: `ค่าความเข้มของอากาศอยู่ที่ ${airQuality.aqi} ค่า PM2.5 อยู่ที่ ${airQuality.pm25?.concentration}`,
    notificationEveryMinute: 60,
    types: "คุณภาพอากาศ",
  });
  res.status(200).json(notification);
}
