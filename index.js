const Discord = require("discord.js");
const tokenfile = require("./tokenfile.json");
const botconfig = require("./botconfig.json");
const bot = new Discord.Client({disableEveryone: true});
var weather = require('weather-js');
const superagent = require('superagent');
const randomPuppy = require('random-puppy');

const fs = require("fs");
const money = require("./money.json");
const { error } = require("console");

let botname = "Gyuri 1.0 YT"

bot.on("ready", async() => {
    console.log(`${bot.user.username} elindult!`)

    let státuszok = [
        "Prefix: !",
        "Készítő: Gyuri 1.0",
        "nyugodtan használj engem"
    ]

    setInterval(function() {
        let status = státuszok[Math.floor(Math.random()* státuszok.length)]

        bot.user.setActivity(status, {type: "PLAYING"})
    }, 3000)
})

bot.on("message", async message => {
    let MessageArray = message.content.split(" ");
    console.log(MessageArray);
    let cmd = MessageArray[0];
    let args = MessageArray.slice(1);
    let prefix = botconfig.prefix;

    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    if(!money[message.author.id]) {
        money[message.author.id] = {
            money: 100,
            user_id: message.author.id

        };
    }
    fs.writeFile("./money.json", JSON.stringify(money), (err) => {
        if(err) console.log(err);
    });
    let selfMoney = money[message.author.id].money;

    if(cmd === `${prefix}money`){
        let profilkep = message.author.displayAvatarURL();

        let MoneyEmbed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setColor("RANDOM")
        .addField("Egyenleg:", `${selfMoney}FT`)
        .setThumbnail(profilkep)
        .setFooter(botname)

        message.channel.send(MoneyEmbed)
    }

    if(cmd === `${prefix}freeMoney`){
        message.channel.send("50FT ot kaptál!")

        money[message.author.id] = {
            money: selfMoney + 50,
            user_id: message.author.id
        }
    }

    if(message.guild){
        let drop_money = Math.floor(Math.random()*50 + 1)
        let random_money = Math.floor(Math.random()*600 + 1)

        if(drop_money === 26){
            let üzenetek = ["Kiraboltál egy csövest!", "Sikeresen eladtad Robin biciklijét!", "Sikeresen eladtál valamit a neten!"]
            let random_üzenet_szam = Math.floor(Math.random()*üzenetek.length)

            let DropMoneyEmbed = new Discord.MessageEmbed()
            .setAuthor(message.author.username)
            .addField("Szerencsén volt!", `${üzenetek[random_üzenet_szam]} Ezért kaptál: ${random_money}FT-ot`)
            .setColor("RANDOM")
            .setThumbnail(message.author.displayAvatarURL())

            message.channel.send(DropMoneyEmbed);

            money[message.author.id] = {
                money: selfMoney + random_money,
                user_id: message.author.id
            }
        }
    }

    if(cmd === `${prefix}shop`){
        let ShopEmbed = new Discord.MessageEmbed()
            .setAuthor(message.author.username)
            .setDescription(`${prefix}vasarol-vip (Ár: 18000)`)
            .setColor("RANDOM")
            .setThumbnail(bot.user.displayAvatarURL())

            message.channel.send(ShopEmbed);
    }

if(cmd === `${prefix}vasarol-vip`){
    let viprang_id = "771331721488105492"

    let price = "18000";
    if(message.member.roles.cache.has(viprang_id)) return message.reply("Ezt a rangot már megvetted egyszer!")
    if(selfMoney < price) return message.reply(`Erre a Rangra nincs pénzed! Egyenleged ${selfMoney}FT`)

    money[message.author.id] = {
        money: selfMoney - parseInt(price),
        user_id: message.author.id
    }

    message.guild.member(message.author.id).roles.add(viprang_id)

    message.reply("**Köszönöm a vásárlást! További szép napot!**")
}

if(cmd == `${prefix}slot`){
    let min_money = 99;
    if(selfMoney < min_money) return message.reply(`Túl kevés pénzed van ezért nem tudsz még játszani! Sterezz több pénzt! (minimum ${min_money}FT-nak kell lennie a számládon!) egyenleged: ${selfMoney}.`)

    let tét = Math.round(args [0] *100)/100
    if(isNaN(tét)) return message.reply("Kérlek adj meg egy szám összeget!")
    if(tét > selfMoney) return message.reply("At egyenlegednél több pénzt nem rakhatsz fel!")

    let slots = ["🍌", "🥝", "🍔", "🍍", "🍉"]
    let result1 = Math.floor(Math.random() * slots.length)
    let result2 = Math.floor(Math.random() * slots.length)
    let result3 = Math.floor(Math.random() * slots.length)

    if(slots[result1] === slots[result2] && slots[result3]){
        let wEmbed = new Discord.MessageEmbed()
        .setTitle('🎁 Szerencs játék | slot machine🎁')
        .addField(message.author.username, `Nyertél! Ennyit kaptál: ${tét*2}FT`)
        .addField("Eredmény:", slots[result1] + slots[result2] + slots[result3])
        .setColor("RANDOM")
        .setTimestamp(message.createdAt)
        .setFooter(botname)
        message.channel.send(wEmbed)
    
    money[message.author.id] = {
        money: selfMoney + tét*2,
        user_id: message.author.id
    }
    } else {
        let wEmbed = new Discord.MessageEmbed()
        .setTitle('🎁 Szerencs játék | slot machine🎁')
        .addField(message.author.username, `Vesztettél! Ennyit buktál: ${tét}FT`)
        .addField("Eredmény:", slots[result1] + slots[result2] + slots[result3])
        .setColor("RANDOM")
        .setTimestamp(message.createdAt)
        .setFooter(botname)
        message.channel.send(wEmbed)

        money[message.author.id] = {
            money: selfMoney - tét,
            user_id: message.author.id
        }
    }
}


if(cmd === `${prefix}lb`){
        let toplist = Object.entries(money)
        .map(v => `${v[1].money}FT <@${v[1].user_id}>`)
        .sort((a, b) => b.split("FT")[0] - a.split("FT")[0])
        .slice(0, 10)

        let LbEmbed = new Discord.MessageEmbed()
        .setTitle("Leaderboard")
        .setColor("RANDOM")
        .addField("Pénz top lista | TOP10", toplist, true)
        .setTimestamp(message.createdAt)
        .setFooter(botname)

        message.channel.send(LbEmbed)
    }

    if(cmd === `${prefix}pay`){
        let pay_money = Math.round(args[0]*100)/100
        if(isNaN(pay_money)) return message.reply(`A parancs helyes használata: ${prefix}pay <összeg> <@név>`)
        if(pay_money > selfMoney) return message.reply("az egyenlegednél több pénzt nem adhatsz meg!")

        let pay_user = message.mentions.members.first();

        if(args[1] && pay_user){
            if(!money[pay_user.id]) {
                money[pay_user.id] = {
                    money: 100,
                    user_id: pay_user.id
                }
            }

            money[pay_user.id] = {
                money: money[pay_user.id].money + pay_money,
                user_id: pay_user.id
            }

            money[message.author.id] = {
                money: selfMoney - pay_money,
                user_id: message.author.id
        }

        message.channel.send(`Sikeresen átutaltál <@${pay_user.id}> számlájára ${pay_money}FT-ot!`)

        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        });
    } else {
        message.reply(`A parancs helyes használata: ${prefix}pay <összeg> <@név>`)
    }
}

