const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const emojis = require('../../../emojis.json')

module.exports = {
    name: 'threadlocked',
    aliases: ['lockthread', 'tl'],
    cat: 'mod',
    description: 'Locks a thread',
    execute: async (message, args) => {
        if (!message.channel.isThread()) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2b2d31")
                        .setDescription(`${emojis.warning} This command can only be used inside a thread.`)
                ]
            });
        }


        if (!message.member.permissions.has("Administrator")) {
            return message.reply('You need Administrator permissions to use this command.');
        }


        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.ManageThreads)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2b2d31")
                        .setDescription(`${emojis.warning} I don't have the \`MANAGE_THREADS\` permission.`)
                ]
            });
        }

        try {
            await message.channel.setLocked(true);

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2b2d31")
                        .setDescription(
                            `${emojis.approve} ${message.author} successfully locked ${message.channel}.`
                        )
                ]
            });
        } catch (error) {
            console.error(error);
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2b2d31")
                        .setDescription(`${emojis.warning} There was an error while trying to lock the thread.`)
                ]
            });
        }
    }
};