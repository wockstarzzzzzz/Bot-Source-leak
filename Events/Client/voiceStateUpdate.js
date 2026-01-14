const { ChannelType } = require("discord.js");
const DB = require("../../Database/Localdb/voiceMasterDB");
const owners = require("../../Handlers/voiceMasterOwners");

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState, client) {
        const guild = newState.guild;
        const config = DB.get(guild.id);
        if (!config) return;

        const member = newState.member;
        const newChannel = newState.channel;
        const oldChannel = oldState.channel;

        if (newChannel && newChannel.id === config.create) {
            const tempChannel = await guild.channels.create({
                name: `${member.user.username}'s channel`,
                type: ChannelType.GuildVoice,
                parent: config.category,
                userLimit: 0
            });

            owners.set(tempChannel.id, member.id);

            await member.voice.setChannel(tempChannel).catch(() => { });
        }

        if (oldChannel && oldChannel.id !== config.create) {
            const owner = owners.get(oldChannel.id);
            if (owner && oldChannel.members.size === 0) {
                await oldChannel.delete().catch(() => { });
                owners.remove(oldChannel.id);
            }
        }
    }
};
