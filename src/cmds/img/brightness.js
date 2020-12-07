module.exports = {
    name: "brightness",
    desc: "Adjusts the brightness of an image.",
    notice: "Only accepts png and jpg/jpeg files.",
    aliases: [],
    usage: `brightness {link} [percentage]`,
    run: (msg, Link, p, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        
        (async () => {
            let input = await jimp.read(Link)
            input.brightness(p / 100).write(output)
            fs.stat('./' + output, async () => {
                await msg.channel.send(`**Sucessfully adjusted brightness by ${p}%! :white_check_mark:**`, {files:['./' + output]})
                .catch(()=>{msg.reply("There was an error uploading your image.")})
                if (!SAVE_IMAGES) fs.unlink(output, function(){}) 
            })
        })()
    }
}
