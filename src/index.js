const Discord = require('discord.js')
const Client = new Discord.Client()
require('dotenv').config()
const PREFIX = process.env.PREFIX
const config = require("../config")
Client.login(process.env.BOT_TOKEN)

Client.on('ready', () => {
    Client.user.setActivity(`${(config.DEBUGGING? "DEBUGGING | ":"")}${PREFIX}help`, {type:"PLAYING"})
    console.log(`Server count: ${Client.guilds.cache.size}`)
    Client.guilds.cache.forEach(g => {
        console.log(g.id)
        if (!config.GUILDS.includes(g.id)){ // if not whitelisted
            g.leave()
            console.log("The client has left a non whitelisted server.")
        }
    })
})

Client.on("guildCreate", async g => {
    console.log("The client has joined a new server.")
    if (!config.GUILDS.includes(g.id)){
        g.leave()
        console.log("The client has left after joining a non whitelisted server.")
    }
})

const fs = require('fs')
const path = require('path')
const jimp = require('jimp')
const crypto = require('crypto')
const fetch = require('node-fetch')
const chromium = require('puppeteer')

async function fetchJSON(url) {
    const response = await fetch(url)
    return response.json()
}

function formatID(id) {
    // input: discord user id
    // returns it fixed if it's a mention: <@!uid> --> uid
    if (id.substring(0, 3) == '<@!') id = id.substring(3)
    if (id.substring(id.length - 1) == '>') id = id.substring(0, id.length-1)
    return id
}

function fixLink(arg) { // possible < > that can be fixed
    var fixedLink = arg
    if (arg.startsWith("<")) fixedLink = fixedLink.substring(1)
    if (arg.endsWith(">")) fixedLink = fixedLink.substring(0, fixedLink.length - 1)
    return fixedLink
}

function getLink(attachments, arg) {
    if (attachments.size > 0) {
        // console.log(msg.attachments)
        return `${attachments.first().url}`
    }
    else { // uses arg if attachment is not present
        if (arg) {
            if (fixLink(arg).startsWith('http')) return arg
        }
    }
    return null
}

function getDomain(arg) {
    arg = fixLink(arg)
    var protocol = arg.startsWith('http')?'http://':arg.startsWith('https')?'https://':null
    if (arg.endsWith("/")) arg = arg.substring(0, arg.length - 1)
    if (protocol) return arg.substring(protocol.length + 1)
    return arg
}

function isCdn(Link) {
    // checks if an image is a cdn.discordapp.com link if you are hosting on your own PC to not get IP grabbed
    Link = fixLink(Link)
    var split = Link.split("://") // {protocol, domain}
    switch(split[0]) {
        case "http":case"https":
            if (split[1].startsWith("cdn.discordapp.com")) return true
        default: return false
    }
}

function newName(Link) {
    // input: link of an attachment or direct url to an image
    // returns a new file name so the correct image is uploaded after modification, just in case other images have the same name and are being worked on simultaneously
    Link = fixLink(Link)
    var slashSplit = Link.split("/") // the name.extension is after the final slash
    var baseName = slashSplit[slashSplit.length - 1].split(".")[0] // name of the original file
    return `${baseName}-${crypto.randomBytes(2).toString('hex')}.png`
}

function validExt(ext) {
    // input: extension
    // returns if the extension is png, jpg, or jpeg
    switch(ext.substring(1).toLowerCase()) { // .PNG is valid but uppercase, convert it to lowercase
        case "png":case"jpg":case"jpeg":return true
    }
    return false
}

function formatTime(ms) { // converts time from milliseconds because discord.js provides uptime in ms
    var days = Math.floor(ms/86400000)
    var hours = Math.floor((ms/3600000) % 24)
    var minutes = Math.floor((ms/60000) % 60)
    var seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
}

const docs = " Documentation: https://github.com/mt60395/discordjs-bot/blob/master/README.md"

