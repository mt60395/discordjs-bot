module.exports = {
    name: "namemc",
    desc: "Display a history of past Minecraft usernames given a provided username.",
    aliases: ['mc', 'minecraft'],
    usage: "namemc {username}",
    run: (Client, msg, args) => {
        const Discord = require('discord.js')
        const docs = " Refer to the `help` command if necessary."
        if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)

        const fetch = require('node-fetch')
        async function fetchJSON(url) {
            const response = await fetch(url)
            return response.json()
        }

        (async () => {
            try {
                var idFetch = await fetchJSON(`https://api.mojang.com/users/profiles/minecraft/${args[1]}`)
                var nameHistory = await fetchJSON(`https://api.mojang.com/user/profiles/${idFetch.id}/names`)

                var embed = new Discord.MessageEmbed()
                .setColor("BLUE")
                .setTitle("Minecraft User Information")
                .addFields({name:nameHistory[0].name, value:"Original Username"})
                for (var i = 1; i < nameHistory.length; i++) {
                    embed.addFields({name:nameHistory[i].name, value:`Changed on ${new Date(nameHistory[i].changedToAt)}`})
                }
                msg.channel.send(embed)
            }
            catch (e) {
                msg.reply("Invalid username.")
            }
        })()
    }
}