const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChannelType, MessageFlags } = require("discord.js");
const emojis = require('../../../emojis.json')

module.exports = {
    name: 'nuke',
    cat: 'mod',
    description: 'nuke text channel',
    async execute(message, args) {

        if (args.length > 0) return;

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            if (this.canSendMessage(message.channel)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("You need `Manage Channels` permissions to use this command.");
                    await message.reply({ embeds: [embed] });
                } catch { }
            }
            return;
        }

        if (message.channel.type !== ChannelType.GuildText) {
            if (this.canSendMessage(message.channel)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("This command can only be used in text channels.");
                    await message.reply({ embeds: [embed] });
                } catch { }
            }
            return;
        }

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_nuke')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton);

        let confirmMessage;
        if (this.canSendMessage(message.channel)) {
            try {
                const confirmEmbed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setDescription('Are you sure you want to nuke this channel?');

                confirmMessage = await message.reply({
                    embeds: [confirmEmbed],
                    components: [row]
                });
            } catch {
                return;
            }
        }

        try {
            const collector = confirmMessage.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 30000
            });

            collector.on('collect', async interaction => {
                if (interaction.user.id !== message.author.id) {
                    try {
                        await interaction.reply({
                            content: "You cannot confirm this nuke command.",
                            flags: MessageFlags.Ephemeral
                        });
                    } catch { }
                    return;
                }

                const channelInfo = {
                    name: message.channel.name,
                    type: message.channel.type,
                    position: message.channel.position,
                    parentId: message.channel.parentId,
                    permissionOverwrites: message.channel.permissionOverwrites.cache.map(overwrite => ({
                        id: overwrite.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny,
                    }))
                };

                try {
                    await message.channel.delete(`Channel nuked by ${interaction.user.tag}`);

                    const newChannel = await message.guild.channels.create({
                        name: channelInfo.name,
                        type: channelInfo.type,
                        parent: channelInfo.parentId,
                        position: channelInfo.position,
                        permissionOverwrites: channelInfo.permissionOverwrites,
                    });

                    const confirmationEmbed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`> ${emojis.approve} This channel has been nuked by ${interaction.user}`);

                    const confirmationMessage = await newChannel.send({ embeds: [confirmationEmbed] });
                    setTimeout(() => {
                        try {
                            confirmationMessage.delete();
                        } catch { }
                    }, 5000);

                } catch {
                    if (this.canSendMessage(message.channel)) {
                        try {
                            const errorEmbed = new EmbedBuilder()
                                .setColor('#2b2d31')
                                .setDescription("I don't have permission to nuke this channel.");
                            await interaction.reply({ embeds: [errorEmbed] });
                        } catch { }
                    }
                }

                collector.stop();
            });

            collector.on('end', async collected => {
                if (confirmMessage.editable) {
                    try {
                        if (collected.size === 0) {
                            const timeoutEmbed = new EmbedBuilder()
                                .setColor('#2b2d31')
                                .setDescription('Nuke command timed out.');

                            await confirmMessage.edit({
                                embeds: [timeoutEmbed],
                                components: []
                            });
                        } else {
                            await confirmMessage.edit({
                                components: []
                            });
                        }
                    } catch { }
                }
            });
        } catch { }
    },

    canSendMessage(channel) {
        const botPermissions = channel.permissionsFor(channel.guild.members.me);
        return botPermissions?.has([
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks
        ]) ?? false;
    }
};