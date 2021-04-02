module.exports = {
    name: "reverse",
    desc: "Reverses a provided string.",
    aliases: [],
    usage: "reverse {string}",
    run: (Client, msg, args, config, PREFIX) => {
        const Discord = require('discord.js');
        msg.channel.send(Discord.Util.removeMentions(msg.content.substring(PREFIX.length + "reverse ".length).split('').reverse().join(''))).catch(()=>msg.reply("Could not reverse the message."));
    }
}