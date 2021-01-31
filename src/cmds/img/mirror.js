module.exports = {
    name: "mirror",
    desc: "Mirrors an image horizontally, vertically, or both ways.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `mirror {link} [direction]
    
    Directions:
    - Horizontal: h, horizontal
    - Vertical: v, vertical
    - Both: b, hv, vh, both`,
    run: (msg, Link, directions, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs')
        const uploadhandler = require('./uploadhandler');
        
        var h = directions[0]
        var v = directions[1]
        var both = h && v;
        (async () => {
            let input = await jimp.read(Link)
            input.mirror(h, v).write(output)
            fs.stat('./' + output, async () => {
                uploadhandler.handle(input, output, msg, `**Sucessfully mirrored ${(both?"horizontally and vertically":h?"horizontally":"vertically")}! :white_check_mark:**`, SAVE_IMAGES);
            })
        })()
    }
}
