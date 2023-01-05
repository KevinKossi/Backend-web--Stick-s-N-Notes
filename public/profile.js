
let myName = document.querySelector("#myName")
let myEmail = document.querySelector("#myEmail")
let myPhone = document.querySelector("#myPhone")
let myAddress = document.querySelector("#myAddress")
let dashboard = document.querySelector("#Dashboard")

console.log(" script is loaded! ");

dashboard.addEventListener('click', )

      const profileData = async (userId) => {
    
        await fetch(`http://localhost:3250/profile?uid=${userId}`, {method: "GET"})
        .then( async res => await res.json())
        .then(resJson =>{
    
          myAddress.innerHTML = "*******";
          myEmail.innerHTML = resJson.myEmail;
          myName.innerHTML = `${resJson.firstname}  ${resJson.lastname}`
          myPhone.innerHTML = resJson.myPhone;
          
    
    
        } )
    
    
      }
      profileData(userId);
    
