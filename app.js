const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const FILE = "inventory.json";

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

function loadInventory() {
    if (fs.existsSync(FILE)) {
        return JSON.parse(fs.readFileSync(FILE, "utf-8"));
    }
    return {};
}

function saveInventory(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 4));
}

app.get("/", (req, res) => {
    const inventory = loadInventory();
    res.render("index", { inventory, search: null });
});

app.post("/add", (req, res) => {
    const inventory = loadInventory();
    const { brand, code, colour, yarnType, quantity, location } = req.body;

    inventory[code] = {
        brand,
        colour,
        yarnType,
        quantity: Number(quantity),
        location
    };

    saveInventory(inventory);
    res.redirect("/");
});



app.post("/update", (req, res) => {
    const inventory = loadInventory();
    const { code, quantity } = req.body;

    if (inventory[code]) {
        inventory[code].quantity = Number(quantity);
        saveInventory(inventory);
    }
    res.redirect("/");
});


app.post("/delete", (req, res) => {
    const inventory = loadInventory();
    delete inventory[req.body.code];
    saveInventory(inventory);
    res.redirect("/");
});


app.get("/search", (req, res) => {
    const inventory = loadInventory();
    const query = req.query.q;

    let result = {};
    if (query && inventory[query]) {
        result[query] = inventory[query];
    }

    res.render("index", { inventory: result, search: query });
});



const PORT = 400;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

