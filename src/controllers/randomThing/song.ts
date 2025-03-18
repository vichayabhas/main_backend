import express from "express";
import { getUser } from "../../middleware/auth";
import Baan from "../../models/Baan";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import {
  AuthSongsCamp,
  BasicBaan,
  BasicCamp,
  GetMenuSongs,
  Id,
  InterCampBack,
  InterSong,
  ShowCampSong,
  ShowCampSongReady,
  ShowSong,
  ShowSongPage,
  UpdateSongPage,
} from "../../models/interface";
import Part from "../../models/Part";
import PeeCamp from "../../models/PeeCamp";
import Song from "../../models/Song";
import User from "../../models/User";
import { getAuthTypes } from "../camp/getCampData";
import { sendRes, removeDuplicate, swop, stringToId, resOk } from "../setup";
export async function addLikeSong(req: express.Request, res: express.Response) {
  const { songIds }: { songIds: Id[] } = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await addLikeSongRaw(user._id, songIds);
  sendRes(res, true);
}
async function addLikeSongRaw(userId: Id, songIds: Id[]) {
  const user = await User.findById(userId);
  if (!user) {
    return;
  }
  const add = removeDuplicate(songIds, user.likeSongIds);
  const remove = removeDuplicate(user.likeSongIds, songIds);
  let likeSongIds = user.likeSongIds;
  let i = 0;
  while (i < add.length) {
    const song = await Song.findById(add[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(null, song._id, likeSongIds);
    await song.updateOne({
      userLikeIds: swop(null, user._id, song.userLikeIds),
    });
  }
  i = 0;
  while (i < remove.length) {
    const song = await Song.findById(remove[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(song._id, null, likeSongIds);
    await song.updateOne({
      userLikeIds: swop(user._id, null, song.userLikeIds),
    });
  }
  await user.updateOne({ likeSongIds });
}
async function getAllSong() {
  const songs = await Song.find();
  const map: Map<string, number> = new Map();
  let i = 0;
  while (i < songs.length) {
    map.set(songs[i++]._id.toString(), 0);
  }
  return map;
}
async function getUserLikeSong(userIds: Id[]) {
  const songList: Map<string, number> = await getAllSong();
  let i = 0;
  while (i < userIds.length) {
    const user = await User.findById(userIds[i++]);
    if (!user) {
      continue;
    }
    let j = 0;
    while (j < user.likeSongIds.length) {
      const songId = user.likeSongIds[j++];
      songList.set(
        songId.toString(),
        (songList.get(songId.toString()) as number) + 1
      );
    }
  }
  return songList;
}
export async function addBaanSong(req: express.Request, res: express.Response) {
  const { songIds }: { songIds: Id[] } = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await addBaanSongRaw(stringToId(req.params.id), songIds, user._id);
  sendRes(res, true);
}

async function addBaanSongRaw(baanId: Id, songIds: Id[], userId: Id) {
  const baan = await Baan.findById(baanId);
  if (!baan) {
    return;
  }
  const camp = await Camp.findById(baan.campId);
  if (!camp) {
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(userId.toString())
  );
  if (!campMemberCard) {
    return;
  }
  const auths = await getAuthTypes(userId, camp._id);
  if (!auths) {
    return;
  }
  switch (campMemberCard.role) {
    case "nong":
      return;
    case "pee": {
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        return;
      }
      if (
        part._id.toString() == camp.partBoardId?.toString() ||
        auths.includes("pr/studio") ||
        auths.includes("หัวหน้าพี่เลี้ยง")
      ) {
        break;
      } else {
        return;
      }
    }
    case "peto": {
      const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
      if (!peeCamp) {
        return;
      }
      const part = await Part.findById(peeCamp.partId);
      if (!part) {
        return;
      }
      if (
        part._id.toString() == camp.partBoardId?.toString() ||
        auths.includes("pr/studio") ||
        auths.includes("หัวหน้าพี่เลี้ยง")
      ) {
        break;
      } else {
        return;
      }
    }
  }
  const add = removeDuplicate(songIds, baan.songIds);
  const remove = removeDuplicate(baan.songIds, songIds);
  let likeSongIds = baan.songIds;
  let i = 0;
  while (i < add.length) {
    const song = await Song.findById(add[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(null, song._id, likeSongIds);
    await song.updateOne({
      baanIds: swop(null, baan._id, song.baanIds),
    });
  }
  i = 0;
  while (i < remove.length) {
    const song = await Song.findById(remove[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(song._id, null, likeSongIds);
    await song.updateOne({
      baanIds: swop(baan._id, null, song.baanIds),
    });
  }
  await baan.updateOne({ songIds: likeSongIds });
}

async function getShowSongRaw(
  song: InterSong,
  userId: Id | null
): Promise<ShowSong> {
  let i = 0;
  const campNames: string[] = [];
  const baanNames: string[] = [];
  const baanRelates: string[] = [];
  const campRelates: string[] = [];
  const { name, campIds, baanIds, author, time, link, userLikeIds, _id } = song;
  while (i < baanIds.length) {
    const baan = await Baan.findById(baanIds[i++]);
    if (!baan) {
      continue;
    }
    const camp = await Camp.findById(baan.campId);
    if (!camp) {
      continue;
    }
    baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    if (!userId) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      baan.mapCampMemberCardIdByUserId.get(userId.toString())
    );
    if (!campMemberCard) {
      continue;
    }
    switch (campMemberCard.role) {
      case "nong": {
        if (baan.nongIds.includes(userId)) {
          baanRelates.push(
            `${camp.nongCall} ${camp.groupName}${baan.name} จากค่าย ${camp.campName}`
          );
        }
        break;
      }
      case "pee": {
        if (baan.peeIds.includes(userId)) {
          baanRelates.push(
            `พี่${camp.groupName} ${camp.groupName}${baan.name} จากค่าย ${camp.campName}`
          );
        }
        break;
      }
      case "peto": {
        break;
      }
    }
  }
  i = 0;
  while (i < campIds.length) {
    const camp = await Camp.findById(campIds[i++]);
    if (!camp) {
      continue;
    }
    campNames.push(camp.campName);
    if (!userId) {
      continue;
    }
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(userId.toString())
    );
    if (!campMemberCard) {
      continue;
    }
    switch (campMemberCard.role) {
      case "nong": {
        campRelates.push(`${camp.nongCall} ${camp.campName}`);
        break;
      }
      case "pee": {
        campRelates.push(`พี่${camp.groupName} ${camp.campName}`);
        break;
      }
      case "peto": {
        campRelates.push(`พี่ปีโต ${camp.campName}`);
        break;
      }
    }
  }
  const buffer: ShowSong = {
    campNames,
    campRelates,
    baanNames,
    baanRelates,
    like: userLikeIds.length,
    time,
    name,
    author,
    link,
    _id,
  };
  return buffer;
}
export async function getMenuSongs(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const songs = await Song.find();
  const out: ShowSong[] = [];
  let i = 0;
  if (!user) {
    while (i < songs.length) {
      const song = await getShowSongRaw(songs[i++], null);
      out.push(song);
    }
    const buffer: GetMenuSongs = {
      songs: out,
      likeSongIds: [],
      authBaans: [],
      authCamps: [],
    };
    res.status(200).json(buffer);
  } else {
    while (i < songs.length) {
      const song = await getShowSongRaw(songs[i++], user._id);
      out.push(song);
    }
    i = 0;
    const authBaans: {
      data: BasicBaan;
      showName: string;
    }[] = [];
    const authCamps: BasicCamp[] = [];
    while (i < user.authPartIds.length) {
      const part = await Part.findById(user.authPartIds[i++]);
      if (!part) {
        continue;
      }
      const camp: InterCampBack | null = await Camp.findById(part.campId);
      if (!camp) {
        continue;
      }
      const auths = await getAuthTypes(user._id, camp._id);
      if (!auths) {
        continue;
      }
      if (user.authPartIds.includes(camp.partBoardId)) {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          authBaans.push({
            data: baan,
            showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
          });
        }
        authCamps.push(camp);
        continue;
      }
      if (auths.includes("pr/studio")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            authCamps.push(camp);
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            authCamps.push(camp);
            break;
          }
        }
        continue;
      }
      if (auths.includes("หัวหน้าพี่เลี้ยง")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            break;
          }
        }
        continue;
      }
    }
    const buffer: GetMenuSongs = {
      songs: out,
      likeSongIds: user.likeSongIds,
      authBaans,
      authCamps,
    };
    res.status(200).json(buffer);
  }
}
export async function createSong(req: express.Request, res: express.Response) {
  await Song.create(req.body);
  res.status(201).json(resOk);
}
export async function getShowSong(req: express.Request, res: express.Response) {
  const song = await Song.findById(req.params.id);
  if (!song) {
    sendRes(res, false);
    return;
  }
  const user = await getUser(req);
  if (!user) {
    const out = await getShowSongRaw(song, null);
    const buffer: ShowSongPage = {
      song: out,
      authBaans: [],
      authCamps: [],
      likeSongIds: [],
    };
    res.status(200).json(buffer);
  } else {
    const out = await getShowSongRaw(song, user._id);
    let i = 0;
    const authBaans: {
      data: BasicBaan;
      showName: string;
    }[] = [];
    const authCamps: BasicCamp[] = [];
    while (i < user.authPartIds.length) {
      const part = await Part.findById(user.authPartIds[i++]);
      if (!part) {
        continue;
      }
      const camp: InterCampBack | null = await Camp.findById(part.campId);
      if (!camp) {
        continue;
      }
      const auths = await getAuthTypes(user._id, camp._id);
      if (!auths) {
        continue;
      }
      if (user.authPartIds.includes(camp.partBoardId)) {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          authBaans.push({
            data: baan,
            showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
          });
        }
        authCamps.push(camp);
        continue;
      }
      if (auths.includes("pr/studio")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            authCamps.push(camp);
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            authCamps.push(camp);
            break;
          }
        }
        continue;
      }
      if (auths.includes("หัวหน้าพี่เลี้ยง")) {
        const campMemberCard = await CampMemberCard.findById(
          camp.mapCampMemberCardIdByUserId.get(user._id)
        );
        if (!campMemberCard) {
          continue;
        }
        switch (campMemberCard.role) {
          case "nong":
            break;
          case "pee": {
            const peeCamp = await PeeCamp.findById(campMemberCard.campModelId);
            if (!peeCamp) {
              continue;
            }
            const baan = await Baan.findById(peeCamp.baanId);
            if (!baan) {
              continue;
            }
            authBaans.push({
              data: baan,
              showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
            });
            break;
          }
          case "peto": {
            let j = 0;
            while (j < camp.baanIds.length) {
              const baan = await Baan.findById(camp.baanIds[j++]);
              if (!baan) {
                continue;
              }
              authBaans.push({
                data: baan,
                showName: `${camp.groupName}${baan.name} จากค่าย ${camp.campName}`,
              });
            }
            break;
          }
        }
        continue;
      }
    }
    const buffer: ShowSongPage = {
      song: out,
      authBaans,
      authCamps,
      likeSongIds: user.likeSongIds,
    };
    res.status(200).json(buffer);
  }
}
export async function addCampSong(req: express.Request, res: express.Response) {
  const { songIds }: { songIds: Id[] } = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await addCampSongRaw(stringToId(req.params.id), songIds, user._id);
  sendRes(res, true);
}
async function addCampSongRaw(campId: Id, songIds: Id[], userId: Id) {
  const camp = await Camp.findById(campId);
  const user = await User.findById(userId);
  if (!camp || !user) {
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths) {
    return;
  }
  if (
    !auths.includes("pr/studio") &&
    user.authPartIds.includes(camp.partBoardId as Id)
  ) {
    return;
  }
  const add = removeDuplicate(songIds, camp.songIds);
  const remove = removeDuplicate(camp.songIds, songIds);
  let likeSongIds = camp.songIds;
  let i = 0;
  while (i < add.length) {
    const song = await Song.findById(add[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(null, song._id, likeSongIds);
    await song.updateOne({
      campIds: swop(null, camp._id, song.campIds),
    });
  }
  i = 0;
  while (i < remove.length) {
    const song = await Song.findById(remove[i++]);
    if (!song) {
      continue;
    }
    likeSongIds = swop(song._id, null, likeSongIds);
    await song.updateOne({
      campIds: swop(camp._id, null, song.campIds),
    });
  }
  await camp.updateOne({ songIds: likeSongIds });
}
export async function updateSongPage(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const input: UpdateSongPage = req.body;
  if (!user) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < input.baans.length) {
    const baan = input.baans[i++];
    await addBaanSongRaw(baan._id, baan.songIds, user._id);
  }
  i = 0;
  while (i < input.camps.length) {
    const camp = input.camps[i++];
    await addCampSongRaw(camp._id, camp.songIds, user._id);
  }
  await addLikeSongRaw(user._id, input.userLikeSongIds);
  sendRes(res, true);
}
export async function getShowCampSongs(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const camp = await Camp.findById(req.params.id);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const nongLikeSongs = await getUserLikeSong(camp.nongIds);
  const peeLikeSongs = await getUserLikeSong(camp.peeIds);
  const petoLikeSongs = await getUserLikeSong(camp.petoIds);
  const songs = await Song.find();
  const outputs: ShowCampSong[] = [];
  let i = 0;
  while (i < songs.length) {
    const { _id, name, userLikeIds, link, author, time, baanIds, campIds } =
      songs[i++];
    let j = 0;
    const campNames: string[] = [];
    const baanNames: string[] = [];
    while (j < baanIds.length) {
      const baan = await Baan.findById(baanIds[j++]);
      if (!baan) {
        continue;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        continue;
      }
      baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    }
    i = 0;
    while (i < campIds.length) {
      const camp = await Camp.findById(campIds[i++]);
      if (!camp) {
        continue;
      }
      campNames.push(camp.campName);
    }
    outputs.push({
      _id,
      like: userLikeIds.length,
      name,
      link,
      author,
      nongLike: nongLikeSongs.get(_id.toString()) || 0,
      peeLike: peeLikeSongs.get(_id.toString()) || 0,
      petoLike: petoLikeSongs.get(_id.toString()) || 0,
      time,
      campNames,
      baanNames,
    });
  }
  res.status(200).json(outputs);
}
export async function getShowBaanSongs(
  req: express.Request,
  res: express.Response
) {
  const baan = await Baan.findById(req.params.id);
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
  const nongLikeSongs = await getUserLikeSong(baan.nongIds);
  const peeLikeSongs = await getUserLikeSong(baan.peeIds);
  const songs = await Song.find();
  const outputs: ShowCampSong[] = [];
  let i = 0;
  while (i < songs.length) {
    const { _id, name, userLikeIds, link, author, time, baanIds, campIds } =
      songs[i++];
    let j = 0;
    const campNames: string[] = [];
    const baanNames: string[] = [];
    while (j < baanIds.length) {
      const baan = await Baan.findById(baanIds[j++]);
      if (!baan) {
        continue;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        continue;
      }
      baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    }
    i = 0;
    while (i < campIds.length) {
      const camp = await Camp.findById(campIds[i++]);
      if (!camp) {
        continue;
      }
      campNames.push(camp.campName);
    }
    outputs.push({
      _id,
      like: userLikeIds.length,
      name,
      link,
      author,
      nongLike: nongLikeSongs.get(_id.toString()) || 0,
      peeLike: peeLikeSongs.get(_id.toString()) || 0,
      petoLike: 0,
      time,
      campNames,
      baanNames,
    });
  }
  const buffer: ShowCampSongReady = {
    showCampSongs: outputs,
    songIds: baan.songIds,
    _id: baan._id,
    baan,
    camp,
    userLikeSongIds: user.likeSongIds,
  };
  res.status(200).json(buffer);
}
export async function getAuthSongs(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const camp: InterCampBack | null = await Camp.findById(req.params.id);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id)
  );
  if (!campMemberCard) {
    sendRes(res, false);
    return;
  }
  let authCamp: boolean;
  const baans: BasicBaan[] = [];
  let i = 0;
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths) {
    sendRes(res, false);
    return;
  }
  if (user.authPartIds.includes(camp.partBoardId)) {
    let j = 0;
    while (j < camp.baanIds.length) {
      const baan = await Baan.findById(camp.baanIds[j++]);
      if (!baan) {
        continue;
      }
      baans.push(baan);
    }
    authCamp = true;
  } else if (auths.includes("pr/studio")) {
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(user._id)
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
        const baan = await Baan.findById(peeCamp.baanId);
        if (!baan) {
          sendRes(res, false);
          return;
        }
        baans.push(baan);
        authCamp = true;
        break;
      }
      case "peto": {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          baans.push(baan);
        }
        authCamp = true;
        break;
      }
    }
  } else if (auths.includes("หัวหน้าพี่เลี้ยง")) {
    const campMemberCard = await CampMemberCard.findById(
      camp.mapCampMemberCardIdByUserId.get(user._id)
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
        const baan = await Baan.findById(peeCamp.baanId);
        if (!baan) {
          sendRes(res, false);
          return;
        }
        baans.push(baan);
        authCamp = false;
        break;
      }
      case "peto": {
        let j = 0;
        while (j < camp.baanIds.length) {
          const baan = await Baan.findById(camp.baanIds[j++]);
          if (!baan) {
            continue;
          }
          baans.push(baan);
        }
        authCamp = false;
        break;
      }
    }
  } else {
    sendRes(res, false);
    return;
  }
  const songs = await Song.find();
  const outputs: ShowCampSong[] = [];
  i = 0;
  const nongLikeSongs = await getUserLikeSong(camp.nongIds);
  const peeLikeSongs = await getUserLikeSong(camp.peeIds);
  const petoLikeSongs = await getUserLikeSong(camp.petoIds);
  while (i < songs.length) {
    const { _id, name, userLikeIds, link, author, time, baanIds, campIds } =
      songs[i++];
    let j = 0;
    const campNames: string[] = [];
    const baanNames: string[] = [];
    while (j < baanIds.length) {
      const baan = await Baan.findById(baanIds[j++]);
      if (!baan) {
        continue;
      }
      const camp = await Camp.findById(baan.campId);
      if (!camp) {
        continue;
      }
      baanNames.push(`${camp.groupName}${baan.name} จากค่าย ${camp.campName}`);
    }
    j = 0;
    while (j < campIds.length) {
      const camp = await Camp.findById(campIds[j++]);
      if (!camp) {
        continue;
      }
      campNames.push(camp.campName);
    }
    outputs.push({
      _id,
      like: userLikeIds.length,
      name,
      link,
      author,
      time,
      campNames,
      baanNames,
      nongLike: nongLikeSongs.get(_id.toString()) || 0,
      peeLike: peeLikeSongs.get(_id.toString()) || 0,
      petoLike: petoLikeSongs.get(_id.toString()) || 0,
    });
  }
  const buffer: AuthSongsCamp = {
    authCamp,
    baans,
    camp,
    songs: outputs,
    userLikeSongIds: user.likeSongIds,
  };
  res.status(200).json(buffer);
}
