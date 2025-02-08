const WebSocket = require('ws');

const fs = require('fs');
const path = require('path');

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const r = 8; 
    const g = 100 + (hash % 156);
    const b = 150 + (hash % 106); 

    return `#${('00' + r.toString(16)).substr(-2)}${('00' + g.toString(16)).substr(-2)}${('00' + b.toString(16)).substr(-2)}`;
}

function setupWebSocketServer(server, sessionParser) {
    const wss = new WebSocket.Server({ server });
    const logFilePath = path.join(__dirname, 'message.log');


    let messageHistory = [];
    if (fs.existsSync(logFilePath)) {
        const data = fs.readFileSync(logFilePath, 'utf8');
        messageHistory = data.split('\n').filter(line => line.trim() !== '');
    }

    wss.on('connection', (ws, req) => {
        sessionParser(req, {}, () => {
            console.log('Сессия:', req.session);
            console.log('Пользователь:', req.session.user);

            if (!req.session.user) {
                console.error('Пользователь не аутентифицирован');
                ws.close();
                return;
            }

            const userLogin = req.session.user.login;
            ws.username = userLogin;
            ws.userColor = stringToColor(userLogin); 

            console.log(`${userLogin} подключен`);

         
            messageHistory.forEach(message => {
                const sender = message.split(':')[0];
                const color = stringToColor(sender); 
                ws.send(JSON.stringify({ message, color, isHistory: true })); 
            });

            ws.on('message', (message) => {
                const sender = ws.username; // Оригинальный отправитель
                const currentDate = new Date();
                const currentTime = currentDate.toLocaleTimeString();
                const currentDateString = currentDate.toLocaleDateString('ru-RU'); // Форматирование даты в формате ДД.ММ.ГГГГ
                const formattedMessage = `${sender}: ${message} [${currentDateString} ${currentTime}]`;
            
                // Логирование сообщения в файл
                fs.appendFileSync(logFilePath, formattedMessage + '\n');
            
                // Рассылка сообщения всем клиентам
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            message: formattedMessage,
                            sender: sender, // Передаем оригинального отправителя
                            color: ws.userColor, // Цвет оригинального отправителя
                            isHistory: false // Новое сообщение
                        }));
                    }
                });
            });
            ws.on('close', () => {
                console.log(`${userLogin} отключен`);
            });
        });
    });

    wss.on('error', (error) => {
        console.error('Ошибка WebSocket:', error);
    });
}
module.exports = { setupWebSocketServer, stringToColor };
