module.exports = {
    name: "coinflip",
    desc: "Flips a coin.",
    aliases: ['flip', 'coin'],
    run: (Client, msg) => {
        Math.floor(Math.random() * 2) == 0 ? msg.reply("Heads."):msg.reply("Tails.")
    }
}