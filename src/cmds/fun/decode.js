module.exports = {
    name: "decode",
    desc: "Converts a string from base64 encoding.",
    aliases: [],
    usage: "decode {string}",
    run: (Client, msg, args, config, PREFIX) => {
        const docs = " Refer to the `help` command if necessary."

        var toDecode = msg.content.substring(PREFIX.length + "decode ".length)
        if (toDecode == "") return msg.reply(`String missing.${docs}`)

        var decoded = Buffer.from(toDecode, 'base64')
        if (decoded.toString().length < 1) return msg.reply("Could not decode the string.")
        msg.channel.send(decoded.toString())
    }
}