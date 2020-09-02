module.exports = {
    name: "info",
    desc: "Provides information about the bot.",
    aliases: [],
    run: (Client, msg) => {
        const Discord = require('discord.js')
        var embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Bot Information")
        .addFields(
            {name:"Creator", value:"https://github.com/mt60395/"},
            {name:"GitHub Repository", value:"https://github.com/mt60395/discordjs-bot"},
            {name:"Commands and documentation", value:"https://github.com/mt60395/discordjs-bot/blob/master/README.md"}
        )
        msg.channel.send(embed)
    }
}