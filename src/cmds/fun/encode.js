module.exports = {
    name: "encode",
    desc: "Converts a string to base64 encoding.",
    aliases: [],
    usage: "encode {string}",
    run: (Client, msg, args, config, PREFIX) => {
        const docs = " Refer to the `help` command if necessary."

        var toEncode = msg.content.substring(PREFIX.length + "encode ".length)
        if (toEncode == "") return msg.reply(`String missing.${docs}`)

        var encoded = Buffer.from(toEncode)
        if (encoded.toString('base64').length > 2000) return msg.reply("String too long. Head to https://www.base64encode.org/ to encrypt longer strings.")
        msg.channel.send(encoded.toString('base64'))
    }
}