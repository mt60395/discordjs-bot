module.exports = {
    name: "blur",
    desc: "Blurs an image.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `blur {OPTIONAL:link} {pixels}`,
    run: (msg, Link, r, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        
        (async () => {
            let input = await jimp.read(Link)
            input.blur(r).write(output)
            fs.stat('./' + output, async () => {
                await msg.channel.send(`**Sucessfully blurred image by ${r} pixels! :white_check_mark:**`, {files:['./' + output]})
                .catch(()=>{msg.reply("There was an error uploading your image.")})
                if (!SAVE_IMAGES) fs.unlink(output, function(){}) 
            })
        })()
    }
}