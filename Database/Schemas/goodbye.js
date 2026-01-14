const mongoose = require('mongoose');

const goodbyeSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    message: { type: String, required: true }
});

module.exports = mongoose.model('GoodbyeMessage', goodbyeSchema);