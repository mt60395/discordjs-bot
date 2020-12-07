module.exports = {
    name: "status",
    desc: "Provides information about the bot status.",
    aliases: ['uptime'],
    run: (Client, msg, args, config) => {
        const Discord = require('discord.js')
        const os = require('os');
        function formatTime(ms) { // converts time from milliseconds because discord.js provides uptime in ms
            var days = Math.floor(ms/86400000)
            var hours = Math.floor((ms/3600000) % 24)
            var minutes = Math.floor((ms/60000) % 60)
            var seconds = ((ms % 60000) / 1000).toFixed(0)
            var formatted = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
            return `${days} day${days == 1? "":"s"}, ` + formatted;
        }
        var embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Current Status")
        .addFields(
            {name:"Uptime", value:formatTime(Client.uptime)},
            // https://github.com/esmBot/esmBot/
            {name:"Memory usage", value:`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`},
            {name:"Host", value:`${os.type()} ${os.release()} (${os.arch()})`},
            {name:"Library", value:`discord.js v${require("discord.js").version}`},
            {name:"Node.js",value:process.version},
            {name:"Debugging mode", value:config.DEBUGGING},
            {name:"Saving images locally", value:config.SAVE_IMAGES},
            {name:"Accepting external images", value:config.EXTERNAL_HOSTING}
        )
        msg.channel.send(embed)
    }
}
