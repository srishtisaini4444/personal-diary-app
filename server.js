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

app.post("/add-entry", (req, res) => {

    const { entry } = req.body;

    const db = readDatabase();

    if (db.users.length === 0) {
        return res.send("No user found.");
    }

    // ------->>>>Temporary: use the last registered user mehuu meow
    const currentUser = db.users[db.users.length - 1];

    const newEntry = {
        id: db.entries.length + 1,
        userId: currentUser.id,
        content: entry
    };

    db.entries.push(newEntry);

    writeDatabase(db);

    let html = `
<h1>My Diary Entries</h1>
`;

db.entries.forEach(entry => {
    html += `
        <div style="border:1px solid black; padding:10px; margin:10px;">
            <p>${entry.content}</p>

            <form action="/delete-entry/${entry.id}" method="POST">
                <button>Delete</button>
            </form>

            <br>

            <form action="/edit-entry/${entry.id}" method="GET">
                <button>Edit</button>
            </form>

        </div>
    `;
});

html += `
<br>
<a href="/">Logout</a>
`;

res.redirect("/entries");

});

app.get("/entries", (req, res) => {

    const db = readDatabase();

    let html = "<h1>My Diary Entries</h1>";

    db.entries.forEach(entry => {

        html += `
        <div style="border:1px solid black;padding:10px;margin:10px;">
            <p>${entry.content}</p>

            <form action="/delete-entry/${entry.id}" method="POST">
                <button>Delete</button>
            </form>

            <br>

            <form action="/edit-entry/${entry.id}" method="GET">
                <button>Edit</button>
            </form>
        </div>
        `;

    });

    html += `
<br><br>

<a href="/">Logout</a>
`;

res.send(html);

});

app.post("/delete-entry/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const db = readDatabase();

    db.entries = db.entries.filter(entry => entry.id !== id);

    writeDatabase(db);

    res.redirect("/entries");

});

app.get("/edit-entry/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const db = readDatabase();

    const entry = db.entries.find(e => e.id === id);

    res.send(`
        <h1>Edit Entry</h1>

        <form action="/update-entry/${id}" method="POST">

            <textarea name="entry" rows="10" cols="50">${entry.content}</textarea>

            <br><br>

            <button type="submit">Update</button>

        </form>
    `);

});

app.post("/update-entry/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const db = readDatabase();

    const entry = db.entries.find(e => e.id === id);

    entry.content = req.body.entry;

    writeDatabase(db);

    res.redirect("/entries");

});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});