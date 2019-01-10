/*
 *  ALPHA.JS
 *  BY: OCTO DEVELOPMENT
 * 
 *  IF YOU USE THE SOURCE CODE OF THIS BOT,
 *  YOU MUST GIVE ME CREDIT.
 * 
 *  Copyright (c) 2018 Octo-Development
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.

 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

//  █▀▀█ █▀▀ ▀▀█▀▀ █▀▀█   █▀▀▄ █▀▀ ▀█░█▀ █▀▀ █░░ █▀▀█ █▀▀█ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀
//  █░░█ █░░ ░░█░░ █░░█   █░░█ █▀▀ ░█▄█░ █▀▀ █░░ █░░█ █░░█ █░▀░█ █▀▀ █░░█ ░░█░░
//  ▀▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀   ▀▀▀░ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀▀ █▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░

const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const os = require("os");
const sleep = require("system-sleep");
const fs = require("fs");
const ffmpeg = require("ffmpeg");
const readline = require("readline-sync");
const Enmap = require("enmap");

const fileLocator = {
    // The File Locator allows you to specify a custom location for the configuration files.
    "globalConfiguration": {
        "location": "src/globalConfiguration.json"
    }
}

const defaultSettings = {
    /*
     * These Default Settings automatically applies to every server the bot joins.
     * however, the settings are configurable with the 'set' command.
     */
    prefix: ">>", // default prefix 
    maxSongLength: 0, // maximum song length (0 = unlimited)
    welcomeChannel: "welcome", // default welcome channel
    /*
     * Welcome Message Variables:
     * {user} = Username
     * {guild} = Guild Name
     * 
     * You can put these variables in the text, it will automatically be replaced.
     */
    welcomeMessage: "Welcome, {user} to {guild}!",
    // Do Not Touch Anything Below This!
    queue: [],
    tags: {}
}

////////////////// Do Not Touch Unless You Know What You're Doing! //////////////////

const client = new Discord.Client();

client.settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

function readConfiguration(sFile) {
    var tmpContents = fs.readFileSync(sFile);
    var tmpJSON = JSON.parse(tmpContents);
    return tmpJSON
}

function setValue(objname,objvalue,file) {
    var tmpData = readConfiguration(file)
    tmpData[objname] = objvalue
    fs.writeFile(file, JSON.stringify(tmpData), (err) => {
        if (err) {
            console.error(err);
            return;
        };
    });
}

function checkPerm(member, perm) {
    if (message.member.roles.filter(r => r.hasPermission(perm)).size > 0) {
        return true
    }
    else {
        return false
    }
}

const globalConfiguration = readConfiguration(fileLocator.globalConfiguration.location);

console.log("=-=-=-=--=-=-=-=-=-=-=-=");
console.log("        ALPHA V1        ");
console.log("   by Octo-Development  ");
console.log("=-=-=-=--=-=-=-=-=-=-=-=");

client.on("error", (e) => console.error("[ERROR] " + e))
client.on("warn", (e) => console.error("[WARNING] " + e))

client.on("ready", () => {
    console.log("");
    console.log("Ready.");
    var servers = client.guilds.size-1
    client.user.setActivity(`${servers} servers!`, { type: "WATCHING" });
});

client.on("guildDelete", guild => {
    client.settings.delete(guild.id)
});

client.on("guildMemberAdd", member => {
    console.log("New User")
    const guildConfiguration = client.settings.ensure(member.guild.id, defaultSettings)
    let welcomeMessage = guildConfiguration.welcomeMessage
    client.settings.ensure(member.guild.id, defaultSettings);

    welcomeMessage = welcomeMessage.replace("{user}", member.user.tag)
    welcomeMessage = welcomeMessage.replace("{guild}", member.guild.name)
    member.guild.channels
        .find("name", guildConfiguration.welcomeChannel)
        .send(welcomeMessage)
        .catch(console.error);
});

