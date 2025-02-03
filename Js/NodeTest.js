const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/general", express.static("D:/GitHub/Test"));

app.post("/submit", function (request, response) {
    const { userLogin, userPassword } = request.body;

    if (!userLogin || !userPassword) {
        return response.sendStatus(400);
    }

    const hashPassword = bcrypt.hashSync(userPassword, 7);

    console.log(`${userLogin} - ${hashPassword}`);
    response.json({ login: userLogin, hashPassword: hashPassword });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});