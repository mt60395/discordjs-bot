module.exports = {
    name: "choose",
    desc: "Choose between at least 2 provided strings.",
    notice: "Strings must be separated by a vertical bar ( | ).",
    aliases: [],
    usage: `choose {option} | {option2}
    
    Example usage:
    
    choose apple | orange | pear`,
    run: (Client, msg, args, config, PREFIX) => {
        const docs = " Refer to the `help` command if necessary."
        if (typeof args[1] == 'undefined' || typeof args[2] == 'undefined') return msg.reply(`Command usage error.${docs}`) // at least 2 args
        var choices = msg.content.substring(PREFIX.length + "choose ".length).split(" | ")
        if (choices.length < 2) return msg.reply(`At least 2 choices must be separated by vertical lines | with spaces.${docs}`)
        msg.reply(choices[Math.floor(Math.random() * (choices.length))])
    }
}