module.exports = {
    name: "external",
    desc: "Toggles accepting images from domains other than cdn.discordapp.com.",
    aliases: [],
    run: (Client, msg, args, config) => {
        const Discord = require('discord.js')
        config.EXTERNAL_HOSTING = !config.EXTERNAL_HOSTING
        var embed = new Discord.MessageEmbed()
        .setTitle("Accepting External Images Status")
        if (config.EXTERNAL_HOSTING) {
            embed.setColor("RED")
            .setDescription("Accepting external images is now on. The bot now accepts images from all domains.")
        }
        else {
            embed.setColor("BLUE")
            .setDescription("Accepting external images is now off. The bot will no longer accept images from domains other than cdn.discordapp.com.")
        }
        msg.channel.send(embed)
    }
}