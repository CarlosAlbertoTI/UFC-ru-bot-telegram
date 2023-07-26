const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios')

const express = require('express');
const app = express();

// Define a route for the home page
app.get('/', function(req, res) {
  res.send('Hello World!');
});

// Start the server
app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});

// replace the value below with the Telegram token you receive from @BotFather
const token = '6110170617:AAFcLKgHGav8L1NcO1pwZWrRwSbMka2KJvg';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });


bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, 'Olá, bem-vindo ao bot do RU UFC! ;)');
  await bot.sendMessage(msg.chat.id, 'Para saber a quantidade de créditos basta digitar:');
  await bot.sendMessage(msg.chat.id, 'matrícula:xxxxxx id ru:xxxxxxx');
  await bot.sendMessage(msg.chat.id, "Para buscar o cardápio do dia basta digitar: 'Cardápio'");
  await bot.sendMessage(msg.chat.id, 'Aproveite ;)');
});
// Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
// 'msg' is the received Message from Telegram
// 'match' is the result of executing the regexp above on the text content
// of the message

//     const chatId = msg.chat.id;
//     const resp = match[1]; // the captured "whatever"

//     // send back the matched "whatever" to the chat
//     bot.sendMessage(chatId, resp);
// });

// Listen for any kind of message. There are different kinds of
// messages.

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text.toLowerCase();

  if (userInput != "/start") {

    if (String(userInput).includes("cardapio") || String(userInput).includes("cardápio")) {
      bot.sendMessage(chatId, `Buscando o cardarpio do dia.....`);
      // Set typing action
      bot.sendChatAction(chatId, "typing");

      try {

        const response = await axios.default.get("https://api-ufc-ru.fly.dev/getTodayMenu")
        const data = response['data']

        if (data.error != undefined) {
          return await bot.sendMessage(chatId, `OPS! Parece que o cardápio hoje não esta disponivel`);
        }
        console.info(response["data"])
        await bot.sendMessage(chatId, `CAFE DA MANHÃ`);
        await bot.sendMessage(chatId, `${data.breakfast.toString()}`);

        await bot.sendMessage(chatId, `ALMOÇO`);
        await bot.sendMessage(chatId, `${data.lunch.toString()}`);

        await bot.sendMessage(chatId, `JANTA`);
        await bot.sendMessage(chatId, `${data.dinner.toString()}`);


        return;
      } catch (error) {
        console.info(error)
        return bot.sendMessage(chatId, `Ops! Parece que temos um erro no nosso serviço, por favor tente mais tarde ;)`);
      }
    }

    if ((String(userInput).includes("matricula") || String(userInput).includes("matrícula")) && String(userInput).includes("id ru")) {
      bot.sendMessage(chatId, `Buscando seus dados.....`);

      // Set typing action
      bot.sendChatAction(chatId, "typing");

      matricula = userInput.split(" ")[0].split(":")[1]
      id = userInput.split("id ru:")[1]


      try {
        const response = await axios.default.get("https://api-ufc-ru.fly.dev/getMyMealTickets", {
          params: {
            studentId: matricula,
            studentRuId: id
          }
        })

        console.info(response.data)
        return bot.sendMessage(chatId, `O usuário ${response.data.name} possui ${response.data.credits} creditos`);
      } catch (error) {
        bot.sendMessage(chatId, `Ops! Parece que temos um erro no nosso serviço, por favor tente mais tarde ;)`);
        return;
      }

    } else {
      bot.sendMessage(chatId, "Resposta não valida, por favor digite matricula e id do ru (matricula:xxxxxx id ru:xxxxxxx)");
      return;
    }
  }
})
