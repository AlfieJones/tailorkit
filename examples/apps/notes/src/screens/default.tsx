import { createScreen } from "@tailorkit/app";
import { useState } from "preact/hooks";
import { Box, Button, Flex } from "#tailorkit";

type View = "notes" | "tasks";

interface Note {
  id: string;
  title: string;
  body: string;
}

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const starterNotes: Note[] = [
  {
    id: "note-welcome",
    title: "Welcome note",
    body: "A small place for notes and tasks.",
  },
];

const starterTasks: Task[] = [
  { id: "task-review", text: "Review today's notes", done: false },
  { id: "task-plan", text: "Pick the next task", done: true },
];

const screen = createScreen("/", {
  component: ScreenComponent,
});

function ScreenComponent() {
  const context = screen.useContext();
  const [view, setView] = useState<View>("notes");
  const [notes, setNotes] = useState<Note[]>(starterNotes);
  const [tasks, setTasks] = useState<Task[]>(starterTasks);

  return (
    <Box background="#f7f8fa" padding="24px" width="100%">
      <Flex direction="column" gap="20px">
        <AppHeader name={"Acmes"} view={view} onViewChange={setView} />

        {view === "notes" ? (
          <NotesPanel notes={notes} onAdd={addNote} onDelete={deleteNote} />
        ) : (
          <TasksPanel tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
        )}
      </Flex>
    </Box>
  );

  function addNote() {
    const count = notes.length + 1;

    setNotes((current) => [
      {
        id: createId("note"),
        title: `Note ${count}`,
        body: "A quick note added from the example app.",
      },
      ...current,
    ]);
  }

  function deleteNote(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  function addTask() {
    const count = tasks.length + 1;

    setTasks((current) => [
      {
        id: createId("task"),
        text: `Task ${count}`,
        done: false,
      },
      ...current,
    ]);
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }
}

function AppHeader({
  name,
  view,
  onViewChange,
}: {
  name?: string;
  view: View;
  onViewChange: (view: View) => void;
}) {
  return (
    <Flex direction="column" gap="12px">
      <Flex direction="column" gap="4px">
        <Box>{name ? `${name}'s workspace` : "Notes workspace"}</Box>
        <Box>Simple notes and tasks</Box>
      </Flex>

      <Flex gap="8px">
        <Button
          variant={view === "notes" ? "primary" : "secondary"}
          onClick={() => onViewChange("notes")}
        >
          Notes
        </Button>
        <Button
          variant={view === "tasks" ? "primary" : "secondary"}
          onClick={() => onViewChange("tasks")}
        >
          Tasks
        </Button>
      </Flex>
    </Flex>
  );
}

function NotesPanel({
  notes,
  onAdd,
  onDelete,
}: {
  notes: Note[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Flex direction="column" gap="12px">
      <Flex justify="space-between" align="center" gap="12px">
        <Box>{notes.length} notes</Box>
        <Button variant="primary" onClick={onAdd}>
          Add note
        </Button>
      </Flex>

      <Flex direction="column" gap="10px">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={onDelete} />
        ))}
      </Flex>
    </Flex>
  );
}

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  return (
    <Box background="#ffffff" border="1px solid #e4e7ec" padding="14px" radius="8px">
      <Flex direction="column" gap="10px">
        <Flex justify="space-between" align="center" gap="12px">
          <Box>{note.title}</Box>
          <Button variant="secondary" onClick={() => onDelete(note.id)}>
            Delete
          </Button>
        </Flex>
        <Box>{note.body}</Box>
      </Flex>
    </Box>
  );
}

function TasksPanel({
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onAdd: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Flex direction="column" gap="12px">
      <Flex justify="space-between" align="center" gap="12px">
        <Box>{tasks.filter((task) => !task.done).length} open tasks</Box>
        <Button variant="primary" onClick={onAdd}>
          Add task
        </Button>
      </Flex>

      <Flex direction="column" gap="10px">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </Flex>
    </Flex>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Box background="#ffffff" border="1px solid #e4e7ec" padding="12px" radius="8px">
      <Flex justify="space-between" align="center" gap="12px">
        <Box>{task.done ? `Done: ${task.text}` : task.text}</Box>
        <Flex gap="8px">
          <Button variant="secondary" onClick={() => onToggle(task.id)}>
            {task.done ? "Undo" : "Done"}
          </Button>
          <Button variant="secondary" onClick={() => onDelete(task.id)}>
            Delete
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default screen;