client.on("message", (message) => {
    const guildConfiguration = client.settings.ensure(message.guild.id, defaultSettings)
    const prefix = guildConfiguration.prefix
    function checkPerm(member, perm) {
        if (message.member.roles.filter(r => r.hasPermission(perm)).size > 0) {
            return true
        }
        else {
            return false
        }
    }
    function play(URL) {
        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel || voiceChannel.type !== 'voice') {
            return false
        }
        else {
            voiceChannel.join()
                .then(connection => {
                    var title = null
                    const streamOptions = { seek: 0, volume: 1 };
                    ytdl.getInfo(`${URL}`, function (err, info) {
                        title = info.title
                        if (info.length_seconds > 60) {
                            durationMinutes = Math.round(info.length_seconds / 60)
                            durationSeconds = info.length_seconds % 60
                        } else {
                            duration = info.length_seconds
                        }
                        if (guildConfiguration > 0 && info.length_seconds > guildConfiguration.maxSongLength) {
                            message.channel.send(":x: **The video you have selected exceeds the Maximum Song Length!**")
                            return;
                        } else {
                            musicEmbed = new Discord.RichEmbed();
                            musicEmbed.setColor(0x17c158);
                            musicEmbed.setTitle("Sucessful");
                            musicEmbed.setFooter("")
                            if (durationSeconds == null) {
                                musicEmbed.setDescription("Playing **" + info.title + "** | **" + duration + " seconds**")
                            } else {
                                musicEmbed.setDescription("Playing **" + info.title + "** | **" + durationMinutes + " minutes** **" + durationSeconds + " seconds.**")
                            }
                            var playingSong = true;
                            //youtubeQueue.push(URL);
                            message.channel.sendEmbed(musicEmbed);
                            const stream = ytdl(`${URL}`, { filter: 'audioonly' });
                            const dispatcher = connection.playStream(stream, streamOptions);
                            dispatcher.on("end", end => {
                                endMusicEmbed = new Discord.RichEmbed();
                                endMusicEmbed.setColor(0x17c158);
                                endMusicEmbed.setTitle("Video Over");
                                endMusicEmbed.setDescription("The Video has now ended.")
                                message.channel.sendEmbed(endMusicEmbed);
                                voiceChannel.leave()
                            });
                        }
                    })
                });
        }
        if (message.guild.voiceConnection === "") {
            message.channel.sendMessage(":x: 404 Voice Channel Connection Failed")
        }
    }
    const commands = {
        /*
        COMMAND DOCUMENTATION:

        REPLACE FALSE WITH 0
        "commandName": {
            requiredPermission: (requiredPermission string),
            numberArgRequired: (numberArgRequired integer),
            onlyShowHelpIfPerm: (onlyShowHelpIfPerm boolean (only required if requiredPermission)),
            helpDesc: (helpDesc string),
            execute: (execute function),
            noPermission: (noPermission function (only required if requiredPermission)),
            argumentArray: (argumentArray array (only required if numberArgRequired))
        },
        ...

        HANDLING ARGUMENTS (COMMAND EXAMPLE):
        "argtester": {
            requiredPermission: 0,
            numberArgRequired: 2,
            argumentArray: [],
            helpDesc: "Tests arguments with the new Command Handler.",
            execute: function() {
                message.channel.send("Arg 1: " + commands.argtester.argumentArray[1])
                message.channel.send("Arg 2: " + commands.argtester.argumentArray[2])
            }
        },
        ...
        */
        "shutdown": {
            requiredPermission: "ADMINISTRATOR",
            numberArgRequired: 0,
            onlyShowHelpIfPerm: true,
            helpDesc: "Turns off the Discord Bot",
            execute: function () {
                message.channel.send(":ballot_box_with_check: **Shutting Down...**")
                client.destroy();
            },
            noPermission: function () {
                message.channel.send(":x: You need permission **ADMINISTRATOR** to run this command.")
            }
        },
        "ping": {
            requiredPermission: 0,
            numberArgRequired: 0,
            helpDesc: "Pings the Bot.",
            execute: function () {
                message.channel.send(":ballot_box_with_check: **Pong!**")
            }
        },
        "help": {
            numberArgRequired: 0,
            requiredPermission: 0,
            helpDesc: "Gets all the commands of the bot.",
            execute: function() {
                message.channel.send("**Alpha Bot Commands**")
                for (command in commands) {
                    var showCommand = true
                    if (commands[command].onlyShowHelpIfPerm) {
                        if (checkPerm(message.author, commands[command].requiredPermission)) {
                            showCommand = true
                        } else {
                            showCommand = false
                        }
                    }
                    if (showCommand) {
                        message.channel.send(command + ": " + commands[command].helpDesc)
                    }
                }
            }
        },
        "argtester": {
            requiredPermission: 0,
            numberArgRequired: 2,
            argumentArray: [],
            helpDesc: "Tests arguments with the new Command Handler.",
            execute: function() {
                message.channel.send("Arg 1: " + commands.argtester.argumentArray[1])
                message.channel.send("Arg 2: " + commands.argtester.argumentArray[2])
            }
        },
        "play": {
            requiredPermission: 0,
            numberArgRequired: 1,
            argumentArray: [],
            helpDesc: "Play's a video from YouTube.",
            execute: function() {
                var URL = commands.play.argumentArray[1]
                guildConfiguration['queue'].push(URL)
                client.settings.set(message.guild.id, guildConfiguration) // ensure that the changes applied
                message.channel.send("**Added URL to queue.**")
                while (guildConfiguration['queue'].length > 0) {
                    guildConfiguration['queue'].shift()
                    var queueArray = guildConfiguration.queue
                    var currentURL = queueArray[0]
                    // removes song from the beginning
                    //message.channel.send("**Playing URL '" + currentURL + "'**") 
                    play(currentURL)
                }
            }
        },
        "setting-set": {
            requiredPermission: "ADMINISTRATOR",
            numberArgRequired: 2,
            argumentArray: [],
            helpDesc: "Sets a per-guild setting for the Discord Bot",
            execute: function() {
                var settingName = commands["setting-set"].argumentArray[1]
                var settingValue = commands["setting-set"].argumentArray[2]
                guildConfiguration[settingName] = settingValue
                client.settings.set(message.guild.id, guildConfiguration)
                message.channel.send(":ballot_box_with_check: **The setting has been changed.**")
                message.channel.send("**" + settingName + " = " + settingValue + "**")
            },
            noPermission: function() {
                message.channel.send(":x: You need permission **ADMINISTRATOR** to run this command.")
            }
        },
        "tag-set": {
            requiredPermission: 0,
            numberArgRequired: 2,
            argumentArray: [],
            helpDesc: "Set's tags",
            execute: function() {
                var tagName = commands["tag-set"].argumentArray[1]
                var tagValue = commands["tag-set"].argumentArray[2]
                guildConfiguration['tags'][tagName] = tagValue
                client.settings.set(message.guild.id, guildConfiguration)
                message.channel.send(":ballot_box_with_check: **Tag Set!**")
            }
        },
        "tag-delete": {
            requiredPermission: 0,
            numberArgRequired: 1,
            argumentArray: [],
            helpDesc: "Delete's tags",
            execute: function () {
                var tagNameArg = commands["tag-delete"].argumentArray[1]
                guildConfiguration['tags'][tagNameArg] = null
                message.channel.send(":ballot_box_with_check: **Tag Deleted!**")
            }
        },
        "tag-list": {
            requiredPermission: 0,
            numberArgRequired: 0,
            helpDesc: "List's tags",
            execute: function () {
                message.channel.send("**Tags**")
                for (tag in guildConfiguration['tags']) {
                    message.channel.send(tag)
                }
            }
        },
        "tag": {
            requiredPermission: 0,
            numberArgRequired: 1,
            argumentArray: [],
            helpDesc: "Get's tags",
            execute: function() {
                var tagNameArg = commands["tag"].argumentArray[1]
                var guildTags = guildConfiguration.tags
                var tagValue = guildTags[tagNameArg]
                message.channel.send("**" + tagValue + "**")
            }
        },
        "kick": {
            requiredPermission: "KICK_MEMBERS",
            numberArgRequired: 1,
            argumentArray: [],
            helpDesc: "Kick a user",
            execute: function() {
                const user = message.mentions.users.first()
                if (user) {
                    const member = message.guild.member(user)
                    if (member) {
                        member.kick().then(() => {
                            message.channel.send(":ballot_box_with_check: **Sucessfully kicked!**")
                        }).catch(err => {
                            message.channel.send(":x: **This member could not be kicked!**")
                        });
                    } else {
                        message.channel.send(":x: **The member isn't in the guild!**")
                    }
                } else {
                    message.channel.send(":x: **You didn't mention a user!**")
                }
            }
        },
        "ban": {
            requiredPermission: "BAN_MEMBERS",
            numberArgRequired: 1,
            argumentArray: [],
            helpDesc: "Ban a user",
            execute: function () {
                const user = message.mentions.users.first()
                if (user) {
                    const member = message.guild.member(user)
                    if (member) {
                        member.ban().then(() => {
                            message.channel.send(":ballot_box_with_check: **Sucessfully banned!**")
                        }).catch(err => {
                            message.channel.send(":x: **This member could not be banned!**")
                        });
                    } else {
                        message.channel.send(":x: **The member isn't in the guild!**")
                    }
                } else {
                    message.channel.send(":x: **You didn't mention a user!**")
                }
            }
        }
    }
    if (message.author.bot) return; // should fix the spam issue
    var commandName = false
    for (command in commands) {
        if (message.content.startsWith(prefix + command)) {
            commandName = command
            break
        }
    }
    if (commandName) {
        var notEnoughArgs = false
        if (commands[commandName].numberArgRequired > 0) {
            let args = message.content.split(" ")
            if ((args.length - 1) < commands[commandName].numberArgRequired) {
                // not enough arguments
                notEnoughArgs = true
                message.channel.send(":x: **Not enough arguments! / " + commands[commandName].numberArgRequired + " arguments required.**")
            } else {
                var i = 0
                while (i < commands[commandName].numberArgRequired) {
                    i = i + 1
                    commands[commandName].argumentArray[i] = args[i]
                }
            }
        }
        if (notEnoughArgs == false) {
            if (commands[commandName].requiredPermission == 0) {
                commands[commandName].execute()
            } else {
                if (checkPerm(message.author, commands[commandName].requiredPermission)) {
                    commands[commandName].execute();
                } else {
                    if (commands[commandName].noPermission == null) {
                        message.channel.send(":x: **No Permission!**")
                        console.log("[WARNING] A 'noPermission' message was not set for the command '" + commandName + "'")
                    } else {
                        commands[commandName].noPermission()
                    }
                }
            }
        }
        commandName = null
    }
});

if (globalConfiguration.token == "[INSERT TOKEN HERE]") {
    console.log("Welcome to Alpha V1 made by Octo Development!")
    var token = readline.question("Please type your token here:")
    setValue("token", token, fileLocator.globalConfiguration.location)
    console.log("Done! You may run this program again, and the bot will start.")
} else {
    client.login(globalConfiguration.token);
}