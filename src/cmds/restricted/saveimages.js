module.exports = {
    name: "saveimages",
    desc: "Toggles saving images. If an upload error occurs, the image is still stored locally.",
    aliases: [],
    run: (Client, msg, args, config) => {
        const Discord = require('discord.js')
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
        msg.channel.send(embed)
    }
}