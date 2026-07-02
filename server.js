const express = require("express");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "data", "database.json");


const app = express();
const PORT = 3000;

function readDatabase() {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
}

function writeDatabase(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/register", (req, res) => {

    const { username, password } = req.body;

    const db = readDatabase();

    const existingUser = db.users.find(
        user => user.username === username
    );

    if (existingUser) {
        return res.send("Username already exists!");
    }

    const newUser = {
        id: db.nextUserId,
        username: username,
        password: password
    };

    db.nextUserId++;

    db.users.push(newUser);

    writeDatabase(db);

    res.send("Registration Successful!");
});

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const db = readDatabase();

    const user = db.users.find(
        user =>
            user.username === username &&
            user.password === password
    );

    if (!user) {
        return res.send("Invalid Username or Password");
    }

    res.sendFile(path.join(__dirname, "public", "diary.html"));

});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});