
    const foodSubmit = document.getElementById('searchButton');
    const foodList = document.getElementById("app");
    const searchBar = document.getElementById('searchTerm');
    const refresher = document.getElementById("refreshNotes");
    const dashboard = document.getElementById('dashboard');
    const userId = document.getElementById("userId").value;

    let firstime = 0;
    let foodCards = [];


    dashboard.addEventListener('click', () =>{
        document.location = `/app?userId=${userId}`
    } )
    searchBar.addEventListener('keyup',  (e) => {
        const searchString = e.target.value.toLowerCase();
        console.log("ingetypt: " + searchString);  
        loadFood(searchString); 

    });

    const loadFood = async (E, error) => {
    try {
        const foodCardR = await fetch(`/search/:${E}?userid=${userId}`, {method:`GET`});
        let foodCards = await foodCardR.json();
        displayFoodCard(foodCards);
    }
    catch {error}
    {
        console.log(error);
    }
    };

    refresher.addEventListener('click', async () => {
        const foodCardR = await fetch(`/overview?userid=${userId}`, {method:`GET`});
        let foodCards = await foodCardR.json();
        displayFoodCard(foodCards);
    })

    const displayFoodCard = (foodCards) => {
        let htmlString = '';
        foodCards.forEach(foodCard => {

            let content = foodCard.content;
            let Bg_color = foodCard.Bg_color;
            let note_id = foodCard.note_id;
            let user_id = foodCard.user_id
            let birth = foodCard.created_at;

                    htmlString += ` 
                    <div class="text-container">

                    <div class= "note-front"> 
                    <textarea name="note" id="text_${note_id}" class="note" cols="20" rows="10" style="background-color: ${Bg_color};" >${content}</textarea>
                     </div>

                     <div class= "note-back" style="background-color: ${Bg_color};> 
                        <h3>Information</h3>
                        <p>#words: ${content.length} words
                        <br>created: ${birth}
                        <br>color: ${Bg_color}
                        </p>
                      </div>
                      <button type="button" class="btn btn-success" id="saveBtn" value= ${note_id} >Save</button>
                      <button type="button" class="btn btn-danger" id="deleteBtn" value= ${note_id}  >Delete</button>

                   </div>`

                

        })
       
        foodList.innerHTML = htmlString; 


    }