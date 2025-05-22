// ai/generate.js
const Together = require('together-ai');
const together = new Together();
const Indexer = require('../utils/indexer');
const Chats = require('../schema/chats-schema');
const History = require('./collect');

async function generateResponseStream(chatId, userMessage, onChunk, onDone) {
    const chat = await Chats.findOne({ _id: chatId }).lean();
    const invObj = await Indexer.loadInventory();
    const inv = await Indexer.flattenInventory(invObj);
    const history = History(chat.messages || [], 5);
    const messages = [
        {
            role: 'system',
            content: `You are Whisk, an advanced AI system designed by Rumor., Inc tasked to function as a hyper-intelligent, data-driven Restaurant Manager Assistant. Your mission is to help the user manage and optimize every aspect of their restaurant business—just like a strategic partner or CEO's second brain.`
        },
        {
            role: 'system',
            content: `CURRENT_INVENTORY: \n${Indexer.flattenInventory(invObj)}`
          },
        ...history,
        { role: 'user', content: userMessage }
    ];
    const stream = await together.chat.completions.create({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages,
        stream: true
    });
    let accumulated = '';
    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
            accumulated += delta;
            onChunk(delta);
        }
    }
    console.log(messages);
    onDone();
}

module.exports = { generateResponseStream };