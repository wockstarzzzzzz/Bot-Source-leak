const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
const emojis = require('../../../emojis.json');

module.exports = {
  name: 'help',
  aliases: ['h'],
  punitop: false,
  adminPermit: false,
  ownerPermit: false,
  cat: 'general',
  async execute(message, args) {
    const client = message.client;
    const prefix = await require('../../../Handlers/prefixHandler').getPrefix(message.guild.id);
    const ownerIds = ['344131223230087177', '1318015940780363821', '1124737231496683543', '900936852285046834'];

    const botName = client.user.username;
    
    const hasSendPermissions = message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.SendMessages);
    const hasEmbedPermissions = message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.EmbedLinks);

    if (!hasSendPermissions) return;

    let em = new EmbedBuilder()
      .setColor(`#2b2d31`)
      .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL() })
      .setDescription('List of commands **(soon/commands)**')
      .addFields(
        {
          name: 'Information',
          value: `> **[\`Invite\`](${`https://discord.com/oauth2/authorize?client_id=${message.client.user.id}`})**\n > **[\`Support\`](${`https://discord.gg/XVtaGhjNZC`})**\n > **(soon)**`,
          inline: false
        })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));


    if (!hasEmbedPermissions) {
      if (message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
        return;
      }
      return;
    }



    let r1 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('he')
        .setPlaceholder('Menu')
        .addOptions([
          {
            label: 'Home',
            value: 'h1',
          },
          {
            label: 'Moderation',
            value: 'h2',
          },
          {
            label: 'Config',
            value: 'h3',
          },
          {
            label: 'General',
            value: 'h4',
          },
          ...(ownerIds.includes(message.author.id) ? [{
            label: 'Owner',
            value: 'h5',
          }] : []),
          {
            label: 'Information',
            value: 'h6',
          },
        ])
    );

    let msg = await message.reply({ embeds: [em], components: [r1] });


    const getCommandsByCategory = (category) => {
      const prefixCommands = Array.from(client.prefixes.values())
        .filter(x => x.cat === category)
        .map(x => x.name);

      const slashCommands = Array.from(client.commands.values())
        .filter(x => x.category === category)
        .map(x => x.data.name);

      const commands = [...prefixCommands, ...slashCommands];

      return commands.length > 0
        ? `\`\`\`ansi\n${Array.from(new Set(commands)).sort().join('\x1b[2;34m,\x1b[0m ')}\`\`\``
        : 'No commands available in this category.';
    };


    let embed2 = new EmbedBuilder()
      .setColor(`#2b2d31`)
      .addFields({ name: 'Moderation Commands', value: getCommandsByCategory('mod') })
      .setAuthor({ name: `${botName}  ☆`, iconURL: client.user.displayAvatarURL() });

    let embed3 = new EmbedBuilder()
      .setColor(`#2b2d31`)
      .addFields({ name: 'Config Commands', value: getCommandsByCategory('config') })
      .setAuthor({ name: `${botName}  ☆`, iconURL: client.user.displayAvatarURL() });

    let embed4 = new EmbedBuilder()
      .setColor(`#2b2d31`)
      .addFields({ name: 'General Commands', value: getCommandsByCategory('general') })
      .setAuthor({ name: `${botName}  ☆`, iconURL: client.user.displayAvatarURL() });

    let embed5 = new EmbedBuilder()
      .setColor(`#2b2d31`)
      .addFields({ name: 'Owner Commands', value: getCommandsByCategory('owner') })
      .setAuthor({ name: `${botName}  ☆`, iconURL: client.user.displayAvatarURL() });

    let embed6 = new EmbedBuilder()
      .setColor(`#2b2d31`)
      .addFields({ name: 'Information Commands', value: getCommandsByCategory('info') })
      .setAuthor({ name: `${botName}  ☆`, iconURL: client.user.displayAvatarURL() });

    const collector = await msg.createMessageComponentCollector({
      filter: (interaction) => {
        if (message.author.id === interaction.user.id) return true;
        else {
          interaction.reply({ content: `${emojis.deny} | This is not your session, run \`${prefix}help\` to create yours.`, flags: MessageFlags.Ephemeral });
          return false;
        }
      },
      time: 100000,
      idle: 100000 / 2
    });

    collector.on('collect', async (interaction) => {
      if (interaction.isStringSelectMenu()) {
        for (const value of interaction.values) {
          if (value === 'h1') {
            let em = new EmbedBuilder()
              .setColor(`#2b2d31`)
              .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL() })
              .setDescription('List of commands **(soon/commands)**')
              .addFields(
                {
                  name: 'Information',
                  value: `> **[\`Invite\`](https://discord.com/oauth2/authorize?client_id=${client.user.id})**\n > **[\`Support\`](https://discord.gg/XVtaGhjNZC)**\n > **(soon)**`,
                  inline: false
                })
              .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
            return interaction.update({ embeds: [em] });
          }
          if (value === 'h2') {
            return interaction.update({ embeds: [embed2] });
          }
          if (value === 'h3') {
            return interaction.update({ embeds: [embed3] });
          }
          if (value === 'h4') {
            return interaction.update({ embeds: [embed4] });
          }
          if (value === 'h5' && ownerIds.includes(interaction.user.id)) {
            return interaction.update({ embeds: [embed5] });
          }
          if (value === 'h6') {
            return interaction.update({ embeds: [embed6] });
          }
        }
      }
    });
  }
};