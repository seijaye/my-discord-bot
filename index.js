require("dotenv").config();

const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const Groq = require("groq-sdk");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Add blocked user IDs here
const blockedUsers = [
    "1461223012236791942"
];

client.once("ready", () => {
    console.log(`Logged in as ${client.user.username}`);
    
    // Set streaming status
    client.user.setPresence({
        activities: [
            {
                name: "sei...",
                type: ActivityType.Streaming,
                url: "https://www.twitch.tv/seijaye"
            }
        ],
        status: "online"
    });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith("!sei ")) return;

    // Check if user is blocked
    if (blockedUsers.includes(message.author.id)) {
        await message.reply("You've been blocked from using this bot by sei.");
        return;
    }

    const question = message.content.slice(5);
    await message.channel.sendTyping();

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: question }]
        });

        const reply = completion.choices[0].message.content;
        const chunks = reply.match(/[\s\S]{1,1900}/g);

        for (const chunk of chunks) {
            await message.reply(chunk);
        }

    } catch (error) {
        console.error(error);
        await message.reply("AI error:\n" + error.message);
    }
});

client.login(process.env.DISCORD_TOKEN);