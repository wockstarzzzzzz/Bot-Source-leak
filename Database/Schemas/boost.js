const mongoose = require('mongoose');

const boostSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    message: { type: String, required: true }
});

module.exports = mongoose.model('BoostMessage', boostSchema);