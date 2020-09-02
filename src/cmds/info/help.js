module.exports = {
    name: "help",
    desc: "Provides information about commands and usage.",
    aliases: ['cmds', 'docs'],
    usage: "help {OPTIONAL:command}",
    run: (Client, msg, args) => {
        const Discord = require('discord.js')
        if (typeof args[1] == 'undefined')
            return msg.channel.send("https://github.com/mt60395/discordjs-bot/blob/master/README.md")
        Client.cmds.forEach(cmd => {
            if (args[1] == cmd.name || cmd.aliases.includes(args[1])) {
                var embed = new Discord.MessageEmbed()
                .setColor("BLUE")
                .setTitle(cmd.name)
                .setDescription(cmd.desc)
                if (cmd.notice) embed.addFields({name:"Notice", value:cmd.notice})
                if (cmd.aliases.length > 0) {
                    var aliasList = ""
                    for (var i = 0; i < cmd.aliases.length; i++) {
                        aliasList += cmd.aliases[i]
                        if (i < cmd.aliases.length - 1) aliasList += ", "
                    }
                    embed.addFields({name:"Aliases", value:aliasList})
                }
                if (cmd.usage) embed.addFields({name:"Usage", value:cmd.usage})
                if (cmd.restricted) embed.addFields({name:"Restricted", value:cmd.restricted})
                if (cmd.dm) embed.addFields({name:"DM Only", value: true})
                msg.channel.send(embed)
            }
        })
    }
}