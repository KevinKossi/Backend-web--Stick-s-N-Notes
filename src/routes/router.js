const { json } = require("body-parser");
let express = require("express");
let router = express.Router(); // We gaan een router van de express instance nodig hebben

const pool = require(`../db`);

router.get("/", (req, res) => {
  instructions =     `<div><h1>hello Newcomer</h1>
                      <p>for the full usage of the API, i recommend you passing through the code first! 
                      <br> For start: create an account with /register or login using /login
                      </p>
  </div>`
return res.send(instructions);
});

router.get("/app", (req, res) => {
  const id = req.query.userId;
  // LIMIT AND OFFSET
  pool.query("SELECT * FROM notes WHERE user_id = ? ", [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length < 1) {
        const damn = {};
        const empty =
          "There are no notes at this moment ! add one with the  post /notes endpoint!";
        damn.empty = empty;
        damn.userId = id;

        return res.json(damn);
      } else {
        console.log(result);
        return res.json(result);
      }
    }
  });
});

router.get("/signup", (req, res) => {
  res.render("signup");
});





//acoount check
// router.get("/account", (req, res) => {
//   let data;

//   if (req.query.userId) {
//     const userId = req.query.userId;
//     pool.query(
//       `SELECT  * FROM users WHERE user_id = ?`,
//       [userId],
//       (err, results) => {
//         if (err) {
//           console.log(err);
//         } else {
//           var resultsArray = Object.values(JSON.parse(JSON.stringify(results)));
//           if (resultsArray.length == 0) {
//             return res.send(" no values to be giving");
//           }

//           data = results;
//           console.log(results);
//           pool.query(
//             `SELECT COUNT(notes.user_id) AS numberOfUserNotes FROM notes WHERE user_id = ?`,
//             [userId],
//             (err, result) => {
//               if (err) {
//                 console.log(err);
//               } else {
//                 console.log(result);
//                 data.push(result[0]);
//                 console.log(data);
//                 return res.json(data)
//                }
//             }
//           );
//         }
//       }
//     );
//   } else {
//   return  res.send("it seems that you aren't a legitimate member of our community, please login / register first ! ");
//   }
// });

// router.get("/overview", (req, res) => {


 

//   pool.query("SELECT * FROM notes WHERE user_id = ? LIMIT 10 OFFSET ? ", [id, Offset], (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       if (result.length < 1) {
//         const damn = {};
//         const empty =
//           "There are no notes at this moment ! Go to the dashboard to add notes";
//         damn.empty = empty;
//         damn.userId = id;

//         return res.render("overview", {
//           damn,
//         });
//       } else {
//         console.log(result);
//         result.push(page)
//         return res.render("overview", {
//           result,
//         });
//       }
//     }
//   });
// });


module.exports = router; // Dit laat ons toe om onze router te importeren in onze index.js file
