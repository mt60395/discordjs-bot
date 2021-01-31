module.exports = {
    name: "rotate",
    desc: `Rotates an image a specified degree counter-clockwise. Specify the direction "left" or "right" for 90 and 270 degrees, respectively`,
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `rotate {link} [degrees/direction]`,
    run: (msg, Link, degree, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        const uploadhandler = require('./uploadhandler');

        (async () => {
            let input = await jimp.read(Link)
            input.rotate(degree).write(output)
            fs.stat('./' + output, async () => {
                uploadhandler.handle(input, output, msg, `**Sucessfully rotated ${degree} degrees! :white_check_mark:**`, SAVE_IMAGES);
            })
        })()
    }
}
