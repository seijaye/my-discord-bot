require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
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

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.username}`);
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (!message.content.startsWith("!sei ")) return;

    const question = message.content.slice(5);

    await message.channel.sendTyping();

    try {

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: question
                }
            ]
        });

        const reply = completion.choices[0].message.content;
        const chunks = reply.match(/[\s\S]{1,1900}/g);

        for (const chunk of chunks) {
            await message.reply(chunk);
        }

    } catch (error) {

        console.error(error);

        await message.reply(
            "AI error:\n" + error.message
        );
    }

});

client.login(process.env.DISCORD_TOKEN);