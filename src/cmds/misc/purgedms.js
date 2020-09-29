module.exports = {
    name: "purgedms",
    desc: "Purge up to 100 direct messages from the bot.",
    notice: "This must be used in a DM channel with the bot.",
    aliases: [],
    dm: true,
    run: (Client, msg) => {
        if (msg.guild) return msg.reply("You must use this command in a DM.");
        (async () => {
            const dmMessages = await msg.channel.messages.fetch({limit: 100}).catch(()=>{console.log("ERROR fetching DM messages.")})
            // max is 100 at a time
            dmMessages.forEach(message => {
                if (message.author.bot) {
                    message.delete().catch(()=>{})
                }
            })
        })()
    }
}