import { getUser } from "../../middleware/auth";
import AnswerContainer from "../../models/AnswerContainer";
import Camp from "../../models/Camp";
import CampMemberCard from "../../models/CampMemberCard";
import ChoiceAnswer from "../../models/ChoiceAnswer";
import ChoiceQuestion from "../../models/ChoiceQuestion";
import {
  EditQuestionPack,
  Id,
  GetAllQuestion,
  GetTextQuestion,
  GetChoiceQuestion,
  AnswerPack,
  RoleCamp,
  GetAllAnswerAndQuestion,
  InterChoiceQuestion,
  InterTextQuestion,
  ScoreTextQuestions,
  UserAndAllQuestionPack,
} from "../../models/interface";
import TextAnswer from "../../models/TextAnswer";
import TextQuestion from "../../models/TextQuestion";
import User from "../../models/User";
import {
  sendRes,
  getSystemInfoRaw,
  swop,
  stringToId,
  removeDuplicate,
} from "../setup";
import express from "express";
import {  getAuthTypes } from "./getCampData";

export async function editQuestion(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  const edit: EditQuestionPack = req.body;
  const camp = await Camp.findById(edit.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  if (!user) {
    res.status(403).json({ success: false });
    return;
  }
  const auths = await getAuthTypes(user._id, camp._id);
  if (!auths || !auths.includes("แก้ไขคำถาม")) {
    sendRes(res, false);
    return;
  }
  let { choiceQuestionIds, textQuestionIds } = camp;
  for (const {
    question,
    a,
    b,
    c,
    d,
    e,
    scoreA,
    scoreB,
    scoreC,
    scoreD,
    scoreE,
    correct,
    order,
    _id,
  } of edit.choices) {
    if (!_id) {
      const newChoice = await ChoiceQuestion.create({
        question,
        a,
        b,
        c,
        d,
        e,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        campId: camp._id,
        correct,
        order,
      });
      choiceQuestionIds = swop(null, newChoice._id, choiceQuestionIds);
    } else {
      const choiceQuestion = await ChoiceQuestion.findById(_id);
      if (!choiceQuestion) {
        continue;
      }
      if (
        choiceQuestion.question == question &&
        choiceQuestion.a == a &&
        choiceQuestion.b == b &&
        choiceQuestion.c == c &&
        choiceQuestion.d == d &&
        choiceQuestion.e == e &&
        choiceQuestion.scoreA == scoreA &&
        choiceQuestion.scoreB == scoreB &&
        choiceQuestion.scoreC == scoreC &&
        choiceQuestion.scoreD == scoreD &&
        choiceQuestion.scoreE == scoreE &&
        choiceQuestion.correct == correct &&
        choiceQuestion.order == order
      ) {
        continue;
      }
      await choiceQuestion.updateOne({
        question,
        a,
        b,
        c,
        d,
        e,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        correct,
        order,
      });
    }
  }
  for (const { _id, question, score, order } of edit.texts) {
    if (!_id) {
      const newText = await TextQuestion.create({
        question,
        score,
        campId: camp._id,
        order,
      });
      textQuestionIds = swop(null, newText._id, textQuestionIds);
    } else {
      const textQuestion = await TextQuestion.findById(_id);
      if (!textQuestion) {
        continue;
      }
      if (
        textQuestion.question == question &&
        textQuestion.score == score &&
        textQuestion.order == order
      ) {
        continue;
      }
      await textQuestion.updateOne({ question, score, order });
    }
  }
  await camp.updateOne({ textQuestionIds, choiceQuestionIds });
  sendRes(res, true);
}
export async function getAllQuestion(
  req: express.Request,
  res: express.Response
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const questions = await getAllQuestionRaw(
    stringToId(req.params.id),
    user._id
  );
  if (!questions) {
    sendRes(res, false);
    return;
  }
  res.status(200).json(questions);
}
export async function getAllQuestionRaw(
  campId: Id,
  userId: Id
): Promise<GetAllQuestion | null> {
  const user = await User.findById(userId);
  const camp = await Camp.findById(campId);
  if (!camp || !user) {
    return null;
  }
  const texts: GetTextQuestion[] = [];
  const choices: GetChoiceQuestion[] = [];
  if (camp.mapAnswerPackIdByUserId.has(user._id.toString())) {
    const answerPack = await AnswerContainer.findById(
      camp.mapAnswerPackIdByUserId.get(user._id.toString())
    );
    if (answerPack) {
      const textQuestionIds: Id[] = [];
      for (const textAnswerId of answerPack.textAnswerIds) {
        const textAnswer = await TextAnswer.findById(textAnswerId);
        if (!textAnswer) {
          continue;
        }
        const text = await TextQuestion.findById(textAnswer.questionId);
        if (!text) {
          continue;
        }
        textQuestionIds.push(text._id);
        const { question, _id, campId, answerIds, score, order } = text;
        texts.push({
          question,
          _id,
          campId,
          answer: textAnswer.answer,
          answerIds,
          score,
          order,
          answerId: textAnswer._id,
          answerScore: textAnswer.score,
        });
      }
      const textRemain = removeDuplicate(camp.textQuestionIds, textQuestionIds);
      for (const textId of textRemain) {
        const text = await TextQuestion.findById(textId);
        if (!text) {
          continue;
        }
        const { question, _id, campId, answerIds, score, order } = text;
        texts.push({
          question,
          _id,
          campId,
          answer: "-",
          answerIds,
          score,
          order,
          answerId: null,
          answerScore: 0,
        });
      }
      const choiceQuestionIds: Id[] = [];
      for (const choiceAnswerId of answerPack.choiceAnswerIds) {
        const choiceAnswer = await ChoiceAnswer.findById(choiceAnswerId);
        if (!choiceAnswer) {
          continue;
        }
        const choice = await ChoiceQuestion.findById(choiceAnswer.questionId);
        if (!choice) {
          continue;
        }
        choiceQuestionIds.push(choice._id);
        const {
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          correct,
          order,
          answerIds,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
        } = choice;
        choices.push({
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          correct,
          order,
          answer: choiceAnswer.answer,
          answerIds,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
          answerId: choiceAnswer._id,
        });
      }
      const choiceRemain = removeDuplicate(
        camp.choiceQuestionIds,
        choiceQuestionIds
      );
      for (const choiceId of choiceRemain) {
        const choice = await ChoiceQuestion.findById(choiceId);
        if (!choice) {
          continue;
        }
        const {
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
          correct,
          order,
          answerIds,
        } = choice;
        choices.push({
          campId,
          question,
          a,
          b,
          c,
          d,
          e,
          _id,
          scoreA,
          scoreB,
          scoreC,
          scoreD,
          scoreE,
          nongAnswerA,
          nongAnswerB,
          nongAnswerC,
          nongAnswerD,
          nongAnswerE,
          peeAnswerA,
          peeAnswerB,
          peeAnswerC,
          peeAnswerD,
          peeAnswerE,
          correct,
          order,
          answer: "-",
          answerIds,
          answerId: null,
        });
      }
    }
  } else {
    for (const textId of camp.textQuestionIds) {
      const text = await TextQuestion.findById(textId);
      if (!text) {
        continue;
      }
      const { question, _id, campId, answerIds, score, order } = text;
      texts.push({
        question,
        _id,
        campId,
        answer: "-",
        answerIds,
        score,
        order,
        answerId: null,
        answerScore: 0,
      });
    }
    for (const choiceId of camp.choiceQuestionIds) {
      const choice = await ChoiceQuestion.findById(choiceId);
      if (!choice) {
        continue;
      }
      const {
        campId,
        question,
        a,
        b,
        c,
        d,
        e,
        _id,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        nongAnswerA,
        nongAnswerB,
        nongAnswerC,
        nongAnswerD,
        nongAnswerE,
        peeAnswerA,
        peeAnswerB,
        peeAnswerC,
        peeAnswerD,
        peeAnswerE,
        correct,
        order,
        answerIds,
      } = choice;
      choices.push({
        campId,
        question,
        a,
        b,
        c,
        d,
        e,
        _id,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        scoreE,
        nongAnswerA,
        nongAnswerB,
        nongAnswerC,
        nongAnswerD,
        nongAnswerE,
        peeAnswerA,
        peeAnswerB,
        peeAnswerC,
        peeAnswerD,
        peeAnswerE,
        correct,
        order,
        answer: "-",
        answerIds,
        answerId: null,
      });
    }
  }
  const buffer: GetAllQuestion = {
    choices,
    texts,
    canAnswerTheQuestion: camp.canAnswerTheQuestion,
  };
  return buffer;
}
export async function answerAllQuestion(
  answer: AnswerPack,
  userId: Id,
  role: RoleCamp
) {
  const camp = await Camp.findById(answer.campId);
  const user = await User.findById(userId);
  if (!camp || !user) {
    return;
  }
  const choiceAnswerIds: Id[] = [];
  const textAnswerIds: Id[] = [];
  let answerContainer = await AnswerContainer.findById(
    camp.mapAnswerPackIdByUserId.get(user._id.toString())
  );
  if (!answerContainer) {
    answerContainer = await AnswerContainer.create({
      campId: camp._id,
      userId: user._id,
      role,
    });
    switch (role) {
      case "nong": {
        await user.updateOne({
          nongAnswerPackIds: swop(
            null,
            answerContainer._id,
            user.nongAnswerPackIds
          ),
        });
        camp.mapAnswerPackIdByUserId.set(
          user._id.toString(),
          answerContainer._id
        );
        await camp.updateOne({
          nongAnswerPackIds: swop(
            null,
            answerContainer._id,
            camp.nongAnswerPackIds
          ),
          mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
        });
        break;
      }
      case "pee": {
        await user.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            user.peeAnswerPackIds
          ),
        });
        camp.mapAnswerPackIdByUserId.set(
          user._id.toString(),
          answerContainer._id
        );
        await camp.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            camp.peeAnswerPackIds
          ),
          mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
          peeAnswerIds: swop(null, user._id, camp.peeAnswerIds),
        });
        break;
      }
      case "peto": {
        await user.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            user.peeAnswerPackIds
          ),
        });
        camp.mapAnswerPackIdByUserId.set(
          user._id.toString(),
          answerContainer._id
        );
        await camp.updateOne({
          peeAnswerPackIds: swop(
            null,
            answerContainer._id,
            camp.peeAnswerPackIds
          ),
          mapAnswerPackIdByUserId: camp.mapAnswerPackIdByUserId,
          peeAnswerIds: swop(null, user._id, camp.peeAnswerIds),
        });
        break;
      }
    }
  }
  for (const textAnswerPack of answer.textAnswers) {
    const question = await TextQuestion.findById(textAnswerPack.questionId);
    if (!question) {
      continue;
    }
    let textAnswer = await TextAnswer.findById(textAnswerPack.answerId);
    if (!textAnswer) {
      textAnswer = await TextAnswer.create({
        answer: textAnswerPack.answer,
        userId: user._id,
        questionId: question._id,
        containerId: answerContainer._id,
      });
      await question.updateOne({
        answerIds: swop(null, textAnswer._id, question.answerIds),
      });
    } else {
      await textAnswer.updateOne({ answer: textAnswerPack.answer });
    }
    textAnswerIds.push(textAnswer._id);
  }
  for (const choiceAnswerPack of answer.choiceAnswers) {
    const question1 = await ChoiceQuestion.findById(
      choiceAnswerPack.questionId
    );
    if (!question1) {
      continue;
    }
    let choiceAnswer = await ChoiceAnswer.findById(choiceAnswerPack.answerId);
    let score: number;
    switch (choiceAnswerPack.answer) {
      case "A": {
        score = question1.scoreA;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerA: question1.nongAnswerA + 1 });
        } else {
          await question1.updateOne({ peeAnswerA: question1.peeAnswerA + 1 });
        }
        break;
      }
      case "B": {
        score = question1.scoreB;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerB: question1.nongAnswerB + 1 });
        } else {
          await question1.updateOne({ peeAnswerB: question1.peeAnswerB + 1 });
        }
        break;
      }
      case "C": {
        score = question1.scoreC;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerC: question1.nongAnswerC + 1 });
        } else {
          await question1.updateOne({ peeAnswerC: question1.peeAnswerC + 1 });
        }
        break;
      }
      case "D": {
        score = question1.scoreD;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerD: question1.nongAnswerD + 1 });
        } else {
          await question1.updateOne({ peeAnswerD: question1.peeAnswerD + 1 });
        }
        break;
      }
      case "E": {
        score = question1.scoreE;
        if (role == "nong") {
          await question1.updateOne({ nongAnswerE: question1.nongAnswerE + 1 });
        } else {
          await question1.updateOne({ peeAnswerE: question1.peeAnswerE + 1 });
        }
        break;
      }
      case "-": {
        score = 0;
        break;
      }
    }
    const question2 = await ChoiceQuestion.findById(question1._id);
    if (!question2) {
      continue;
    }
    if (!choiceAnswer) {
      choiceAnswer = await ChoiceAnswer.create({
        campId: camp._id,
        answer: choiceAnswerPack.answer,
        score,
        questionId: question2._id,
        userId: user._id,
        containerId: answerContainer._id,
      });
      await question2.updateOne({
        answerIds: swop(null, choiceAnswer._id, question2.answerIds),
      });
    } else {
      switch (choiceAnswer.answer) {
        case "A": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerA: question2.nongAnswerA - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerA: question2.peeAnswerA - 1 });
          }
          break;
        }
        case "B": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerB: question2.nongAnswerB - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerB: question2.peeAnswerB - 1 });
          }
          break;
        }
        case "C": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerC: question2.nongAnswerC - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerC: question2.peeAnswerC - 1 });
          }
          break;
        }
        case "D": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerD: question2.nongAnswerD - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerD: question2.peeAnswerD - 1 });
          }
          break;
        }
        case "E": {
          if (role == "nong") {
            await question2.updateOne({
              nongAnswerE: question2.nongAnswerE - 1,
            });
          } else {
            await question2.updateOne({ peeAnswerE: question2.peeAnswerE - 1 });
          }
          break;
        }
        case "-": {
          break;
        }
      }
      await choiceAnswer.updateOne({ score, answer: choiceAnswerPack.answer });
    }
    choiceAnswerIds.push(choiceAnswer._id);
  }
  await answerContainer.updateOne({
    choiceAnswerIds,
    textAnswerIds,
  });
}
export async function deleteChoiceQuestion(
  req: express.Request,
  res: express.Response
) {
  const question = await ChoiceQuestion.findById(req.params.id);
  if (!question) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(question.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  await camp.updateOne({
    choiceQuestionIds: swop(question._id, null, camp.choiceQuestionIds),
  });
  let i = 0;
  while (i < question.answerIds.length) {
    const answer = await ChoiceAnswer.findById(question.answerIds[i++]);
    if (!answer) {
      continue;
    }
    const answerContainer = await AnswerContainer.findById(answer.containerId);
    if (!answerContainer) {
      continue;
    }
    await answerContainer.updateOne({
      choiceAnswerIds: swop(answer._id, null, answerContainer.choiceAnswerIds),
    });
    await answer.deleteOne();
  }
  await question.deleteOne();
  sendRes(res, true);
}
export async function deleteTextQuestion(
  req: express.Request,
  res: express.Response
) {
  const question = await TextQuestion.findById(req.params.id);
  if (!question) {
    sendRes(res, false);
    return;
  }
  const camp = await Camp.findById(question.campId);
  if (!camp) {
    sendRes(res, false);
    return;
  }
  await camp.updateOne({
    textQuestionIds: swop(question._id, null, camp.textQuestionIds),
  });
  let i = 0;
  while (i < question.answerIds.length) {
    const answer = await TextAnswer.findById(question.answerIds[i++]);
    if (!answer) {
      continue;
    }
    const answerContainer = await AnswerContainer.findById(answer.containerId);
    if (!answerContainer) {
      continue;
    }
    await answerContainer.updateOne({
      textAnswerIds: swop(answer._id, null, answerContainer.textAnswerIds),
    });
    await answer.deleteOne();
  }
  await question.deleteOne();
  sendRes(res, true);
}
export async function peeAnswerQuestion(
  req: express.Request,
  res: express.Response
) {
  const answer: AnswerPack = req.body;
  const camp = await Camp.findById(answer.campId);
  const user = await getUser(req);
  if (!camp || !user) {
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
  await answerAllQuestion(answer, user._id, campMemberCard.role);
  sendRes(res, true);
}

export async function getAllAnswerAndQuestion(
  req: express.Request,
  res: express.Response
) {
  const camp = await Camp.findById(req.params.id);
  const user = await getUser(req);
  if (
    !camp ||
    !user ||
    (camp.nongIds.includes(user._id) &&
      !(
        camp.canNongSeeAllAnswer &&
        (user.role != "nong" || camp.canNongAccessDataWithRoleNong)
      ))
  ) {
    sendRes(res, false);
    return;
  }
  const nongsAnswers: UserAndAllQuestionPack[] = [];
  const peeAnswers: UserAndAllQuestionPack[] = [];
  const mainChoices: InterChoiceQuestion[] = [];
  const mainTexts: InterTextQuestion[] = [];
  const nongPendingAnswers: UserAndAllQuestionPack[] = [];
  const nongPassAnswers: UserAndAllQuestionPack[] = [];
  const nongSureAnswers: UserAndAllQuestionPack[] = [];
  const nongPaidAnswers: UserAndAllQuestionPack[] = [];
  const nongInterviewAnswers: UserAndAllQuestionPack[] = [];
  for (const userId of camp.nongIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongsAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const userId of camp.peeAnswerIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      peeAnswers.push({
        user,
        questions,
      });
    }
  }
  const nongPendingIds: Id[] = [];
  camp.nongPendingIds.forEach((v, k) => {
    nongPendingIds.push(stringToId(k));
  });
  for (const userId of nongPendingIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongPendingAnswers.push({
        user,
        questions,
      });
    }
  }
  const nongInterviewIds: Id[] = [];
  camp.nongInterviewIds.forEach((v, k) => {
    nongInterviewIds.push(stringToId(k));
  });
  for (const userId of nongInterviewIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongInterviewAnswers.push({
        user,
        questions,
      });
    }
  }
  const nongPassIds: Id[] = [];
  camp.nongPassIds.forEach((v, k) => {
    nongPassIds.push(stringToId(k));
  });
  for (const userId of removeDuplicate(nongPassIds, camp.nongPaidIds)) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongPassAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const userId of camp.nongPaidIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongPaidAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const userId of camp.nongSureIds) {
    const user = await User.findById(userId);
    if (!user) {
      continue;
    }
    const questions = await getAllQuestionRaw(camp._id, user._id);
    if (questions) {
      nongSureAnswers.push({
        user,
        questions,
      });
    }
  }
  for (const id of camp.choiceQuestionIds) {
    const question = await ChoiceQuestion.findById(id);
    if (question) {
      mainChoices.push(question);
    }
  }
  for (const id of camp.textQuestionIds) {
    const question = await TextQuestion.findById(id);
    if (question) {
      mainTexts.push(question);
    }
  }
  const buffer: GetAllAnswerAndQuestion = {
    nongInterviewAnswers,
    nongPaidAnswers,
    nongPassAnswers,
    nongPendingAnswers,
    nongsAnswers,
    nongSureAnswers,
    mainChoices,
    mainTexts,
    peeAnswers,
    success: true,
    groupName: camp.groupName,
    systemInfo: getSystemInfoRaw(),
    canScoring: camp.lockChangeQuestion && !camp.canAnswerTheQuestion,
  };
  res.status(200).json(buffer);
}
export async function scoreTextQuestions(
  req: express.Request,
  res: express.Response
) {
  const input: ScoreTextQuestions = req.body;
  const camp = await Camp.findById(input.campId);
  const user = await getUser(req);
  if (!camp || !user) {
    sendRes(res, false);
    return;
  }
  const campMemberCard = await CampMemberCard.findById(
    camp.mapCampMemberCardIdByUserId.get(user._id.toString())
  );
  if (!campMemberCard || campMemberCard.role == "nong") {
    sendRes(res, false);
    return;
  }
  for (const i1 of input.scores) {
    for (const { id, score } of i1) {
      await TextAnswer.findByIdAndUpdate(id, { score });
    }
  }
  sendRes(res, true);
}
