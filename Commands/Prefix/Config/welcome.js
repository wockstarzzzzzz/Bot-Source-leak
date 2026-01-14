const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const emojis = require('../../../emojis.json')
const config = require('../../../config.json')
const WelcomeMessage = require('../../../Database/Schemas/welcome'); 
const mongoose = require('mongoose');

module.exports = {
    name: 'welcome',
    cat: 'config',
    description: 'Dispatched whenever a user joins the server.',
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
                        .setTitle('welcome add command')
                        .setDescription(
                            'Create a system message with the `welcome add` command.\n\`\`\`Syntax: ,welcome remove <channel>\nExample: ,welcome add #general welcome {user.mention}\`\`\`'
                        )
                ]
            });
        }

        const targetChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

        if (!targetChannel && subcommand !== 'view') {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('You must specify a valid channel!')
                ]
            });
        }


        if (subcommand === 'add') {
            const welcomeMessage = args.slice(2).join(' ');
            if (!welcomeMessage) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription('You must specify a welcome message!')
                    ]
                });
            }

            try {
                await WelcomeMessage.findOneAndUpdate(
                    { guildId: message.guild.id },
                    { guildId: message.guild.id, channelId: targetChannel.id, message: welcomeMessage },
                    { upsert: true }
                );

                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#a5eb78')
                            .setDescription(`${emojis.approve} ${message.author}: Welcome message successfully set for ${targetChannel}`)
                    ]
                });
            } catch (error) {
                console.error(error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription('An error occurred while saving the welcome message.')
                    ]
                });
            }
        }


        if (subcommand === 'remove') {
            try {
                const result = await WelcomeMessage.findOneAndDelete({ guildId: message.guild.id, channelId: targetChannel.id });
                if (!result) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#2b2d31')
                                .setDescription('No welcome message is set for this channel.')
                        ]
                    });
                }

                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#a5eb78')
                            .setDescription(`${emojis.approve} ${message.author}: Welcome message removed for ${targetChannel}.`)
                    ]
                });
            } catch (error) {
                console.error(error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription('An error occurred while removing the welcome message.')
                    ]
                });
            }
        }


        if (subcommand === 'view') {
            const data = await WelcomeMessage.findOne({ guildId: message.guild.id, channelId: targetChannel?.id });

            if (!data) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2b2d31')
                            .setDescription('No welcome message is set for this channel.')
                    ]
                });
            }

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`Welcome message for <#${data.channelId}>:\n\n${data.message}`)
                ]
            });
        }
    },
};
