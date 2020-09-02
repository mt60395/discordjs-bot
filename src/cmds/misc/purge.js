module.exports = {
    name: "purge",
    desc: "Purges up to 100 messages.",
    notice: "Only users with MANAGE_MESSAGES permissions are allowed to use this command.",
    aliases: [],
    usage: "purge {amount}",
    run: (Client, msg, args) => {
        if (!msg.member) return msg.reply("This command is not available for direct messages. Did you mean `purgedms`?")
        if (!(msg.member.hasPermission("MANAGE_MESSAGES")))
            return msg.reply(`You are not authorized to use the command \'${args[0]}\'.`)
        const docs = " Refer to the `help` command if necessary."
        var n = Number(args[1])
        if (n > 0 && n < 101 && Number.isInteger(n)) {
            (async () => {
                await msg.delete().catch(()=>{});
                const guildMessages = await msg.channel.messages.fetch({limit: n}).catch(()=>{console.log("ERROR fetching guild messages.")})
                msg.channel.bulkDelete(guildMessages)
            })()
        }
        else {
            msg.reply(`Invalid number. The integer must be less than 101 and greater than 0.${docs}`)
        }
    }
}