const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const emojis = require('../../../emojis.json')
const config = require('../../../config.json')
const GoodbyeMessage = require('../../../Database/Schemas/goodbye'); 
const mongoose = require('mongoose');

module.exports = {
    name: 'goodbye',
    cat: 'config',
    description: 'Dispatched whenever a user leaves the server.',
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
                        .setTitle('goodbye add command')
                        .setDescription(
                            'Create a goodbye message with the `goodbye add` command.\n\`\`\`Syntax: ,goodbye add <channel> <message>\nExample: ,goodbye add #general Goodbye {user.mention}!\`\`\`'
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
            const goodbyeMessage = args.slice(2).join(' ');
            if (!goodbyeMessage) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.warning}`)
                            .setDescription('You must specify a goodbye message!')
                    ]
                });
            }

            try {
                await GoodbyeMessage.findOneAndUpdate(
                    { guildId: message.guild.id },
                    { guildId: message.guild.id, channelId: targetChannel.id, message: goodbyeMessage },
                    { upsert: true }
                );

                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.approve}`)
                            .setDescription(`Goodbye message successfully set for ${targetChannel}`)
                    ]
                });
            } catch (error) {
                console.error(error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.warning}`)
                            .setDescription('An error occurred while saving the goodbye message.')
                    ]
                });
            }
        }

        if (subcommand === 'remove') {
            try {
                const result = await GoodbyeMessage.findOneAndDelete({ guildId: message.guild.id, channelId: targetChannel.id });
                if (!result) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(`${config.deny}`)
                                .setDescription('No goodbye message is set for this channel.')
                        ]
                    });
                }

                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.approve}`)
                            .setDescription(`${emojis.approve} ${message.author}: Goodbye message removed for ${targetChannel}.`)
                    ]
                });
            } catch (error) {
                console.error(error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.warning}`)
                            .setDescription('An error occurred while removing the goodbye message.')
                    ]
                });
            }
        }

        if (subcommand === 'view') {
            const data = await GoodbyeMessage.findOne({ guildId: message.guild.id, channelId: targetChannel?.id });

            if (!data) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`${config.deny}`)
                            .setDescription('No goodbye message is set for this channel.')
                    ]
                });
            }

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(`${config.approve}`)
                        .setDescription(`${message.author}: Goodbye message for <#${data.channelId}>:\n\n${data.message}`)
                ]
            });
        }
    },
};