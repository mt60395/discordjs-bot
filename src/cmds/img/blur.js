module.exports = {
    name: "blur",
    desc: "Blurs an image.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `blur {link} [pixels]`,
    run: (msg, Link, r, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        const uploadhandler = require('./uploadhandler');
        
        (async () => {
            let input = await jimp.read(Link)
            input.blur(r).write(output)
            fs.stat('./' + output, async () => {
                uploadhandler.handle(input, output, msg, `**Sucessfully blurred image by ${r} pixels! :white_check_mark:**`, SAVE_IMAGES);
            })
        })()
    }
}