Client.on('message', msg => {
    if (!(msg.content.substring(0, 1) == PREFIX)) return // prefix check
    if (msg.author.bot) return // bot recursion check
    if (config.DEBUGGING) if (!config.DEBUGGERS.includes(msg.author.id)) return msg.reply("The bot is currently in debugging mode. Please temporarily refrain from using commands.")
    var args = msg.content.substring(PREFIX.length).split(" ") // only use after the prefix
    switch(args[0]) {
        case "help":
        case "cmds":
        case "docs":
            return msg.channel.send("https://github.com/mt60395/discordjs-bot/blob/master/README.md")

        case "status":
        case "uptime":
            var embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Current Status")
            .addFields(
                {name:"Uptime", value:formatTime(Client.uptime)},
                {name:"Debugging mode", value:config.DEBUGGING},
                {name:"Saving images locally", value:config.SAVE_IMAGES},
                {name:"Accepting external images", value:config.EXTERNAL_HOSTING}
            )
            return msg.channel.send(embed)

        case "info":
            var embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Bot Information")
            .addFields(
                {name:"Creator", value:"https://github.com/mt60395/"},
                {name:"GitHub Repository", value:"https://github.com/mt60395/discordjs-bot"},
                {name:"Commands and documentation", value:"https://github.com/mt60395/discordjs-bot/blob/master/README.md"}
            )
            return msg.channel.send(embed)

        case "user":
        case "userinfo":
            var id = formatID(typeof args[1] == 'undefined'? msg.author.id:args[1])
            // if id is not explicitly stated then use the message sender's id
            if (Number(id) > 0 && (id.length == 18)) {
                return Client.users.fetch(id).then(Data => 
                    msg.channel.send(embed = new Discord.MessageEmbed()
                        .setColor("BLUE")
                        .setAuthor(`${Data.username}#${Data.discriminator}`, Data.displayAvatarURL({format:"png",dynamic:true}))
                        .setTitle("User Information")
                        .addFields(
                            {name:"Username", value:Data.username},
                            {name:"Discriminator", value:Data.discriminator},
                            {name:"Creation Date", value:Data.createdAt},
                            {name:"Avatar URL", value:Data.displayAvatarURL({format:"png",dynamic:true})},
                            {name:"Default Avatar URL", value:Data.defaultAvatarURL},
                            {name:"Is Discord Bot", value:Data.bot},
                        )
                    )
                )
                .catch(()=>msg.reply(`You must provide a valid discord user id.${docs}`))
            }
            else {
                return msg.reply(`You must provide a valid discord user id.${docs}`)
            }

        case "server":
        case "serverinfo":
            var guild = msg.guild
            if (!guild) return msg.reply("You must use this command in a server.")
            var embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Server Information")
            .setThumbnail(guild.iconURL({format:"png",dynamic:true}))
            .addFields(
                {name:"Server Name", value:guild.name},
                {name:"Server ID", value:guild.id},
                {name:"Creation Date", value:guild.createdAt},
                {name:"Server Icon URL", value:guild.iconURL({format:"png",dynamic:true})},
                {name:"Owner", value:guild.owner},
                {name:"Total member count", value:guild.memberCount}
            )
            return msg.channel.send(embed)

        case "avatar":
            var id = formatID(typeof args[1] == 'undefined'? msg.author.id:args[1])
            if (Number(id) > 0 && (id.length == 18)) {
                return Client.users.fetch(id).then(Data => 
                    msg.channel.send(Data.displayAvatarURL({format:"png",dynamic:true}))
                )
                .catch(()=>msg.reply(`You must provide a valid discord user id.${docs}`))
            }
            else {
                return msg.reply(`You must provide a valid discord user id.${docs}`)
            }

        // image manipulation start
        case "rotate":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`) // at least 1 arg

            var Link = getLink(msg.attachments, args[1])
            if (!Link) return msg.reply("Image missing.")

            if (!config.EXTERNAL_HOSTING) // if hosting on your own device
                if (!isCdn(Link)) return msg.reply("Please make sure your link starts with cdn.discordapp.com, or upload your attachment instead.")

            var degree
            msg.attachments.size > 0 ? degree = Number(args[1]):degree = Number(args[2])
            // only argument is the direction (attachment provided) or 2 arguments, and first is a link so the second is the direction

            if (degree > 0 && degree < 360) { // Degree Number must be greater than 0, NaN is denied
                if (!validExt(path.extname(Link))) return msg.reply(`Invalid image format.${docs}`)
                var output = newName(Link)

                return (async () => {
                    let input = await jimp.read(Link)
                    input.rotate(degree).write(output)
                    fs.stat('./' + output, async () => {
                        await msg.channel.send(`**Sucessfully rotated ${degree} degrees! :white_check_mark:**`, {files:['./' + output]})
                        .catch(()=>{msg.reply("There was an error uploading your image.")})
                        if (!config.SAVE_IMAGES) fs.unlink(output, function(){}) 
                    })
                })()
            }
            else {
                return msg.reply(`Invalid degree. The degree must be greater than 0 and less than 360.${docs}`)
            }

        case "resize":
        case "stretch":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`) // at least 1 arg

            var Link = getLink(msg.attachments, args[1])
            if (!Link) return msg.reply("Image missing.")
            if (!config.EXTERNAL_HOSTING) // if hosting on your own device
                if (!isCdn(Link)) return msg.reply("Please make sure your link starts with cdn.discordapp.com, or upload your attachment instead.")

            var resolution
            var resolutionY = "" // for people that prefer spaces between dimension

            if (msg.attachments.size > 0) {
                resolution = args[1] // only argument is a resolution
                if (args[2]) resolutionY = args[2] // the other argument if not (SideX)x(SideY)
            }
            else {
                resolution = args[2] // 2 arguments, first is a link so the second is the res argument
                if (args[3]) resolutionY = args[3]
            }

            resolution = resolution.toLowerCase()
            resolutionY = resolutionY.toLowerCase()
            var res = resolution.split("x") // res[0] is x, res[1] is y
            if (resolutionY) {
                res = [resolution, resolutionY]
                resolution = `${resolution}x${resolutionY}` // for the success message
            }

            // resolution/dimension validity checks
            res[0] = Number(res[0]); res[1] = Number(res[1])
            var bool = res[0] > 1 && res[0] <= 4096 // 1 pixel isn't clickable on Discord and you don't want more than 4k
            var bool2 = res[1] > 1 && res[1] <= 4096
            var bool3 = Number.isInteger(res[0])
            var bool4 = Number.isInteger(res[1]) // JIMP errors with non integers

            if (bool && bool2 && bool3 && bool4){
                if (!validExt(path.extname(Link))) return msg.reply(`Invalid image format.${docs}`)
                var output = newName(Link)

                return (async () => {
                    let input = await jimp.read(Link)
                    input.resize(res[0], res[1])
                    .quality(50)
                    .write(output)
                    fs.stat('./' + output, async () => {
                        await msg.channel.send(`**Sucessfully resized to ${resolution}! :white_check_mark:**`, {files:['./' + output]})
                        .catch(()=>{msg.reply("There was an error uploading your image.")})
                        if (!config.SAVE_IMAGES) fs.unlink(output, function(){}) 
                    })
                })()
            }
            else {
                return msg.reply(`Invalid dimension(s). Desired side length must be greater than 1 pixel and less than 4096 pixels.${docs}`)
            }

        case "mirror":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`) // at least 1 arg

            var Link = getLink(msg.attachments, args[1])
            if (!Link) return msg.reply("Image missing.")
            if (!config.EXTERNAL_HOSTING) // if hosting on your own device
                if (!isCdn(Link)) return msg.reply("Please make sure your link starts with cdn.discordapp.com, or upload your attachment instead.")

            var dir = ""
            msg.attachments.size > 0 ? dir = args[1]:dir = args[2]
            // only argument is the direction (attachment provided) or 2 arguments, and first is a link so the second is the direction

            if (typeof dir == 'undefined') return msg.reply(`Invalid direction. It must be horizontal, vertical, or both.${docs}`)

            var validDir = false, h = false, v = false, both = false // variable both is for the message reply, other vars are for direction/validity checking
            switch(dir.toLowerCase()) { // checks if the direction is valid
                case "h":case "horizontal":
                    validDir = true; h = true
                break
                case "v":case "vertical":
                    validDir = true; v = true
                break
                case "both":case"b":case"vh":case"hv":
                    validDir = true; both = true; h = true; v = true
            }

            if (validDir) {
                if (!validExt(path.extname(Link))) return msg.reply(`Invalid image format.${docs}`)
                var output = newName(Link)

                return (async () => {
                    let input = await jimp.read(Link)
                    input.mirror(h, v).write(output)
                    fs.stat('./' + output, async () => {
                        await msg.channel.send(`**Sucessfully mirrored ${(both?"horizontally and vertically":h?"horizontally":"vertically")}! :white_check_mark:**`, {files:['./' + output]})
                        .catch(()=>{msg.reply("There was an error uploading your image.")})
                        if (!config.SAVE_IMAGES) fs.unlink(output, function(){}) 
                    })
                })()
            }
            else {
                return msg.reply(`Invalid direction. It must be horizontal, vertical, or both.${docs}`)
            }

        case "invert":
            var Link = getLink(msg.attachments, args[1])
            if (!Link) return msg.reply("Image missing.")
            if (!config.EXTERNAL_HOSTING) // if hosting on your own device
                if (!isCdn(Link)) return msg.reply("Please make sure your link starts with cdn.discordapp.com, or upload your attachment instead.")

            if (!validExt(path.extname(Link))) return msg.reply(`Invalid image format.${docs}`)
            var output = newName(Link)

            return (async () => {
                let input = await jimp.read(Link)
                input.invert()
                .write(output)
                fs.stat('./' + output, async () => {
                    await msg.channel.send("**Sucessfully inverted colors! :white_check_mark:**", {files:['./' + output]})
                    .catch(()=>{msg.reply("There was an error uploading your image.")})
                    if (!config.SAVE_IMAGES) fs.unlink(output, function(){}) 
                })
            })()
        // image manipulation end

        case "rng":
            if (typeof args[1] == 'undefined' || typeof args[2] == 'undefined')
                return msg.reply(Math.floor(Math.random() * 2000000 - 1000000))
            var num = Number(args[1]), num2 = Number(args[2])
            if (isNaN(num) || isNaN(num2)) return msg.reply(`Invalid number detected.${docs}`)
            var floatFlag // if a float is detected then the number will not floor
            if (!Number.isInteger(num) || !Number.isInteger(num2)) {
                floatFlag = true
            } 
            var min = Math.min(num, num2), max = Math.max(num, num2)
            if (floatFlag) {
                var numDec = num.toString().split("."), num2Dec = num2.toString().split(".")
                var decimals // longest decimals to use as the rounding point
                if (typeof numDec[1] == 'undefined') {
                    decimals = num2Dec[1].length
                }
                else if (typeof num2Dec[1] == 'undefined') {
                    decimals = numDec[1].length
                }
                else {
                    decimals = Math.max(numDec[1].length, num2Dec[1].length)
                }
                var rand = Math.random() * (max - min) + min
                function roundNum(number, digits) {
                    var multiple = Math.pow(10, digits)
                    return Math.round(number * multiple) / multiple
                }
                return msg.reply(roundNum(rand, decimals))
            }
            else {
                return msg.reply(Math.floor(Math.random() * (max - min) + min))
            }

        case "choose":
            if (typeof args[1] == 'undefined' || typeof args[2] == 'undefined') return msg.reply(`Command usage error.${docs}`) // at least 2 args
            var choices = msg.content.substring(PREFIX.length + "choose ".length).split(" | ")
            if (choices.length < 2) return msg.reply(`At least 2 choices must be separated by vertical lines | with spaces.${docs}`)
            return msg.reply(choices[Math.floor(Math.random() * (choices.length))])

        case "gen":
        case "pass":
        case "password":
            var length = 32
            if (typeof args[1] != 'undefined') { // 32 default
                var n = Number(args[1])
                if (n > 0 && n < 2043 && Number.isInteger(n)) { // if it is provided check the number
                    length = Math.floor(Number(args[1])) // maximum length is 2042 to have proper formatting for discord
                } // who has passwords that long anyways???
                else {
                    return msg.reply(`Invalid number. The integer must be less than 2043 and greater than 0.${docs}`)
                }
            }

            function genString(LENGTH) {
                var str = ""
                for (var i = 0; i < LENGTH; i++) str += String.fromCharCode(Math.random() * 94 + 34)
                return str
            }

            var embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("New Password: Length " + length)
            .setDescription("```" + genString(length) + "```")
            return (async () => {
                var fail = false
                await msg.author.send(embed).catch(()=>{
                    fail = true
                    msg.reply("I am unable to send you a direct message. Please check your Privacy & Safety settings to allow direct messages from server members. https://i.imgur.com/HMHoPPD.png")
                })
                if (!fail && msg.guild) msg.reply("Your password has been generated. Check your direct messages from the bot.")
            })()

        case "flip":
        case "coin":
        case "conflip":
            return Math.random() * 2 == 0 ? msg.reply("Heads."):msg.reply("Tails.")

        case "poll":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`) // at least 1 arg
            var choices = false
            var question = ""
            if (!isNaN(Number(args[1]))) { // use numbers instead of check or x and parse the question accordingly
                choices = Math.floor(Number(args[1]))
                if (choices > 9 || choices < 1) {
                    msg.delete().catch(()=>{})
                    return msg.reply("Number must be less than 10 and greater than 0.").then(newMsg => {
                        setTimeout(function() {newMsg.delete().catch(()=>{})}, 1500)
                    })
                }
                question = msg.content.substring(PREFIX.length + "poll 1 ".length) // example command, question will be after these arguments
            }
            else {
                question = msg.content.substring(PREFIX.length + "poll ".length)
            }
            
            msg.delete().catch(()=>{})
            var embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Poll: " + question)
            .setDescription(`${(choices? "React to the appropriate choice number.\n":"")}Poll created by <@!${msg.author.id}>`)
            return msg.channel.send(embed).then(toReact => {
                if (choices) {
                    for (var num = 1; num <= choices; num++) {
                        switch(num) {
                            case 1: toReact.react("1️⃣").catch(()=>{}); break
                            case 2: toReact.react("2️⃣").catch(()=>{}); break
                            case 3: toReact.react("3️⃣").catch(()=>{}); break
                            case 4: toReact.react("4️⃣").catch(()=>{}); break
                            case 5: toReact.react("5️⃣").catch(()=>{}); break
                            case 6: toReact.react("6️⃣").catch(()=>{}); break
                            case 7: toReact.react("7️⃣").catch(()=>{}); break
                            case 8: toReact.react("8️⃣").catch(()=>{}); break
                            case 9: toReact.react("9️⃣").catch(()=>{})
                        }
                    }
                }
                else {
                    toReact.react("✅").catch(()=>{})
                    toReact.react("❌").catch(()=>{})
                    toReact.react("🤷").catch(()=>{})
                }
            })

        case "reverse":
            return msg.channel.send(msg.content.substring(PREFIX.length + "reverse ".length).split('').reverse().join('')).catch(()=>msg.reply("Could not reverse the message."))

        case "encode":
            var toEncode = msg.content.substring(PREFIX.length + "encode ".length)
            if (toEncode == "") return msg.reply(`String missing.${docs}`)
            var encoded = Buffer.from(toEncode)
            if (encoded.toString('base64').length > 2000) return msg.reply("String too long. Head to https://www.base64encode.org/ to encrypt longer strings.")
            return msg.channel.send(encoded.toString('base64'))
        case "decode":
            var toDecode = msg.content.substring(PREFIX.length + "decode ".length)
            if (toDecode == "") return msg.reply(`String missing.${docs}`)
            var decoded = Buffer.from(toDecode, 'base64')
            if (decoded.toString().length < 1) return msg.reply("Could not decode the string.")
            return msg.channel.send(decoded.toString())

        case "minecraft":
        case "mc":
        case "namemc":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)
            return (async () => {
                try {
                    var idFetch = await fetchJSON(`https://api.mojang.com/users/profiles/minecraft/${args[1]}`)
                    var nameHistory = await fetchJSON(`https://api.mojang.com/user/profiles/${idFetch.id}/names`)

                    var embed = new Discord.MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Minecraft User Information")
                    .addFields({name:nameHistory[0].name, value:"Original Username"})
                    for (var i = 1; i < nameHistory.length; i++) {
                        embed.addFields({name:nameHistory[i].name, value:`Changed on ${new Date(nameHistory[i].changedToAt)}`})
                    }
                    msg.channel.send(embed)
                }
                catch (e) {
                    msg.reply("Invalid username.")
                }
            })()

        case "roblox":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)

            return (async () => {
                var usernameFetch = await fetchJSON(`https://api.roblox.com/users/get-by-username/?username=${args[1]}`)
                if (usernameFetch.errorMessage == 'User not found') return msg.reply("Invalid ROBLOX username.")

                var username = usernameFetch.Username
                var uid = usernameFetch.Id
                var link = `https://roblox.com/users/${uid}/profile`
                var avatar = await fetchJSON(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${uid}&size=250x250&format=Png&isCircular=false`)
                var headshot = await fetchJSON(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${uid}&size=150x150&format=Png&isCircular=false`)

                var user = await fetchJSON(`https://api.roblox.com/users/${uid}/onlinestatus/`)
                var presence = "Last Online "
                function formatTimestamp(timestamp) {
                    // Example Timestamp: 2006-02-27T00:00:01.OTHERINFORMATION
                    // The date and time+other are split with the T.
                    // The Time and other are split with the .
                    var TSplit = timestamp.split("T") // For the date and the second half to split
                    var dotSplit = TSplit[1].split(".") // Second half split
                    return [TSplit[0], dotSplit[0]] // returns Date, Time
                }
                user.IsOnline ? presence = user.LastLocation : presence += `${formatTimestamp(user.LastOnline).join(' at ')} EST`

                var joinTS = await fetchJSON(`https://users.roblox.com/v1/users/${uid}`)
                var desc = joinTS.description
                if (desc == "") desc = "No description provided."

                var joinDate = formatTimestamp(joinTS.created).join(' at ')

                var status = await fetchJSON(`https://users.roblox.com/v1/users/${uid}/status`)
                status.status == "" ? status = "No status provided." : status = status.status

                var history = await fetchJSON(`https://users.roblox.com/v1/users/${uid}/username-history?sortOrder=Asc`)
                var nameList = []
                if (!joinTS.isBanned) { // banned users don't show past names
                    for (var i = 0; i < history.data.length; i ++) nameList.push(history.data[i].name)
                }
                nameList.length == 0? nameList = "No past names.": nameList = nameList.join(", ")

                var embed = new Discord.MessageEmbed()
                .setColor("BLUE")
                .setTitle("ROBLOX User Information")
                .setThumbnail(headshot.data[0].imageUrl)
                .addFields(
                    {name:"Username", value:username},
                    {name:"UID", value:uid.toLocaleString()},
                    {name:"Direct Link", value:link},
                    {name:"Status", value:status},
                    {name:"Description", value:desc},
                    {name:"Account Banned", value:joinTS.isBanned},
                    {name:"Presence", value:presence},
                    {name:"Join Date", value:joinDate}
                )
                if (!joinTS.isBanned) embed.addFields({name:"Past Usernames", value:nameList})
                embed.setImage(avatar.data[0].imageUrl)
                msg.channel.send(embed)
            })()
        
        case "debug":
        case "debugmode":
            if (config.DEBUGGERS.includes(msg.author.id)) {
                config.DEBUGGING = !config.DEBUGGING
                Client.user.setActivity(`${(config.DEBUGGING? "DEBUGGING | ":"")}${PREFIX}help`, {type:"PLAYING"})
                var embed = new Discord.MessageEmbed()
                .setTitle("Debug Status")
                if (config.DEBUGGING) {
                    embed.setColor("RED")
                    .setDescription("Debugging mode is now on. Command usage is restricted to debuggers.")
                }
                else {
                    embed.setColor("GREEN")
                    .setDescription("Debugging mode is now off. Command usage restrictions have been lifted.")
                }
                return msg.channel.send(embed)
            }
            else {
                return msg.reply(`You are not authorized to use the command \'${args[0]}\'.`)
            }
        
        case "saveimages":
            if (config.DEBUGGERS.includes(msg.author.id)) {
                config.SAVE_IMAGES = !config.SAVE_IMAGES
                var embed = new Discord.MessageEmbed()
                .setTitle("Save Image Status")
                if (config.SAVE_IMAGES) {
                    embed.setColor("GREEN")
                    .setDescription("Saving images is now on. The bot now has all modified images downloaded and saved locally.")
                }
                else {
                    embed.setColor("BLUE")
                    .setDescription("Saving images is now off. The bot will no longer save images locally and will immediately delete images.")
                }
                return msg.channel.send(embed)
            }
            else {
                return msg.reply(`You are not authorized to use the command \'${args[0]}\'.`)
            }

        case "external":
            if (config.DEBUGGERS.includes(msg.author.id)) {
                config.EXTERNAL_HOSTING = !config.EXTERNAL_HOSTING
                var embed = new Discord.MessageEmbed()
                .setTitle("Accepting External Images Status")
                if (config.EXTERNAL_HOSTING) {
                    embed.setColor("RED")
                    .setDescription("Accepting external images is now on. The bot now accepts images from all domains.")
                }
                else {
                    embed.setColor("BLUE")
                    .setDescription("Accepting external images is now off. The bot will no longer accept images from domains other than cdn.discordapp.com.")
                }
                return msg.channel.send(embed)
            }
            else {
                return msg.reply(`You are not authorized to use the command \'${args[0]}\'.`)
            }

        case "ip":
        case "ipinfo":
        case "website":
        case "websiteinfo":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)

            var Link = getDomain(args[1])
            if (!Link) return msg.reply(`Invalid URL / IP.${docs}`)

            return (async () => {
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

        case "whois":
            if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)

            var Link = getDomain(args[1])
            if (!Link) return msg.reply(`Invalid URL / IP.${docs}`)

            return (async () => {
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
                    if (body.length > 2045) {
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

        case "purgedms":
            if (msg.guild) {
                return msg.reply("You must use this command in a DM.")
            }
            else {
                return (async () => {
                    const dmMessages = await msg.channel.messages.fetch({ limit: 100}).catch(()=>{console.log("ERROR fetching DM messages.")})
                    dmMessages.forEach(message => {
                        if (message.author.bot) {
                            message.delete().catch(()=>{})
                        }
                    })
                })()
            }

    }
})
