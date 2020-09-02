module.exports = {
    name: "rotate",
    desc: "Rotates an image a specified degree counter-clockwise.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `With an attachment:\nrotate {degrees}

    With a link:\nrotate {link} {degrees}`,
    run: (msg, Link, degree, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');

        (async () => {
            let input = await jimp.read(Link)
            input.rotate(degree).write(output)
            fs.stat('./' + output, async () => {
                await msg.channel.send(`**Sucessfully rotated ${degree} degrees! :white_check_mark:**`, {files:['./' + output]})
                .catch(()=>{msg.reply("There was an error uploading your image.")})
                if (!SAVE_IMAGES) fs.unlink(output, function(){}) 
            })
        })()
    }
}