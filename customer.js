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
function validator(value) {
    var reg = /^\d+$/;
    return reg.test(value) || "Please enter a number!";
}

function showAll(func) {
    var select = "SELECT * FROM products";
    connection.query(select, function (err, result) {
        if (err) throw err;
        result.forEach(function (x, i) {
            console.log(`
                Item: ${result[i].product_name}
                ID: ${result[i].item_id}
                Price: ${ result[i].price}
                In stock: ${ result[i].stock_quantity}${divider}
                `);
        });
        func();
    })
};

function inqPrompt() {
    inquirer
        // Message to the user
        .prompt([
            {
                name: "item",
                message: "Enter ID of the item would you like to buy:",
                validate: validator
            },

            {
                name: "quantity",
                message: "How many would you like to buy?:",
                validate: validator
            }

        ]
        )
        // the meat
        .then(function (answer) {
            var id = answer.item;
            var select = "SELECT * FROM products WHERE item_id = ?";
            connection.query(select, [id], function (err, result) {
                if (err) throw err;
                var quantity = answer.quantity;
                var totalSpent = result[0].price * answer.quantity;
                var stock = result[0].stock_quantity;
                var remaining = result[0].stock_quantity -= quantity;
                // if not enough stock or answer is not a number
                if (quantity <= stock) {
                    // function to update stock 
                    function update() {
                        var upSyn = `UPDATE products SET stock_quantity = ? WHERE item_id = ?`;
                        connection.query(upSyn, [remaining, id], function (err) {
                            if (err) throw err;

                        });

                    }
                    // function to show the price
                    function transaction() {
                        console.log(`
                    ______________________________________
                    | You bought : ${result[0].product_name}  |
                    | Total spent: $${totalSpent}    |
                    | Only ${result[0].stock_quantity} left!       |
                    ---------------------------------------
                    `);

                    };
                    update();
                    transaction();
                }
                else {
                    console.log("ERROR");

                }
                inqPrompt()
            });


            // end of .then line
        });
};
showAll(inqPrompt);