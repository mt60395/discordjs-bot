module.exports = {
    name: "avatar",
    desc: "Display a user's avatar / profile picture from a user ID or mention. https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-",
    aliases: [],
    usage: `avatar {OPTIONAL:userid}
    avatar {OPTIONAL:@user}`,
    run: (Client, msg, args) => {
        const docs = " Refer to the `help` command if necessary."
        function formatID(id) {
            // input: discord user id
            // returns it fixed if it's a mention: <@!uid> --> uid
            if (id.startsWith('<@!')) id = id.substring(3)
            if (id.endsWith('>')) id = id.substring(0, id.length-1)
            return id
        }
        var id = formatID(typeof args[1] == 'undefined'? msg.author.id:args[1])
        if (Number(id) > 0 && (id.length == 18)) {
            Client.users.fetch(id).then(Data => 
                msg.channel.send(Data.displayAvatarURL({format:"png",dynamic:true}))
            )
            .catch(()=>msg.reply(`You must provide a valid discord user id.${docs}`))
        }
        else {
            msg.reply(`You must provide a valid discord user id.${docs}`)
        }
    }
}