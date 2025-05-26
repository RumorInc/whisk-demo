// ai/generate.js
const Together = require('together-ai');
const together = new Together();
const Indexer = require('../utils/indexer');
const Chats = require('../schema/chats-schema');
const History = require('./collect');

async function generateResponseStream(chatId, userMessage, options, onChunk, onDone) {
    const chat = await Chats.findById(chatId).lean();
    const history = History(chat.messages || [], 5);
    const messages = [
        {
            role: 'system',
            content: `You are Whisk, an advanced AI system designed by Rumor., Inc tasked to function as a hyper-intelligent, data-driven Restaurant Manager Assistant. Your mission is to help the user manage and optimize every aspect of their restaurant business—just like a strategic partner or CEO's second brain.`
        }
    ];
    if (options.readInv) {
        const invObj = await Indexer.loadInventory();
        const inv = await Indexer.flattenInventory(invObj);
        messages.push({
            role: 'system',
            content: `CURRENT_INVENTORY:\n${inv}`
        });
    }
    if (options.readSales) {
        const salesData = await Indexer.loadSales()
        messages.push({
            role: 'system',
            content: `CURRENT_SALES:\n${salesData}`
        });
    }
    if (options.fileUploaded) {
        messages.push({
            role: 'system',
            content: `NOTE: The user has uploaded a file for your analysis.`
        });
    }
    messages.push(...history, { role: 'user', content: userMessage });
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
    onDone();
}


module.exports = { generateResponseStream };