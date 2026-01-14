const { EmbedBuilder } = require("discord.js");
const emojis = require('../../../emojis.json')
const AFKSchema = require("../../../Database/Schemas/afk");

module.exports = {
    name: 'afk',
    cat: 'general',
    description: 'Status AFK',
    execute: async (message, args) => {
        const razón = args.join(' ') || 'AFK';

        try {
            await AFKSchema.findOneAndUpdate(
                { userId: message.author.id },
                { userId: message.author.id, reason: razón },
                { upsert: true, new: true }
            );

            const afkEmbed = new EmbedBuilder()
                .setColor('#a5eb78')
                .setDescription(`${emojis.approve} ${message.author}: You're now AFK with the status: **${razón}**`);

            await message.channel.send({ embeds: [afkEmbed] });
        } catch (error) {
            console.error('Error AFK:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`${message.author}: Error al establecer tu estado AFK.`);

            await message.reply({ embeds: [errorEmbed] });
        }
    }
};