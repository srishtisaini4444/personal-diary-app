const express = require("express");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "data", "database.json");


const app = express();
const PORT = process.env.PORT || 3000;
let currentUserId = null;

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

app.get("/diary", (req, res) => {

    if (currentUserId === null) {
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "public", "diary.html"));

});

app.post("/register", (req, res) => {

    const { username, password } = req.body;

    const db = readDatabase();

    const existingUser = db.users.find(
        user => user.username === username
    );

    if (existingUser) {
        return res.send(`
<script>
alert("⚠ Username already exists!");
window.location.href="/register";
</script>
`);
    }

    const newUser = {
        id: db.nextUserId,
        username: username,
        password: password
    };

    db.nextUserId++;

    db.users.push(newUser);

    writeDatabase(db);

    res.redirect("/");
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
    return res.send(`
<script>
alert("❌ Invalid Username or Password");
window.location.href="/";
</script>
`);
}

currentUserId = user.id;

    res.sendFile(path.join(__dirname, "public", "diary.html"));

});

app.get("/logout", (req, res) => {

    currentUserId = null;

    res.redirect("/");

});

app.post("/add-entry", (req, res) => {

    const { entry } = req.body;

    const db = readDatabase();

    // ------->>>>Temporary: use the last registered user mehuu meow🥺
     const currentUser = db.users.find(
    user => user.id === currentUserId
    );

    if (!currentUser) {
    return res.redirect("/");
}

    const now = new Date();

const newEntry = {

    id: db.nextEntryId,

    userId: currentUser.id,

    content: entry,

    date: now.toLocaleDateString(),

    time: now.toLocaleTimeString()

    };

    db.entries.push(newEntry);

    db.nextEntryId++;

    writeDatabase(db);

res.redirect("/entries");

});

app.get("/api/entries", (req, res) => {

    const db = readDatabase();

    if (currentUserId === null) {
        return res.json([]);
    }

    const userEntries = db.entries.filter(
        entry => entry.userId === currentUserId
    );

    res.json(userEntries);

});

app.get("/entries", (req, res) => {

    if (currentUserId === null) {
    return res.redirect("/");
    }


res.sendFile(path.join(__dirname,"public","entries.html"));

});

app.post("/delete-entry/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const db = readDatabase();

    const entry = db.entries.find(e => e.id === id);

    if (!entry) {
        return res.send("Entry not found.");
    }

    if (entry.userId !== currentUserId) {
        return res.send("Unauthorized!");
    }

    db.entries = db.entries.filter(e => e.id !== id);

    writeDatabase(db);

    res.redirect("/entries");

});

app.get("/edit-entry/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const db = readDatabase();

    const entry = db.entries.find(e => e.id === id);

    if (!entry) {
    return res.send("Entry not found.");
}

if (entry.userId !== currentUserId) {
    return res.send("Unauthorized!");
}

    res.send(`
<!DOCTYPE html>
<html>
<head>

<title>Edit Entry</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/css/style.css">

</head>

<body>

<div class="container">

<h1>✏ Edit Memory</h1>

<p class="subtitle">
Update your thoughts.
</p>

<form action="/update-entry/${id}" method="POST">

<textarea
name="entry"
required>${entry.content}</textarea>

<button class="login-btn">
💾 Update Memory
</button>

</form>

<p class="bottom-text">
<a href="/entries">← Back to Memories</a>
</p>

</div>

</body>
</html>
`);

});

app.post("/update-entry/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const db = readDatabase();

    const entry = db.entries.find(e => e.id === id);

    if (!entry) {
    return res.send("Entry not found.");
}

if (entry.userId !== currentUserId) {
    return res.send("Unauthorized!");
}

    entry.content = req.body.entry;

    writeDatabase(db);

    res.redirect("/entries");

});



if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;