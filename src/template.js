module.exports = {
    name: "",
    desc: "",
    notice: "", // optional
    aliases: [], // aliases is required
    usage: `This is
    a multiline comment.
    
    Example usage:
    
    `,
    dm: false,
    run: (Client, msg, args, config, PREFIX) => { // remove unnecessary parameters
        const docs = " Refer to the `help` command if necessary."
    }
}