module.exports = {
    name: "poll",
    desc: "Creates a poll.",
    aliases: [],
    usage: `Create a poll with a check and x: poll {question}

    Create a poll with numbers from 1-9: poll {number} {question}`,
    run: (Client, msg, args, config, PREFIX) => {
        const Discord = require('discord.js')
        const docs = " Refer to the `help` command if necessary."

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
        msg.channel.send(embed).then(toReact => {
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
    }
}