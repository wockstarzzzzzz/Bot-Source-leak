const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
    name: 'firstmessage',
    cat: 'general',
    aliases: ['firstmsg', 'fmsg'],
    description: 'Gets the first message',
    async execute(message, args) {

        let targetChannel;
        
        if (!args.length) {

            targetChannel = message.channel;
        } else if (message.mentions.channels.size > 0) {

            targetChannel = message.mentions.channels.first();
        } else {

            targetChannel = message.guild.channels.cache.get(args[0]);
        }


        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
            if (this.canSendMessage(message.channel)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("> I can't find messages on this channel");
                    await message.channel.send({ embeds: [embed] });
                } catch {}
            }
            return;
        }

        try {

            const messages = await targetChannel.messages.fetch({ limit: 1, after: 0 });
            const firstMessage = messages.last();

            if (firstMessage) {
                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setDescription(`**The first message sent in ${targetChannel} -  [JUMP](${firstMessage.url})**`);

                await message.channel.send({ embeds: [embed] });
            } else {
                if (this.canSendMessage(message.channel)) {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("> No messages found in this channel.");
                    await message.channel.send({ embeds: [embed] });
                }
            }
        } catch {
            if (this.canSendMessage(message.channel)) {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription("> I don't have permission to read messages in that channel.");
                    await message.reply({ embeds: [embed] });
                } catch {}
            }
        }
    },

    canSendMessage(channel) {
        const botPermissions = channel.permissionsFor(channel.guild.members.me);
        return botPermissions?.has([
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks
        ]) ?? false;
    }
};