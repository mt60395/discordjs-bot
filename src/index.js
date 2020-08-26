const Discord = require('discord.js')
const Client = new Discord.Client()
require('dotenv').config()
const PREFIX = process.env.PREFIX
const config = require("../config")
Client.login(process.env.BOT_TOKEN)

Client.on('ready', () => {
    console.log("Server count: " + Client.guilds.cache.size)
    Client.guilds.cache.forEach(g => {
        console.log(g.id)
        if (!config.GUILDS.includes(g.id)){ // if not whitelisted
            g.leave()
            console.log("The client has left a non whitelisted server.")
        }
    })
})

Client.on("guildCreate", async g => {
    g.leave()
    console.log("The client has left after joining a non whitelisted server.")
})

const fs = require('fs')
const Jimp = require('jimp')
const fetch = require('node-fetch')

async function getData(url) {
    const response = await fetch(url)
    return response.json()
}

function randColor() { // better colors for the embeds
    var colors = ["AQUA","GREEN","BLUE","PURPLE","GOLD","ORANGE","RED","DARK_PURPLE","DARK_GOLD","LUMINOUS_VIVID_PINK","DARK_VIVID_PINK"]
    return colors[Math.floor(Math.random() * colors.length)]
}

function formatID(id) {
    // input: discord user id
    // returns it fixed if it's a mention: <@!uid> --> uid
    if (id.substring(0, 3) == '<@!') id = id.substring(3)
    if (id.substring(id.length - 1) == '>') id = id.substring(0, id.length-1)
    return id
}

function getLink(attachments, arg) {
    if (attachments.size > 0) {
        // console.log(msg.attachments)
        return `${attachments.first().url}`
    }
    else if (arg.startsWith('http')) { // uses arg if attachment is not present
        return arg
    }
    return 0
}

function isCdn(Link) {
    // checks if an image is a cdn.discordapp.com link if you are hosting on your own PC to not get IP grabbed
    var split = Link.split("://") // {protocol, domain}
    switch(split[0]) {
        case "http":case"https":
            if (split[1].startsWith("cdn.discordapp.com")) return true
        default: return false
    }
}

function handleImageLink(Link) {
    // input: link of an attachment or direct url to an image
    // returns an array with the original name of the file and the extension, split
    var slashSplit = Link.split("/") // the name.extension is after the final slash
    var name = slashSplit[slashSplit.length - 1] // String: name.extension
    return name.split(".") // returns {name, extension}
}

function validExt(ext) {
    // input: extension
    // returns if the extension is png, jpg, or jpeg
    switch(ext.toLowerCase()) { // .PNG is valid but uppercase, convert it to lowercase
        case "png":case"jpg":case"jpeg":return true
    }
    return false
}

function formatTime(ms) { // converts time from milliseconds because discord.js provides uptime in ms
    var days = Math.floor(ms/86400000)
    var hours = Math.floor((ms/3600000) % 24)
    var minutes = Math.floor((ms/60000) % 60)
    var seconds = ((ms % 60000) / 1000).toFixed(0)
    return days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds"
}

const docs = " Documentation: https://github.com/mt60395/discordjs-bot/blob/master/README.md"

