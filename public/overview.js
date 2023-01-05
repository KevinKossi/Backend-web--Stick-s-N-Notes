const foodSubmit = document.getElementById('foodSubmit');
    const foodList = document.getElementById("foodList");
    const searchBar = document.getElementById('searchBar');
    let firstime = 0;
    let foodCards = [];

    searchBar.addEventListener('keyup',  (e) => {
        // filter alle resultaten en kijk of dat de keys uit het object van de food correspondeert met hetgeen wat er wordt opgezogcht 
        const searchString = e.target.value.toLowerCase();
        console.log("ingetypt: " + searchString);  
        loadFood(searchString); 
    });

    const loadFood = async (E, error) => {
    try {
        const foodCardR = await fetch(`/displayFood/${E}`, {method:`GET`});
        let foodCards = await foodCardR.json();
        displayFoodCard(foodCards);
    }
    catch {error}
    {
        console.log(error);
    }
    };

    const displayFoodCard = (foodCards) => {
        let htmlString = '';
        foodCards.forEach(foodCard => {
            let lactoserijk = false;
            const filters = ['milk', 'lactose'];
            const tags = foodCard.ingredients_tags.split(',');
            tags.forEach((tag) => {
                if(tag.includes(':')){
                    const [language, tagname] = tag.split(':');
                    filters.forEach(filter => {
                        if (tagname.includes(filter)) {
                            lactoserijk = true;
                        }
                    });
                }
            });
            if(lactoserijk){
                    htmlString += `<div class="SearchConatinerCard">
                    <img class="SearchContainerCardImg" src="${foodCard.image_small_url}"</img>
                    <div class="SearchContainerTableProdCard">
                        <div class="SearchContainerProductTitle">${foodCard.product_name}</div>
                        <table class="SearchContainerTable">
                            <thead>
                                <tr>
                                    <th class="SearchContainerItemsHead"> ${foodCard.ingredients_text} </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="SearchContainerItemsSub" style="display:none;">${foodCard.ingredients_tags}</td>
                                </tr>
                                <tr>
                                    <td class="SearchContainerItemsSub">${foodCard.allergens}</td>
                                </tr>
                                <tr>
                                    <td class="SearchContainerItemsSub">${foodCard.quantity}</td>
                                    <td style="display: none;"> 1 </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="SearchContainerBevatCard">
                        <div class="SearchContainerBevatCardText">Bevat: </div>
                        <div class="SearchContainerBevatCardItem">Lactose</div>
                    </div>
                    <button class="SearchContainerSave"><ion-icon name="save-outline"></ion-icon></button>
                </div>`
                }
                else {
                    htmlString += `<div class="SearchConatinerCard">
                    <img class="SearchContainerCardImg" src="${foodCard.image_small_url}"</img>
                    <div class="SearchContainerTableProdCard">
                        <div class="SearchContainerProductTitle">${foodCard.product_name}</div>
                        <table class="SearchContainerTable">
                            <thead>
                                <tr>
                                    <th class="SearchContainerItemsHead"> ${foodCard.ingredients_text} </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="SearchContainerItemsSub" style="display:none;">${foodCard.ingredients_tags}</td>
                                </tr>
                                <tr>
                                    <td class="SearchContainerItemsSub">${foodCard.allergens}</td>
                                </tr>
                                <tr>
                                    <td class="SearchContainerItemsSub">${foodCard.quantity}</td>
                                    <td style="display: none;" > 0 </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="SearchContainerBevatCard" >
                    <div class="SearchContainerBevatCardText">Bevat: </div>
                    <div class="SearchContainerBevatCardItem" style="display:none;">Lactose</div>
                </div>
                    <button class="SearchContainerSave"><ion-icon name="save-outline"></ion-icon></button>
                </div>`
            }
        })
       
        if(searchBar.value == '')
        {
            htmlString = `<div class='SearchConatinerNotYet'>Nog Geen Items Gevonden. <br> Zoek een Product </div>`
        }
        foodList.innerHTML = htmlString; 
        let SearchContainerSave = document.getElementsByClassName('SearchContainerSave');
        let card_array_SearchContainerSave = Array.from(SearchContainerSave);
        // SAVE BUTTON SEARCH OPSLAAN VAN DE DATA 
        card_array_SearchContainerSave.forEach(element => {
            element.addEventListener('click', async() => {
                
                // await fetch(`/saveP/`)
                const container = element.parentElement;
                const img_url = container.getElementsByTagName('img')[0].getAttribute('src');
                const food_name = container.querySelector('div.SearchContainerTableProdCard > div.SearchContainerProductTitle').innerText;
                const ingredients = container.querySelector('th').innerText;
                const results = container.querySelectorAll('td');
                const ingredient_tags = results[0].innerText;
                const allergens = results[1].innerText;
                const quantity  = results[2].innerText;
                const rijkArm  = results[3].innerText;
                
                await fetch(`/saveFood/${food_name}/${img_url}/${ingredients}/${allergens}/${quantity}/${rijkArm}`, {method:`POST`});
                document.getElementsByClassName('LacVrij')[0].style.display = 'block';
                document.getElementsByClassName('LacRijk')[0].style.display = 'block';
                document.getElementsByClassName('LacRijkDetail')[0].style.display = "none";
                document.getElementsByClassName('Search-Results')[0].style.display = "none";
            
            })
        })

    }

    if(firstime === 0){
        loadFood(); 
        firstime++;
    }