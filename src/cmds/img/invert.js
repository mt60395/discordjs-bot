module.exports = {
    name: "invert",
    desc: "Inverts an image's colors.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `With an attachment:\ninvert

    With a link:\ninvert {link}`,
    run: (msg, Link, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        
        (async () => {
            let input = await jimp.read(Link)
            input.invert()
            .write(output)
            fs.stat('./' + output, async () => {
                await msg.channel.send("**Sucessfully inverted colors! :white_check_mark:**", {files:['./' + output]})
                .catch(()=>{msg.reply("There was an error uploading your image.")})
                if (!SAVE_IMAGES) fs.unlink(output, function(){}) 
            })
        })()
    }
}