# discordjs-bot
This is a multipurpose Discord bot using discord.js.

Made mainly for my needs, it has: discord user lookup, simple image manipulation, poll creation, and many other various commands.

## Info Commands

#### help
Provides a link to this page for documentation. Use ```help``` with a command for information about its usage.

    help {OPTIONAL:command}
    
*Aliases: cmds, docs*

#### info
Provides information about the bot.
#### status
Provides information about the bot status.

*Alias: uptime*

#### user
Provides information about a user from a user ID or mention. https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

    user {OPTIONAL:userid}

    user {OPTIONAL:@user}

*Alias: userinfo*

#### serverinfo
Display informations about the server.

*Alias: server*

#### avatar
Display a user's avatar / profile picture from a user ID or mention. https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-

    avatar {OPTIONAL:userid}

    avatar {OPTIONAL:@user}

## Image Manipulation
Image manipulation commands only accept png and jpg/jpeg files.

#### rotate
Rotates an image a specified degree counter-clockwise.

    rotate {OPTIONAL:link} {degrees}

#### resize
Resizes an image. Dimensions can be combined together with an 'x' or separated.

    resize {OPTIONAL:link} {dimensions}

Example usage:

    resize 1920x1080

    resize 1920 1080

#### mirror
Mirrors an image.

    mirror {OPTIONAL:link} {direction}

Directions: 
- Horizontal: h, horizontal
- Vertical: v, vertical
- Both: b, hv, vh, both

#### invert
Inverts an image's colors.

    invert {OPTIONAL:link}

#### blur
Blurs an image.

    blur {OPTIONAL:link} {pixels}

#### brightness
Adjusts the brightness of an image.

    brightness {OPTIONAL:link} {percentage}

#### contrast
Adjusts the contrast of an image.

    contrast {OPTIONAL:link} {percentage}

#### greyscale
Removes color from an image.

    greyscale {OPTIONAL:link}

## Fun Commands

#### rng
Random number generator. Providing a minimum + maximum number is optional. It is -1000000 and 1000000 by default if you are missing one or both of the arguments.

    rng {OPTIONAL:min} {OPTIONAL:max}

#### choose
Choose between at least 2 provided strings. Strings must be separated by a vertical bar ( | ).

    choose {option} | {option2}

    choose apple | orange | pear

#### youtube
Adds a timestamp to a YouTube link. Provide it in seconds or in a **H:M:S** format. Leading zeros aren't necessary.

    youtube {link} {H:M:S}

*Aliases: yt, time, timestamp*

#### gen
Generates a password up to 2042 characters and sends it by DM. The default length is 32 if you don't provide one for input.

    gen {OPTIONAL:length}
    
*Aliases: pass, password*

#### coinflip
Flips a coin.

*Aliases: flip, coin*

#### poll
Creates a poll. Provide a number if you want numbered options. 

    poll {OPTIONAL:number} {question}

#### reverse
Reverses a provided string.

    reverse {string}

#### encode
Converts a string to base64 encoding.

    encode {string}

#### decode
Converts a string from base64 encoding.

    decode {string}

## Miscellaneous Info

#### namemc
Display a history of past Minecraft usernames given a provided username.

    namemc {username}

*Aliases: mc, minecraft*

#### roblox
Displays information about a ROBLOX user.

    roblox {username}

#### website
Displays information about a website or IP. Only accepts full website addresses with http(s) prepended, and IPv4 or IPv6 addresses.

    website {website/ip}

*Aliases: websiteinfo, ip, ipinfo*

#### whois
Displays information about a WHOIS lookup for a specified domain.

    whois {website}

## Miscellaneous

#### purgedms
Purge up to 100 direct messages from the bot. This must be used in a DM channel with the bot.

#### purge
Purges up to 100 messages. Only users with MANAGE_MESSAGES permissions are allowed to use this command.

    purge {amount}

## Restricted Commands
These commands are restricted to whitelisted user IDs labeled as DEBUGGERS in the config file.

#### debug
Toggles the debugging mode, which restricts bot access to whitelisted debuggers.

*Alias: debugmode*

#### saveimages
Toggles saving images. If an upload error occurs, the image is still stored locally.

#### external
Toggles accepting images from domains other than cdn.discordapp.com.

## Installation
- Create a new application: https://discord.com/developers/applications
- Create the bot invite link: https://discordapi.com/permissions.html
- Invite the bot to a server that you want it to be in.
- Put your bot token in the BOT_TOKEN field located in the .env file.
- Modify the config.json file to fit your needs. Note that ommands like debugmode/saveimages won't write to the JSON file, but the config will have the set default options once the bot restarts.
- Change your current directory to the folder in the terminal.
- Install the necessary node modules with ```npm install```.
- Start the bot with node.

If you are hosting on an Arch-based distribution with an ARM processor, run these commands before installing the node modules:

    sudo pacman -S chromium
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
    export PUPPETEER_EXECUTABLE_PATH=$(which chromium)
    sudo ln -s /usr/bin/chromium /usr/bin/chromium-browser

## Hosting with Heroku
- Create an account: https://heroku.com
- Fork this repository or clone it and upload it to GitHub with all the files modified as you wish.
- Edit the config.json file to how you wish.
- Go to the heroku dashboard: https://dashboard.heroku.com/
- Create a new app and it will generate a name for you.
- Click on the app.
- Either make the repository private and include the bot token in the .env file or remove the BOT_TOKEN line from .env to add it to config vars.
- If you want to add your token to config vars: click on the settings tab on the app. Click Reveal Config Vars. Add BOT_TOKEN as the KEY and your bot token as the VALUE. Click Add.
- Click on the Deploy tab.
- Deploy your application.
