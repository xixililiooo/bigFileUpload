const createVideoSchema = () => {
    const mongoose = require('mongoose');
    let Schema = mongoose.Schema
    let ObjectId = Schema.Types.ObjectId
    let videoSchema = new Schema({
        id: { type: String },
        src: { type: String },
        author: { type: String },
        title: { type: String },
        loveNumber: { type: String },
        commentNumber: { type: String },
        shareNumber: { type: String },
        createTime: { type: Date, default: Date.now() }
    }, {
        collection: 'video'
    })
    mongoose.model('Video', videoSchema);
}
module.exports = {
    createVideoSchema
};