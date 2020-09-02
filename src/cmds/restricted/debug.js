module.exports = {
    name: "debug",
    desc: "Toggles the debugging mode, which restricts bot access to whitelisted debuggers.",
    aliases: ['debugmode'],
    run: (Client, msg, args, config, PREFIX) => {
        const Discord = require('discord.js')
        config.DEBUGGING = !config.DEBUGGING
        Client.user.setActivity(`${(config.DEBUGGING? "DEBUGGING | ":"")}${PREFIX}help`, {type:"PLAYING"})
        var embed = new Discord.MessageEmbed()
        .setTitle("Debug Status")
        if (config.DEBUGGING) {
            embed.setColor("RED")
            .setDescription("Debugging mode is now on. Command usage is restricted to debuggers.")
        }
        else {
            embed.setColor("GREEN")
            .setDescription("Debugging mode is now off. Command usage restrictions have been lifted.")
        }
        msg.channel.send(embed)
    }
}