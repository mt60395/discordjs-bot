module.exports = {
    handle: (input, output, msg, success, SAVE_IMAGES) => {
        const jimp = require('jimp');
        const fs = require('fs');

        (async() => {
            await msg.channel.send(success, {files:['./' + output]})
            .then(()=> { // success
                if (!SAVE_IMAGES) fs.unlink(output, function(){});
            })
            .catch(()=>{
                msg.reply("There was an error uploading your image. Resizing and attempting to try again...");
                if (input.bitmap.width > input.bitmap.height) {
                    input.resize(1920, jimp.AUTO).write(output);
                }
                else {
                    input.resize(jimp.AUTO, 1920).write(output);
                }
                const uploadhandler = require('./uploadhandler');
                uploadhandler.handle(input, output, msg, success, SAVE_IMAGES);
            })
        })();
    }
}
