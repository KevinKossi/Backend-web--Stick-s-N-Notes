let express = require('express')
let router = express.Router()  // We gaan een router van de express instance nodig hebben

router.get('/', (req, res) => {
    res.render('login')
  })

router.get('/app', (req, res) => {
    console.log(req.params + "is what i received from login / register ")
    const userId = req.params.userId
    
    db.query('SELECT * FROM notes WHERE userId = ? ', [userId], (err,result ) => {
      if (err) {
        console.log(err)

      } else {  

        return response.render("app", {
          result
        });      }
    })

  })

router.get('/signup', (req, res) => {
    res.render('signup')
  })

router.get('/logout', (req, res) => {
    res.render('login')
  })

module.exports = router  // Dit laat ons toe om onze router te importeren in onze index.js file