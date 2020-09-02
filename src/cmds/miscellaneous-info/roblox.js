module.exports = {
    name: "roblox",
    desc: "Displays information about a ROBLOX user.",
    aliases: [],
    usage: "roblox {username}",
    run: (Client, msg, args) => {
        const Discord = require('discord.js')
        const docs = " Refer to the `help` command if necessary."
        if (typeof args[1] == 'undefined') return msg.reply(`Command usage error.${docs}`)

        const fetch = require('node-fetch')
        async function fetchJSON(url) {
            const response = await fetch(url)
            return response.json()
        }

        (async () => {
            var usernameFetch = await fetchJSON(`https://api.roblox.com/users/get-by-username/?username=${args[1]}`)
            if (usernameFetch.errorMessage == 'User not found') return msg.reply("Invalid ROBLOX username.")

            var username = usernameFetch.Username
            var uid = usernameFetch.Id
            var link = `https://roblox.com/users/${uid}/profile`
            var avatar = await fetchJSON(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${uid}&size=250x250&format=Png&isCircular=false`)
            var headshot = await fetchJSON(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${uid}&size=150x150&format=Png&isCircular=false`)

            var user = await fetchJSON(`https://api.roblox.com/users/${uid}/onlinestatus/`)
            var presence = "Last Online "
            function formatTimestamp(timestamp) {
                // Example Timestamp: 2006-02-27T00:00:01.OTHERINFORMATION
                // The date and time+other are split with the T.
                // The Time and other are split with the .
                var TSplit = timestamp.split("T") // For the date and the second half to split
                var dotSplit = TSplit[1].split(".") // Second half split
                return [TSplit[0], dotSplit[0]] // returns Date, Time
            }
            user.IsOnline ? presence = user.LastLocation : presence += `${formatTimestamp(user.LastOnline).join(' at ')} EST`

            var joinTS = await fetchJSON(`https://users.roblox.com/v1/users/${uid}`)
            var desc = joinTS.description
            if (desc == "") desc = "No description provided."

            var joinDate = formatTimestamp(joinTS.created).join(' at ')

            var status = await fetchJSON(`https://users.roblox.com/v1/users/${uid}/status`)
            status.status == "" ? status = "No status provided." : status = status.status

            var history = await fetchJSON(`https://users.roblox.com/v1/users/${uid}/username-history?sortOrder=Asc`)
            var nameList = []
            if (!joinTS.isBanned) { // banned users don't show past names
                for (var i = 0; i < history.data.length; i ++) nameList.push(history.data[i].name)
            }
            nameList.length == 0? nameList = "No past names.": nameList = nameList.join(", ")

            var embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("ROBLOX User Information")
            .setThumbnail(headshot.data[0].imageUrl)
            .addFields(
                {name:"Username", value:username},
                {name:"UID", value:uid.toLocaleString()},
                {name:"Direct Link", value:link},
                {name:"Status", value:status},
                {name:"Description", value:desc},
                {name:"Account Banned", value:joinTS.isBanned},
                {name:"Presence", value:presence},
                {name:"Join Date", value:joinDate}
            )
            if (!joinTS.isBanned) embed.addFields({name:"Past Usernames", value:nameList})
            embed.setImage(avatar.data[0].imageUrl)
            msg.channel.send(embed)
        })()
    }
}