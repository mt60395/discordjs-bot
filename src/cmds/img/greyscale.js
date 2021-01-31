module.exports = {
    name: "greyscale",
    desc: "Removes color from an image.",
    notice: "Only accepts png and jpg/jpeg files.",
    aliases: [],
    usage: `greyscale {link}`,
    run: (msg, Link, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        const uploadhandler = require('./uploadhandler');
        
        (async () => {
            let input = await jimp.read(Link)
            input.greyscale().write(output)
            fs.stat('./' + output, async () => {
                uploadhandler.handle(input, output, msg, "**Sucessfully greyscaled image! :white_check_mark:**", SAVE_IMAGES);
            })
        })()
    }
}
