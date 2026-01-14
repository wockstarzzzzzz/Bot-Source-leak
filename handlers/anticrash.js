const { EmbedBuilder, WebhookClient } = require("discord.js");
const { inspect } = require("util");
const webhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/1453134991625158677/Z8ZsOQgcF75zuNEetb4nPvtI-huDnxGMqyLokBlAY3cOXMsF9wxSD9R9CrywFlrkCVKk",
});

module.exports = (client) => {
  const embed = new EmbedBuilder().setColor("#2b2d31");

  client.on("error", (err) => {
    console.log(err);

    embed
      .setTitle("Discord API Error")
      .setDescription(
        `\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``
      )
      .setTimestamp();

    return webhook.send({ embeds: [embed] });
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.log(reason, "\n", promise);

    embed
      .setTitle("Unhandled Rejection/Catch")
      .addFields(
        {
          name: "Reason",
          value: `\`\`\`${inspect(reason, { depth: 0 }).slice(0, 1000)}\`\`\``,
        },
        {
          name: "Promise",
          value: `\`\`\`${inspect(promise, { depth: 0 }).slice(0, 1000)}\`\`\``,
        }
      )
      .setTimestamp();

    return webhook.send({ embeds: [embed] });
  });

  process.on("uncaughtException", (err, origin) => {
    console.log(err, "\n", origin);

    embed
      .setTitle("Uncaught Exception/Catch")
      .addFields(
        {
          name: "Error",
          value: `\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``,
        },
        {
          name: "Origin",
          value: `\`\`\`${inspect(origin, { depth: 0 }).slice(0, 1000)}\`\`\``,
        }
      )
      .setTimestamp();

    return webhook.send({ embeds: [embed] });
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(err, "\n", origin);

    embed
      .setTitle("Uncaught Exception Monitor")
      .addFields(
        {
          name: "Error",
          value: `\`\`\`${inspect(err, { depth: 0 }).slice(0, 1000)}\`\`\``,
        },
        {
          name: "Origin",
          value: `\`\`\`${inspect(origin, { depth: 0 }).slice(0, 1000)}\`\`\``,
        }
      )
      .setTimestamp();

    return webhook.send({ embeds: [embed] });
  });

  process.on("warning", (warn) => {
    console.log(warn);

    embed
      .setTitle("Uncaught Exception Monitor Warning")
      .addFields({
        name: "Warning",
        value: `\`\`\`${inspect(warn, { depth: 0 }).slice(0, 1000)}\`\`\``,
      })
      .setTimestamp();

    return webhook.send({ embeds: [embed] });
  });
};