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
    const error = req.query.error || null;
    res.render("index", { inventory, search: null, error });
});

app.post("/add", (req, res) => {
    const inventory = loadInventory();
    const { brand, code, colour, yarnType, quantity, location } = req.body;

    if (inventory[code]) {
        const existing = inventory[code];
        const detailsMatch =
            existing.brand.trim().toLowerCase()    === brand.trim().toLowerCase()    &&
            existing.colour.trim().toLowerCase()   === colour.trim().toLowerCase()   &&
            existing.yarnType.trim().toLowerCase() === yarnType.trim().toLowerCase() &&
            existing.location.trim().toLowerCase() === location.trim().toLowerCase();

        if (detailsMatch) {
            // Same item — just add to the quantity
            existing.quantity += Number(quantity);
            saveInventory(inventory);
            return res.redirect("/");
        } else {
            // Code taken by a different item — warn the user
            const msg = encodeURIComponent(`Code "${code}" already exists with different details. Edit the existing entry instead, or use a different code.`);
            return res.redirect(`/?error=${msg}`);
        }
    }

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
    const { code, brand, colour, yarnType, quantity, location } = req.body;

    if (inventory[code]) {
        inventory[code].brand = brand;
        inventory[code].colour = colour;
        inventory[code].yarnType = yarnType;
        inventory[code].quantity = Number(quantity);
        inventory[code].location = location;
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
    const query = (req.query.q || "").trim().toLowerCase();

    let result = {};
    if (query) {
        for (const code in inventory) {
            const colour = (inventory[code].colour || "").toLowerCase();
            if (colour.includes(query)) {
                result[code] = inventory[code];
            }
        }
    }

    res.render("index", { inventory: result, search: req.query.q || "", error: null });
});



const PORT = 400;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

