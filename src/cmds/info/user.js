module.exports = {
    name: "user",
    desc: "Provides information about a user from a user ID or mention. https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-",
    aliases: ['userinfo'],
    usage: `user {OPTIONAL:userid}
    user {OPTIONAL:@user}`,
    run: (Client, msg, args) => {
        const Discord = require('discord.js')
        const docs = " Refer to the `help` command if necessary."
        function formatID(id) {
            // input: discord user id
            // returns it fixed if it's a mention: <@!uid> --> uid
            if (id.startsWith('<@!')) id = id.substring(3)
            if (id.endsWith('>')) id = id.substring(0, id.length-1)
            return id
        }
        var id = formatID(typeof args[1] == 'undefined'? msg.author.id:args[1])
        // if id is not explicitly stated then use the message sender's id
        if (Number(id) > 0 && (id.length == 18)) {
            Client.users.fetch(id).then(Data => 
                msg.channel.send(embed = new Discord.MessageEmbed()
                    .setColor("BLUE")
                    .setAuthor(`${Data.username}#${Data.discriminator}`, Data.displayAvatarURL({format:"png",dynamic:true}))
                    .setTitle("User Information")
                    .addFields(
                        {name:"Username", value:Data.username},
                        {name:"Discriminator", value:Data.discriminator},
                        {name:"Creation Date", value:Data.createdAt},
                        {name:"Avatar URL", value:Data.displayAvatarURL({format:"png",dynamic:true})},
                        {name:"Default Avatar URL", value:Data.defaultAvatarURL},
                        {name:"Is Discord Bot", value:Data.bot},
                    )
                )
            )
            .catch(()=>msg.reply(`You must provide a valid discord user id.${docs}`))
        }
        else {
            msg.reply(`You must provide a valid discord user id.${docs}`)
        }
    }
}