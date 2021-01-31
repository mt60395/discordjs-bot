module.exports = {
    name: "invert",
    desc: "Inverts an image's colors.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `invert {link}`,
    run: (msg, Link, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        const uploadhandler = require('./uploadhandler');
        
        (async () => {
            let input = await jimp.read(Link)
            input.invert().write(output)
            fs.stat('./' + output, async () => {
                uploadhandler.handle(input, output, msg, "**Sucessfully inverted colors! :white_check_mark:**", SAVE_IMAGES);
            })
        })()
    }
}
