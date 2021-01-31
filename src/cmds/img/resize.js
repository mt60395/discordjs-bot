module.exports = {
    name: "resize",
    desc: "Resizes an image. Dimensions can be combined together with an 'x' or separated.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `resize {link} [dimensions]
    
    Example usage:

    resize 1920x1080
    
    resize 1920 1080`,
    run: (msg, Link, res, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs');
        const uploadhandler = require('./uploadhandler');
        
        (async () => {
            let input = await jimp.read(Link)
            input.resize(res[0], res[1])
            .quality(50)
            .write(output)
            fs.stat('./' + output, async () => {
                uploadhandler.handle(input, output, msg, `**Sucessfully resized to ${res.join("x")}! :white_check_mark:**`, SAVE_IMAGES);
            })
        })()
    }
}
