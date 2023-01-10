let express = require('express')    // We require'n de express module
let app = express()                 // We starten een nieuwe express app en maken dit beschikbaar in de variabele app
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const {body, validationResult} = require('express-validator')
const bcrypt = require("bcrypt")
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);

const pool = require("./db")
let Router = require('./routes/Router')
require("./global")

const port = process.env.PORT || 3250;
app.listen(port, () => console.info('Server started at port 3250'))  


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




pool.getConnection(function(err) {
    if (err) throw err;
    console.log("Connected to database");
  });




  app.use(session({
    secret: 'Mpxnchii',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))




// URL ENDPOINTS

// register user check
app.post('/register',  [
  body('telephone').isMobilePhone().withMessage("no regional code, just start your mobile phone with 0"),
  body('email').trim().isEmail().withMessage('Email must be a valid one.'),
  body('password').trim().isStrongPassword().withMessage('The password is not strong enough. your password must have at least: \n 1 lowercase,\n 1 uppercase, \n 1 number \n 1 symbol.'),
  body('name').trim().isLength({min: 3, max: 20}).withMessage('Name must be between 3 and 20 characters.').isAlpha().withMessage("names can only contain letters "),
  body('Lname').trim().isLength({min: 3, max: 20}).withMessage(' Last name must be between 3 and 20 characters.').isAlpha().withMessage("names can only contain letters "),
  body('passwordconfirm').trim().isLength({min: 8, max: 20}).withMessage('Password Confirm must be between 8 and 20 characters.'),
  body('passwordconfirm').custom((value, { req }) => {
    if (value != req.body.password)
        throw new Error('Passwords must match.');

    return true;
}).withMessage('Passwords must match.'),
] ,(req, res) => {

        const errors = validationResult(req);
        const vb =         {
          name: "yourName",
          Lname: "your Last name",
          email: "valid email",
          password:" password",
          passwordconfirm:"confirm password",
          telephone: "your phone number",

        }
        
        if (!errors.isEmpty() ) {
          return res.json({errors: errors.array(),
                          example: vb});
        }
        if (!req.body) {
          return res.json({example:vb})
        }
  const Firstname = req.body.name;
  const Lastname = req.body.Lname;
  const Email = req.body.email;
  const Password = req.body.password;
  const PwdConfirm = req.body.passwordconfirm;
  const Phone = req.body.telephone;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(Password, salt);

  if (Password == PwdConfirm ) {
      
  pool.query("INSERT INTO users (firstname, email, lastname, password, phone) VALUES (?, ?, ?, ?,?)", [Firstname, Email, Lastname, hash, Phone], (error, results) => {

    if (error) {
        console.log(error);
        let bad = 'email has already been registered ! please login or use another email ';
        const message = {
            "mail": bad,
            "registration": false
        };
        return res.json(message);
    }
    else {
        let good = "data has been succesfully transfered to the database";

        pool.query("SELECT user_id FROM users WHERE email = ? ", [Email], (error, resu) => {
            if (error) {
                console.log(error);
                let bad = 'cannot receive ID from the user ';
                const message = {
                    "message": bad,
                    "registration": false
                };
                return res.json(message);
            } else {
                const result = {
                    "reason": good,
                    "registration": true,
                    "userId": resu[0].user_id,
                    "email": Email,
                    "firstname": Firstname,
                    "lastname": Lastname,
                    "auth": true
                }

                return res.redirect(`/app?userId=${resu[0].user_id}`);
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
// login check --> almost 
app.post('/login',[
  body('email').trim().isEmail().withMessage('Email must be a valid one.'),
]  ,
 (req, response) => {
  console.log(req.body);
  const Email = req.body.email;
  const Password = req.body.password;
  const message = {
    msg: `` ,
    login: false
  };

  const errors = validationResult(req);
  if (!errors.isEmpty() ) {
    return res.json({errors: errors.array(),
                    example: vb});
  }
  const vb =         {
    email: "valid email",
    password:" password",
  }
  if (!req.body) {
    return res.json({example:vb})
  }

  pool.query("SELECT email, password, user_id FROM users WHERE  email = ? ",[Email], (error,results ) => {
    // var results = Object.values(JSON.parse(JSON.stringify(results)))

     // als de account bestaat:
     if(error){
      console.log(error);
      let bad = " there is no user with this account ! please sign up first "
      message.msg = bad;
      message.example = vb
      return response.json( message);

      }   
      if (results.length > 0){
        Password_hash = results[0]["password"];
        console.log(results)
        const verify = bcrypt.compareSync(Password, Password_hash);

        if(verify){

          global.loggedIn = true;
          return  response.redirect(`/app?userId=${results[0]["user_id"]}`);

          }else{
            message.msg = `password incorrect`;
           message.example = vb;
            return response.json(message);
          }

      }
      else{
          message.msg = 'email incorrect ';
          console.log(message.msg);
         return response.json(message);
      }
      

    });
});

// del user check
app.delete('/user', (req, res) => {
  const userId = req.query.userId;
  pool.query("DELETE FROM users WHERE user_id =?", [userId], (error,result) => {
    if (error) {
      const erro = {
        "msg": `there has been a problem with deleting your account. doublecheck your userId`,
        "registration": false
      };
      return res.json(erro);
    }
      
    else{
      console.log(res);
      let message = {
        "msg": `user ${userId} has been deleted!`,
        "registration": true
      };
      return res.json(message);
    }
  });
})
// get users check
app.get('/user', (req, res) => {
  let data 
  if (req.query.userId) {
    pool.query("SELECT * FROM users WHERE  user_id = ?",[req.query.userId],(error, result) => {
      if (error) {
        console.log(error);
        let erro = {
          "msg": `there has been a problem  retrieving your account data. doublecheck your query if the userId that you sent is correct. \n if you want all the accounts, then don't use a query`,
          "receiveUser": false
        };
        return res.json(erro);
      }
      else{
          var resultsArray = Object.values(JSON.parse(JSON.stringify(result)));
          if (resultsArray.length == 0) {
            return res.send(" no values to be giving");
          }
          else{
          data = result;
          console.log(result);
          pool.query(
            `SELECT COUNT(notes.user_id) AS numberOfUserNotes FROM notes WHERE user_id = ?`,
            [req.query.userId],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                data.push(result[0]);
                data[1].receiveUser = true
                console.log(data);
                return res.json(data)
               }
            }
          );
          }

        // console.log(result); 
        // let message = {
        //   "user":result,
        //   "receiveUser": true
        // };
        // return res.json(message);
      }
  
  })
  } else {
    pool.query("SELECT * FROM users", (error, result) => {
      if (error) {
        let erro = {
          "msg": `there has been a problem with deleting your account. doublecheck your userId`,
          "receiveAllUsers": false
        };
        return res.json(erro);
      }
      else{
        console.log(result); 
        let message = {
          "msg": `there are ${result.length} users`,
          "users":result,
          "receiveAllUsers": true
        };
        return res.json(message);
      }
  
  })
  }
})
// put users check
app.put('/user', (req, res) => {
  const userId = req.body.userId;
  const Profession = req.body.profession;
  const About_me  = req.body.about_me;

  const vb = {
    about_me: " a description of who you are",
    profession: "what is your profession ? ",
    userId: "userId"
  }
  
  pool.query(" UPDATE users SET Profession = ?, About_me = ? WHERE  user_id = ?",[ Profession, About_me, userId ],(err,resu) => {
    if (err) {

      let erro = {
        "msg": `there has been a problem updating your account. doublecheck your userId`,
        "updateUser": false,
        "example": vb
      };
      return res.json(erro);
      }else{
        if (resu.affectedRows == 0) {
          let erro = {
            "msg": `there has been a problem updating your account. doublecheck your userId`,
            "updateUser": false,
            "example": vb
          };
          return res.json(erro);
        }
        console.log(resu); 
        let message = {
          "msg": `user ${userId} has been updated!`,
          "updateUser": true
        };
        return res.json(message);
      }
      
    })
  })

//----------------------------------

// for the notes
// insert new note check 
app.post('/notes', (req,  res) => {
  const userId = req.body.userId
  const content = req.body.content

  const vb =         {
    userId: "id of the user",
    content:" content of the new note",
  }
  pool.query("INSERT INTO notes (user_id, content) VALUES (?, ?)", [userId, content], (error, results) => {

    if (error) {
        console.log(error);
        let bad = 'error creating a new note in the database ';
        const message = {
            "message": bad,
            "insertion": false
        };
        return res.json({error: message, example:vb});
    }
    else {
        

        pool.query(`SELECT * FROM notes WHERE user_id = ? AND content LIKE ?`, [userId,content], (error, resu) => {
            if (error) {
                console.log(error);
                let bad = 'cannot receive ID from the user ';
                const message = {
                    "message": bad,
                    "insertion": false
                };
                return res.json(message);
            } else {

              let good = "new note has been succesfully inserted to the database";
              resu[0].insertion = true
              resu[0].message = good
              console.log(resu);

                return res.json(resu);
            }
        })
    }
});

})

//delete note check
app.delete('/notes/:userId/:noteId', (req,res) => {
  const userId = req.params.userId
  const noteId = req.params.noteId
  const data = {
    message:"",
    deletion:false

  }
  pool.query('DELETE FROM notes WHERE note_id = ?  AND user_id = ?', [noteId,userId], (err,result ) => {
    if (err) {
      console.log(err)
      data.message = " there has been a problem, deleting your precious note";
    
      return res.json(data)

    } else {  
      if (result.affectedRows == 0 ) {
         console.log(result);
        data.message = " i can't find the note, double check the noteid OR userid please. the correct endpoint: /notes/:userId/:noteId  ";
    
      return res.json(data)
      }
      console.log(result)
      data.message = " note has been succesfully deleted !";
      data.deletion = true 
      return res.json(data); }  
  })
  
})
// update note check
app.put('/notes', (req,res) => {

  const vb = {
    userId: "id of the user",
    noteId: " id of the note ",
    content:" content of the new note",
    Bg_color:" color of the note "
  }

  const data = { 
    update: false,
    message: ""

  }
 const userId = req.body.userId;
 const noteId = req.body.noteId;
 const content = req.body.content;
 const Bg_color = req.body.Bg_color;
  
  pool.query('UPDATE notes SET content = ?, Bg_color = ?  WHERE user_id = ? AND note_id = ?  ', [content, Bg_color, userId, noteId], (err,result ) => {
    if (err) {
      console.log(err)
      return res.send(err)

    } else {  
      if (result.affectedRows == 0 ) {
        
       data.message = " i can't find the note, double check the noteid OR userid please.";
   
     return res.json({msg:data,example:vb})
     }
      console.log(result);

      data.message = " succesfully updated the note in the database ! ";
      data.update = true;
      return res.json(data)
    }  
  })

  
})


app.get('/notes', (req, res) => {
  const id = req.query.userId;
  // LIMIT AND OFFSET
  const damn = {};
  pool.query("SELECT * FROM notes WHERE user_id = ? ", [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length < 1) {
        console.log(result);
        const empty =
          "There are no notes at this moment ! add one with the  post /notes endpoint!";
        damn.empty = empty;
        damn.userId = id;
        damn.example = "correct endpoint: /notes?userId=[id of user]"

        return res.json(damn);
      } else {
        console.log(result);
        return res.json(result);
      }
    }
  });
})

app.put('/color', (req,res) => {

  const color = req.body.Bg_color;
  const noteId = req.body.noteid;
  const userId = req.body.userid
   
   pool.query('UPDATE notes SET Bg_color = ?  WHERE user_id = ? AND note_id = ? ', [color, userId, noteId], (err,result ) => {
     if (err) {
       console.log(err)
 
     } else {  
       const data = { 
         update: true,
         message: " succesfully updated color in the database ! "
 
       }
       return res.json(data)
     }  
   })
 
   
 })

app.get('/search/:key', (req,res) => {

const key = req.params.key;
const userId = req.query.userid

if(key === 'undefined'){
   
  pool.query(`SELECT * FROM notes WHERE user_id = ? `,(error,result) => {
    if(error){

      console.log(error)

    }if(result){

            return res.json(result);
        }
      });
    }
    else{

      let note = `%${key}%`
      pool.query(`SELECT * FROM notes WHERE content LIKE ? AND user_id = ? LIMIT 10`,[note, userId],(error,results) =>{
        if(error){
          console.log(error)

        }
        if(results){
            food_data = JSON.stringify(results);

            return res.send(food_data);
        }
     });
  }

})

app.get('/search/', (req,res) => {

  const key = req.query.content;
  const userId = req.query.userid;
  const Bg_color = req.query.Bg_color;
  
  if(key === 'undefined'){
     
    pool.query(`SELECT * FROM notes WHERE user_id = ? `,(error,result) => {
      if(error){
  
        console.log(error)
  
      }if(result){
  
              return res.json(result);
          }
        });
      }
      else{
  
        let note = `%${key}%`
        pool.query(`SELECT * FROM notes WHERE content LIKE ? AND user_id = ? LIMIT 10`,[note, userId],(error,results) =>{
          if(error){
            console.log(error)
  
          }
          if(results){
              food_data = JSON.stringify(results);
  
              return res.send(food_data);
          }
       });
    }
  
  })