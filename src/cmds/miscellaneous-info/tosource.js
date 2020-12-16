module.exports = {
    name: "tosource",
    desc: "Sends a link to the source of the command specified.",
    aliases: ['source', 'src', 'to'],
    usage: `tosource [command]`,
    run: (msg, args, cmds) => { 
        const Discord = require('discord.js');
        const docs = " Refer to the `help` command if necessary.";
        if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)
        args[1] = args[1].toLowerCase();
        
        var c = null;
        cmds.forEach(cmd => {
            if (args[1] == cmd.name || cmd.aliases.includes(args[1])) {
                c = cmd;
            }
        })

        if (c) {
            var embed = new Discord.MessageEmbed().setColor("BLUE");
            embed.setTitle(args[1]);
            var link = `mt60395/discordjs-bot/master/src/cmds/${c.category}/${c.fileName}`
            embed.addFields({name:"GitHub", value:`https://github.com/${link}`.replace("/master", "/blob/master")});
            embed.addFields({name:"Raw", value:`https://raw.githubusercontent.com/${link}`});
            return msg.channel.send(embed);
        }
        msg.reply(`Command not found.${docs}`);
    }
}
