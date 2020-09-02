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
            var protocol = arg.startsWith('http')?'http://':arg.startsWith('https')?'https://':null
            if (arg.endsWith("/")) arg = arg.substring(0, arg.length - 1)
            if (protocol) return arg.substring(protocol.length + 1)
            return arg
        }

        var Link = getDomain(args[1])
        if (!Link) return msg.reply(`Invalid URL / IP.${docs}`)

        const chromium = require('puppeteer');
        (async () => {
            var statusMessage = await msg.channel.send("Launching Chromium...")
            const browser = await chromium.launch();
            statusMessage.edit("Accessing page...").catch(()=>{})
            const page = await browser.newPage();

            const search = `https://www.ip-tracker.org/lookup/whois-lookup.php?query=${Link}`
            await page.goto(search, {waitUntil: 'load'});
            statusMessage.edit("WHOIS loaded. Evaluating contents...").catch(()=>{})

            var body = await page.evaluate(() => {
                if (document.getElementsByClassName("it").length < 1) return null
                return document.getElementsByClassName("it")[0].innerHTML
            })
            
            if (body) {
                statusMessage.delete().catch(()=>{})

                var embed = new Discord.MessageEmbed()
                .setColor("BLUE")
                .setTitle("WHOIS Information")
                if (body.length > 2048) {
                    embed.setFooter(`View full page: ${search}`)
                    body = `${body.substring(0, 2045)}...`
                }
                embed.setDescription(body)

                msg.channel.send(embed)
            }
            else {
                statusMessage.delete().catch(()=>{})
                msg.reply(`Invalid URL.${docs}`)
            }
            browser.close();
        })()
    }
}