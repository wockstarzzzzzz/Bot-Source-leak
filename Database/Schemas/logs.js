const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    types: { type: Array, default: [] }
});

module.exports = mongoose.model('Logs', logSchema);
