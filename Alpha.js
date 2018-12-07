/*
 *  ALPHA V1
 *  BY: OCTO DEVELOPMENT
 * 
 *  IF YOU USE THE SOURCE CODE OF THIS BOT,
 *  PLEASE GIVE ME CREDIT.
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

// █▀▀█ █▀▀ ▀▀█▀▀ █▀▀█   █▀▀▄ █▀▀ ▀█░█▀ █▀▀ █░░ █▀▀█ █▀▀█ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀
// █░░█ █░░ ░░█░░ █░░█   █░░█ █▀▀ ░█▄█░ █▀▀ █░░ █░░█ █░░█ █░▀░█ █▀▀ █░░█ ░░█░░
// ▀▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀   ▀▀▀░ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀▀ █▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░

const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const os = require("os");
const sleep = require("system-sleep");
const fs = require("fs");
const ffmpeg = require("ffmpeg");
const readline = require("readline-sync");

const fileLocator = {
    // The File Locator allows you to specify a custom location for the configuration files.
    "globalConfiguration": {
        "location": "globalConfiguration.json"
    }
}

const client = new Discord.Client();

function readConfiguration(sFile) {
    var tmpContents = fs.readFileSync(sFile);
    var tmpJSON = JSON.parse(tmpContents);
    return tmpJSON
}

// TODO: Make a JSON data class system
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

const globalConfiguration = readConfiguration(fileLocator.globalConfiguration.location);

console.log("=-=-=-=--=-=-=-=-=-=-=-=");
console.log("        ALPHA V1        ");
console.log("   by Octo-Development  ");
console.log("=-=-=-=--=-=-=-=-=-=-=-=");

client.on("ready", () => {
    console.log("");
    console.log("Ready.");
    var servers = client.guilds.size-1
    client.user.setActivity(`${servers} servers!`, { type: "WATCHING" });
});

client.on("message", (message) => {

    function checkPerm(member, perm) {
        if (message.member.roles.filter(r => r.hasPermission(perm)).size > 0) {
            return true
            // Returns True
        }
        else {
            return false
            // Returns False
        }
    }

    if (message.content.startsWith(prefix + "shutdown")) {
        if (checkPerm(message.author, "ADMINISTRATOR")) {
            message.channel.send(":ballot_box_with_check: **Shutting Down...**");
            client.destroy();
        } else {
            message.channel.send(":x: You need permission **ADMINISTATOR** to run this command.");
        }
    }

    if (message.content.startsWith(prefix + "ping")) {
        message.channel.send(":ballot_box_with_check: **Pong!**");
    }

    if (message.content.startsWith(prefix + "play")) {
        const voiceChannel = message.member.voiceChannel;
        let args = message.content.split(" ")
         var link = args[1];
        if (!voiceChannel || voiceChannel.type !== 'voice') {
             message.channel.sendMessage(":x: **You are not in any voice channel!**")
         }
         else {
               voiceChannel.join()
                .then(connection => {
                    var title = null
                       const streamOptions = { seek: 0, volume: 1 };
                      ytdl.getInfo(`${link}`, function (err, info) {
                           title = info.title
                          if (info.length_seconds > 60) {
                            durationMinutes = Math.round(info.length_seconds/60)
                            durationSeconds = info.length_seconds%60
                        } else {
                            duration = info.length_seconds
                        }
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
                        youtubeQueue.push(link);
                        message.channel.sendEmbed(musicEmbed);
                        const stream = ytdl(`${link}`, { filter: 'audioonly' });
                        const dispatcher = connection.playStream(stream, streamOptions);
                        dispatcher.on("end", end => {
                            endMusicEmbed = new Discord.RichEmbed();
                            endMusicEmbed.setColor(0x17c158);
                            endMusicEmbed.setTitle("Video Over");
                            endMusicEmbed.setDescription("The Video has now ended.")
                            message.channel.sendEmbed(endMusicEmbed);
                            voiceChannel.leave();
                        });
                    })
                });
            }
            if (message.guild.voiceConnection === "") {
                message.channel.sendMessage(":x: Your voice channel has either reached the max people allowed or is locked")
            }
        }       
    })
if (globalConfiguration.token == "[INSERT TOKEN HERE]") {
    console.log("Welcome to Alpha V1 made by Octo Development!")
    var token = readline.question("Please type your token here:")
    setValue("token",token,fileLocator.globalConfiguration.location)
} else {
    client.login(globalConfiguration.token);
}

