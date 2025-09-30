class NoteCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const note = JSON.parse(this.getAttribute('note'));
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    background: var(--card-background);
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 4px 8px var(--shadow-color);
                }
                h3 {
                    margin-top: 0;
                    color: var(--primary-color);
                }
                p {
                    flex-grow: 1;
                }
                .date {
                    font-size: 0.8em;
                    color: #999;
                }
                .controls {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                 button {
                    padding: 5px 10px;
                    border: none;
                    border-radius: 5px;
                    background-color: var(--primary-color);
                    color: #fff;
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: background-color 0.3s;
                }
                button:hover {
                    background-color: var(--primary-color-dark);
                }
            </style>
            <div>
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <p class="date">${new Date(note.date).toLocaleString()}</p>
                <div class="controls">
                    <button class="edit">Edit</button>
                    <button class="delete">Delete</button>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('.edit').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('edit-note', { detail: note }));
        });

        this.shadowRoot.querySelector('.delete').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-note', { detail: note }));
        });
    }
}

customElements.define('note-card', NoteCard);

document.addEventListener('DOMContentLoaded', () => {
    const notesContainer = document.getElementById('notes-container');
    const searchInput = document.getElementById('search');
    const addNoteButton = document.getElementById('add-note');
    const themeToggleButton = document.getElementById('theme-toggle');
    const modal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('modal-title');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveNoteButton = document.getElementById('save-note');
    const closeButton = document.querySelector('.close-button');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;

    const saveNotes = () => {
        localStorage.setItem('notes', JSON.stringify(notes));
    };

    const renderNotes = (filteredNotes = notes) => {
        notesContainer.innerHTML = '';
        filteredNotes.forEach(note => {
            const noteCard = document.createElement('note-card');
            noteCard.setAttribute('note', JSON.stringify(note));
            noteCard.addEventListener('edit-note', (e) => openModal(e.detail));
            noteCard.addEventListener('delete-note', (e) => deleteNote(e.detail.id));
            notesContainer.appendChild(noteCard);
        });
    };

    const openModal = (note = null) => {
        if (note) {
            modalTitle.textContent = 'Edit Note';
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            currentNoteId = note.id;
        } else {
            modalTitle.textContent = 'Add Note';
            noteTitleInput.value = '';
            noteContentInput.value = '';
            currentNoteId = null;
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const saveNote = () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!title || !content) {
            alert('Please enter a title and content for your note.');
            return;
        }

        if (currentNoteId) {
            notes = notes.map(note => 
                note.id === currentNoteId ? { ...note, title, content, date: new Date() } : note
            );
        } else {
            const newNote = {
                id: Date.now(),
                title,
                content,
                date: new Date(),
            };
            notes.push(newNote);
        }

        saveNotes();
        renderNotes();
        closeModal();
    };

    const deleteNote = (noteId) => {
        if(confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== noteId);
            saveNotes();
            renderNotes();
        }
    };

    const searchNotes = (query) => {
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) || 
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        renderNotes(filteredNotes);
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        if(document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark-mode');
        } else {
            localStorage.removeItem('theme');
        }
    };

    addNoteButton.addEventListener('click', () => openModal());
    saveNoteButton.addEventListener('click', saveNote);
    closeButton.addEventListener('click', closeModal);
    searchInput.addEventListener('input', (e) => searchNotes(e.target.value));
    themeToggleButton.addEventListener('click', toggleTheme);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Load theme preference
    if(localStorage.getItem('theme') === 'dark-mode') {
        document.body.classList.add('dark-mode');
    }

    renderNotes();
});
