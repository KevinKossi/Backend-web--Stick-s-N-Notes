const { json } = require('body-parser');
let express = require('express')
let router = express.Router()  // We gaan een router van de express instance nodig hebben


const pool = require(`../db`)


router.get('/', (req, res) => {
    res.render('login')
  })

router.get('/app', (req, res) => {
 const id = req.query.userId
    pool.query('SELECT * FROM notes WHERE user_id = ? ', [id], (err,result ) => {
      if (err) {
        console.log(err)

      } else {  

        if (result.length < 1 ) {
          const damn = {}
        const empty = "There are no notes at this moment ! click on the '+' button to add one"
        damn.empty = empty;
        damn.userId  = id;

        return res.render("app", {
          damn,
          
        });
          
        } else {
          console.log(result);
          return res.render("app", {
            result,
            
          });
        }
        


       }
    })
  })

router.get('/signup', (req, res) => {
    res.render('signup')
  })

router.get('/logout', (req, res) => {
    res.render('login')
  })

router.get('/account', (req, res) => {
  let data 

  if (req.query.userId) {
    const userId = req.query.userId
    pool.query(`SELECT  * FROM users WHERE user_id = ?`, [userId], (err, results) => {
      if (err){
        console.log(err);
      }
      else{
        var resultsArray = Object.values(JSON.parse(JSON.stringify(results)))
        if (resultsArray.length == 0 ) {
          console.log(" no values to be giving");
        }

        data = results;
        console.log(results);
        pool.query(`SELECT COUNT(notes.user_id) AS numberOfUserNotes FROM notes WHERE user_id = ?`, [userId], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            data.push(result[0])
            console.log( data);
            return res.render("profile", {
              data
            })

          }
  
      })

      }
    })


  } else {
    res.render('login')
  }
    

  })

module.exports = router  // Dit laat ons toe om onze router te importeren in onze index.js file