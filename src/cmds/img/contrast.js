module.exports = {
    name: "contrast",
    desc: "Adjusts the contrast of an image.",
    notice: "Only accepts png and jpg/jpeg files.",
    aliases: [],
    usage: `contrast {link} [percentage]`,
    run: (msg, Link, p, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        const uploadhandler = require('./uploadhandler');
        
        (async () => {
            let input = await jimp.read(Link)
            input.contrast(p / 100).write(output)
            fs.stat('./' + output, async () => {
                uploadhandler.handle(input, output, msg, `**Sucessfully adjusted contrast by ${p}%! :white_check_mark:**`, SAVE_IMAGES);
            })
        })()
    }
}