Client.on('message', msg => {
    if (!(msg.content.substring(0, 1) == PREFIX)) return // prefix check
    if (msg.author.bot) return // bot recursion check
    var args = msg.content.substring(PREFIX.length).split(" ") // only use after the prefix
    switch(args[0]) {
        case "help":
        case "h":
        case "cmds":
            var embed = new Discord.MessageEmbed()
            .setColor(randColor())
            .setTitle("Commands and documentation")
            .setDescription("https://github.com/mt60395/discordjs-bot/blob/master/README.md")
            return msg.channel.send(embed)

        case "status":
        case "uptime":
            return msg.channel.send("**Uptime: " + formatTime(Client.uptime) + "**")

        case "info":
            var embed = new Discord.MessageEmbed()
            .setColor(randColor())
            .setTitle("Bot Information")
            .addFields(
                {name:"Creator", value:"https://github.com/mt60395/"},
                {name:"GitHub Repository", value:"https://github.com/mt60395/discordjs-bot"}
            )
            return msg.channel.send(embed)

        case "user":
        case "userinfo":
            var id = formatID(typeof args[1] == 'undefined'? msg.author.id:args[1])
            // if id is not explicitly stated then use the message sender's id
            if (Number(id) > 0 && (id.length == 18)) {
                Client.users.fetch(id).then(Data => 
                    msg.channel.send(embed = new Discord.MessageEmbed()
                        .setColor(randColor())
                        .setAuthor(Data.username + "#" + Data.discriminator, Data.displayAvatarURL({format:"png",dynamic:true}))
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
                .catch(e=>msg.reply("You must provide a valid discord user id." + docs))
            }
            else {
                return msg.reply("You must provide a valid discord user id." + docs)
            }
        break

        case "server":
        case "serverinfo":
            var guild = msg.guild
            var embed = new Discord.MessageEmbed()
            .setColor(randColor())
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
                Client.users.fetch(id).then(Data => 
                    msg.channel.send(Data.displayAvatarURL({format:"png",dynamic:true}))
                )
                .catch(e=>msg.reply("You must provide a valid discord user id." + docs))
            }
            else {
                return msg.reply("You must provide a valid discord user id." + docs)
            }
        break

        // image manipulation start
        case "rotate":
            if (typeof args[1] == 'undefined') return msg.reply("Command usage error." + docs) // at least 1 arg

            var Link = getLink(msg.attachments, args[1])
            if (Link == 0) return msg.reply("Attachment missing.")

            if (!config.EXTERNAL_HOSTING) { // if hosting on your own device
                if (!isCdn(Link)) return msg.reply("Please make sure your link starts with cdn.discordapp.com, or upload your attachment instead.")
            }

            var degree
            msg.attachments.size > 0 ? degree = Number(args[1]):degree = Number(args[2])
            // only argument is the direction (attachment provided) or 2 arguments, and first is a link so the second is the direction

            if (degree > 0 && degree < 360) { // Degree Number must be greater than 0, NaN is denied
                var splitLink = handleImageLink(Link) // name and extension
                if (!validExt(splitLink[1])) return msg.reply("Invalid image format." + docs)

                var output = splitLink[0] + '.png' // final output name

                async function rotateFunc() { 
                    let input = await Jimp.read(Link)
                    input.rotate(degree).write(output)
                    fs.exists('./' + output, () => {
                        msg.channel.send("**Sucessfully rotated " + degree + " degrees! :white_check_mark:**", {files:['./' + output]}),
                        setTimeout(function() {
                            fs.unlink(output, function(err){if(err) throw err}) 
                        }, 1500) // deleting too quickly will result in the file not actually sending
                    })
                }
                rotateFunc()
            }
            else {
                return msg.reply("Invalid degree. The degree must be greater than 0 and less than 360." + docs)
            }
        break

        case "resize":
        case "stretch":
            if (typeof args[1] == 'undefined') return msg.reply("Command usage error." + docs) // at least 1 arg

            var Link = getLink(msg.attachments, args[1])
            if (Link == 0) return msg.reply("Attachment missing.")
            if (!config.EXTERNAL_HOSTING) { // if hosting on your own device
                if (!isCdn(Link)) return msg.reply("Please make sure your link starts with cdn.discordapp.com, or upload your attachment instead.")
            }

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
                resolution = resolution + "x" + resolutionY // for the success message
            }

            // resolution/dimension validity checks
            res[0] = Number(res[0]); res[1] = Number(res[1])
            var bool = res[0] > 1 && res[0] <= 4096, bool2 = res[1] > 1 && res[1] <= 4096 // 1 pixel isn't clickable on Discord and you don't want more than 4k
            var bool3 = Number.isInteger(res[0]), bool4 = Number.isInteger(res[1]) // JIMP errors with non integers

            if (bool && bool2 && bool3 && bool4){
                var splitLink = handleImageLink(Link) // name and extension
                if (!validExt(splitLink[1])) return msg.reply("Invalid image format." + docs)
                var output = splitLink[0] + '.png' // final output name

                async function resizeFunc() { 
                    let input = await Jimp.read(Link)
                    input.resize(res[0], res[1])
                    .quality(50)
                    .write(output)
                    fs.exists('./' + output, () => {
                        msg.channel.send("**Sucessfully resized to " + resolution + "! :white_check_mark:**", {files:['./' + output]}),
                        setTimeout(function() {
                            fs.unlink(output, function(err){if(err) throw err}) 
                        }, 1500) // deleting too quickly will result in the file not actually sending
                    })
                }
                resizeFunc()
            }
            else {
                return msg.reply("Invalid dimension(s). Desired side length must be greater than 1 pixel and less than 4096 pixels." + docs)
            }
        break

        case "mirror":
            if (typeof args[1] == 'undefined') return msg.reply("Command usage error." + docs) // at least 1 arg

            var Link = getLink(msg.attachments, args[1])
            if (Link == 0) return msg.reply("Attachment missing.")
            if (!config.EXTERNAL_HOSTING) { // if hosting on your own device
                if (!isCdn(Link)) return msg.reply("Please make sure your link starts with cdn.discordapp.com, or upload your attachment instead.")
            }

            var dir = ""
            msg.attachments.size > 0 ? dir = args[1]:dir = args[2]
            // only argument is the direction (attachment provided) or 2 arguments, and first is a link so the second is the direction

            if (typeof dir == 'undefined') return msg.reply("Invalid direction. It must be horizontal or vertical." + docs)

            var validDir = false, h = false, v = false, both = false // variable both is for the message reply, other vars are for direction/validity checking
            switch(dir.toLowerCase()) { // checks if the direction is valid
                case "h":case "horizontal":
                    validDir = true; h = true
                break
                case "v":case "vertical":
                    validDir = true; v = true
                break
                case "both":
                    validDir = true; both = true; h = true; v = true
            }

            if (validDir) {
                var splitLink = handleImageLink(Link) // name and extension
                if (!validExt(splitLink[1])) return msg.reply("Invalid image format." + docs)
                var output = splitLink[0] + '.png' // final output name

                async function mirrorFunc() { 
                    let input = await Jimp.read(Link)
                    input.mirror(h, v)
                    .write(output)
                    fs.exists('./' + output, () => {
                        msg.channel.send("**Sucessfully mirrored " + (both?"horizontally and vertically":h?"horizontally":"vertically") + "! :white_check_mark:**", {files:['./' + output]}),
                        setTimeout(function() {
                            fs.unlink(output, function(err){if(err) throw err}) 
                        }, 1500) // deleting too quickly will result in the file not actually sending
                    })
                }
                mirrorFunc()
            }
            else {
                return msg.reply("Invalid direction. It must be horizontal, vertical, or both." + docs)
            }
        break
        // image manipulation end

        case "rng":
            if (typeof args[1] == 'undefined' || typeof args[2] == 'undefined')
                return msg.reply(Math.floor(Math.random() * 2000000 - 1000000))
            var num = Number(args[1]), num2 = Number(args[2])
            if (isNaN(num) || isNaN(num2)) return msg.reply("Invalid number detected." + docs)
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
            if (typeof args[1] == 'undefined' || typeof args[2] == 'undefined') return msg.reply("Command usage error." + docs) // at least 2 args
            var choices = msg.content.substring(PREFIX.length + "choose ".length).split(" | ")
            if (choices.length < 2) return msg.reply("At least 2 choices must be separated by vertical lines | with spaces." + docs)
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
                    return msg.reply("Invalid number. The integer must be less than 2043 and greater than 0." + docs)
                }
            }

            function newPass(str) { // recursive string generation :sunglasses:
                if (str.length < length) {
                    str += String.fromCharCode(Math.random() * 94 + 34)
                    return newPass(str)
                }
                return str
            }

            var embed = new Discord.MessageEmbed()
            .setColor(randColor())
            .setTitle("New Password: Length " + length)
            .setDescription("```" + newPass("") + "```")
            async function dmEmbed() {
                var fail = false
                await msg.author.send(embed).catch(e=>{
                    fail = true
                    msg.reply("I am unable to send you a direct message. Please check your Privacy & Safety settings to allow direct messages from server members.")
                })
                if (!fail) msg.reply("Your password has been generated. Check your direct messages from the bot.")
            }
            dmEmbed()
        break

        case "flip":
        case "coin":
        case "conflip":
            return Math.random() * 2 == 0 ? msg.reply("Heads."):msg.reply("Tails.")

        case "8ball": // https://en.wikipedia.org/wiki/Magic_8-Ball#Possible_answers
            var num = Math.floor(Math.random() * 4) // 20 possible answers but chances for each type are 2/4, 1/4, and 1/4
            ans = []
            switch(num) {
                case 0:
                case 1: // positive cases are 2/4 chance or 50%
                    ans = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes."]
                break

                case 2: // non-committal or uncertain cases
                    ans = ["Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again."]
                break

                default: // negative cases
                    ans = ["Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."]
            }
            return msg.reply(ans[Math.floor(Math.random() * ans.length)])

        case "poll":
            if (typeof args[1] == 'undefined') return msg.reply("Command usage error." + docs) // at least 1 arg
            var choices = false
            var question = ""
            if (!isNaN(Number(args[1]))) { // use numbers instead of check or x and parse the question accordingly
                choices = Math.floor(Number(args[1]))
                if (choices > 9 || choices < 1) {
                    msg.delete()
                    return msg.reply("Number must be less than 10 and greater than 0.").then(newMsg => {
                        setTimeout(function() {newMsg.delete()}, 1500)
                    })
                }
                question = msg.content.substring(PREFIX.length + "poll 1 ".length) // example command, question will be after these arguments
            }
            else {
                question = msg.content.substring(PREFIX.length + "poll ".length)
            }
            
            msg.delete()
            var embed = new Discord.MessageEmbed()
            .setColor(randColor())
            .setTitle("Poll: " + question)
            .setDescription((choices? "React to the appropriate choice number.\n":"") + "Poll created by " + "<@!" + msg.author.id + ">")
            return msg.channel.send(embed).then(toReact => {
                if (choices) {
                    for (var num = 1; num <= choices; num++) {
                        switch(num) {
                            case 1: return toReact.react("1️⃣")
                            case 2: return toReact.react("2️⃣")
                            case 3: return toReact.react("3️⃣")
                            case 4: return toReact.react("4️⃣")
                            case 5: return toReact.react("5️⃣")
                            case 6: return toReact.react("6️⃣")
                            case 7: return toReact.react("7️⃣")
                            case 8: return toReact.react("8️⃣")
                            case 9: return toReact.react("9️⃣")
                        }
                    }
                }
                else {
                    toReact.react("✅")
                    toReact.react("❌")
                    toReact.react("🤷")
                }
            })

        case "reverse":
            return msg.channel.send(msg.content.substring(PREFIX.length + "reverse ".length).split('').reverse().join('')).catch(e=>msg.reply("Could not reverse the message."))

        case "encode":
            if (msg.content.substring(PREFIX.length + "encode ".length) == "") return msg.reply("String missing." + docs)
            var b = new Buffer(msg.content.substring(PREFIX.length + "encode ".length))
            if (b.toString('base64').length > 2000) return msg.reply("String too long. Head to https://www.base64encode.org/ to encrypt longer strings.")
            return msg.channel.send(b.toString('base64'))
        case "decode":
            if (msg.content.substring(PREFIX.length + "decode ".length) == "") return msg.reply("String missing." + docs)
            var b = new Buffer(msg.content.substring(PREFIX.length + "decode ".length), 'base64')
            return msg.channel.send(b.toString())

        case "minecraft":
        case "mc":
        case "namemc":
            if (typeof args[1] == 'undefined') return msg.reply("Command usage error." + docs)
            async function MinecraftLookup() {
                try {
                    var idFetch = await getData("https://api.mojang.com/users/profiles/minecraft/" + args[1])
                    var nameHistory = await getData("https://api.mojang.com/user/profiles/" + idFetch.id + "/names")

                    var embed = new Discord.MessageEmbed()
                    .setColor(randColor())
                    .setTitle("Minecraft User Information")
                    .addFields({name:nameHistory[0].name, value:"Original Username"})
                    for (var i = 1; i < nameHistory.length; i++) {
                        embed.addFields({name:nameHistory[i].name, value:"Changed on " + new Date(nameHistory[i].changedToAt)})
                    }
                    msg.channel.send(embed)
                }
                catch (e) {
                    msg.reply("Invalid username.")
                }
            }
            return MinecraftLookup()

        case "roblox":
            if (typeof args[1] == 'undefined') return msg.reply("Command usage error." + docs)

            async function ROBLOXLookup() {
                var usernameFetch = await getData("https://api.roblox.com/users/get-by-username/?username=" + args[1])
                if (usernameFetch.errorMessage == 'User not found') return msg.reply("Invalid ROBLOX username.")

                var username = usernameFetch.Username
                var uid = usernameFetch.Id
                var link = "https://roblox.com/users/" + uid + "/profile"
                var avatar = await getData("https://thumbnails.roblox.com/v1/users/avatar?userIds=" + uid + "&size=250x250&format=Png&isCircular=false")
                var headshot = await getData("https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" + uid + "&size=150x150&format=Png&isCircular=false")

                var user = await getData("https://api.roblox.com/users/" + uid + "/onlinestatus/")
                var presence = "Last Online "
                function formatTimestamp(timestamp) {
                    // Example Timestamp: 2006-02-27T00:00:01.OTHERINFORMATION
                    // The date and time+other are split with the T.
                    // The Time and other are split with the .
                    var TSplit = timestamp.split("T") // For the date and the second half to split
                    var dotSplit = TSplit[1].split(".") // Second half split
                    return [TSplit[0], dotSplit[0]] // returns Date, Time
                }
                user.IsOnline ? presence = user.LastLocation : presence += formatTimestamp(user.LastOnline).join(' at ') + " EST"

                var joinTS = await getData("https://users.roblox.com/v1/users/" + uid)
                var desc = joinTS.description
                if (desc == "") desc = "No description provided."

                var joinDate = formatTimestamp(joinTS.created).join(' at ')

                var status = await getData("https://users.roblox.com/v1/users/" + uid + "/status")
                status.status == "" ? status = "No status provided." : status = status.status

                var history = await getData("https://users.roblox.com/v1/users/" + uid + "/username-history?sortOrder=Asc")
                var nameList = []
                if (!joinTS.isBanned) { // banned users don't show past names
                    for (var i = 0; i < history.data.length; i ++) nameList.push(history.data[i].name)
                }
                nameList.length == 0? nameList = "No past names.": nameList = nameList.join(", ")

                var embed = new Discord.MessageEmbed()
                .setColor(randColor())
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
            }
            return ROBLOXLookup()
    }
})
