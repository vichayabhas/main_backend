import { getUser } from "../middleware/auth";
import Baan from "../models/Baan";
import Camp from "../models/Camp";
import HeathIssue from "../models/HeathIssue";
import NongCamp from "../models/NongCamp";
import Part from "../models/Part";
import PeeCamp from "../models/PeeCamp";
import PetoCamp from "../models/PetoCamp";
import CampMemberCard from "../models/CampMemberCard";
import User, { buf } from "../models/User";
import { calculate, sendingEmail, sendRes, swop } from "./setup";
import express from "express";
import bcrypt from "bcrypt"
import { HeathIssueBody, HeathIssuePack, Id, Register, UpdateTimeOffset } from "../models/interface";
import jwt from 'jsonwebtoken'
import TimeOffset from "../models/TimeOffset";
//*export async function register
//*export async function login
//*export async function getMe
// export async function logout
//*export async function updateMode
//*export async function updateSize
//*export async function getHeathIssue
//*export async function updateHeath
//*export async function updateBottle
//*export async function getCampMemberCardByCampId
//*export async function updateProfile
//*export async function changeModeToPee
//*export async function checkTel
//*export async function updateSleep
//*export async function getUsers
//*export async function getCampMemberCard
//*export async function updateTimeOffset
//*export async function getTimeOffset
//*export async function signId
//*export async function verifyEmail
//*export async function revalidationHeathIssues
//*export async function checkPassword
//*export async function bypassRole
export async function register(req: express.Request, res: express.Response) {
	try {
		const buf: Register = req.body
		const user = await User.create(buf);
		const select = await TimeOffset.create({ userId: user._id })
		const display = await TimeOffset.create({ userId: user._id })
		await user.updateOne({ displayOffsetId: display._id, selectOffsetId: select._id })
		sendTokenResponse(user._id, 200, res);
	} catch (err) {
		res.status(400).json({
			success: false
		});
		console.log(err);
	}
}
export async function login(req: express.Request, res: express.Response) {
	const {
		email,
		password
	} = req.body;
	if (!email || !password) {
		return res.status(400).json({
			success: false,
			msg: "Please provide an email and password"
		});
	}
	const user = await User.findOne({
		email
	}).select("+password");
	if (!user) {
		return res.status(400).json({
			success: false,
			msg: "Invalid credentials"
		});
	}
	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		return res.status(401).json({
			success: false,
			msg: "Invalid credentials"
		});
	}
	sendTokenResponse(user._id, 200, res);
}
const sendTokenResponse = (id: Id, statusCode: number, res: express.Response) => {
	const token = jwt.sign({ id }, buf, {
		expiresIn: process.env.JWT_EXPIRE
	});
	const options = {
		expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '0') * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};
	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		token,
	});
};
export async function getMe(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	res.status(200).json(user);
}
export async function logout(req: express.Request, res: express.Response) {
	//Clears cookie
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});
	res.status(200).json({
		success: true,
		data: {}
	});
}
export async function updateMode(req: express.Request, res: express.Response) {
	const {
		mode,
		filterIds,
		linkHash
	} = req.body;
	const user = await User.findByIdAndUpdate((await getUser(req))?._id, {
		mode,
		filterIds, linkHash
	});
	res.status(200).json(user);
}
export async function updateSize(req: express.Request, res: express.Response) {
	const shirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' = req.params.id as 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL'
	const old = await getUser(req)
	if (!old) {
		sendRes(res, false)
		return
	}
	const oldSize = old.shirtSize
	if (shirtSize) {
		const user = await User.findByIdAndUpdate(old._id, {
			shirtSize
		});
		if (!user) {
			sendRes(res, false)
			return
		}
		let i = 0
		while (i < user.campMemberCardIds.length) {
			const campMemberCard = await CampMemberCard.findById(user.campMemberCardIds[i++])
			if (!campMemberCard) {
				continue
			}
			switch (campMemberCard.role) {
				case 'nong': {
					const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
					if (!nongCamp) {
						continue
					}
					const camp = await Camp.findById(nongCamp.campId)
					if (!camp || camp.dataLock) {
						continue
					}
					const baan = await Baan.findById(nongCamp.baanId);
					if (!baan) {
						continue
					}
					await campMemberCard.updateOne({ size: shirtSize })
					camp.nongShirtSize.set(oldSize, calculate(camp.nongShirtSize.get(oldSize), 0, 1));
					camp.nongShirtSize.set(shirtSize, calculate(camp.nongShirtSize.get(shirtSize), 1, 0));
					baan.nongShirtSize.set(oldSize, calculate(baan.nongShirtSize.get(oldSize), 0, 1));
					baan.nongShirtSize.set(shirtSize, calculate(baan.nongShirtSize.get(shirtSize), 1, 0));
					await camp.updateOne({
						nongShirtSize: camp.nongShirtSize,
					})
					await baan.updateOne({
						nongShirtSize: baan.nongShirtSize,
					})
					break
				}
				case 'pee': {
					const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
					if (!peeCamp) {
						continue
					}
					const camp = await Camp.findById(peeCamp.campId)
					if (!camp || camp.peeDataLock) {
						continue
					}
					const baan = await Baan.findById(peeCamp.baanId);
					const part = await Part.findById(peeCamp.partId)
					if (!baan || !part) {
						continue
					}
					await campMemberCard.updateOne({ size: shirtSize })
					camp.peeShirtSize.set(oldSize, calculate(camp.peeShirtSize.get(oldSize), 0, 1));
					camp.peeShirtSize.set(shirtSize, calculate(camp.peeShirtSize.get(shirtSize), 1, 0));
					baan.peeShirtSize.set(oldSize, calculate(baan.peeShirtSize.get(oldSize), 0, 1));
					baan.peeShirtSize.set(shirtSize, calculate(baan.peeShirtSize.get(shirtSize), 1, 0));
					part.peeShirtSize.set(oldSize, calculate(part.peeShirtSize.get(oldSize), 0, 1));
					part.peeShirtSize.set(shirtSize, calculate(part.peeShirtSize.get(shirtSize), 1, 0));
					await camp.updateOne({
						peeShirtSize: camp.peeShirtSize,
					})
					await baan.updateOne({
						peeShirtSize: baan.peeShirtSize,
					})
					await part.updateOne({
						peeShirtSize: part.peeShirtSize,
					})
					break
				}
				case 'peto': {
					const petoCamp = await PetoCamp.findById(campMemberCard.campModelId)
					if (!petoCamp) {
						continue
					}
					const camp = await Camp.findById(petoCamp.campId)
					if (!camp || camp.petoDataLock) {
						continue
					}
					const part = await Part.findById(petoCamp.partId)
					if (!part) {
						continue
					}
					await campMemberCard.updateOne({ size: shirtSize })
					camp.petoShirtSize.set(oldSize, calculate(camp.petoShirtSize.get(oldSize), 0, 1));
					camp.petoShirtSize.set(shirtSize, calculate(camp.petoShirtSize.get(shirtSize), 1, 0));
					part.petoShirtSize.set(oldSize, calculate(part.petoShirtSize.get(oldSize), 0, 1));
					part.petoShirtSize.set(shirtSize, calculate(part.petoShirtSize.get(shirtSize), 1, 0));
					await camp.updateOne({
						petoShirtSize: camp.petoShirtSize,
					})
					await part.updateOne({
						petoShirtSize: part.petoShirtSize,
					})
					break
				}
			}
		}
		res.status(200).json(user);
	} else {
		res.status(400).json({
			success: false
		})
	}
}
export async function getHeathIssue(req: express.Request, res: express.Response) {
	try {
		const data = await HeathIssue.findById(req.params.id);
		if (!data) {
			return res.status(400).json({
				success: false
			});
		}
		res.status(200).json(data);
	} catch {
		res.status(400).json({
			success: false
		});
	}
}
export async function updateHeath(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	const heathIssueBody: HeathIssueBody = req.body
	if (!user) {
		sendRes(res, false)
		return
	}
	const oldHeathId = user.healthIssueId
	const old = await HeathIssue.findById(oldHeathId)
	if (!old || old.campIds.length) {
		if (!old) {
			if (!heathIssueBody.food.localeCompare('') && !heathIssueBody.medicine.localeCompare('') && !heathIssueBody.chronicDisease.localeCompare('') && !heathIssueBody.foodConcern.localeCompare('') && !heathIssueBody.spicy && !heathIssueBody.isWearing && heathIssueBody.foodLimit == 'ไม่มีข้อจำกัดด้านความเชื่อ') {
				sendRes(res, true)
				return
			}
			const {
				food,
				chronicDisease,
				medicine,
				extra,
				isWearing,
				spicy,
				foodConcern,
			} = heathIssueBody
			const heath = await HeathIssue.create({
				food,
				chronicDisease,
				medicine,
				extra,
				isWearing,
				spicy,
				foodConcern,
				userId: user._id,
			});
			await user.updateOne({
				healthIssueId: heath._id
			});
			let i = 0
			while (i < user.campMemberCardIds.length) {
				const campMemberCard = await CampMemberCard.findById(user.campMemberCardIds[i++])
				if (!campMemberCard) {
					continue
				}
				switch (campMemberCard.role) {
					case "nong": {
						const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
						if (!nongCamp) {
							continue
						}
						const camp = await Camp.findById(nongCamp.campId)
						if (!camp || camp.dataLock) {
							continue
						}
						const baan = await Baan.findById(nongCamp.baanId)
						if (!baan) {
							continue
						}
						await camp.updateOne({
							nongHeathIssueIds: swop(null, heath._id, camp.nongHeathIssueIds),
							nongCampMemberCardHaveHeathIssueIds: swop(null, campMemberCard._id, camp.nongCampMemberCardHaveHeathIssueIds),
						})
						await baan.updateOne({
							nongHeathIssueIds: swop(null, heath._id, baan.nongHeathIssueIds),
							nongCampMemberCardHaveHeathIssueIds: swop(null, campMemberCard._id, baan.nongCampMemberCardHaveHeathIssueIds),
						})
						await heath.updateOne({
							campMemberCardIds: swop(null, campMemberCard._id, heath.campMemberCardIds),
						})
						await campMemberCard.updateOne({ healthIssueId: heath._id })
						break
					}
					case "pee": {
						const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
						if (!peeCamp) {
							continue
						}
						const camp = await Camp.findById(peeCamp.campId)
						if (!camp || camp.peeDataLock) {
							continue
						}
						const baan = await Baan.findById(peeCamp.baanId)
						const part = await Part.findById(peeCamp.partId)
						if (!baan || !part) {
							continue
						}
						await camp.updateOne({
							peeHeathIssueIds: swop(null, heath._id, camp.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(null, campMemberCard._id, camp.peeCampMemberCardHaveHeathIssueIds)
						})
						await baan.updateOne({
							peeHeathIssueIds: swop(null, heath._id, baan.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(null, campMemberCard._id, baan.peeCampMemberCardHaveHeathIssueIds)
						})
						await part.updateOne({
							peeHeathIssueIds: swop(null, heath._id, part.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(null, campMemberCard._id, part.peeCampMemberCardHaveHeathIssueIds)
						})
						await heath.updateOne({
							campMemberCardIds: swop(null, campMemberCard._id, heath.campMemberCardIds),
						})
						await campMemberCard.updateOne({ healthIssueId: heath._id })
						break
					}
					case "peto": {
						const petoCamp = await PetoCamp.findById(user.petoCampIds[i++])
						if (!petoCamp) {
							continue
						}
						const camp = await Camp.findById(petoCamp.campId)
						if (!camp || camp.petoDataLock) {
							continue
						}
						const part = await Part.findById(petoCamp.partId)
						if (!part) {
							continue
						}
						await camp.updateOne({
							petoHeathIssueIds: swop(null, heath._id, camp.petoHeathIssueIds),
							petoCampMemberCardHaveHeathIssueIds: swop(null, campMemberCard._id, part.petoCampMemberCardHaveHeathIssueIds),
						})
						await part.updateOne({
							petoHeathIssueIds: swop(null, heath._id, part.petoHeathIssueIds),
							petoCampMemberCardHaveHeathIssueIds: swop(null, campMemberCard._id, part.petoCampMemberCardHaveHeathIssueIds),
						})
						await heath.updateOne({
							campMemberCardIds: swop(null, campMemberCard._id, heath.campMemberCardIds),
						})
						await campMemberCard.updateOne({ healthIssueId: heath._id })
						break
					}
				}
			}
			sendRes(res, true)
			return
		}
		if (!heathIssueBody.food.localeCompare('') && !heathIssueBody.medicine.localeCompare('') && !heathIssueBody.chronicDisease.localeCompare('') && !heathIssueBody.foodConcern.localeCompare('') && !heathIssueBody.spicy && !heathIssueBody.isWearing && heathIssueBody.foodLimit == 'ไม่มีข้อจำกัดด้านความเชื่อ') {
			let i = 0
			while (i < old.campMemberCardIds.length) {
				const campMemberCard = await CampMemberCard.findById(old.campMemberCardIds[i++])
				if (!campMemberCard) {
					continue
				}
				switch (campMemberCard.role) {
					case "nong": {
						const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
						if (!nongCamp) {
							continue
						}
						const camp = await Camp.findById(nongCamp.campId)
						const baan = await Baan.findById(nongCamp.baanId)
						if (!baan || !camp) {
							continue
						}
						await camp.updateOne({
							nongHeathIssueIds: swop(old._id, null, camp.nongHeathIssueIds),
							nongCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, camp.nongCampMemberCardHaveHeathIssueIds),
						})
						await baan.updateOne({
							nongHeathIssueIds: swop(old._id, null, baan.nongHeathIssueIds),
							nongCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, baan.nongCampMemberCardHaveHeathIssueIds),
						})
						await campMemberCard.updateOne({ healthIssueId: null })
						break
					}
					case "pee": {
						const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
						if (!peeCamp) {
							continue
						}
						const camp = await Camp.findById(peeCamp.campId)
						const baan = await Baan.findById(peeCamp.baanId)
						const part = await Part.findById(peeCamp.partId)
						if (!baan || !camp || !part) {
							continue
						}
						await camp.updateOne({
							peeHeathIssueIds: swop(old._id, null, camp.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, camp.peeCampMemberCardHaveHeathIssueIds),
						})
						await baan.updateOne({
							peeHeathIssueIds: swop(old._id, null, baan.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, baan.peeCampMemberCardHaveHeathIssueIds),
						})
						await part.updateOne({
							peeHeathIssueIds: swop(old._id, null, part.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, part.peeCampMemberCardHaveHeathIssueIds),
						})
						await campMemberCard.updateOne({ healthIssueId: null })
						break
					}
					case "peto": {
						const petoCamp = await PetoCamp.findById(campMemberCard.campModelId)
						if (!petoCamp) {
							continue
						}
						const camp = await Camp.findById(petoCamp.campId)
						const part = await Part.findById(petoCamp.partId)
						if (!camp || !part) {
							continue
						}
						await camp.updateOne({
							petoHeathIssueIds: swop(old._id, null, camp.petoHeathIssueIds),
							petoCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, camp.petoCampMemberCardHaveHeathIssueIds),
						})
						await part.updateOne({
							petoHeathIssueIds: swop(old._id, null, part.petoHeathIssueIds),
							petoCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, part.petoCampMemberCardHaveHeathIssueIds),
						})
						await campMemberCard.updateOne({ healthIssueId: null })
						break
					}
				}
			}
			await user.updateOne({ healthIssueId: null })
			await old.deleteOne()
			sendRes(res, true)
			return
		}
		const {
			food,
			chronicDisease,
			medicine,
			extra,
			isWearing,
			spicy,
			foodConcern,
		} = heathIssueBody
		const heath = await HeathIssue.create({
			food,
			chronicDisease,
			medicine,
			extra,
			isWearing,
			spicy,
			foodConcern,
			userId: user._id,
			campMemberCardIds: old.campMemberCardIds,
		});
		await user.updateOne({
			healthIssueId: heath._id
		});
		let i = 0
		while (i < old.campMemberCardIds.length) {
			const campMemberCard = await CampMemberCard.findById(old.campMemberCardIds[i++])
			if (!campMemberCard) {
				continue
			}
			switch (campMemberCard.role) {
				case "nong": {
					const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
					if (!nongCamp) {
						continue
					}
					const camp = await Camp.findById(nongCamp.campId)
					const baan = await Baan.findById(nongCamp.baanId)
					if (!baan || !camp) {
						continue
					}
					await camp.updateOne({ nongHeathIssueIds: swop(old._id, heath._id, camp.nongHeathIssueIds) })
					await baan.updateOne({ nongHeathIssueIds: swop(old._id, heath._id, baan.nongHeathIssueIds) })
					await campMemberCard.updateOne({ healthIssueId: heath._id })
					break
				}
				case "pee": {
					const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
					if (!peeCamp) {
						continue
					}
					const camp = await Camp.findById(peeCamp.campId)
					const baan = await Baan.findById(peeCamp.baanId)
					const part = await Part.findById(peeCamp.partId)
					if (!baan || !camp || !part) {
						continue
					}
					await camp.updateOne({ peeHeathIssueIds: swop(old._id, heath._id, camp.peeHeathIssueIds) })
					await baan.updateOne({ peeHeathIssueIds: swop(old._id, heath._id, baan.peeHeathIssueIds) })
					await part.updateOne({ peeHeathIssueIds: swop(old._id, heath._id, part.peeHeathIssueIds) })
					await campMemberCard.updateOne({ healthIssueId: heath._id })
					break
				}
				case "peto": {
					const petoCamp = await PetoCamp.findById(campMemberCard.campModelId)
					if (!petoCamp) {
						continue
					}
					const camp = await Camp.findById(petoCamp.campId)
					const part = await Part.findById(petoCamp.partId)
					if (!camp || !part) {
						continue
					}
					await camp.updateOne({ petoHeathIssueIds: swop(old._id, heath._id, camp.petoHeathIssueIds) })
					await part.updateOne({ petoHeathIssueIds: swop(old._id, heath._id, part.petoHeathIssueIds) })
					await campMemberCard.updateOne({ healthIssueId: heath._id })
				}
			}
		}
	} else {
		const heath = await HeathIssue.findByIdAndUpdate(user?.healthIssueId, heathIssueBody);
		if (!heath) {
			sendRes(res, false)
			return
		}
		await revalidationHeathIssues([heath._id])
		res.status(200).json(heath?.toObject());
	}
}
export async function updateBottle(req: express.Request, res: express.Response) {
	const old = await getUser(req)
	if (!old) {
		sendRes(res, false)
		return
	}
	const oldBottle = old?.haveBottle
	const user = await User.findByIdAndUpdate(old._id, {
		haveBottle: !oldBottle
	});
	if (!user) {
		sendRes(res, false)
		return
	}
	let i = 0
	while (i < user.campMemberCardIds.length) {
		const campMemberCard = await CampMemberCard.findById(user.campMemberCardIds[i++])
		if (!campMemberCard) {
			continue
		}
		switch (campMemberCard.role) {
			case 'nong': {
				const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
				if (!nongCamp) {
					continue
				}
				const camp = await Camp.findById(nongCamp.campId)
				if (!camp || camp.dataLock) {
					continue
				}
				const baan = await Baan.findById(nongCamp.baanId);
				if (!baan) {
					continue
				}
				await campMemberCard.updateOne({ haveBottle: !oldBottle })
				if (oldBottle) {
					await camp.updateOne({ nongHaveBottleIds: swop(user._id, null, camp.nongHaveBottleIds) });
					await baan.updateOne({ nongHaveBottleIds: swop(user._id, null, baan.nongHaveBottleIds) })
				} else {
					await camp.updateOne({ nongHaveBottleIds: swop(null, user._id, camp.nongHaveBottleIds) });
					await baan.updateOne({ nongHaveBottleIds: swop(null, user._id, baan.nongHaveBottleIds) })
				}
				break

			}
			case 'pee': {
				const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
				if (!peeCamp) {
					continue
				}
				const camp = await Camp.findById(peeCamp.campId)
				if (!camp || camp.peeDataLock) {
					continue
				}
				const baan = await Baan.findById(peeCamp.baanId);
				const part = await Part.findById(peeCamp.partId)
				if (!baan || !part) {
					continue
				}
				await campMemberCard.updateOne({ haveBottle: !oldBottle })
				if (oldBottle) {
					await camp.updateOne({ peeHaveBottleIds: swop(user._id, null, camp.peeHaveBottleIds) })
					await baan.updateOne({ peeHaveBottleIds: swop(user._id, null, baan.peeHaveBottleIds) })
					await part.updateOne({ peeHaveBottleIds: swop(user._id, null, part.peeHaveBottleIds) })
				} else {
					await camp.updateOne({ peeHaveBottleIds: swop(null, user._id, camp.peeHaveBottleIds) })
					await baan.updateOne({ peeHaveBottleIds: swop(null, user._id, baan.peeHaveBottleIds) })
					await part.updateOne({ peeHaveBottleIds: swop(null, user._id, part.peeHaveBottleIds) })
				}
				break
			}
			case 'peto': {
				const petoCamp = await PetoCamp.findById(campMemberCard.campModelId)
				if (!petoCamp) {
					continue
				}
				const camp = await Camp.findById(petoCamp.campId)
				if (!camp || camp.petoDataLock) {
					continue
				}
				const part = await Part.findById(petoCamp.partId)
				if (!part) {
					continue
				}
				await campMemberCard.updateOne({ haveBottle: !oldBottle })
				if (oldBottle) {
					await camp.updateOne({ petoHaveBottleIds: swop(user._id, null, camp.petoHaveBottleIds) })
					await part.updateOne({ petoHaveBottleIds: swop(user._id, null, part.petoHaveBottleIds) })
				} else {
					await camp.updateOne({ petoHaveBottleIds: swop(null, user._id, camp.petoHaveBottleIds) })
					await part.updateOne({ petoHaveBottleIds: swop(null, user._id, part.petoHaveBottleIds) })
				}
				break
			}
		}
	}
	res.status(200).json({
		success: true,
		user,
	});
}
export async function getCampMemberCardByCampId(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	const campId: string = req.params.id
	const camp = await Camp.findById(campId)
	const campMemberCard = await CampMemberCard.findById(camp?.mapCampMemberCardIdByUserId.get(user?.id))
	res.status(200).json(campMemberCard)
}
export async function updateProfile(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	const { email, tel, name, nickname, lastname, citizenId } = req.body
	await user?.updateOne({ email, tel, name, nickname, lastname, citizenId })
	res.status(200).json(user)
}
export async function changeModeToPee(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	try {
		if (!user || user.role == 'nong') {
			sendRes(res, false)
			return
		}
		const password = req.body.password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			sendRes(res, false)
			return
		}
		await user.updateOne({ mode: 'pee' })
		sendRes(res, true)
	} catch (err) {
		console.log(err)
		sendRes(res, false)
	}
}
export async function checkTel(req: express.Request, res: express.Response) {
	//type FindMode='h=>nong,f=>nong'|'h=>nong,f=>pee'|'h=>nong,f=>peto'|'h=>pee,f=>nong'|'h=>pee,f=>pee'|'h=>pee,f=>peto'|'h=>peto,f=>nong'|'h=>peto,f=>pee'|'h=>peto,f=>peto'
	const findUser = await User.findOne({ tel: req.params.id })
	const host = await getUser(req)
	//console.log(findUser)
	const relation: string[] = []
	if (!host || !findUser) {
		res.status(400).json({ relation })
		return
	}
	let i = 0
	//const map=new Map<string,FindMode>()
	while (i < host.nongCampIds.length) {
		const nongCamp = await NongCamp.findById(host.nongCampIds[i++])
		if (!nongCamp) {
			continue
		}
		const camp = await Camp.findById(nongCamp.campId)
		if (!camp || !camp.mapCampMemberCardIdByUserId.has(findUser._id.toString())) {
			continue
		}
		const campMemberCard = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(findUser._id.toString()))
		if (!campMemberCard) {
			continue
		}
		switch (campMemberCard.role) {
			case 'nong': {
				const findNongCamp = await NongCamp.findById(campMemberCard.campModelId)
				const findBaan = await Baan.findById(findNongCamp?.baanId)
				relation.push(`เพื่อนชื่อ${findUser.nickname} จากค่าย${camp.campName} บ้าน${findBaan?.name}`)
				break
			}
			case 'pee': {
				const findPeeCamp = await PeeCamp.findById(campMemberCard.campModelId)
				const findBaan = await Baan.findById(findPeeCamp?.baanId)
				relation.push(`พี่ชื่อ${findUser.nickname} จากค่าย${camp.campName} บ้าน${findBaan?.name}`)
				break
			}
			case 'peto': {
				relation.push(`พี่ชื่อ${findUser.nickname} จากค่าย${camp.campName}`)
				break
			}
		}
	}
	i = 0
	while (i < host.peeCampIds.length) {
		const peeCamp = await PeeCamp.findById(host.peeCampIds[i++])
		if (!peeCamp) {
			continue
		}
		const camp = await Camp.findById(peeCamp.campId)
		if (!camp || !camp.mapCampMemberCardIdByUserId.has(findUser._id.toString())) {
			continue
		}
		const campMemberCard = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(findUser._id.toString()))
		if (!campMemberCard) {
			continue
		}
		switch (campMemberCard.role) {
			case 'nong': {
				const findNongCamp = await NongCamp.findById(campMemberCard.campModelId)

				const findBaan = await Baan.findById(findNongCamp?.baanId)
				relation.push(`น้อง${findUser.nickname} จากค่าย${camp.campName} บ้าน${findBaan?.name}`)
				break
			}
			case 'pee': {
				const findPeeCamp = await PeeCamp.findById(campMemberCard.campModelId)

				const findBaan = await Baan.findById(findPeeCamp?.baanId)
				const findPart = await Part.findById(findPeeCamp?.partId)
				relation.push(`เพื่อนชื่อ${findUser.nickname} จากค่าย${camp.campName} บ้าน${findBaan?.name} ฝ่าย${findPart?.partName}`)
				break
			}
			case 'peto': {
				const findPeeCamp = await PetoCamp.findById(campMemberCard.campModelId)
				const findPart = await Part.findById(findPeeCamp?.partId)
				relation.push(`พี่ปีโตชื่อ${findUser.nickname} จากค่าย${camp.campName} ฝ่าย${findPart?.partName}`)
				break
			}
		}
	}
	i = 0
	while (i < host.petoCampIds.length) {
		const petoCamp = await PetoCamp.findById(host.petoCampIds[i++])
		if (!petoCamp) {
			continue
		}
		const camp = await Camp.findById(petoCamp.campId)
		if (!camp || !camp.mapCampMemberCardIdByUserId.has(findUser._id.toString())) {
			continue
		}
		const campMemberCard = await CampMemberCard.findById(camp.mapCampMemberCardIdByUserId.get(findUser._id.toString()))
		if (!campMemberCard) {
			continue
		}
		switch (campMemberCard.role) {
			case 'nong': {
				const findNongCamp = await NongCamp.findById(campMemberCard.campModelId)

				const findBaan = await Baan.findById(findNongCamp?.baanId)
				relation.push(`น้อง${findUser.nickname} จากค่าย${camp.campName} บ้าน${findBaan?.name}`)
				break
			}
			case 'pee': {
				const findPeeCamp = await PeeCamp.findById(campMemberCard.campModelId)
				const findBaan = await Baan.findById(findPeeCamp?.baanId)
				const findPart = await Part.findById(findPeeCamp?.partId)
				relation.push(`น้องปี1ชื่อ${findUser.nickname} จากค่าย${camp.campName} บ้าน${findBaan?.name} ฝ่าย${findPart?.partName}`)
				break
			}
			case 'peto': {
				const findPeeCamp = await PetoCamp.findById(campMemberCard.campModelId)
				const findPart = await Part.findById(findPeeCamp?.partId)
				relation.push(`เพื่อนชื่อ${findUser.nickname} จากค่าย${camp.campName} ฝ่าย${findPart?.partName}`)
				break
			}
		}
	}
	res.status(200).json({
		relation
	})
}
export async function updateSleep(req: express.Request, res: express.Response) {
	const old = await getUser(req)
	if (!old) {
		sendRes(res, false)
		return
	}
	const oldSleep = old?.likeToSleepAtCamp
	const user = await User.findByIdAndUpdate(old._id, {
		likeToSleepAtCamp: !oldSleep
	});
	if (!user) {
		sendRes(res, false)
		return
	}
	let i = 0
	while (i < user.campMemberCardIds.length) {
		const campMemberCard = await CampMemberCard.findById(user.campMemberCardIds[i++])
		if (!campMemberCard) {
			continue
		}
		switch (campMemberCard.role) {
			case 'nong': {
				const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
				if (!nongCamp) {
					continue
				}
				const camp = await Camp.findById(nongCamp.campId)
				if (!camp || camp.dataLock || camp.nongSleepModel !== 'เลือกได้ว่าจะค้างคืนหรือไม่') {
					continue
				}
				const baan = await Baan.findById(nongCamp.baanId);
				if (!baan) {
					continue
				}
				await campMemberCard.updateOne({ sleepAtCamp: !oldSleep })
				if (oldSleep) {
					await camp.updateOne({ nongSleepIds: swop(user._id, null, camp.nongSleepIds) });
					await baan.updateOne({ nongSleepIds: swop(user._id, null, baan.nongSleepIds) })

				} else {
					await camp.updateOne({ nongSleepIds: swop(null, user._id, camp.nongSleepIds) });
					await baan.updateOne({ nongSleepIds: swop(null, user._id, baan.nongSleepIds) })
				}
				break

			}
			case 'pee': {
				const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
				if (!peeCamp) {
					continue
				}
				const camp = await Camp.findById(peeCamp.campId)
				if (!camp || camp.peeDataLock || camp.peeSleepModel != 'เลือกได้ว่าจะค้างคืนหรือไม่') {
					continue
				}
				const baan = await Baan.findById(peeCamp.baanId);
				const part = await Part.findById(peeCamp.partId)
				if (!baan || !part) {
					continue
				}
				await campMemberCard.updateOne({ sleepAtCamp: !oldSleep })
				if (oldSleep) {
					await camp.updateOne({ peeSleepIds: swop(user._id, null, camp.peeSleepIds) })
					await baan.updateOne({ peeSleepIds: swop(user._id, null, baan.peeSleepIds) })
					await part.updateOne({ peeSleepIds: swop(user._id, null, part.peeSleepIds) })
				} else {
					await camp.updateOne({ peeSleepIds: swop(null, user._id, camp.peeSleepIds) })
					await baan.updateOne({ peeSleepIds: swop(null, user._id, baan.peeSleepIds) })
					await part.updateOne({ peeSleepIds: swop(null, user._id, part.peeSleepIds) })
				}
				break
			}
			case 'peto': {
				const petoCamp = await PetoCamp.findById(campMemberCard.campModelId)
				if (!petoCamp) {
					continue
				}
				const camp = await Camp.findById(petoCamp.campId)
				if (!camp || camp.petoDataLock || camp.peeSleepModel !== 'เลือกได้ว่าจะค้างคืนหรือไม่') {
					continue
				}
				const part = await Part.findById(petoCamp.partId)
				if (!part) {
					continue
				}
				await campMemberCard.updateOne({ sleepAtCamp: !oldSleep })
				if (oldSleep) {
					await camp.updateOne({ petoSleepIds: swop(user._id, null, camp.petoSleepIds) })
					await part.updateOne({ petoSleepIds: swop(user._id, null, part.petoSleepIds) })
				} else {
					await camp.updateOne({ petoSleepIds: swop(null, user._id, camp.petoSleepIds) })
					await part.updateOne({ petoSleepIds: swop(null, user._id, part.petoSleepIds) })
				}
				break
			}
		}
	}
	res.status(200).json({
		success: true,
		user,
	});
}
export async function getUsers(req: express.Request, res: express.Response) {
	try {
		const user = await User.findById(req.params.id)
		res.status(200).json(user)
	} catch (err) {
		console.log(err)
		sendRes(res, false)
	}
}
export async function getCampMemberCard(req: express.Request, res: express.Response) {
	try {
		const campMemberCard = await CampMemberCard.findById(req.params.id)
		res.status(200).json(campMemberCard)
	} catch (err) {
		console.log(err)
		sendRes(res, false)
	}

}
export async function updateTimeOffset(req: express.Request, res: express.Response) {
	const update: UpdateTimeOffset = req.body
	const user = await getUser(req)
	if (!user) {
		sendRes(res, false)
		return
	}
	await TimeOffset.findByIdAndUpdate(user.displayOffsetId, update.display)
	await TimeOffset.findByIdAndUpdate(user.selectOffsetId, update.select)
	sendRes(res, true)
}
export async function getTimeOffset(req: express.Request, res: express.Response) {
	try {
		const buf = await TimeOffset.findById(req.params.id)
		res.status(200).json(buf)
	} catch {
		sendRes(res, false)
	}
}
export function checkValidStudentEmail(input: string) {
	const endEmail = process.env.END_EMAIL || 'student.chula.ac.th'
	const lastTwoDigit = process.env.LAST_TWO_DIGIT || '21'
	const idLength = parseInt(process.env.ID_LENGTH || '10')
	const id = input.split('@')[0]
	return input.split('@')[1] == endEmail && id[8] == lastTwoDigit[0] && id[9] == lastTwoDigit[1] && Number.isInteger(id) && id.length == idLength
}
export async function signId(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	if (!user) {
		sendRes(res, false)
		return
	}
	if (!checkValidStudentEmail(user.email)) {
		sendRes(res, false)
		return
	}
	const salt = await bcrypt.genSalt(10)
	const text = await bcrypt.hash(user._id.toString(), salt)
	sendingEmail(user.email, jwt.sign({ password: text }, buf))
	sendRes(res, true)
}
export async function verifyEmail(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	if (!user) {
		sendRes(res, false)
		return
	}
	if (!checkValidStudentEmail(user.email)) {
		sendRes(res, false)
		return
	}
	try {
		const { password } = jwt.verify(req.body.password, buf) as { password: string }
		const correct = await bcrypt.compare(user._id.toString(), password)
		if (!correct) {
			sendRes(res, false)
			return
		}
		await user.updateOne({
			fridayActEn: true,
			studentId: user.email.split('@')[0]
		})
		sendRes(res, true)
	} catch (error) {
		console.error(error)
		sendRes(res, false)
	}

}
export async function revalidationHeathIssues(ids: Id[]) {
	let i = 0
	while (i < ids.length) {
		const old = await HeathIssue.findById(ids[i++])
		if (!old) {
			continue
		}
		if (old.campIds.length) {
			continue
		}
		const user = await User.findById(old.userId)
		if (!user) {
			continue
		}
		if (!old._id.equals(user.healthIssueId)) {
			await old.deleteOne()
			continue
		}
		if (old.food == '' && old.medicine == '' && old.chronicDisease == '' && old.foodConcern == '' && !old.spicy && !old.isWearing && old.foodLimit == 'ไม่มีข้อจำกัดด้านความเชื่อ') {
			let j = 0
			while (j < old.campMemberCardIds.length) {
				const campMemberCard = await CampMemberCard.findById(old.campMemberCardIds[j++])
				if (!campMemberCard) {
					continue
				}
				switch (campMemberCard.role) {
					case "nong": {
						const nongCamp = await NongCamp.findById(campMemberCard.campModelId)
						if (!nongCamp) {
							continue
						}
						const camp = await Camp.findById(nongCamp.campId)
						const baan = await Baan.findById(nongCamp.baanId)
						if (!baan || !camp) {
							continue
						}
						await camp.updateOne({
							nongHeathIssueIds: swop(old._id, null, camp.nongHeathIssueIds),
							nongCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, camp.nongCampMemberCardHaveHeathIssueIds),
						})
						await baan.updateOne({
							nongHeathIssueIds: swop(old._id, null, baan.nongHeathIssueIds),
							nongCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, baan.nongCampMemberCardHaveHeathIssueIds),
						})
						await campMemberCard.updateOne({ healthIssueId: null })
						break
					}
					case "pee": {
						const peeCamp = await PeeCamp.findById(campMemberCard.campModelId)
						if (!peeCamp) {
							continue
						}
						const camp = await Camp.findById(peeCamp.campId)
						const baan = await Baan.findById(peeCamp.baanId)
						const part = await Part.findById(peeCamp.partId)
						if (!baan || !camp || !part) {
							continue
						}
						await camp.updateOne({
							peeHeathIssueIds: swop(old._id, null, camp.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, camp.peeCampMemberCardHaveHeathIssueIds),
						})
						await baan.updateOne({
							peeHeathIssueIds: swop(old._id, null, baan.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, baan.peeCampMemberCardHaveHeathIssueIds),
						})
						await part.updateOne({
							peeHeathIssueIds: swop(old._id, null, part.peeHeathIssueIds),
							peeCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, part.peeCampMemberCardHaveHeathIssueIds),
						})
						await campMemberCard.updateOne({ healthIssueId: null })
						break
					}
					case "peto": {
						const petoCamp = await PetoCamp.findById(campMemberCard.campModelId)
						if (!petoCamp) {
							continue
						}
						const camp = await Camp.findById(petoCamp.campId)
						const part = await Part.findById(petoCamp.partId)
						if (!camp || !part) {
							continue
						}
						await camp.updateOne({
							petoHeathIssueIds: swop(old._id, null, camp.petoHeathIssueIds),
							petoCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, camp.petoCampMemberCardHaveHeathIssueIds),
						})
						await part.updateOne({
							petoHeathIssueIds: swop(old._id, null, part.petoHeathIssueIds),
							petoCampMemberCardHaveHeathIssueIds: swop(campMemberCard._id, null, part.petoCampMemberCardHaveHeathIssueIds),
						})
						await campMemberCard.updateOne({ healthIssueId: null })
						break
					}
				}
			}
			await user.updateOne({ healthIssueId: null })
			await old.deleteOne()
		}
	}
}
export async function checkPassword(req: express.Request, res: express.Response) {
	const user = await getUser(req)
	if (!user) {
		sendRes(res, false)
		return
	}
	const isMatch = await bcrypt.compare(req.body.password, user.password)
	sendRes(res, isMatch)
}
export async function bypassRole(req: express.Request, res: express.Response) {
	const { key } = req.body
	const user = await getUser(req)
	if (!user) {
		sendRes(res, false)
		return
	}
	switch (key) {
		case process.env.PEEBAAN: {
			await user.updateOne({ role: 'pee' })
			sendRes(res, true)
			return
		}
		case process.env.PETO: {
			await user.updateOne({ role: 'peto' })
			sendRes(res, true)
			return
		}
		case process.env.ADMIN: {
			await user.updateOne({ role: 'admin' })
			sendRes(res, true)
			return
		}
		case process.env.NONG: {
			await user.updateOne({ role: 'nong' })
			sendRes(res, true)
			return
		}
	}
	sendRes(res, false)
}
export function isWelfareValid(input: HeathIssuePack): boolean {
	return input.heathIssue.food != '' || input.heathIssue.foodConcern != '' || input.heathIssue.foodLimit != 'ไม่มีข้อจำกัดด้านความเชื่อ' || input.heathIssue.isWearing || input.heathIssue.spicy
}