const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    categoryId: { type: String },
    transcriptId: { type: String },
    supportRoleId: { type: String },
    categories: { type: Array, default: [] }, // { name, emoji, roleId, description }
    tickets: { type: Array, default: [] }
});

module.exports = mongoose.model('Ticket', ticketSchema);
