module.exports = {
    name: "status",
    desc: "Provides information about the bot status.",
    aliases: ['uptime'],
    run: (Client, msg, args, config) => {
        const Discord = require('discord.js')
        function formatTime(ms) { // converts time from milliseconds because discord.js provides uptime in ms
            var days = Math.floor(ms/86400000)
            var hours = Math.floor((ms/3600000) % 24)
            var minutes = Math.floor((ms/60000) % 60)
            var seconds = ((ms % 60000) / 1000).toFixed(0)
            return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
        }
        var embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Current Status")
        .addFields(
            {name:"Uptime", value:formatTime(Client.uptime)},
            {name:"Debugging mode", value:config.DEBUGGING},
            {name:"Saving images locally", value:config.SAVE_IMAGES},
            {name:"Accepting external images", value:config.EXTERNAL_HOSTING}
        )
        msg.channel.send(embed)
    }
}