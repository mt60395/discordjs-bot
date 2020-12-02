module.exports = {
    name: "youtube",
    desc: "Adds a timestamp to a YouTube link. Provide it in seconds or in an **H:M:S** format.",
    notice: "Leading zeros aren't necessary.",
    aliases: ['yt', 'time', 'timestamp'],
    usage: "youtube {link} {H:M:S}",
    run: (Client, msg, args) => {
        const docs = " Refer to the `help` command if necessary."
        if (typeof args[1] == 'undefined' || typeof args[2] == 'undefined') {
            return msg.reply(`Command usage error.${docs}`)
        }
        if (!args[2].includes(":")) {
            return msg.channel.send(`${args[1]}&t=${args[2]}`)
        }
        times = args[2].split(":").reverse()
        if (times.length > 3) { // S:M:H
            return msg.reply(`Too many numbers provided.${docs}`)
        }
        seconds = 0
        for (var i = 0; i < times.length; i++) {
            n = Number(times[i])
            if (!Number.isInteger(n) || ((i == 0 || i == 1) && n > 59) || (i == 2 && n > 12)){
                return msg.reply(`Invalid time.${docs}`) 
            }
            switch(i) {
                case 1: n *= 60; break // 1 minute = 60 seconds
                case 2: n *= 3600 // 1 hour = 3600 seconds
            }
            seconds += n;
        }
        msg.channel.send(`${args[1]}&t=${seconds}`)
    }
}