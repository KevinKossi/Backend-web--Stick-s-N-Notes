let express = require('express')    // We require'n de express module
let app = express()                 // We starten een nieuwe express app en maken dit beschikbaar in de variabele app
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require("mysql");
const bcrypt = require("bcrypt")
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);


const port = process.env.PORT || 3250;
app.listen(port, () => console.info('Server started at port 3250'))  

let Router = require('./routes/Router')

app.use(Router)

app.use((req, res, next) => {  // We geven hier de parameters request, response en next (die de request gaat doorsturen naar de volgende functie)
    console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body)  // We loggen de huidige datum en de URL
    next()  // Als we next hier niet aanroepen zal de browser de pagina eindeloos blijven laden. Eventueel kunnen we hier bvb ook een res.send('blabla') terugsturen als we de executie van deze paginga willen afbreken.
  })

  // waar dat de frontend zich gaat bevinden
const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// connectie met hbs 
app.set('view engine', 'hbs');  

app.use('/', require('./routes/router'));
// app.use('/auth', require("./routes/auth"));
app.use("/assets", express.static("assets"));


// beschermingvan gevoelige info

dotenv.config({ path:'./.env' });


// //Connection User Data Base 
const db = mysql.createPool({
  host: process.env.DATABASE_HOST, // nu local, indien je server hebt, schrijf je IP adres van server,
  user: process.env.DATABASE_USER,
  password:process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT
});

db.getConnection(function(err) {
    if (err) throw err;
    console.log("Connected to database");
  });


// URL ENDPOINTS 
app.post('/register',(req, res) => {
  console.log(req.body)

  const Firstname = req.body.name;
  const Lastname = req.body.Lname;
  const Email = req.body.email;
  const Password = req.body.password;
  const PwdConfirm = req.body.passwordconfirm;
  const Phone = req.body.telephone;
  // const salt = bcrypt.genSaltSync(10);
  // const hash = bcrypt.hashSync(Password, salt);

  if (Password == PwdConfirm ) {
      
  db.query("INSERT INTO users (firstname, email, lastname, password, phone) VALUES (?, ?, ?, ?,?)", [Firstname, Email, Lastname, hash, Phone], (error, results) => {

    if (error) {
        console.log(error);
        let bad = 'email has already been registered ! please login or use another email ';
        const message = {
            "mail": bad,
            "registration": false
        };
        return response.render("signup", {
          message
      });
    }
    else {
        let good = "data has been succesfully transfered to the database";

        db.query("SELECT id FROM users WHERE email = ? ", [Email], (error, resu) => {
            if (error) {
                console.log(error);
                let bad = 'cannot receive ID from the user ';
                const message = {
                    "id": bad,
                    "registration": false
                };
                return res.render("signup", {
                  message
              });
            } else {
                const result = {
                    "reason": good,
                    "registration": true,
                    "userId": resu[0].id,
                    "email": Email,
                    "firstname": Firstname,
                    "lastname": Lastname,
                }

                return res.redirect("/app", {
                  result
              });
            }
        })
    }
});
    
  } else {
    let bad = " passwords don't match ! "
    const message = {
      "password": bad,
      "registration": false

    }
    return res.render("signup", {
      message
  });
    
  }
});

app.post('/login',   (req, response) => {
  console.log(req.body);
  const Email = req.body.Email;
  const Password = req.body.Password;
  const message = {
    email: `` ,
    
    password: ``
  };
  //  dit is optioneel, kan dat we later de gegevens zullen opslaan in een session.
  const data = {
    email: ``,
    userId: ``
  }

  db.query("SELECT email, password, id FROM users WHERE  email = ? ",[Email], (error,results ) => {
    var resultArray = Object.values(JSON.parse(JSON.stringify(results)))

     // als de account bestaat:
     if(error){
      console.log(error);
      let bad = " there is no user with this account ! please sign up first "
      message.email = bad;
      return response.render("login", {
        message
      });

      }   
      if (resultArray.length > 0){
        Password_hash = results[0]["password"];
        console.log(results)
        const verify = bcrypt.compareSync(Password, Password_hash);

        if(verify){

            req.session.isAuth = true;
            loggedin = true;
            module.exports = loggedin;
            console.log(req.session.id);
            module.exports.cookiedough = req.session.id;
            module.exports.cookieauth =  req.session.isAuth;
            //  met sessionstore werken waarbij ik dat in een globale var steek of direct meegeven als params 
           data.email = Email;
           data.userId = results[0]["id"];

           
            console.log( " cookies sent is: " + req.session.auth );
            console.log("User: ",Email,"just logged in!"," -->  pass to app ! ");
            response.redirect("/app", { data});

          }else{
            console.log( req.body)
            message.password = `password incorrect`;
            console.log(message.password);
            return response.render("login", {
              message
          });
          }

      }
      else{
          console.log( req.body)
          message.email = 'email incorrect ';
          console.log(message.email);
         return response.render("login", {
            message
        });
      }
      

    });
});