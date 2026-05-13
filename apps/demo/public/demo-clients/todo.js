import { h, render } from "preact";
import { useState } from "preact/hooks";
import { version as preactVersion } from "preact/package.json";

function createRemoteComponent(name, options) {
  const tagName = `tailorkit-${name
    .replaceAll(/([a-z0-9])([A-Z])/gu, "$1-$2")
    .replaceAll(/[\s_]+/gu, "-")
    .toLowerCase()}`;

  return function RemoteComponent({ children, ...props }) {
    const nextProps = { ...props };
    const callbackMap = {};

    for (const [key, inputCount] of Object.entries(options.callbacks ?? {})) {
      const callback = nextProps[key];
      if (typeof callback !== "function") {
        continue;
      }

      const eventName = `tailorkitcallback${key.replaceAll(/[^A-Za-z0-9_$]/gu, "").toLowerCase()}`;
      callbackMap[eventName] = { callback: key, inputCount };
      nextProps[`on${eventName}`] = (event) => {
        callback(...(event.detail ?? []).slice(0, inputCount));
      };
      nextProps[key] = undefined;
    }

    if (Object.keys(callbackMap).length > 0) {
      nextProps["data-tailorkit-callbacks"] = JSON.stringify(callbackMap);
    }

    return h(tagName, nextProps, children);
  };
}

const Button = createRemoteComponent("Button", {
  callbacks: { onClick: 0 },
  slots: ["default"],
});

const DropdownMenu = createRemoteComponent("DropdownMenu", { slots: ["default"] });
const DropdownMenuTrigger = createRemoteComponent("DropdownMenuTrigger", { slots: ["default"] });
const DropdownMenuContent = createRemoteComponent("DropdownMenuContent", { slots: ["default"] });
const DropdownMenuItem = createRemoteComponent("DropdownMenuItem", {
  callbacks: { onClick: 0 },
  slots: ["default"],
});
const DropdownMenuSeparator = createRemoteComponent("DropdownMenuSeparator", {});

const Checkbox = createRemoteComponent("Checkbox", {
  callbacks: { onCheckedChange: 1 },
  slots: [],
});

const Input = createRemoteComponent("Input", {
  callbacks: { onValueChange: 1 },
  slots: [],
});

const todoTasks = [
  { id: "onboard", title: "Onboard New Customer" },
  { id: "refund", title: "Refund Confirmation" },
  { id: "sync", title: "Schedule Team Sync" },
  { id: "reports", title: "Prepare Reports" },
  { id: "metrics", title: "Review Q1 Metrics" },
];

const lastWeekTasks = [
  { id: "lw-deploy", title: "Deploy v2.1 to Production" },
  { id: "lw-retro", title: "Sprint Retrospective" },
  { id: "lw-docs", title: "Update API Documentation" },
  { id: "lw-review", title: "Quarterly Review" },
  { id: "lw-bug", title: "Fix Auth Bug" },
];

function TaskList({
  tasks,
  done,
  editingId,
  editingTitle,
  onToggle,
  onStartEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
}) {
  if (tasks.length === 0) {
    return h(
      "tailorkit-flex",
      { justify: "center", padding: "lg" },
      h("tailorkit-box", { textColor: "muted" }, "No tasks."),
    );
  }

  return h(
    "tailorkit-card",
    null,
    h(
      "tailorkit-card-content",
      null,
      tasks.map((task, index) =>
        h(
          "tailorkit-box",
          { key: task.id },
          editingId === task.id
            ? h(
                "tailorkit-flex",
                { align: "center", gap: "sm", padding: "md" },
                h(Input, { onValueChange: onEditTitleChange, value: editingTitle }),
                h(Button, { onClick: onSaveEdit, size: "sm", variant: "outline" }, "Save"),
                h(Button, { onClick: onCancelEdit, size: "sm", variant: "ghost" }, "Cancel"),
              )
            : h(
                "tailorkit-flex",
                { align: "center", gap: "sm", justify: "between", padding: "md" },
                h(
                  "tailorkit-flex",
                  { align: "center", gap: "sm" },
                  h(Checkbox, {
                    checked: done.includes(task.id) ? "true" : "false",
                    onCheckedChange: () => onToggle(task.id),
                  }),
                  h(
                    "tailorkit-box",
                    { textColor: done.includes(task.id) ? "muted" : "default" },
                    task.title,
                  ),
                ),
                h(
                  DropdownMenu,
                  null,
                  h(DropdownMenuTrigger, null, "⋯"),
                  h(
                    DropdownMenuContent,
                    null,
                    h(DropdownMenuItem, { onClick: () => onStartEdit(task) }, "Edit"),
                    h(DropdownMenuSeparator, null),
                    h(
                      DropdownMenuItem,
                      { onClick: () => onDelete(task.id), variant: "destructive" },
                      "Delete",
                    ),
                  ),
                ),
              ),
          index < tasks.length - 1 && h("tailorkit-separator"),
        ),
      ),
    ),
  );
}

function TodoScreen() {
  const [tab, setTab] = useState("todo");
  const [tasks, setTasks] = useState({ todo: todoTasks, lastWeek: lastWeekTasks });
  const [done, setDone] = useState([
    "refund",
    "lw-deploy",
    "lw-retro",
    "lw-docs",
    "lw-review",
    "lw-bug",
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const currentTasks = tasks[tab] ?? [];

  function addTask() {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      return;
    }
    const newTask = { id: `task-${Date.now()}`, title: trimmed };
    setTasks((t) => ({ ...t, [tab]: [newTask, ...t[tab]] }));
    setNewTitle("");
  }

  function toggleTask(id) {
    setDone((c) => (c.includes(id) ? c.filter((i) => i !== id) : [...c, id]));
  }

  function deleteTask(id) {
    setTasks((t) => ({ ...t, [tab]: t[tab].filter((task) => task.id !== id) }));
    setDone((c) => c.filter((i) => i !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function saveEdit() {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setTasks((t) => ({
        ...t,
        [tab]: t[tab].map((task) => (task.id === editingId ? { ...task, title: trimmed } : task)),
      }));
    }
    setEditingId(null);
  }

  const sharedProps = {
    done,
    editingId,
    editingTitle,
    onToggle: toggleTask,
    onStartEdit: startEdit,
    onDelete: deleteTask,
    onSaveEdit: saveEdit,
    onCancelEdit: () => setEditingId(null),
    onEditTitleChange: setEditingTitle,
  };

  return h(
    "tailorkit-flex",
    {
      direction: "column",
      gap: "md",
      grow: "1",
      minHeight: "0",
      padding: "md",
      width: "full",
    },

    // Add task row
    h(
      "tailorkit-flex",
      { align: "center", gap: "sm" },
      h(Input, { onValueChange: setNewTitle, placeholder: "New task...", value: newTitle }),
      h(Button, { onClick: addTask, size: "sm", variant: "default" }, "Add"),
    ),

    // Tab bar
    h(
      "tailorkit-flex",
      { align: "center", gap: "xs" },
      h(
        Button,
        {
          onClick: () => {
            setTab("todo");
          },
          size: "sm",
          variant: tab === "todo" ? "outline" : "ghost",
        },
        "Todo",
      ),
      h(
        Button,
        {
          onClick: () => {
            setTab("lastWeek");
          },
          size: "sm",
          variant: tab === "lastWeek" ? "outline" : "ghost",
        },
        "Last week",
      ),
    ),

    // Task list
    h(TaskList, { ...sharedProps, tasks: currentTasks }),
  );
}

export default {
  $meta: { preactVersion },
  $runtime: { h, render },
  screens: { "/": { component: TodoScreen, path: "/" } },
};
