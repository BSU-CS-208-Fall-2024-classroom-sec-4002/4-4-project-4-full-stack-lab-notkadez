import express from 'express'
import sql from 'sqlite3'

const sqlite3 = sql.verbose()

// Create an in memory table to use
const db = new sqlite3.Database(':memory:')

// This is just for testing you would not want to create the table every
// time you start up the app feel free to improve this code :)
db.run(`CREATE TABLE todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL)`)

const app = express()
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    console.log('GET called')

    const local = { tasks: [] }
    db.each('SELECT id, task FROM todo', function (err, row) {
        if (err) {
        console.log(err)
        } else {
        local.tasks.push({ id: row.id, task: row.task })
        }
    }, function (err, numrows) {
        if (!err) {
        res.render('index', local)
        } else {
        console.log(err)
        }
    })
})

app.post('/', function (req, res) {
    const todo = req.body.todo
    // If todo is empty, simply continue without adding to db
    if (!todo) { 
        res.redirect("/");
        return;
    }

    console.log('Adding todo item')

    // Prepare insert statement using parametrized statement
    // No extra sanitization is needed here as using prepared parameterized statements is enough
    const stmt = db.prepare('INSERT INTO todo (task) VALUES (?)')
    stmt.run(todo)
    stmt.finalize()

    // Redirect to main page
    res.redirect("/")
})

app.post('/delete', function (req, res) {
    // Get the item id
    const item_id = req.body.id;
    console.log('Deleting todo item with id ' + item_id + "...")
    
    // Check if the item id is a valid number
    if (isNaN(Number(item_id))) {
        console.log("Invalid todo item id")
    } else {
        // Prepare delete statement using parametrized statement
        const stmt = db.prepare('DELETE FROM todo where id = (?)')
        stmt.run(req.body.id)
        stmt.finalize()
    }

    // Redirect to main page
    res.redirect("/")
})

// Start the web server
app.listen(3000, function () {
    console.log('Listening on port 3000...')
})