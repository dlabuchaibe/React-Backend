const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collection = 'tweets';
const tweetSchema = new Schema({
    content:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: false
    },
    likes:{
        type: Number,
        required: true
    },
    user: {
        type: Schema.ObjectId, ref: 'users'
    },
    comments:[{
        userComment:{
            type: String,
            required: true
        },
        userId: {
            type: Schema.ObjectId, ref: 'users'
        }
    }]      
}, {
    timestamps: true
});

const Tweet = mongoose.model(collection, tweetSchema);

module.exports = Tweet;