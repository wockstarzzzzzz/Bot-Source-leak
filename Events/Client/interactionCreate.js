const { ChatInputCommandInteraction, MessageFlags } = require("discord.js");
const { handleVoiceMasterButtons } = require("../../Handlers/voiceMasterButtons");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {

    const vmHandled = await handleVoiceMasterButtons(interaction);
    if (vmHandled) return;

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command)
        return interaction.reply({
          content: "This command is outdated.",
          flags: MessageFlags.Ephemeral,
        });

      if (command.developer && interaction.user.id !== "344131223230087177" && interaction.user.id !== "1436451809903382599" && interaction.user.id !== "763141886834769980")
        return interaction.reply({
          content: "Solo para el dev.",
          flags: MessageFlags.Ephemeral,
        });

      command.execute(interaction, client);
    }
  },
};