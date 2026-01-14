const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags, StringSelectMenuBuilder } = require('discord.js');
const TicketSchema = require('../../../Database/Schemas/ticket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Manage the ticket system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName('panel')
                .setDescription('Send the ticket panel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to send the panel to')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('category-add')
                .setDescription('Add a ticket category')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the category')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Support role for this category')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji for the category')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('category-remove')
                .setDescription('Remove a ticket category')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the category to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('setup')
                .setDescription('Configure general settings')
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Category to create tickets in')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('transcript_channel')
                        .setDescription('Channel to send transcripts to')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('close')
                .setDescription('Close a ticket (force)')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            if (subcommand === 'setup') {
                const category = interaction.options.getChannel('category');
                const transcriptChannel = interaction.options.getChannel('transcript_channel');

                await TicketSchema.findOneAndUpdate(
                    { guildId },
                    {
                        guildId,
                        categoryId: category.id,
                        transcriptId: transcriptChannel ? transcriptChannel.id : null
                    },
                    { upsert: true, new: true }
                );

                await interaction.reply({ content: '> General settings updated successfully.', flags: MessageFlags.Ephemeral });

            } else if (subcommand === 'category-add') {
                const name = interaction.options.getString('name');
                const role = interaction.options.getRole('role');
                const emoji = interaction.options.getString('emoji') || '🎫';

                const data = await TicketSchema.findOne({ guildId });
                if (data && data.categories.length >= 25) return interaction.reply({ content: 'You can only have up to 25 categories.', flags: MessageFlags.Ephemeral });

                await TicketSchema.findOneAndUpdate(
                    { guildId },
                    { $push: { categories: { name, roleId: role.id, emoji } } },
                    { upsert: true, new: true }
                );

                await interaction.reply({ content: `> Category **${name}** added with role ${role}.`, flags: MessageFlags.Ephemeral });

            } else if (subcommand === 'category-remove') {
                const name = interaction.options.getString('name');

                await TicketSchema.findOneAndUpdate(
                    { guildId },
                    { $pull: { categories: { name: name } } }
                );

                await interaction.reply({ content: `> Category **${name}** removed if it existed.`, flags: MessageFlags.Ephemeral });

            } else if (subcommand === 'panel') {
                const channel = interaction.options.getChannel('channel');
                const data = await TicketSchema.findOne({ guildId });

                if (!data || !data.categories || data.categories.length === 0) {
                    return interaction.reply({ content: 'No categories configured. Use `/ticket category-add` first.', flags: MessageFlags.Ephemeral });
                }

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle('Support Tickets')
                    .setDescription('Please select a category below to open a ticket.')
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

                const options = data.categories.map(cat => ({
                    label: cat.name,
                    value: `ticket_${cat.name}_${cat.roleId}`,
                    emoji: cat.emoji,
                    description: `Open a ${cat.name} ticket`
                }));

                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('ticket_category_select')
                            .setPlaceholder('Select a category')
                            .addOptions(options)
                    );

                await channel.send({ embeds: [embed], components: [row] });
                await interaction.reply({ content: `> Ticket panel sent to ${channel}`, flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            console.error(error);
            if (!interaction.replied) await interaction.reply({ content: 'An error occurred.', flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'close') {
            const data = await TicketSchema.findOne({ guildId: interaction.guild.id });
            const ticket = data?.tickets.find(t => t.channelId === interaction.channel.id);

            if (!ticket) {
                return interaction.reply({ content: 'This is not a ticket channel or not found in database.', flags: MessageFlags.Ephemeral });
            }

            await interaction.reply({ content: 'Closing ticket in 5 seconds...' });

            setTimeout(async () => {
                await interaction.channel.delete().catch(() => { });
                await TicketSchema.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { $pull: { tickets: { channelId: interaction.channel.id } } }
                );
            }, 5000);
        }
    }
};
