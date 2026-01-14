const { Events, EmbedBuilder, AuditLogEvent, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder } = require('discord.js');
const TicketSchema = require('../../Database/Schemas/ticket');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

        try {
            if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category_select') {
                const selectedValue = interaction.values[0];
                const [_, categoryName, roleId] = selectedValue.split('_');

                const data = await TicketSchema.findOne({ guildId: interaction.guild.id });
                if (!data) return interaction.reply({ content: 'Ticket system error.', flags: MessageFlags.Ephemeral });

                if (data.tickets.some(t => t.userId === interaction.user.id && !t.closed)) {
                }

                const modal = new ModalBuilder()
                    .setCustomId(`ticket_modal_${roleId}_${categoryName}`)
                    .setTitle(`Open ${categoryName} Ticket`);

                const reasonInput = new TextInputBuilder()
                    .setCustomId('ticket_reason')
                    .setLabel('Reason for opening ticket')
                    .setStyle(TextInputStyle.Paragraph);

                const actionRow = new ActionRowBuilder().addComponents(reasonInput);
                modal.addComponents(actionRow);

                await interaction.showModal(modal);
            }

            if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal')) {
                const [_, __, roleId, categoryName] = interaction.customId.split('_');
                const reason = interaction.fields.getTextInputValue('ticket_reason');

                const data = await TicketSchema.findOne({ guildId: interaction.guild.id });
                if (!data) return;

                const parentCategory = interaction.guild.channels.cache.get(data.categoryId);

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: parentCategory ? parentCategory.id : null,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
                        },
                        {
                            id: roleId,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                });

                await TicketSchema.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { $push: { tickets: { channelId: channel.id, userId: interaction.user.id, closed: false, category: categoryName } } }
                );

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle(`Ticket: ${interaction.user.tag}`)
                    .setDescription(`**Category:** ${categoryName}\n**Reason:** ${reason}\n\nSupport will be with you shortly.`)
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Close')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒'),
                        new ButtonBuilder()
                            .setCustomId('claim_ticket')
                            .setLabel('Claim')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('🙋‍♂️'),
                        new ButtonBuilder()
                            .setCustomId('transcript_ticket')
                            .setLabel('Transcript')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('📑')
                    );

                await channel.send({ content: `<@${interaction.user.id}> <@&${roleId}>`, embeds: [embed], components: [row] });
                await interaction.reply({ content: `> Ticket created: ${channel}`, flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'claim_ticket') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                    return interaction.reply({ content: 'You cannot claim tickets.', flags: MessageFlags.Ephemeral });
                }

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setDescription(`Ticket claimed by ${interaction.user}`);

                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Close')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒'),
                        new ButtonBuilder()
                            .setCustomId('claim_ticket')
                            .setLabel(`Claimed by ${interaction.user.username}`)
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('✅')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('transcript_ticket')
                            .setLabel('Transcript')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('📑')
                    );

                await interaction.message.edit({ components: [newRow] });
                await interaction.reply({ embeds: [embed] });
            }

            if (interaction.customId === 'transcript_ticket') {
                await interaction.reply({ content: 'Generating transcript...', flags: MessageFlags.Ephemeral });

                const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                    limit: -1,
                    returnType: 'attachment',
                    filename: `transcript-${interaction.channel.name}.html`,
                    saveImages: true,
                    poweredBy: false
                });

                await interaction.followUp({ files: [attachment], flags: MessageFlags.Ephemeral });
            }

            if (interaction.customId === 'close_ticket') {
                const data = await TicketSchema.findOne({ guildId: interaction.guild.id });
                const ticket = data?.tickets.find(t => t.channelId === interaction.channel.id);

                if (!ticket) return interaction.reply({ content: 'Ticket not found in DB.', flags: MessageFlags.Ephemeral });

                await interaction.reply({ content: 'Saving transcript and deleting channel...' });

                const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                    limit: -1,
                    returnType: 'attachment',
                    filename: `transcript-${interaction.channel.name}.html`,
                    saveImages: true,
                    poweredBy: false
                });

                const transcriptChannel = interaction.guild.channels.cache.get(data.transcriptId);
                if (transcriptChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('Ticket Closed')
                        .addFields(
                            { name: 'Ticket Owner', value: `<@${ticket.userId}>`, inline: true },
                            { name: 'Closed By', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Category', value: `${ticket.category || 'None'}`, inline: true }
                        )
                        .setTimestamp();

                    await transcriptChannel.send({ embeds: [embed], files: [attachment] }).catch(err => console.error("Failed to send log:", err));
                }

                const user = await interaction.guild.members.fetch(ticket.userId).catch(() => null);
                if (user) {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('Ticket Closed')
                        .setDescription(`Your ticket in **${interaction.guild.name}** has been closed.\nA transcript uses attached below.`)
                        .setTimestamp();

                    await user.send({ embeds: [dmEmbed], files: [attachment] }).catch(() => { });
                }

                await TicketSchema.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { $pull: { tickets: { channelId: interaction.channel.id } } }
                );

                setTimeout(() => {
                    interaction.channel.delete().catch(() => { });
                }, 3000);
            }

        } catch (error) {
            console.error(error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Error handling ticket interaction.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
