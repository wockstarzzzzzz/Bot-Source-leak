const { PermissionsBitField } = require("discord.js");
const emojis = require('../../../emojis.json')

module.exports = {
    name: 'say',
    ownerPermit: false,
    adminPermit: true,
    punitop: false,
    cat: 'mod',
    execute(message, args, client) { 
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply(`${emojis.warning} You don't have permission to use this command.`);
        }

        const text = args.join(" ");
        if (!text) {
            return message.reply(`${emojis.warning} Please provide the message you want the bot to say.`);
        }

        try {
            message.delete().catch(() => {
                console.error("Failed to delete the user's message.");
            });

            message.channel.send(text);
        } catch (error) {
            console.error(error);
            return message.reply(`${emojis.warning} There was an error trying to execute this command.`);
        }
    },
};
