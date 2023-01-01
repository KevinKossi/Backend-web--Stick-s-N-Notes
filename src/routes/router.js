const { json } = require('body-parser');
let express = require('express')
let router = express.Router()  // We gaan een router van de express instance nodig hebben


const pool = require(`../db`)


router.get('/', (req, res) => {
    res.render('login')
  })

router.get('/app', (req, res) => {
 const id = req.query.id
    pool.query('SELECT * FROM notes WHERE user = ? ', [id], (err,result ) => {
      if (err) {
        console.log(err)

      } else {  
        const empty = "There are no notes at this moment ! click on the "+" button to add one"
        result.empty = empty;
        result.userId  = id;
        return res.render("app", {
          result,
          
        }); }
    })
  })

router.get('/signup', (req, res) => {
    res.render('signup')
  })

router.get('/logout', (req, res) => {
    res.render('login')
  })

module.exports = router  // Dit laat ons toe om onze router te importeren in onze index.js file