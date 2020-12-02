module.exports = {
    name: "website",
    desc: "Displays information about a website or IP.",
    notice: "Only accepts full website addresses with http(s) prepended, and IPv4 or IPv6 addresses.",
    aliases: ['websiteinfo', 'ip', 'ipinfo'],
    usage: "website {website/ip}",
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
            var protocol = arg.startsWith('https')?'https://':arg.startsWith('http')?'http://':null
            if (arg.endsWith("/")) arg = arg.slice(0, -1)
            if (protocol) {
                return arg.substring(protocol.length);
            }
            else if (arg.includes(":")) {
                return arg;
            }
            return null;
        }
        
        var Link = getDomain(args[1])
        if (!Link) return msg.reply(`Invalid URL / IP.${docs}`)

        const unirest = require('unirest');
        const cheerio = require('cheerio');

        async function getInfo(IP) {
            var lookingFor = ["Country", "State / Region", "District / County", "Zip / Postal code", "Coordinates", "ISP"];
            var ipInfo = [];
            ipInfo.push(`IP | ${IP}`)
            await unirest.get(`https://db-ip.com/${IP}`).then(function(result) {
                let $ = cheerio.load(result.body);
                lookingFor.forEach(function(value) {
                    $('table.table:nth-child(2) > tbody:nth-child(1)').children().each(function(i, e) {
                        var field = $(e).children()[0].children[0].data;
                        if (field.startsWith(value)) {
                            if (field != "Country") {
                                ipInfo.push(`${value} | ` + $(e).children()[1].children[0].data);
                            }
                            else {
                                ipInfo.push("Country | " + $(e).children()[1].children[0].children[0].data);
                            }
                        }
                    })
                })
                $('div.col-md-6:nth-child(1) > div:nth-child(1) > table:nth-child(1) > tbody').children().each(function(i, e) {
                    if ($(e).children()[0].children[0].data == "ISP") {
                        ipInfo.push("ISP | " + $(e).children()[1].children[0].data)
                    }
                })
            })
            return ipInfo;
        }

        async function checkIPv4(Link) {
            return await unirest.get(`https://ipgeolocation.io/browse/ip/${Link}`).then(function(result) {
                let $ = cheerio.load(result.body);
                var invalidURL = false;
                $('.serverMessageBox').each(function(i, e) {
                    invalidURL = true; // can't return
                })
                return !invalidURL;
            })
        }

        async function checkIPv6(Link) {
            return await unirest.get(`https://db-ip.com/${Link}`).then(function(result) {
                let $ = cheerio.load(result.body);
                var text = $('.main').each(function(i, e) {
                    return $(this).text();
                })
                return text == "404 Not Found" ? false:true;
            })
        }

        async function resolveDNS(domain) {
            return await unirest.get(`http://ip-api.com/json/${domain}`).then(function(result) {
                return result.body['query']; // validity of ip already checked
            })
        }

        (async () => {
            var embed = new Discord.MessageEmbed().setColor("BLUE");
            if (Link.includes(":")) { // ipv6
                if (await checkIPv6(Link)) {
                    embed.setTitle("IPv6 Information");
                }
                else {
                    return msg.reply(`Invalid IP.${docs}`);
                }
            }
            else { // ipv4
                if (checkIPv4(Link)) {
                    embed.setTitle("Website / IP Information");
                }
                else {
                    return msg.reply(`Invalid URL or missing innerHTML (bot issue).${docs}`);
                }
            }
            var IP = await resolveDNS(Link);
            var ipInfo = await getInfo(IP);
            ipInfo.forEach(function(field) {
                var header = field.substring(0, field.indexOf(" | "));
                var text = field.substring(field.indexOf(" | ") + 3).replace("\n", "");
                embed.addFields({name:header, value:text});
            })
            msg.channel.send(embed)
        })()
    }
}
