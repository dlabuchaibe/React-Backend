const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collection = 'hashtag';
const hashtagSchema = new Schema({
    wordTag: {
        type: String,
        required: true
    },
    wordCount: {
        type: Number,
        required:true
    }   
}, {
    timestamps: true
});

const Hashtag = mongoose.model(collection, hashtagSchema);

module.exports = Hashtag;