module.exports = {
    name: "rng",
    desc: "Random number generator.",
    notice: "Providing a minimum + maximum number is optional. It is -1000000 and 1000000 by default if you are missing one or both of the arguments.",
    aliases: [],
    usage: "rng {OPTIONAL:min} {OPTIONAL:max}",
    run: (Client, msg, args) => {
        const docs = " Refer to the `help` command if necessary."
        if (typeof args[1] == 'undefined' || typeof args[2] == 'undefined') {
            return msg.reply(Math.random() * 2000000 - 1000000)
        }
        var num = Number(args[1]), num2 = Number(args[2])
        if (isNaN(num) || isNaN(num2)) return msg.reply(`Invalid number detected.${docs}`)
        var floatFlag // if a float is detected then the number will not floor
        if (!Number.isInteger(num) || !Number.isInteger(num2)) {
            floatFlag = true
        } 
        var min = Math.min(num, num2), max = Math.max(num, num2)
        if (floatFlag) {
            var numDec = num.toString().split("."), num2Dec = num2.toString().split(".")
            var decimals // longest decimals to use as the rounding point
            if (typeof numDec[1] == 'undefined') {
                decimals = num2Dec[1].length
            }
            else if (typeof num2Dec[1] == 'undefined') {
                decimals = numDec[1].length
            }
            else {
                decimals = Math.max(numDec[1].length, num2Dec[1].length)
            }
            var rand = Math.random() * (max - min) + min
            function roundNum(number, digits) {
                var multiple = Math.pow(10, digits)
                return Math.round(number * multiple) / multiple
            }
            msg.reply(roundNum(rand, decimals))
        }
        else {
            msg.reply(Math.floor(Math.random() * (max - min) + min))
        }
    }
}