 // code is inspired from: https://www.youtube.com/watch?v=Efo7nIUF2JY&ab_channel=dcode


const notesContainer = document.getElementById("app");
console.log(notesContainer + "container");
const addNoteButton = notesContainer.querySelector(".add-note");
console.log(addNoteButton + " adding button ");
let x = document.getElementById("profile-class");
let notes = document.getElementById("app");
let state = document.getElementById("status")
let empty = document.querySelector("#empty")
let profile = document.querySelector("#profile")

const userId = document.querySelector("#userId").value



getNotes().forEach((note) => {
  const noteElement = createNoteElement(note.id, note.content);
  notesContainer.insertBefore(noteElement, addNoteButton);
});

addNoteButton.addEventListener("click", () => addNote());

function getNotes() {
  return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
}

function saveNotes(notes) {
  localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

function createNoteElement(id, content) {
  const element = document.createElement("textarea");


  element.classList.add("note");
  element.value = content;
  element.placeholder = "Empty Sticky Note";
  

  element.addEventListener("change", () => {
    updateNote(id, element.value);
  });

  element.addEventListener("dblclick", () => {
    const doDelete = confirm(
      "Are you sure you wish to delete this sticky note?"
    );

    if (doDelete) {
      deleteNote(id, element);
    }
  });

  return element;
}

function addNote() {
  const notes = getNotes();
  const noteObject = {
    id: Math.floor(Math.random() * 100000),
    content: ""
  };
  empty.style.display =  "none";
  
  const noteElement = createNoteElement(noteObject.id, noteObject.content);
  notesContainer.insertBefore(noteElement, addNoteButton);

  notes.push(noteObject);
  saveNotes(notes);
}

function updateNote(id, newContent) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id == id)[0];

  targetNote.content = newContent;
  saveNotes(notes);
}

function deleteNote(id, element) {
  const notes = getNotes().filter((note) => note.id != id);

  saveNotes(notes);
  notesContainer.removeChild(element);
}

function Myfunction() {

  // if (x.style.display === "none") {
  //   x.style.display = "block";
  // } else {
  //   x.style.display = "none";
  // }
  x.style.display = "block";
  notes.style.display = "none";
  state.style.display = "none";
}

profile.addEventListener('click', () => {

  document.location = `/account?userId=${userId}`
})



 

