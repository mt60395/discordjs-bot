const Discord = require('discord.js')
const Client = new Discord.Client()
require('dotenv').config()
const PREFIX = process.env.PREFIX
const config = require("../config")
Client.login(process.env.BOT_TOKEN)

Client.on('ready', () => { // on bot start
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
Client.cmds = new Discord.Collection();

(function (dir = "cmds") {
    // this code only works for setups like this repo, where ./src/cmds only has folders/categories with commands inside those folders
    // DO NOT put files in ./src/cmds because there will be errors
    fs.readdir(path.join(__dirname, dir), function(err, categories) { // ./src/cmds
        categories.forEach(function(cmdType) { // array of all categories/command types: fun, img, etc.
            const commandFiles = fs.readdirSync(path.join(__dirname, dir, cmdType))
            commandFiles.forEach(function(file) {
                if (file.includes("handler")) return // for reusing functions
                var cmd = require(path.join(__dirname, dir, cmdType, file))
                cmd.category = cmdType
                Client.cmds.set(cmd.name, cmd)
            })
        })
    })
})()

const imghandler = require('./cmds/img/imghandler')

Client.on('message', msg => {
    if (!(msg.content.startsWith(PREFIX)) || msg.author.bot) return
    if (config.DEBUGGING && !config.DEBUGGERS.includes(msg.author.id)) return msg.reply("The bot is currently in debugging mode. Please temporarily refrain from using commands.")
    var args = msg.content.substring(PREFIX.length).split(" ") // only use after the prefix
    Client.cmds.forEach(cmd => {
        if (args[0] == cmd.name || cmd.aliases.includes(args[0])) { // command found
            switch(cmd.category) {
                case 'img':
                    return imghandler.handle(Client, msg, args, config)
                case 'restricted':
                    if (!(config.DEBUGGERS.includes(msg.author.id)))
                        return msg.reply(`You are not authorized to use the command \'${args[0]}\'.`)
                default: cmd.run(Client, msg, args, config, PREFIX)
            }
        }
    })
})
