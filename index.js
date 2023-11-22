const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const webAppUrl = 'https://jf-tg-bot.netlify.app/';

let token;
process.argv.forEach(function (val, index, array) {
    if (val !== undefined && val.startsWith('BOT_TOKEN')) {
        token = val.split('=')[1];
        console.log(`Token: '${token}'`);
    }
});

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
            await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('api/web-data', async (req, res) => {
    const {queryId, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
        }

        header {
            text-align: center;
            padding: 20px;
            background-color: #f2f2f2;
        }

        h1 {
            color: #333;
        }

        section {
            margin-top: 20px;
        }

        p {
            line-height: 1.6;
            color: #555;
        }

        footer {
            text-align: center;
            color: #888;
        }
        
        html{
            height: 100%;
        }
        
        body{
            height: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: column;
        }
    </style>
</head>
<body>
<main>
    <header>
        <h1>API Documentation</h1>
    </header>

    <section>
        <h2>Introduction</h2>
        <p>Welcome to the documentation for our API. This API provides various features for my Telegram bot to work.</p>
    </section>

    <section>
        <h2>Endpoints</h2>
        <p>Our API has the following endpoints:</p>
        <ul>
            <li>/api/web-data - POST</li>
            <li>/api/get-user-photo - GET</li>
            <!-- Add more endpoints and descriptions as needed -->
        </ul>
    </section>
</main>
    <footer>
        &copy; 2023 My Telegram Bot<br>
        To access the API, you should talk to author. Contact me in discord 
        <span style="
            background-color: darkgray;
            border-radius: 5px;
            padding: 1px 4px;
        ">@justafrogger</span>
    </footer>

</body>
</html>
`);
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))