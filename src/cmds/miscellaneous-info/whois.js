module.exports = {
    name: "whois",
    desc: "Displays information about a WHOIS lookup for a specified domain.",
    aliases: [],
    usage: "whois {website}",
    run: (Client, msg, args) => {
        const Discord = require('discord.js')
        const docs = " Refer to the `help` command if necessary."

        if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)

        function fixLink(arg) { // possible < > that can be fixed
            var fixedLink = arg
            if (arg.startsWith("<")) fixedLink = fixedLink.substring(1)
            if (arg.endsWith(">")) fixedLink = fixedLink.substring(0, fixedLink.length - 1)
            return fixedLink
        }
        
        function getDomain(arg) {
            // input: link
            // returns the domain only, with the protocol removed from the link
            arg = fixLink(arg)
            if (arg.includes("://")) {
                arg = arg.substring(arg.indexOf("://") + "://".length)
            }
            if (arg.endsWith("/")) {
                arg = arg.slice(0, -1)
            }
            return arg;
        }

        const unirest = require('unirest');
        const cheerio = require('cheerio');
        var search = `https://www.whois.com/whois/${getDomain(args[1])}`;
        (async () => {
            var body = await unirest.get(search).then(function(result) {
                let $ = cheerio.load(result.body);
                if (typeof $('.df-raw').children()[0] == 'undefined') {
                    return null;
                }
                return $('.df-raw').children()[0].next.data;
            })
            if (body) {
                body = body.replace(">>>", "").replace("<<<", "");
                var embed = new Discord.MessageEmbed()
                .setColor("BLUE")
                .setTitle("WHOIS Information")
                .setFooter(`View full page: ${search}`)
                if (body.length > 2048) {
                    body = `${body.substring(0, 2045)}...`
                }
                embed.setDescription(body)
                msg.channel.send(embed)
            }
            else {
                msg.reply(`Invalid URL.${docs}`)
            }
        })()
    }
}
