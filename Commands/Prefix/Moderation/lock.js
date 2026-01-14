const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
    name: "lock",
    cat: 'mod',
    description: "Bloquea un canal de texto",
    async execute(message, args) {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {

            if (this.canSendMessage(message)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("You do not have `Manage Roles` permissions to block channels.");
                    await message.reply({ embeds: [embed] });
                } catch {}
            }
            return;
        }


        const botMember = message.guild.members.me;
        if (!botMember.permissions.has([PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageChannels])) {

            if (this.canSendMessage(message)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("I do not have the necessary permissions to block channels.");
                    await message.reply({ embeds: [embed] });
                } catch {}
            }
            return;
        }


        const channel = message.mentions.channels.first() ||
            message.guild.channels.cache.get(args[0]) ||
            message.channel;

        if (!channel || channel.type !== ChannelType.GuildText) {
            if (this.canSendMessage(message)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("Please mention a valid channel.");
                    await message.reply({ embeds: [embed] });
                } catch {}
            }
            return;
        }


        const currentPermissions = channel.permissionOverwrites.cache.get(message.guild.id);
        if (currentPermissions?.deny?.has(PermissionsBitField.Flags.SendMessages)) {
            if (this.canSendMessage(message)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("This channel is already blocked.");
                    await message.reply({ embeds: [embed] });
                } catch {}
            }
            return;
        }

        try {

            await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });


            if (this.canSendMessage(message)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`🔒 ${channel} **has been blocked**.`);
                    await message.reply({ embeds: [embed] });
                } catch {}
            }
        } catch (error) {

            if (this.canSendMessage(message)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("An error occurred while blocking the channel.");
                    await message.reply({ embeds: [embed] });
                } catch {}
            }
        }
    },


    canSendMessage(message) {
        const botPermissions = message.channel.permissionsFor(message.guild.members.me);
        return botPermissions.has([
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks
        ]);
    }
};