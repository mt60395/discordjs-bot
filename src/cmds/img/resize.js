module.exports = {
    name: "resize",
    desc: "Resizes an image. Dimensions can be combined together with an 'x' or separated.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `With an attachment:\nresize {dimensions}

    With a link:\nresize {link} {dimensions}
    
    Example usage:

    resize 1920x1080
    
    resize 1920 1080`,
    run: (msg, Link, res, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');

        (async () => {
            let input = await jimp.read(Link)
            input.resize(res[0], res[1])
            .quality(50)
            .write(output)
            fs.stat('./' + output, async () => {
                await msg.channel.send(`**Sucessfully resized to ${res.join("x")}! :white_check_mark:**`, {files:['./' + output]})
                .catch(()=>{msg.reply("There was an error uploading your image.")})
                if (!SAVE_IMAGES) fs.unlink(output, function(){}) 
            })
        })()
    }
}