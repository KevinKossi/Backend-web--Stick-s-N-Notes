 // code is inspired from: https://www.youtube.com/watch?v=Efo7nIUF2JY&ab_channel=dcode

let count = 0 ;
const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");
let x = document.getElementById("profile-class");
let notes = document.getElementById("app");
let state = document.getElementById("status")
let empty = document.querySelector("#empty")
let profile = document.querySelector("#profile")

const userId = document.querySelector("#userId").value
const allNotes = Array.from(document.querySelectorAll(".note"))
const deleteBtns = Array.from(document.querySelectorAll(".btn-danger"))
const saveBtns = Array.from( document.querySelectorAll(".btn-success"))

//  change background color for each textarea that exists:
allNotes.forEach(el =>{

  el.addEventListener("dblclick", () => {

   let color =  prompt(" change the color of your note: ");
    let noteid = el.id.split("_")[1]

    if (color != '') {
      el.style.background = color
      updateColor(color,noteid);
    }
  })
  


})

deleteBtns.forEach(btn => {
btn.addEventListener("click", () =>
{
  let noteId = btn.value

  const doDelete = confirm(
    "Are you sure you wish to delete this sticky note?"
  );

  if (doDelete) {
    deleteNote(userId, noteId);
    btn.parentElement.remove();
  }
})
 
});

saveBtns.forEach(btn => {
  let noteId = btn.value
  let textarea = document.getElementById(`text_${noteId}`);
  let content
  textarea.addEventListener('input', () => {
    content = document.getElementById(`text_${noteId}`).value;
  })

  btn.addEventListener("click", () =>
  {
    updateNote(noteId, content);
  })
   
  });



addNoteButton.addEventListener("click", () => addNote());




const addNote = async() => {
  
  const noteObject = {
    userid:userId ,
    content: `empty${++count}`
  };

  if (empty) {
    empty.style.display =  "none";
  }

  const response = await fetch('/notes', {method: "POST", headers:{'Content-Type':'application/json'},body: JSON.stringify(noteObject)})

  const data = await response.json();

if (data.insertion == true) {

  createNoteElement(data[0])
  alert(data[0]["message"])

} else {
  alert(data[0]["message"])
} 
}

const createNoteElement = (data) =>  {
  console.log('ik zit erin')
  const element = document.createElement("textarea");
  const saveBtn = document.createElement("button");
  const delBtn = document.createElement("button");
  const div  = document.createElement("div");


  // voor textarea
  element.classList.add("note");
  element.placeholder = "Empty Sticky Note";
  element.id = `text_${data["note_id"]}`;
  element.style.backgroundColor = 'lightblue';

  //save button
  saveBtn.type = "button";
  saveBtn.classList.add("btn btn-success");
  saveBtn.id = "saveBtn";
  saveBtn.value = `${data["note_id"]}`
  saveBtn.innerHTML = "Save"

 //delete buttton
  delBtn.type = "button";
  delBtn.classList.add("btn btn-danger");
  delBtn.id = "deleteBtn";
  delBtn.value = `${data["note_id"]}`
  delBtn.innerHTML = "Delete"

//div

div.classList.add("text-container");
div.appendChild(element)
div.appendChild(saveBtn)
div.appendChild(delBtn)

notesContainer.appendChild(div);

  return div;
}

//update color of the note 
const updateColor = async (color,noteid) => {
 const response  = await fetch('/color', {method: "PUT",headers:{	'Content-Type':'application/json'},body:JSON.stringify({Bg_color:color,noteid:noteid ,userid:userId})})
 const data =await response.json()
 alert(data.message)

 // logbar: changed element met id = ? to color

}

const updateNote = async (noteID, newContent) => {

  const updata = {
    userid: userId,
    noteid: noteID,
    content: newContent

  }
  const response = await fetch(`/notes`,{method:"PUT", headers:{	'Content-Type':'application/json'}, body: JSON.stringify(updata)})
  
  const data = await response.json()
  alert(data.message)
}

const deleteNote = async(userID, noteID) =>  {
 const response = await fetch(`/notes?user_id=${userID}&note_id=${noteID}`,{method:"DELETE"})

 const data = await response.json();
 alert(data.message)


}


profile.addEventListener('click', () => {

  document.location = `/account?userId=${userId}`
})



 

