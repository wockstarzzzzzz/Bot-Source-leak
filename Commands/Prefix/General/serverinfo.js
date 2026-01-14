const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  aliases: ['server', 'si', 'guildinfo'],
  cat: 'general',
  description: 'Displays server information',

  async execute(message, args) {
    if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {
      return;
    }

    let guild;

    if (args[0]) {
      guild = message.client.guilds.cache.get(args[0]);

      if (!guild) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setDescription(`Could not find a server with ID \`${args[0]}\`.`);

        return message.channel.send({ embeds: [errorEmbed] });
      }
    } else {
      guild = message.guild;
    }

    const owner = await guild.fetchOwner();

    const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
    const categoryChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter((member) => member.user.bot).size;
    const humanCount = totalMembers - botCount;
    const totalRoles = guild.roles.cache.size;
    const totalEmojis = guild.emojis.cache.size;
    const totalStickers = guild.stickers.cache.size;
    const verifyLevel = getVerificationLevel(guild.verificationLevel);

    const iconURL = guild.iconURL({ dynamic: true, size: 1024 });
    const bannerURL = guild.bannerURL({ dynamic: true, size: 1024 });
    const splashURL = guild.splashURL({ dynamic: true, size: 1024 }) || 'n/a';

    const embedMessage = new EmbedBuilder()
      .setColor('#2b2d31')
      .setAuthor({ name: `${guild.name} (${guild.id})`, iconURL: guild.iconURL({ dynamic: true }) })
      .setTitle(`Serverinfo`)
      .setThumbnail(iconURL);

    if (bannerURL) {
      embedMessage.setImage(bannerURL);
    }

    if (guild.description) {
      embedMessage.setDescription(`\n_${guild.description}_\n`);
    }

    embedMessage.addFields(
      {
        name: 'Information',
        value: `> **Owner:** ${owner.user}\n> **Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n> **Verification:** \`${verifyLevel}\``,
        inline: false,
      },
      {
        name: 'Members',
        value: `> **Total:** \`${totalMembers}\`\n> **Humans:** \`${humanCount}\`\n> **Bots:** \`${botCount}\``,
        inline: true,
      },
      {
        name: 'Channels',
        value: `> **Text:** \`${textChannels}\`\n> **Voice:** \`${voiceChannels}\`\n> **Category:** \`${categoryChannels}\``,
        inline: true,
      },
      {
        name: 'Counts',
        value: `> **Emojis:** \`${totalEmojis}\`\n> **Stickers:** \`${totalStickers}\`\n> **Roles:** \`${totalRoles}/250\``,
        inline: true,
      },
      {
        name: 'Design',
        value: `> **Icon:** ${iconURL ? `[here](${iconURL})` : 'n/a'}\n> **Banner:** ${bannerURL ? `[here](${bannerURL})` : 'n/a'}\n> **Splash:** ${splashURL !== 'n/a' ? `[here](${splashURL})` : 'n/a'}`,
        inline: true,
      },
      {
        name: 'Boosts',
        value: `> **Boosts:** \`${guild.premiumSubscriptionCount || 0}\`\n> **Boosters:** \`${guild.premiumSubscriptionCount || 0} booster(s)\`\n> **Vanity:** \`${guild.vanityURLCode ? guild.vanityURLCode : 'None'}\``,
        inline: true,
      }
    );

    await message.channel.send({ embeds: [embedMessage] });
  },
};

function getVerificationLevel(level) {
  const levels = ['None', 'Low', 'Medium', 'High', 'Very High'];
  return levels[level];
}