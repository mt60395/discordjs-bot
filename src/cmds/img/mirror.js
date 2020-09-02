module.exports = {
    name: "mirror",
    desc: "Mirrors an image horizontally, vertically, or both ways.",
    notice: "Only accepts png, jpg, and jpeg files.",
    aliases: [],
    usage: `Valid directions:
    - Horizontal: h, horizontal
    - Vertical: v, vertical
    - Both: b, hv, vh, both
    
    With an attachment:\nmirror {direction}

    With a link:\nmirror {link} {direction}`,
    run: (msg, Link, directions, output, SAVE_IMAGES) => {
        const jimp = require('jimp')
        const fs = require('fs')

        var h = directions[0]
        var v = directions[1]
        var both = h && v;
        (async () => {
            let input = await jimp.read(Link)
            input.mirror(h, v).write(output)
            fs.stat('./' + output, async () => {
                await msg.channel.send(`**Sucessfully mirrored ${(both?"horizontally and vertically":h?"horizontally":"vertically")}! :white_check_mark:**`, {files:['./' + output]})
                .catch(()=>{msg.reply("There was an error uploading your image.")})
                if (!SAVE_IMAGES) fs.unlink(output, function(){}) 
            })
        })()
    }
}