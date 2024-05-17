document.addEventListener('DOMContentLoaded', function() {
    let noteForm = document.querySelector('.note-form');
    let noteTitle = document.querySelector('.note-title');
    let noteText = document.querySelector('.note-textarea');
    let saveNoteBtn = document.querySelector('.save-note');
    let newNoteBtn = document.querySelector('.new-note');
    let clearBtn = document.querySelector('.clear-btn');
    let noteList = document.querySelector('.list-group'); // Ensure this selector matches your HTML
  
    let noteListItems = []; // Keep track of notes on the page for reference
  
    const show = (elem) => {
      elem.style.display = 'inline';
    };
  
    const hide = (elem) => {
      elem.style.display = 'none';
    };
  
    let activeNote = {};
  
    const handleFetchErrors = (response) => {
      if (!response.ok) {
          throw Error('The server returned an error: ' + response.statusText);
      }
      return response.json(); // This line expects a JSON response
  };
  
    const getNotes = () =>
      fetch('/api/notes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(handleFetchErrors);
  
    const saveNote = (note) =>
      fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      }).then(handleFetchErrors);
  
      const deleteNote = (id) =>
        fetch(`/api/notes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(handleFetchErrors);
  
    const renderActiveNote = () => {
      hide(saveNoteBtn);
      hide(clearBtn);
      if (activeNote.id) {
        noteTitle.setAttribute('readonly', true);
        noteText.setAttribute('readonly', true);
        noteTitle.value = activeNote.title;
        noteText.value = activeNote.text;
        show(newNoteBtn);
      } else {
        noteTitle.removeAttribute('readonly');
        noteText.removeAttribute('readonly');
        noteTitle.value = '';
        noteText.value = '';
        hide(newNoteBtn);
      }
    };
  
    const handleNoteSave = () => {
      const newNote = {
        title: noteTitle.value,
        text: noteText.value
      };
      saveNote(newNote).then(() => {
        getAndRenderNotes();
        renderActiveNote();
      }).catch(error => alert("Failed to save note: " + error));
    };
  
    const handleNoteView = (e) => {
      e.stopPropagation(); // Good practice to stop propagation
      const noteId = parseInt(e.target.closest('li').dataset.noteId); // Ensure this is how you set the data attribute
  
      // Find the note from noteListItems, which should be updated every fetch
      const note = noteListItems.find(note => note.id === noteId);
      if (note) {
        activeNote = note;
        renderActiveNote();
      }
    };
  
    const renderNoteList = (notes) => {
      noteList.innerHTML = '';
      noteListItems = notes; // Keep the local cache updated
  
      notes.forEach((note) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.setAttribute('data-note-id', note.id); // Ensure IDs are set correctly
  
        const titleSpan = document.createElement('span');
        titleSpan.textContent = note.title;
        li.appendChild(titleSpan);
  
        const deleteBtn = document.createElement('i');
        deleteBtn.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Stop the click from propagating to the li
          handleNoteDelete(note.id);
        });
        li.appendChild(deleteBtn);
  
        li.addEventListener('click', handleNoteView); // Attach view handler
        noteList.appendChild(li);
      });
    };
  
    const handleNoteDelete = (noteId) => {
      deleteNote(noteId).then(() => {
        getAndRenderNotes(); // Refresh the list
      }).catch(error => {
        alert("Failed to delete note: " + error.message);
      });
    };
  
    const getAndRenderNotes = () => {
      getNotes().then(notes => {
        renderNoteList(notes);
        if (!activeNote.id) {
          renderActiveNote();
        }
      });
    };
  
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', () => {
      activeNote = {};
      renderActiveNote();
    });
    clearBtn.addEventListener('click', () => {
      activeNote = {};
      renderActiveNote();
    });
    noteForm.addEventListener('input', () => {
      if (noteTitle.value.trim() && noteText.value.trim()) {
        show(saveNoteBtn);
        show(clearBtn);
      } else {
        hide(saveNoteBtn);
        hide(clearBtn);
      }
    });
  
    getAndRenderNotes();
  });  