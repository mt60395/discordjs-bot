module.exports = {
    name: "website",
    desc: "Displays information about a website or IP.",
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
            var ipv6 = false
            statusMessage.edit("Checking if it is an IPv6 address...").catch(()=>{})
            const page = await browser.newPage();

            if (Link.includes(":")) { // db-ip.com shows more accurate information of ipv6 addresses, it also works with ipv4 but the ipgeolocation.io is more detailed with ipv4
                await page.goto(`https://db-ip.com/${Link.replace("/:/g", "%3A")}`, {waitUntil: 'load'}) // how ipv6 is handled as a query
                const error404 = await page.evaluate(() => {
                    return document.getElementsByClassName("main")[0].innerHTML // existent regardless if the ip exists or not, just the message is different
                })
                if (error404 != "404 Not Found") ipv6 = true
            }
            statusMessage.edit(ipv6? "IPv6 address detected. Visiting db-ip.com...":"IPv6 address not detected. Accessing ipgeolocation.io...").catch(()=>{})

            if (ipv6) {
                await page.goto(`https://db-ip.com/${Link.replace("/:/g", "%3A")}`, {waitUntil: 'load'})
                statusMessage.edit("IPv6 information loaded. Evaluating contents...").catch(()=>{})
                const main = await page.evaluate(() => {
                    return document.getElementsByClassName("table light")[2].innerHTML
                })
                var mainTable = main.split("<th>")

                const ISP = await page.evaluate(() => {
                    return document.getElementsByClassName("table light")[0].innerHTML
                })
                var ISPTable = ISP.split("<th>")

                var lookingFor = ["Country", "State / Region", "District / County", "Zip / Postal code", "Coordinates", "ISP"]
                var ipv6Information = []
                for (var i = 0; i < mainTable.length; i++) {
                    lookingFor.forEach(function(value) {
                        if (mainTable[i].startsWith(value)) {
                            var found = mainTable[i]
                            found = found.split("<td>")[1]
                            if (found.includes("country")) {
                                var Index = found.indexOf(">") + 1
                                found = found.substring(Index, found.indexOf("<", Index))
                            }
                            else {
                                found = found.substring(0, found.indexOf("<")) // to get the text field
                            }
                            found = found.replace("amp;", "").replace("\n", "")

                            ipv6Information.push(found.endsWith(" ")? found.substring(0, found.length - 1):found)
                        }
                    })
                }
                for (var i = 0; i < ISPTable.length; i++) {
                    if (ISPTable[i].startsWith("ISP")) {
                        var found = ISPTable[i]
                        found = found.split("<td>")[1]
                        found = found.substring(0, found.indexOf("<")) // to get the text field
                        found = found.replace("amp;", "")

                        ipv6Information.push(found) // less exceptions for just the ISP field
                    }
                }

                statusMessage.delete().catch(()=>{})

                var embed = new Discord.MessageEmbed()
                .setColor("BLUE")
                .setTitle("IPv6 Information")

                for (var i = 0; i < lookingFor.length; i++) {
                    var header = lookingFor[i]
                    var text = ipv6Information[i]
                    if (header.length > 0 && text.length > 0) // embed fields cannot be empty, won't hurt
                        embed.addFields({name:header, value:text})
                }
                msg.channel.send(embed)
            }
            else {
                await page.goto(`https://ipgeolocation.io/browse/ip/${Link}`, {waitUntil: 'load'}) // make sure the link is correct!
                statusMessage.edit("IP information loaded. Evaluating contents...").catch(()=>{})

                const body = await page.evaluate(() => {
                    if (document.getElementsByClassName("serverMessageBox").length > 0) return null // will show if url is invalid
                    if (document.getElementById("ipInfoTable").length < 1) return 0 // won't show if innerHTML is missing, only happened to me once
                    return document.getElementById("ipInfoTable").innerHTML
                })

                if (body == 0) {
                    statusMessage.delete().catch(()=>{})
                    msg.reply("ERROR: Missing innerHTML.")
                }
                else if (body) {
                    statusMessage.edit("Resolving hostname...").catch(()=>{})
                    await page.goto(`https://www.ip-tracker.org/locator/ip-lookup.php?ip=${Link}`, {waitUntil: 'load'})
                    const hostname = await page.evaluate(()=> {
                        if (document.getElementsByClassName("lookupredempty").length > 0) return null // will show if url is invalid
                        if (document.getElementsByClassName("table-auto").length < 1) return null // can never hurt
                        return document.getElementsByClassName("table-auto")[0].innerHTML
                    })
                    
                    var realHostname = ""
                    if (hostname) {
                        var trackingInfo = hostname.split("<th>")
                        trackingInfo.forEach(function(tracker) { 
                            if (tracker.startsWith("Hostname")) {
                                var index = tracker.indexOf("tracking")
                                realHostname = tracker.substring(index + "tracking\">".length, tracker.indexOf("</td"))
                            }
                        })

                        var ipTable = body.split("<td>")
                        var lookingFor = ["IP", "Hostname", "Continent Name", "Country Name", "State/Province", "District/County", "Zip Code", "Latitude", "ISP"]
                        var ipInformation = []
                        for (var i = 0; i < ipTable.length; i++) {
                            lookingFor.forEach(function(value) {
                                if (ipTable[i].startsWith(value)) {
                                    if (value == "Hostname") return ipInformation.push(hostname?realHostname:Link) //hostname?hostname:Link
                                    ipInformation.push(ipTable[i + 1].split("<")[0].replace("amp;", ""))
                                }
                            })
                        }
                        statusMessage.delete().catch(()=>{})

                        var embed = new Discord.MessageEmbed()
                        .setColor("BLUE")
                        .setTitle("Website / IP Information")

                        for (var i = 0; i < lookingFor.length; i++) {
                            var header = lookingFor[i]
                            var text = ipInformation[i]
                            if (header == "Latitude") header += " & Longitude"
                            if (header.length > 0 && text.length > 0) // embed fields cannot be empty, sometimes district/county won't show
                                embed.addFields({name:header, value:text})
                        }
                        msg.channel.send(embed)
                    }
                    else {
                        statusMessage.delete().catch(()=>{})
                        msg.reply(`Invalid URL.${docs}`)
                    }
                }
                else {
                    statusMessage.delete().catch(()=>{})
                    msg.reply(`Invalid URL.${docs}`)
                }
            }
            browser.close();
        })()
    }
}