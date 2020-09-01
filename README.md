# discordjs-bot
## Description
This is a multipurpose Discord bot using discord.js.

Made mainly for my needs, it has: a server whitelist, discord user lookup, simple image manipulation, poll creation, and many other various commands.

## Commands and Documentation
### help
Provides a link to this page for documentation.

*Aliases: cmds, docs*
### info
Provides information about the bot.
### uptime
Provides information about the bot uptime.

*Alias: status*
### user
Provides information about a user from a user ID or mention. https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

*Alias: userinfo*

```user {userid}```

```user {@user}```

### server
Display informations about the server.

*Alias: serverinfo*
### avatar
Display a user's avatar / profile picture from a user ID or mention. https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

```avatar {userid}```

```avatar {@user}```

### rotate
Rotates an image a specified degree counter-clockwise. Only accepts png, jpg, and jpeg files.

*With an attachment (files uploaded with the command as a comment):* ```rotate {degrees}```

*With a link:* ```rotate {link} {degrees}```

### resize
Resizes an image. Dimensions can be combined together with an 'x' or separated. Only accepts png, jpg, and jpeg files.

*With an attachment (files uploaded with the command as a comment):* ```resize {dimensions}```

*With a link:* ```resize {link} {dimensions}```

```resize 1920x1080```

```resize 1920 1080```

### mirror
Mirrors an image horizontally, vertically, or both ways. Only accepts png, jpg, and jpeg files.

Valid directions:

- Horizontal: h, horizontal
- Vertical: v, vertical
- Both: b, hv, vh, both

*With an attachment (files uploaded with the command as a comment):* ```mirror {direction}```

*With a link:* ```mirror {link} {direction}```

### invert
Inverts an image's colors. Only accepts png, jpg, and jpeg files.

*With an attachment (files uploaded with the command as a comment):* ```invert```

*With a link:* ```invert {link}```

### rng
Random number generator. Providing a minimum + maximum number is optional. It is -1000000 and 1000000 by default.

```rng {min} {max}```

### choose
Choose between at least 2 provided strings. They must be separated by a vertical bar, | (this is to provide support for strings with spaces).

```choose {option} | {option2}```

```choose apple | orange | pear```

### gen
Password generator.

Generates a password and sends it by DM. The default length is 32 if you don't provide one for input.

*Aliases: pass, password*

```gen 16```

### flip
Flips a coin.

*Aliases: coin, coinflip*

### poll
Creates a poll. 

*Option 1: Create a poll with a check and x:* ```poll {question}```

*Option 2: Create a poll with numbers from 1-9:* ```poll {number} {question}```

### reverse
Reverses a provided string.

```reverse {string}```

### encode
Converts a string to base64 encoding.

```encode {string}```

### decode
Converts a string from base64 encoding.

```decode {string}```

### namemc
Display a history of past Minecraft usernames given a provided username.

```namemc {username}```

*Aliases: mc, minecraft*

### roblox
Displays information about a ROBLOX user.

```roblox {username}```

### website
Displays information about a website or IP.

```website {website/ip}```

*Aliases: websiteinfo, ip, ipinfo*

### whois
Displays information about a WHOIS lookup for a specified domain.

```whois {website}```

### purgedms
Purge 100 direct messages from the bot. This must be used in a DM channel with the bot.

## Restricted commands
These commands are restricted to whitelisted user IDs labeled as DEBUGGERS in the config file.

### debug
Toggles the debugging mode, which restricts access to whitelisted debuggers.

*Alias: debugmode*

### saveimages
Toggles saving images. If an upload error occurs, the image is still stored locally.

### external
Toggles accepting images from domains other than cdn.discordapp.com.

## Installation
- Create a new application: https://discord.com/developers/applications
- Create the bot invite link: https://discordapi.com/permissions.html
- Invite the bot to a server that you want it to be in.
- Put your bot token in the BOT_TOKEN field located in the .env file.
- Modify the config.json file to fit your needs. Add your whitelisted guild IDs and such. Commands like debugmode/saveimages won't write to the JSON file, but the config will have the default options once the bot restarts.
- Change your current directory to the folder in the terminal.
- Install the necessary node modules with ```npm install```.
- Start the bot with node.

Please note the bot requires a restart before joining a newly whitelisted guild.
