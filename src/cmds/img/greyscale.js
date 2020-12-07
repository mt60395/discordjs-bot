module.exports = {
    name: "greyscale",
    desc: "Removes color from an image.",
    notice: "Only accepts png and jpg/jpeg files.",
    aliases: [],
    usage: `greyscale {link}`,
    run: (msg, Link, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        
        (async () => {
            let input = await jimp.read(Link)
            input.greyscale().write(output)
            fs.stat('./' + output, async () => {
                await msg.channel.send("**Sucessfully greyscaled image! :white_check_mark:**", {files:['./' + output]})
                .catch(()=>{msg.reply("There was an error uploading your image.")})
                if (!SAVE_IMAGES) fs.unlink(output, function(){}) 
            })
        })()
    }
}
