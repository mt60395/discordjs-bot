module.exports = {
    name: "serverinfo",
    desc: "Display informations about the server.",
    aliases: ['server'],
    run: (Client, msg) => {
        const Discord = require('discord.js')
        var guild = msg.guild
        if (!guild) return msg.reply("You must use this command in a server.")
        var embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Server Information")
        .setThumbnail(guild.iconURL({format:"png",dynamic:true}))
        .addFields(
            {name:"Server Name", value:guild.name},
            {name:"Server ID", value:guild.id},
            {name:"Creation Date", value:guild.createdAt},
            {name:"Server Icon URL", value:guild.iconURL({format:"png",dynamic:true})},
            {name:"Owner", value:guild.owner},
            {name:"Total member count", value:guild.memberCount}
        )
        msg.channel.send(embed)
    }
}