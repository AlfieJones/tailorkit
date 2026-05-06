import { createScreen } from "@tailorkit/app";
import { useState } from "preact/hooks";
import { Button } from "#tailorkit";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const screen = createScreen("/", {
  component: ScreenComponent,
});

function ScreenComponent() {
  const context = screen.useContext();
  const [activeTab, setActiveTab] = useState<"notes" | "tasks">("notes");

  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState("");

  const addNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;

    setNotes((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        title: noteTitle.trim() || "Untitled",
        content: noteContent,
      },
      ...prev,
    ]);
    setNoteTitle("");
    setNoteContent("");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const addTask = () => {
    if (!taskText.trim()) return;

    setTasks((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        text: taskText.trim(),
        completed: false,
      },
      ...prev,
    ]);
    setTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
        {context.user.name}&apos;s Notes
      </h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <Button
          variant={activeTab === "notes" ? "default" : "outline"}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </Button>
        <Button
          variant={activeTab === "tasks" ? "default" : "outline"}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks
        </Button>
      </div>

      {activeTab === "notes" ? (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <input
              type="text"
              placeholder="Note title"
              value={noteTitle}
              onInput={(e) => setNoteTitle(e.currentTarget.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <textarea
              placeholder="Write something..."
              value={noteContent}
              onInput={(e) => setNoteContent(e.currentTarget.value)}
              rows={4}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                resize: "vertical",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={addNote} disabled={!noteTitle.trim() && !noteContent.trim()}>
                Add Note
              </Button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notes.length === 0 ? (
              <p
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  padding: "32px",
                }}
              >
                No notes yet. Jot down your first idea above.
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {note.title}
                    </h3>
                    <Button variant="ghost" onClick={() => deleteNote(note.id)}>
                      Delete
                    </Button>
                  </div>
                  {note.content && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: 1.5,
                        color: "#374151",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {note.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              value={taskText}
              onInput={(e) => setTaskText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <Button onClick={addTask} disabled={!taskText.trim()}>
              Add Task
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tasks.length === 0 ? (
              <p
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  padding: "32px",
                }}
              >
                No tasks yet. Add one above to get started.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    background: "#ffffff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "14px",
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#9ca3af" : "#111827",
                    }}
                  >
                    {task.text}
                  </span>
                  <Button variant="ghost" onClick={() => deleteTask(task.id)}>
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default screen;