if(cmd === `${prefix}works`){
    let cd_role_id = "968954393443581982";
    let cooldown_time = "60"; //mp

    if(message.member.roles.cache.has(cd_role_id)) return message.reply(`Ezt a parancsot ${cooldown_time} percenként használhatod!`)

    message.member.roles.add(cd_role_id)

    let üzenetek = ["Jó munkát végeztél!", "A főnököd adott egy kis borravalót!"]
    let random_üzenet_szam = Math.floor(Math.random()*üzenetek.length)

    let random_money = Math.floor(Math.random()*1900 +1)

    let worksEmbed = new Discord.MessageEmbed()
    .setTitle("Munka!")
    .addField(`${üzenetek[random_üzenet_szam]}`, `A számládhoz került: ${random_money}FT!`)
    .setColor("RANDOM")
    .setTimestamp(message.createdAt)
    .setFooter(botname)
    message.channel.send(worksEmbed)

    money[message.author.id] = {
        money: selfMoney + random_money,
        user_id: message.author.id
}

setTimeout(() => {
    message.member.roles.remove(cd_role_id)
}, 1000 * cooldown_time)
}








    if(cmd === `${prefix}hello`){
        message.channel.send("Szia");
    }



    if(cmd === `${prefix}infó`){
        let InfoEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(message.author.username)
        .setTitle("Info Embed!")
        .addField("Információk:", "YouTube: \n TikTok: \n Facebook: \n Insta: \n")
        .setThumbnail(message.author.displayAvatarURL())
        .setImage(message.guild.iconURL())
        .setDescription(`\`${prefix}\``)
        .setFooter(`${botname} | ${message.createdAt}`)

        message.channel.send(InfoEmbed)
    }

    if(cmd === `${prefix}szöveg`){
        let szöveg = args.join(" ");

        if(szöveg) {
            let dumaEmbed = new Discord.MessageEmbed()
        .setColor("#98AA12")
        .setAuthor(message.author.username)
        .addField("Szöveg:", szöveg)
        .setFooter(`${botname} | ${message.createdAt}`)
    
        message.channel.send(dumaEmbed)
        } else {
            message.reply("írj szöveget!")
        }
    }

    /////////////////////////////////
    //// LOGIKAI OPERÁTOROK TIPP ////
    //////////////////////////////////////////////////////////
    //                                                      //
    //   || vagy , PL: if(X=1 || X=3)                       //
    //                                                      //
    //   && és , PL: if(X=5 && Y=3)                         //
    //                                                      //
    //   = sima egyenlő jel , PL: if(5=5)                   //
    //   ==  egyenlő jel , PL: if(X==5)                     //
    //   >= nagyobb vagy egyenő , PL: if(X >= 3)            //
    //   <= kisebb vagy egyenlő , PL: if(X <= 3)            //
    //   ! tagadás , PL if(X != 2)                          //
    //                                                      //
    //////////////////////////////////////////////////////////

    if(cmd === `${prefix}kick`){
        let kick_user = message.mentions.members.first();
        if(args[0] && kick_user){

            if(args[1]){

                let KickEmbed = new Discord.MessageEmbed()
                .setTitle("KICK")
                .setColor("RED")
                .setDescription(`**Kickelte:** ${message.author.tag}\n**Kickelve lett:** ${kick_user.user.tag}\n**Kick indoka:** ${args.slice(1).join(" ")}`)

            message.channel.send(KickEmbed);

                kick_user.kick(args.slice(1).join(" "));

            } else {
            let parancsEmbed = new Discord.MessageEmbed()
            .setTitle("Parancs használata:")
            .addField(`\`${prefix}kick <@név> [indok]\``, "˘˘˘")
            .setColor("BLUE")
            .setDescription("HIBA: Kérlek adj meg egy indokot!!")

            message.channel.send(parancsEmbed);
            }

        } else {
            let parancsEmbed = new Discord.MessageEmbed()
            .setTitle("Parancs használata:")
            .addField(`\`${prefix}kick <@név> [indok]\``, "˘˘˘")
            .setColor("BLUE")
            .setDescription("HIBA: Kérlek említs meg egy embert!")

            message.channel.send(parancsEmbed);

        }
    }


    if(cmd === `${prefix}ban`){
        let ban_user = message.mentions.members.first();
        if(args[0] && ban_user){

            if(args[1]){

                let BanEmbed = new Discord.MessageEmbed()
                .setTitle("BAN")
                .setColor("RED")
                .setDescription(`**Banolta:** ${message.author.tag}\n**Banolva lett:** ${kick_user.user.tag}\n**Ban indoka:** ${args.slice(1).join(" ")}`)

            message.channel.send(KickEmbed);

                ban_user.ban(args.slice(1).join(" "));

            } else {
            let parancsEmbed = new Discord.MessageEmbed()
            .setTitle("Parancs használata:")
            .addField(`\`${prefix}ban <@név> [indok]\``, "˘˘˘")
            .setColor("BLUE")
            .setDescription("HIBA: Kérlek adj meg egy indokot!!")

            message.channel.send(parancsEmbed);
            }

        } else {
            let parancsEmbed = new Discord.MessageEmbed()
            .setTitle("Parancs használata:")
            .addField(`\`${prefix}ban <@név> [indok]\``, "˘˘˘")
            .setColor("BLUE")
            .setDescription("HIBA: Kérlek említs meg egy embert!")

            message.channel.send(parancsEmbed);

        }
    }

    if(cmd === `${prefix}weather`){
        if(args[0]){
            weather.find({search: args.join(" "), degreeType: "C"}, function(err, result) {
                if (err) message.reply(err);

                if(result.length === 0){
                    message.reply("Kérlek adj meg egy létező település nevet!")
                    return;
                }

                let current = result[0].current;
                let location = result[0].location;

                let WeatherEmbed = new Discord.MessageEmbed()
                .setDescription(`**${current.skytext}**`)
                .setAuthor(`Időjárás itt: ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor("GREEN")
                .addField("Időzóna:", `UTC${location.timezone}`, true)
                .addField("Fokozat típusa:", `${location.degreetype}`, true)
                .addField("Hőfok", `${current.temperature}°C`, true)
                .addField("Hőérzet:", `${current.feelslike}°C`, true)
                .addField("Szél", `${current.winddisplay}`, true)
                .addField("Páratartalom:", `${current.humidity}%`, true)

                message.channel.send(WeatherEmbed);
            })

        } else {
            message.reply("Kérlek adj meg egy település nevet!")
        }
    } 

    if(cmd === `${prefix}meme`){
        const subreddits = ["dankmeme", "meme", "me_irl"]
        const random = subreddits[Math.floor(Math.random() * subreddits.length)]

        const IMG = await randomPuppy(random)
        const MemeEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setImage(IMG)
        .setTitle(`Keresési szöveg: ${random} (KATT IDE!)`)
        .setURL(`https://www.reddit.com/r/${random}`)

        message.channel.send(MemeEmbed)
    }




})

fs.writeFile("./money.json", JSON.stringify(money), (err) => {
    if(err) console.log(err);
});













bot.login(tokenfile.token);
