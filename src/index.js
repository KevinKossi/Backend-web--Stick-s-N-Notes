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
global.isLoggedIn = false

const port = process.env.PORT || 3250;
app.listen(port, () => console.info('Server started at port 3250'))  


app.use(Router)

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


let isLoggedIn = false 

// URL ENDPOINTS

// register user 
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
                global.isLoggedIn = true;
                return res.redirect(`/user?userId=${resu[0].user_id}`);
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
    return res.json(message)
    
  }
});
// login user
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

          global.isLoggedIn = true;
          return  response.redirect(`/user?userId=${results[0]["user_id"]}`);

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

app.get("/logout", (req, res) => {
  global.isLoggedIn = false;
  return res.redirect("/login");
});

// del user check
app.delete('/user', (req, res) => {
  global.isLoggedIn == true ? console.log("user is logged in") : res.redirect(`/login`);
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
// update user info check
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

// get notes check 
app.get('/notes', (req, res) => {
  const id = parseInt(req.query.userId);
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);
  let offset = (page - 1) * limit

  if (!req.query.page || !req.query.limit ) {
    return res.status(404).send(" please fill in the URL correctly! '/notes?userId=[id user]&page=[page]&limit=[#results]'") 
  }

  if (!req.query.userId) {
    return res.status(404).send(" can't find the userId ! '/notes?userId=[id user]&page=[page]&limit=[#results]'")
  }


  let data = []
  const results = {

  }
  let NOnotes 
  pool.query("SELECT COUNT(note_id) AS NoNotes FROM notes where user_id = ? ", [id], (err, resu)=> {
    if (err) {
      console.log(err);
      return res.status(500).send(err)}
    else {
      if (resu.length > 0) {
        NOnotes = resu[0].NoNotes
        console.log(NOnotes);

      }}
  })

  const damn = {};
  pool.query("SELECT *  FROM notes WHERE user_id = ? LIMIT ? OFFSET ? ", [id, limit, offset], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err)
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
        if (offset > 0) {
          results.previous = {
            page: page - 1,
            limit: limit,
          }
        }
        if (page * limit < NOnotes) {

        results.next = {
          page: page + 1,
          limit: limit,
        }
      
      }
      data.push(results);
      data.push(result);
        console.log(result);
        return res.json(data);
      }
    }
  });
})
// change note color check
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

// search note based on content
app.get('/search', (req,res) => {

let key = '' ;
let keyQuery = '';
let note;
let colorQuery = ''
const userId = req.query.userId;
if (req.query.key) {
  key = req.query.key
   note = `%${key}%`
   keyQuery = `AND content LIKE ? `
}

if (req.query.color) {
  color = req.query.color

   colorQuery = `AND Bg_color LIKE "%${color}%" `
}



      pool.query(`SELECT * FROM notes WHERE user_id = ? ${keyQuery} ${colorQuery}`,[userId, note],(error,results) =>{
        if(error){
          return res.status(404).json({example: " http://localhost:3250/search?userId=[id user]&color=[color of note]&key=[content]"})

        }
        if(results.length < 1){

            return res.json({msg: "nohting to be found, pleas check your queries",example: " http://localhost:3250/search?userId=[id user]&color=[color of note]&key=[content]"})
        }
        else{
          return res.json(results)
        }
     });
  

})



  // auth users only en dan enkel nog de search + readMe
