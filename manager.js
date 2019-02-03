const mysql = require("mysql");
const inquirer = require("inquirer")
const divider = '\n--------------------------------------------------\n';
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});
//View Products for Sale
function showAll() {
    var select = "SELECT * FROM products";
    connection.query(select, function (err, result) {
        if (err) throw err;
        for (i = 0; i < result.length; i++) {
            console.log(`
            Item: ${result[i].product_name}
            ID: ${result[i].item_id}
            Price: ${ result[i].price}
            In stock: ${ result[i].stock_quantity}${divider}
            `);
        }
        inqPrompt();
    })
};
//View Low Inventory
function lowInventory(func) {
    var select = "SELECT * FROM products";
    connection.query(select, function (err, result) {
        if (err) throw err;
        for (i = 0; i < result.length; i++) {
            var stock = result[i].stock_quantity;
            if (stock <= 5)
                console.log(`
                Item: ${result[i].product_name}
                ID: ${result[i].item_id}
                Price: ${ result[i].price}
                In stock: ${ result[i].stock_quantity}${divider}
                `);
        }
        inqPrompt();
    });

};
function validator(value) {
    var reg = /^\d+$/;
    return reg.test(value) || "Please enter a number!";
 }
//Add to Inventory
function restock() {
    inquirer.prompt([
        {
            name: "item",
            message: "Which item do you want to restock?",
            validate: validator
        },
        {
            name: "num",
            message: "How many do you want to add?",
            validate: validator
        }
    ])
        .then(function (answer) {
            var id = answer.item;
            var amount = Number(answer.num);
            if (isNaN(amount)) {
                console.log("it's not a number");
            }
            var upSyn = `UPDATE products SET stock_quantity = ? WHERE item_id = ?`;
            var read = 'SELECT * FROM products WHERE item_id = ?';
            connection.query(read,[id], function (err, result) {
                if (err) throw err;
                var newStock = parseFloat(result[0].stock_quantity += amount);
                if (isNaN(newStock)) {
                    console.log("new stock's not a number");
                }
                var prodName = result[0].product_name;
                connection.query(upSyn, [newStock, id], function (err) {
                    if (err) throw err;
                    console.log(`
                        New stock amount for ${prodName}
                        is now ${newStock}
                    `);
                    inqPrompt();
                });
            });
           

        });

};

//Add New Product
function newProduct() {

    inquirer.prompt([
        {
            name: 'name',
            message: "Whats the product name?",

        },
        {
            name: 'department',
            message: 'What department does it belong to?',
        },
        {
            name: 'price',
            message: 'How much does it cost?',
            validate: validator
        },
        {
            name: 'stock',
            message: 'How many in stock?',
            validate: validator
        },
    ])
        .then(function (answer) {
            var insert = 'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUE (?, ?, ?, ?)';
            var readRecent = 'SELECT * FROM products ORDER BY item_id DESC LIMIT 1 ';
            var name = answer.name;
            var department = answer.department;
            var price = answer.price;
            var stock = answer.stock;
            connection.query(insert, [name, department, price, stock], function (err) {
                if (err) throw err;
                connection.query(readRecent, function (err, result) {
                    if (err) throw err;
                    console.log(`
                    Item: ${result[0].product_name}
                    ID: ${result[0].item_id}
                    Price: ${ result[0].price}
                    In stock: ${ result[0].stock_quantity}
                    Successfully added!${divider}
                    
                    `)
                    inqPrompt();
                });
            });
            
        });

};

function inqPrompt() {
    inquirer.prompt([
        {
            name: 'action',
            message: 'What would you like to do?',
            type: 'list',
            choices: ["View Products for Sale", 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        },
    ])
        .then(function (answer) {
            var response = answer.action
            if (response === "View Products for Sale") {
                showAll();
            }
            else if (response === 'View Low Inventory') {
                lowInventory();
            }
            else if (response === 'Add to Inventory') {
                restock();
            }
            else if (response === 'Add New Product') {
                newProduct();
            }
        });

};
inqPrompt();