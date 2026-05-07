import { createScreen } from "@tailorkit/app";
import { useState } from "preact/hooks";
import { Box, Button, Flex, Tabs, TabsList, TabsPanel, TabsTab } from "#tailorkit";

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
  const [view, setView] = useState<View>("notes");
  const [notes, setNotes] = useState<Note[]>(starterNotes);
  const [tasks, setTasks] = useState<Task[]>(starterTasks);

  return (
    <Box background="muted" padding="lg" width="full">
      <Flex direction="column" gap="lg">
        <AppHeader name="Acmes" />

        <Tabs value={view} onValueChange={(nextView) => setView(nextView as View)}>
          <Flex justify="between" align="center" gap="md">
            <TabsList variant="underline">
              <TabsTab value="notes">Notes</TabsTab>
              <TabsTab value="tasks">Tasks</TabsTab>
            </TabsList>
            {view === "notes" ? (
              <Button variant="default" onClick={addNote}>
                Add note
              </Button>
            ) : (
              <Button variant="default" onClick={addTask}>
                Add task
              </Button>
            )}
          </Flex>

          <TabsPanel value="notes">
            <NotesPanel notes={notes} onDelete={deleteNote} />
          </TabsPanel>
          <TabsPanel value="tasks">
            <TasksPanel tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
          </TabsPanel>
        </Tabs>
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

function AppHeader({ name }: { name?: string }) {
  return (
    <Flex direction="column" gap="xs">
      <Flex direction="column" gap="2xs">
        <Box>{name ? `${name}'s workspace` : "Notes workspace"}</Box>
        <Box>Simple notes and tasks</Box>
      </Flex>
    </Flex>
  );
}

function NotesPanel({ notes, onDelete }: { notes: Note[]; onDelete: (id: string) => void }) {
  return (
    <Flex direction="column" gap="md">
      <Flex justify="between" align="center" gap="md">
        <Box>{notes.length} notes</Box>
      </Flex>

      <Flex direction="column" gap="sm">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={onDelete} />
        ))}
      </Flex>
    </Flex>
  );
}

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  return (
    <Box background="surface" border="solid" borderColor="default" padding="md" radius="md">
      <Flex direction="column" gap="sm">
        <Flex justify="between" align="center" gap="md">
          <Box>{note.title}</Box>
          <Button variant="destructive" onClick={() => onDelete(note.id)}>
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
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Flex direction="column" gap="md">
      <Flex justify="between" align="center" gap="md">
        <Box>{tasks.filter((task) => !task.done).length} open tasks</Box>
      </Flex>

      <Flex direction="column" gap="sm">
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
    <Box background="surface" border="solid" borderColor="default" padding="md" radius="md">
      <Flex justify="between" align="center" gap="md">
        <Box>{task.done ? `Done: ${task.text}` : task.text}</Box>
        <Flex gap="sm">
          <Button variant="default" onClick={() => onToggle(task.id)}>
            {task.done ? "Undo" : "Done"}
          </Button>
          <Button variant="destructive" onClick={() => onDelete(task.id)}>
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
