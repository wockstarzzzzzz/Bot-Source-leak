const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const emojis = require('../../../emojis.json');
const config = require('../../../config.json');

module.exports = {
    name: "unmute",
    cat: 'mod',
    description: "Unmutes a user by removing their timeout with a reason.",
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("You don't have permission to unmute members.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("I don't have permission to unmute members.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Usage: !unmute <@user or ID> [reason]");
            return message.reply({ embeds: [errorEmbed] });
        }

        let member;
        try {
            const userId = args[0].replace(/[<@!>]/g, '');
            member = message.mentions.members.first() || await message.guild.members.fetch(userId);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Couldn't find that user.");
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!member.isCommunicationDisabled()) {
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("That user is not muted.");
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(' ') || "No reason provided";

        try {
            await member.timeout(null, reason);

            const embed = new EmbedBuilder()
                .setColor(`${config.approve}`)
                .setTitle("User Unmuted")
                .setDescription(`**User:** <@${member.id}>\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(`${config.deny}`)
                .setDescription("Failed to unmute the user.");
            return message.reply({ embeds: [errorEmbed] });
        }
    }
};