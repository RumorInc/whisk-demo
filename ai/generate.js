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
        },
        {
            role: 'system',
            content: `RESTAURANT_INFO: 
            [Name: PRSÀ]
            [Location: Level 2, Phoenix Bloom Mall, Kharadi, Pune, India]
            [Type: Affordable Fine-Dine]
            [Cuisine: Vegetarian & Non-Vegetarian]
            [Bar/Alcohol: false]
            [Total Customer Seats: 76]
            [Total Chefs: 6]
            [Total Tables: 12]
            [Total Servers: 8]`
        }
    ];
    if (options.inventory) {
        const invObj = await Indexer.loadInventory();
        const inv = await Indexer.flattenInventory(invObj);
        messages.push({
            role: 'system',
            content: `CURRENT_INVENTORY:\n${inv}`
        });
    }
    if (options.sales) {
        messages.push({
            role: 'system',
            content: `CURRENT_SALES:
            [Day: Friday]
            [Date: 2025-05-16]
            [Weather: Thunderstorm]
            [Festival: None]
            [Most Ordered Side Dish: Manchurian Soup from Soups Menu]
            [Most Ordered Main Course Dish: Chicken Biryani]
            [Least Ordered Dish: Spinach Lasagna]
            [Most Ordered Cuisine: Non-Veg]
            [Total Sales (INR): 47,900]
            <BREAK>
            [Day: Sunday]
            [Date: 2025-05-18]
            [Weather: Windy]
            [Festival: Buddha Purnima]
            [Most Ordered Dish: Palak Paneer]
            [Least Ordered Dish: Mix Veg Handi]
            [Most Ordered Cuisine: Veg]
            [Total Sales (INR): 60,250]
            <BREAK>
            [Day: Monday]
            [Date: 2025-05-19]
            [Weather: Partly Cloudy]
            [Festival: None]
            [Most Ordered Dish: Butter Chicken]
            [Least Ordered Dish: Prawns Koliwada]
            [Most Ordered Cuisine: Non-Veg]
            [Total Sales (INR): 39,500]
            `
        });
    }
    messages.push(...history, { role: 'user', content: userMessage });
    const stream = await together.chat.completions.create({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages,
        stream: true
    });
    console.log(messages);
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