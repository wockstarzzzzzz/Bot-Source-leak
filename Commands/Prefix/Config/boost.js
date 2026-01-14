const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const emojis = require('../../../emojis.json')
const config = require('../../../config.json');
const BoostMessage = require('../../../Database/Schemas/boost'); 

module.exports = {
    name: 'boost',
    cat: 'config',
    description: 'Dispatched whenever a user boosts the server.',
    async execute(message, args) {

        if (!message.guild.members.me.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
            return;
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(`${config.warning}`)
                        .setDescription('You need the `Manage Server` permission.')
                ]
            });
        }

        const subcommand = args[0]?.toLowerCase();

        if (!['add', 'remove', 'view'].includes(subcommand)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('boost add command')
                        .setDescription(
                            'Create a boost message with the `boost add` command.\n\`\`\`Syntax: ,boost add <channel> <message>\nExample: ,boost add #general Thanks for boosting {user.mention}!\`\`\`'
                        )
                ]
            });
        }

        const targetChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

        if (!targetChannel && subcommand !== 'view') {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(`${config.warning}`)
                        .setDescription('You must specify a valid channel!')
                ]
            });
        }

        if (subcommand === 'add') {
            const boostMessage = args.slice(2).join(' ');
            if (!boostMessage) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.warning}`)
                            .setDescription('You must specify a boost message!')
                    ]
                });
            }

            try {
                await BoostMessage.findOneAndUpdate(
                    { guildId: message.guild.id },
                    { guildId: message.guild.id, channelId: targetChannel.id, message: boostMessage },
                    { upsert: true }
                );

                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.approve}`)
                            .setDescription(`${emojis.approve} ${message.author}: Boost message successfully set for ${targetChannel}`)
                    ]
                });
            } catch (error) {
                console.error(error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.warning}`)
                            .setDescription('An error occurred while saving the boost message.')
                    ]
                });
            }
        }

        if (subcommand === 'remove') {
            try {
                const result = await BoostMessage.findOneAndDelete({ guildId: message.guild.id, channelId: targetChannel.id });
                if (!result) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(`${config.deny}`)
                                .setDescription('No boost message is set for this channel.')
                        ]
                    });
                }

                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.approve}`)
                           .setDescription(`${emojis.approve} ${message.author}: Boost message removed for ${targetChannel}.`)
                    ]
                });
            } catch (error) {
                console.error(error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.warning}`)
                            .setDescription('An error occurred while removing the boost message.')
                    ]
                });
            }
        }

        if (subcommand === 'view') {
            const data = await BoostMessage.findOne({ guildId: message.guild.id, channelId: targetChannel?.id });

            if (!data) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.deny}`)
                            .setDescription('No boost message is set for this channel.')
                    ]
                });
            }

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(`${config.approve}`)
                        .setDescription(`${message.author}: Boost message for <#${data.channelId}>:\n\n${data.message}`)
                ]
            });
        }
    },
};