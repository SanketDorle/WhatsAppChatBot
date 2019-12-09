var mongoose = require('mongoose')
    , Schema = mongoose.Schema

var loginSchema = Schema({
    // guestToken: { type: String,required: true },
    mobileNo : { type: String,required: true },
    authToken: String ,
    userCard: [{ type: Schema.Types.ObjectId, ref: 'Card'}],
    acceptedCard: [{type: Schema.Types.ObjectId, ref: 'Card'}]
});

var cardSchema = Schema({
    card_name:{type: String, required: true},
    card_hash : {type: Schema.Types.ObjectId, required: true},
    img_string:{type: String, required: true },
    name:{type: String, required: true },
    Mobile:[
        {
            type: { type: String, required: true },
            mobile: { type: Number, required: true },
        }
    ],
    Email:[
        {
            type: { type: String, required: true },
            email: { type: String, required: true },
        }

    ],
    Company:[
        {
            companyName:{ type: String, required: true }, 
            designation: { type: String, required: true },
        }
    ],
    Addresses:[
        {
            type:{ type: String, required: true },
            address:{ type: String, required: true }
        }
    ],
    Website:{ type: Array, required: true },
    Linkedin:{ type: String, required: true },
    WhatsApp : { type: String, required: true },
    Skype : { type: String, required: true },
    About:{ type: String, required: true },

    Notes:[{ type: Schema.Types.ObjectId, ref: 'Notes'}],
    Userid: { type: Schema.Types.ObjectId, ref: 'User' },
    Card_Owner_Id: {type: Schema.Types.ObjectId, ref: 'User'},
});

var notesSchema = Schema({
    Userid: { type: Schema.Types.ObjectId },
    card_hash : { type: Schema.Types.ObjectId, ref: 'Card' },
    note_hash : {type: Schema.Types.ObjectId},
    Notes:{
        Title:{ type: String, required: true },
        Message: { type: String, required: true },
        Created_date: {type: Date, default: Date.now},
        Reminder: { type: Boolean, default: false, required: true}, 
        Reminder_date :{type: Date}  
    },
});

var audioSchema = Schema({
    AudioFile:String,
    Date : Date,
    card_hash : { type: Schema.Types.ObjectId, ref: 'Card' }
});

var feedbackSchema = Schema({
    Userid: { type: String, required: true},
    Topic: { type: String, required: true },
    Message: { type: String, required: true }
});

//contact schema => this is same as card API, not in use, please remove
var contactSchema = Schema({
    Userid: { type: String, required: true},
    contact_hash: { type: Schema.Types.ObjectId, required: true },    
    img_string: { type: String},
    name: {type: String, required: true},
    Mobile:[
        {
            type: { type: String, required: true },
            mobile: { type: Number, required: true },
        }
    ],
    Email:[
        {
            type: { type: String, required: true },
            email: { type: String, required: true },
        }

    ],
    Company:[
        {
            companyName:{ type: String, required: true }, 
            designation: { type: String, required: true },
        }
    ],
    Addresses:[
        {
            type:{ type: String, required: true },
            address:{ type: String, required: true }
        }
    ],
    Website: { type: Array},
    LinkedIn: String,
    WhatsApp: String,
    Skype: String,
    About: String,
    card_hash: { type: Schema.Types.ObjectId, ref: 'Card'},
    Tag: {type: Schema.Types.ObjectId, ref: 'Tag'}
});

//tag schema
var tagSchema = Schema({
    Userid: { type:Schema.Types.ObjectId },
    tag_hash: { type: Schema.Types.ObjectId, required: true },
    tag_name: { type: String, required: true }
});

//manage_token (Manage fcm token)
var tokenSchema = Schema({
    Userid: { type: Schema.Types.ObjectId },
    deviceid: { type: String, required: true },
    token: { type: String, required: true }
});

//saving array of phone numbers schema
var phoneNoSchema = Schema({
    Userid: { type: Schema.Types.ObjectId },
    phone: [{
        name:{ type: String },
        number: {type: String, required: true },
        createdDate: {type: Date, default: Date.now()}
    }]
});

//last loginSchema
var lastLoginSchema = Schema({
    Userid: { type: Schema.Types.ObjectId },
    deviceid: { type: String, required: true },
});

//user settings schema
var userSettingsSchema = Schema({
    Userid: { type: Schema.Types.ObjectId },
    show_adv: { type: Boolean, default: true, required: true},
    show_notif: { type: Boolean, default: true, required: true},
    call_rec: { type: Boolean, default: true, required: true},
    sync_contacts: { type: Boolean, default: true, required: true}
});

var User = mongoose.model('User', loginSchema);
var Card = mongoose.model('Card', cardSchema);
var Audio = mongoose.model('Audio', audioSchema);
var Notes = mongoose.model('Notes', notesSchema);
var Feedback = mongoose.model('Feedback', feedbackSchema);
var Contact = mongoose.model('Contact', contactSchema); //initialize it to a variable.
var Tag = mongoose.model('Tag', tagSchema); //initialize it to a variable.
var Token = mongoose.model('Token', tokenSchema);
var PhoneNo = mongoose.model('PhoneNo', phoneNoSchema);
var LastLogin = mongoose.model('LastLogin', lastLoginSchema);
var UserSettings = mongoose.model('UserSettings', userSettingsSchema);

notesSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
  })
//   notesSchema.pre('save', function (next) {
//     this.Notes.Created_date = new Date(this.Notes.Created_date);
//     this.Notes.Reminder_date = new Date(this.Notes.Reminder_date);
//     next();
//   })
  notesSchema.post('save', function (notes) {
    if(this.wasNew){
        Card.update({ card_hash: notes.card_hash }, { $push: { 'Notes': notes } }, function () {
            // console.log('In user Card post hook...........', notes);
        });
    }
});
notesSchema.post('remove', function (notes) {
    Card.update({ card_hash: notes.card_hash }, { $pull: { 'Notes': { $in: [notes._id] } } }, function () {
        // console.log('In remove card post hook...........', notes);
    });
});


cardSchema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
  })


cardSchema.post('save', function (card) {
    if(this.wasNew){
        User.update({ _id: card.Card_Owner_Id }, { $push: { 'userCard': card } }, function () {
            // console.log('In user Card post hook...........', card);
        });
    }
});


cardSchema.post('remove', function (card) {
    User.update({ _id: card.Card_Owner_Id }, { $pull: { 'userCard': { $in: [card._id] } } }, function () {
        // console.log('In remove card post hook...........', card);
    });
});


//export the schema for use.
module.exports = { Card, User, Audio, Notes, Feedback, Contact, Tag, Token, PhoneNo, LastLogin, UserSettings };