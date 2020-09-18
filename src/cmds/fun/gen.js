module.exports = {
    name: "gen",
    desc: "Generates a password up to 2042 characters and sends it by DM.",
    notice: "The default length is 32 if you don't provide one for input.",
    aliases: ['pass', 'password'],
    usage: "gen {OPTIONAL:length}",
    run: (Client, msg, args) => {
        const Discord = require('discord.js')
        const docs = " Refer to the `help` command if necessary."
        var length = 32
        if (typeof args[1] != 'undefined') { // 32 default
            var n = Number(args[1])
            if (!(n > 0 && n < 2043 && Number.isInteger(n))) { // if it is provided check the number
                return msg.reply(`Invalid number. The integer must be less than 2043 and greater than 0.${docs}`)
            }
            length = n
        }

        function genString(LENGTH) {
            var str = ""
            for (var i = 0; i < LENGTH; i++) str += String.fromCharCode(Math.random() * 94 + 33)
            return str
        }

        var embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("New Password: Length " + length)
        .setDescription("```" + genString(length) + "```");
        (async () => {
            var fail = false
            await msg.author.send(embed).catch(()=>{
                fail = true
                msg.reply("I am unable to send you a direct message. Please check your Privacy & Safety settings to allow direct messages from server members. https://i.imgur.com/HMHoPPD.png")
            })
            if (!fail && msg.guild) msg.reply("Your password has been generated. Check your direct messages from the bot.")
        })()
    }
}
