import React from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Split from "react-split";
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { notesCollection, db } from "./firebase";

export default function App() {
	const [notes, setNotes] = React.useState([]);

	const [currentNoteId, setCurrentNoteId] = React.useState("");

	const currentNote =
		notes.find((note) => note.id === currentNoteId) || notes[0];

	React.useEffect(() => {
		const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
			// Sync up our local notes array with the snapshot data
			const notesArray = snapshot.docs.map((doc) => {
				return { id: doc.id, ...doc.data() };
			});
			setNotes(notesArray);
		});
		return unsubscribe;
	}, []);

	React.useEffect(() => {
		if (!currentNoteId) {
			setCurrentNoteId(notes[0]?.id);
		}
	}, [notes]);

	async function createNewNote() {
		const newNote = {
			body: "# Type your markdown note's title here",
		};
		const newNoteRef = await addDoc(notesCollection, newNote); // addDoc returns a promise
		setCurrentNoteId(newNoteRef.id); // set the current note to the newly created note
	}

	async function updateNote(text) {
		const docRef = doc(db, "notes", currentNoteId);
		await setDoc(docRef, { body: text }, { merge: true }); // merge: true will only update the body field
	}

	async function deleteNote(noteId) {
		const docRef = doc(db, "notes", noteId);
		await deleteDoc(docRef);
	}

	return (
		<main>
			{notes.length > 0 ? (
				<Split
					sizes={[30, 70]}
					direction="horizontal"
					className="split"
				>
					<Sidebar
						notes={notes}
						currentNote={currentNote}
						setCurrentNoteId={setCurrentNoteId}
						newNote={createNewNote}
						deleteNote={deleteNote}
					/>
					<Editor currentNote={currentNote} updateNote={updateNote} />
				</Split>
			) : (
				<div className="no-notes">
					<h1>You have no notes</h1>
					<button className="first-note" onClick={createNewNote}>
						Create one now
					</button>
				</div>
			)}
		</main>
	);
}
