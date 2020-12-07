module.exports = {
    name: "invite",
    desc: "Gets the invite for the discord bot.",
    aliases: [],
    run: (Client, msg) => {
        msg.channel.send(`https://discord.com/oauth2/authorize?client_id=${Client.user.id}&scope=bot&permissions=60480`);
    }
}
