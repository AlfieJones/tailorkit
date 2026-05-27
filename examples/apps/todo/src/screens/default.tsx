import { createScreen } from "@tailorkit/app";
import { useState } from "preact/hooks";
import { Box, Button, Flex, Input } from "#tailorkit";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

const starterTodos: Todo[] = [
  { id: "todo-review-notes", text: "Review today's notes", done: false },
  { id: "todo-plan-next", text: "Pick the next task", done: true },
];

const screen = createScreen("/", {
  component: ScreenComponent,
});

function ScreenComponent() {
  const [todos, setTodos] = useState<Todo[]>(starterTodos);
  const openCount = todos.filter((todo) => !todo.done).length;

  return (
    <Box padding="md" width="full" overflowWrap="anywhere">
      <Flex direction="column" gap="md">
        <Flex direction="column" gap="xs">
          <Box>Todo</Box>
          <Box>{openCount === 1 ? "1 open todo" : `${openCount} open todos`}</Box>
        </Flex>

        <Button variant="default" onClick={addTodo}>
          Add todo
        </Button>

        <Flex direction="column" gap="sm">
          {todos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onDelete={deleteTodo}
              onToggle={toggleTodo}
              onUpdate={updateTodo}
            />
          ))}
        </Flex>
      </Flex>
    </Box>
  );

  function addTodo() {
    const count = todos.length + 1;

    setTodos((current) => [
      {
        id: createId("todo"),
        text: `Todo ${count}`,
        done: false,
      },
      ...current,
    ]);
  }

  function updateTodo(id: string, text: string) {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, text } : todo)));
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    );
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }
}

function TodoRow({
  todo,
  onDelete,
  onToggle,
  onUpdate,
}: {
  todo: Todo;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}) {
  return (
    <Box border="solid" borderColor="default" padding="sm" radius="sm" width="full">
      <Flex direction="column" gap="sm">
        <Box>{todo.done ? "Done" : "Open"}</Box>
        <Input value={todo.text} onValueChange={({ value }) => onUpdate(todo.id, value)} />
        <Flex direction="column" gap="xs">
          <Button variant="default" onClick={() => onToggle(todo.id)}>
            {todo.done ? "Reopen" : "Complete"}
          </Button>
          <Button variant="secondary" onClick={() => onDelete(todo.id)}>
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
