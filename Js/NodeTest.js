const express = require("express");
const session = require("express-session");
const app = express();
const https = require("https");
const fs = require("fs");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require("mysql2");
const getIPv4Addresses = require('./getIpAddresses');
require('dotenv').config();
const sessionSecret = process.env.SESSION_SECRET;
const path = require("path");
const { setupWebSocketServer, stringToColor } = require('./websocket');
app.set("view engine", "ejs");
app.set('views', path.join("D:/GitHub/Test"));


const port = 3000;
const ipAddress = getIPv4Addresses();
const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const loginAttempts = {};

const sessionParser = session({
    secret: String(sessionSecret),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } 
});

app.use(sessionParser);

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "testdb",
    password: "8765зыштф"
});

app.post("/submit", function (request, response) {
    const { userLogin, userPassword } = request.body;

    if (!userLogin || !userPassword) {
        return response.sendStatus(400);
    }

    const userIp = request.ip;

    if (!loginAttempts[userIp]) {
        loginAttempts[userIp] = {
            attempts: 0,
            firstAttemptTime: Date.now()
        };
    }

    const currentTime = Date.now();
    const timeElapsed = currentTime - loginAttempts[userIp].firstAttemptTime;

    if (timeElapsed > 10 * 60 * 1000) {
        loginAttempts[userIp] = {
            attempts: 0,
            firstAttemptTime: currentTime
        };
    }

    if (loginAttempts[userIp].attempts >= 10) {
        return response.status(429).json({ message: "Too many login attempts. Please try again later." });
    }

    const query = "SELECT userPassword FROM user WHERE userLogin = ?";

    connection.execute(query, [userLogin], function (err, results) {
        if (err) {
            console.error("Ошибка при проверке логина:", err);
            return response.sendStatus(500);
        }

        if (results.length === 0) {
            loginAttempts[userIp].attempts++;
            return response.json({ result: 0, message: "Пользователь не найден." });
        }

        const storedHash = results[0].userPassword;
        const isPasswordValid = bcrypt.compareSync(userPassword, storedHash);

        if (isPasswordValid) {
            request.session.user = {
                login: userLogin,
                ip: userIp
            };
            delete loginAttempts[userIp];
            return response.json({ result: 1, message: "Successful entry!" });
        } else {
            loginAttempts[userIp].attempts++;
            return response.json({ result: 0, message: "The password is incorrect." });
        }
    });
});

const server = https.createServer(options, app);
setupWebSocketServer(server, sessionParser);

server.listen(port, ipAddress, () => {
    console.log(`Сервер запущен по адресу https://${ipAddress}:${port}`);
});

app.use("/general", express.static("D:/GitHub/Test"));

app.get("/zelc_chat", isAuthenticated, (req, res) => {
    res.render("chat", { 
        login: req.session.user.login,
        ipAddress: ipAddress
     });
});

app.get('/messageHistory', (req, res) => {
    const logFilePath = path.join(__dirname, 'message.log');
    if (fs.existsSync(logFilePath)) {
        const data = fs.readFileSync(logFilePath, 'utf8');
        const messages = data.split('\n').filter(line => line.trim() !== '');
        res.json(messages.map(message => {
            const sender = message.split(':')[0];
            const color = stringToColor(sender);
            return JSON.stringify({ message, color });
        }));
    } else {
        res.json([]);
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        const userIp = req.ip;
        const allowedIp = req.session.user.ip;

        if (allowedIp === userIp) {
            return next();
        } else {
            return res.status(403).send("Access denied: IP address mismatch.");
        }
    } else {
        return res.status(401).send("Unauthorized: Please log in.");
    }
}