const {
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");
const owners = require("./voiceMasterOwners");
const COLOR = "#565656";

async function handleVoiceMasterButtons(interaction) {
    if (interaction.isButton()) {
        const member = interaction.member;
        const guild = interaction.guild;

        const channel = member.voice?.channel;
        if (!channel)
            return interaction.reply({
                embeds: [new EmbedBuilder().setDescription("<:deny:1446619235135787040> You must be in your voice channel to use this button.")],
                ephemeral: true
            });

        if (owners.get(channel.id) !== member.id)
            return interaction.reply({
                embeds: [new EmbedBuilder().setDescription("<:deny:1446619235135787040> Only the channel owner can use these buttons.")],
                ephemeral: true
            });

        switch (interaction.customId) {
            case "vm_lock":
                await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect: false });
                return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:lock:1441487505286234252> Channel locked!")], ephemeral: true });

            case "vm_unlock":
                await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect: true });
                return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:unlock:1441487621678305393> Channel unlocked!")], ephemeral: true });

            case "vm_hide":
                await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });
                return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:ghost:1441488167529218299> Channel hidden!")], ephemeral: true });

            case "vm_unhide":
                await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: true });
                return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:unghost:1441488094762369190> Channel visible!")], ephemeral: true });

            case "vm_claim":
                owners.set(channel.id, member.id);
                return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:Ownership:1447346504649019436> Channel ownership claimed!")], ephemeral: true });

            case "vm_info":
                return interaction.reply({
                    embeds: [new EmbedBuilder().setDescription(`<:info:1441488877230756123> Channel info:\n- Name: ${channel.name}\n- Members: ${channel.members.size}`)],
                    ephemeral: true
                });

            case "vm_plus":
                await channel.setUserLimit(channel.userLimit + 1).catch(() => { });
                return interaction.reply({
                    embeds: [new EmbedBuilder().setDescription(`<:increase:1441489046399484085> User limit increased! New limit: ${channel.userLimit}`)],
                    ephemeral: true
                });

            case "vm_minus":
                await channel.setUserLimit(channel.userLimit - 1).catch(() => { });
                return interaction.reply({
                    embeds: [new EmbedBuilder().setDescription(`<:decrease:1441488996411768842> User limit decreased! New limit: ${channel.userLimit}`)],
                    ephemeral: true
                });

            case "vm_rename":
            case "vm_activity": {
                const modal = new ModalBuilder()
                    .setCustomId(`${interaction.customId}:${channel.id}`)
                    .setTitle(interaction.customId === "vm_rename" ? "Rename your voice channel" : "Start an activity");

                const input = new TextInputBuilder()
                    .setCustomId(interaction.customId === "vm_rename" ? "new_name" : "activity_name")
                    .setLabel(interaction.customId === "vm_rename" ? "New channel name" : "Activity name")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder(interaction.customId === "vm_rename" ? "Enter new channel name" : "Enter activity")
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            case "vm_kick": {
                const options = channel.members
                    .filter(m => m.id !== member.id)
                    .map(m => ({ label: m.user.username ?? "Unknown", value: m.id }));

                if (!options.length)
                    return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:error:1446711807841665186> No members to kick!")], ephemeral: true });

                const select = new StringSelectMenuBuilder()
                    .setCustomId(`kick:${channel.id}`)
                    .setPlaceholder("Select members to disconnect")
                    .setOptions(options)
                    .setMaxValues(options.length);

                return interaction.reply({
                    embeds: [new EmbedBuilder().setDescription("<:disconnect:1441488320063340597> Select members to kick")],
                    components: [new ActionRowBuilder().addComponents(select)],
                    ephemeral: true
                });
            }

            default:
                return false;
        }
    }

    if (interaction.isModalSubmit()) {
        const [type, channelId] = interaction.customId.split(":");
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel)
            return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:deny:1446619235135787040> Channel not found.")], ephemeral: true });

        const member = interaction.member;
        if (owners.get(channel.id) !== member.id)
            return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:deny:1446619235135787040> Only the owner can use this modal.")], ephemeral: true });

        if (type === "vm_rename") {
            const newName = interaction.fields.getTextInputValue("new_name");
            if (!newName)
                return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:deny:1446619235135787040> No name provided.")], ephemeral: true });

            await channel.setName(newName);

            return interaction.reply({
                embeds: [new EmbedBuilder().setDescription(`<:approve:1446619174343540756> Channel renamed to **${newName}**`).setColor(0xa4ec77)],
                ephemeral: true
            });
        }

        if (type === "vm_activity") {
            const activity = interaction.fields.getTextInputValue("activity_name");
            await channel.setName(activity);

            return interaction.reply({
                embeds: [new EmbedBuilder().setDescription(`<:approve:1446619174343540756> Channel name updated to: **${activity}**`).setColor(0xa4ec77)],
                ephemeral: true
            });
        }
    }

    if (interaction.isStringSelectMenu()) {
        const [type, channelId] = interaction.customId.split(":");
        if (type !== "kick") return false;

        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:deny:1446619235135787040> Channel not found.")], ephemeral: true });

        const member = interaction.member;
        if (owners.get(channel.id) !== member.id)
            return interaction.reply({ embeds: [new EmbedBuilder().setDescription("<:deny:1446619235135787040> Only the owner can kick.")], ephemeral: true });

        interaction.values.forEach(userId => {
            const m = channel.members.get(userId);
            if (m) m.voice.disconnect();
        });

        return interaction.update({ embeds: [new EmbedBuilder().setDescription("<:approve:1446619174343540756> Selected members kicked!")], components: [] });
    }

    return false;
}

module.exports = { handleVoiceMasterButtons };
