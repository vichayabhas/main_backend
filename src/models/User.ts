import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { arrayObjectId, dataString } from '../controllers/setup';
export const buf: string = process.env.JWT_SECECRET || 'asdfjkl;;lkjfdsa'
const UserSchema = new mongoose.Schema({
    name: dataString,
    lastname: dataString,
    nickname: dataString,
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        Math: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            , 'Please add a valid email'
        ]
    },

    password: {
        type: String,
        required: [true, 'Please add a password']
        ,
        minlength: 6,
        select: false

    },
    tel: {
        type: String,
        unique: true,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    studentId: {//รหัสประจำตัวนิสิต
        type: String,
        default: null,
        unique: false
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    shirtSize: {
        type: String,
        required: [true, 'Plese choose shirt size'],
        enum: ['S', 'M', 'L', 'XL', 'XXL', '3XL']
    },
    healthIssueId: {//heathIssue
        type: mongoose.Schema.ObjectId,
        default: null

    },
    haveBottle: {
        type: Boolean,
        default: false
    },

    mode: {
        type: String,
        enum: ['nong', 'pee'],
        default: 'nong'
    },
    nongCampIds: arrayObjectId,
    peeCampIds: arrayObjectId,
    petoCampIds: arrayObjectId
    ,
    group: {
        type: String,
        enum: ['A', 'B', 'C', 'Dog', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', null],
        default: null
    },
    role: {
        type: String,
        enum: ['pee', 'nong', 'admin', 'peto'],
        default: 'nong'

    },
    filterIds: arrayObjectId,
    registerIds: arrayObjectId,
    authorizeIds: arrayObjectId,
    fridayActIds: arrayObjectId,
    fridayActEn: {
        type: Boolean,
        default: false
    },
    fridayAuth: {
        type: Boolean,
        default: false
    },
    likeSongIds: arrayObjectId,
    campMemberCardIds: arrayObjectId,
    lostAndFoundIds: arrayObjectId,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    linkHash: {
        type: String,
        default: 'null'
    },
    citizenId: dataString,
    likeToSleepAtCamp: {
        type: Boolean,
        required: true
    },
    authPartIds: arrayObjectId,
    selectOffsetId: {
        type: mongoose.Schema.ObjectId
    },
    displayOffsetId: {
        type: mongoose.Schema.ObjectId
    },
    chatIds: arrayObjectId,
    nongAnswerPackIds: arrayObjectId,
    peeAnswerPackIds: arrayObjectId,
});
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
});
export default mongoose.model('User', UserSchema);