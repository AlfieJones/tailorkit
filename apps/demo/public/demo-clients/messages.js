import { h, render } from "preact";
import { useMemo, useState } from "preact/hooks";
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
      delete nextProps[key];
      if (typeof callback !== "function") {
        continue;
      }

      const eventName = `tailorkitcallback${key.replaceAll(/[^A-Za-z0-9_$]/g, "").toLowerCase()}`;
      callbackMap[eventName] = { callback: key, inputCount };
      nextProps[`on${eventName}`] = (event) => {
        callback(...(event.detail ?? []).slice(0, inputCount));
      };
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

const Input = createRemoteComponent("Input", {
  callbacks: { onValueChange: 1 },
  slots: [],
});

const customers = [
  {
    id: "acme",
    name: "Acme Co",
    unread: 3,
    thread: [
      { from: "Acme Co", text: "Can we review the launch checklist?" },
      { from: "You", text: "Yes, on it." },
    ],
  },
  {
    id: "northwind",
    name: "Northwind",
    unread: 0,
    thread: [{ from: "Northwind", text: "Billing export is ready." }],
  },
  {
    id: "globex",
    name: "Globex",
    unread: 1,
    thread: [{ from: "Globex", text: "Rollout notes sent for approval." }],
  },
  {
    id: "initech",
    name: "Initech",
    unread: 5,
    thread: [{ from: "Initech", text: "TPS reports — need cover sheets." }],
  },
  {
    id: "stark",
    name: "Stark Industries",
    unread: 2,
    thread: [{ from: "Stark Industries", text: "Q4 renewal ready to sign." }],
  },
  {
    id: "wayne",
    name: "Wayne Enterprises",
    unread: 0,
    thread: [{ from: "Wayne Enterprises", text: "All good on our end." }],
  },
  {
    id: "dunder",
    name: "Dunder Mifflin",
    unread: 4,
    thread: [{ from: "Dunder Mifflin", text: "Paper order needs approval." }],
  },
  {
    id: "piedpiper",
    name: "Pied Piper",
    unread: 1,
    thread: [{ from: "Pied Piper", text: "Compression algorithm demo ready." }],
  },
  {
    id: "hooli",
    name: "Hooli",
    unread: 0,
    thread: [{ from: "Hooli", text: "Contract countersigned." }],
  },
  {
    id: "prestige",
    name: "Prestige Worldwide",
    unread: 3,
    thread: [{ from: "Prestige Worldwide", text: "Step brothers are stepping up." }],
  },
  {
    id: "bluth",
    name: "Bluth Company",
    unread: 7,
    thread: [{ from: "Bluth Company", text: "There's always money in the banana stand." }],
  },
  {
    id: "vandelay",
    name: "Vandelay Industries",
    unread: 0,
    thread: [{ from: "Vandelay Industries", text: "Latex shipment confirmed." }],
  },
  {
    id: "umbrella",
    name: "Umbrella Corp",
    unread: 2,
    thread: [{ from: "Umbrella Corp", text: "Research division update attached." }],
  },
  {
    id: "cyberdyne",
    name: "Cyberdyne Systems",
    unread: 0,
    thread: [{ from: "Cyberdyne Systems", text: "Model 101 deployment on schedule." }],
  },
  {
    id: "soylent",
    name: "Soylent Corp",
    unread: 1,
    thread: [{ from: "Soylent Corp", text: "New formula ready for review." }],
  },
  {
    id: "initrode",
    name: "Initrode",
    unread: 0,
    thread: [{ from: "Initrode", text: "Merger docs signed." }],
  },
  {
    id: "oscorp",
    name: "Oscorp",
    unread: 6,
    thread: [{ from: "Oscorp", text: "Lab results need sign-off." }],
  },
];

function MessagesScreen() {
  const [selectedId, setSelectedId] = useState(null);
  const [threads, setThreads] = useState(
    Object.fromEntries(customers.map((c) => [c.id, c.thread])),
  );
  const [unread, setUnread] = useState(Object.fromEntries(customers.map((c) => [c.id, c.unread])));
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedId) ?? null,
    [selectedId],
  );

  const filteredCustomers = useMemo(
    () => customers.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );

  function openConversation(id) {
    setSelectedId(id);
    setInputText("");
    setUnread((u) => ({ ...u, [id]: 0 }));
  }

  function sendMessage() {
    const trimmed = inputText.trim();
    if (!trimmed || !selectedId) {
      return;
    }
    setThreads((t) => ({
      ...t,
      [selectedId]: [...(t[selectedId] ?? []), { from: "You", text: trimmed }],
    }));
    setInputText("");
  }

  // ── Conversation view ──────────────────────────────────────────
  if (selectedCustomer) {
    const thread = threads[selectedCustomer.id] ?? [];

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

      h(
        "tailorkit-flex",
        { align: "center", gap: "sm" },
        h(Button, { onClick: () => setSelectedId(null), size: "icon-sm", variant: "ghost" }, "←"),
        h("tailorkit-card-title", null, selectedCustomer.name),
      ),

      h(
        "tailorkit-card",
        null,
        h(
          "tailorkit-card-content",
          null,
          h(
            "tailorkit-flex",
            {
              direction: "column",
              gap: "sm",
              grow: "1",
              minHeight: "0",
              overflow: "auto",
              padding: "md",
              width: "full",
            },
            thread.map((msg, i) =>
              h(
                "tailorkit-box",
                { key: `msg-${i}` },
                h(
                  "tailorkit-flex",
                  { direction: "column", gap: "xs", padding: "md" },
                  h("tailorkit-box", { textColor: "muted" }, msg.from),
                  h("tailorkit-box", { textColor: "default" }, msg.text),
                ),
                i < thread.length - 1 && h("tailorkit-separator"),
              ),
            ),
          ),
        ),
      ),

      h(
        "tailorkit-card",
        null,
        h(
          "tailorkit-card-content",
          null,
          h(
            "tailorkit-flex",
            { align: "center", gap: "sm", padding: "sm" },
            h(Input, {
              onValueChange: setInputText,
              placeholder: "Message via Slack...",
              value: inputText,
            }),
            h(Button, { onClick: sendMessage, size: "sm", variant: "outline" }, "Send"),
          ),
        ),
      ),
    );
  }

  // ── List view ──────────────────────────────────────────────────
  return h(
    "tailorkit-flex",
    {
      direction: "column",
      gap: "md",
      grow: "1",
      minHeight: "0",
      overflow: "auto",
      padding: "md",
      width: "full",
    },

    h(
      "tailorkit-flex",
      { align: "center", gap: "sm" },
      h(Input, {
        onValueChange: setSearchQuery,
        placeholder: "Search...",
        value: searchQuery,
      }),
      h(Button, { onClick: () => setSearchQuery(""), size: "sm", variant: "ghost" }, "Clear"),
    ),

    h(
      "tailorkit-flex",
      { align: "center", gap: "xs" },
      h(Button, { onClick: () => setSearchQuery(""), size: "sm", variant: "outline" }, "Inbox"),
      h(
        "tailorkit-box",
        { textColor: "muted" },
        h(Button, { onClick: () => setSearchQuery(""), size: "sm", variant: "ghost" }, "Recent"),
      ),
    ),

    filteredCustomers.length > 0 &&
      h(
        "tailorkit-card",
        null,
        h(
          "tailorkit-card-content",
          null,
          filteredCustomers.map((customer, index) =>
            h(
              "tailorkit-box",
              { key: customer.id },
              h(
                "tailorkit-flex",
                { align: "center", gap: "sm", justify: "between", padding: "md" },
                h("tailorkit-box", { textColor: "default" }, customer.name),
                h(
                  "tailorkit-flex",
                  { align: "center", gap: "xs" },
                  unread[customer.id] > 0 &&
                    h("tailorkit-badge", { variant: "outline" }, String(unread[customer.id])),
                  h(
                    Button,
                    {
                      onClick: () => openConversation(customer.id),
                      size: "icon-sm",
                      variant: "ghost",
                    },
                    "→",
                  ),
                ),
              ),
              index < filteredCustomers.length - 1 && h("tailorkit-separator"),
            ),
          ),
        ),
      ),

    filteredCustomers.length === 0 &&
      h(
        "tailorkit-flex",
        { padding: "md" },
        h("tailorkit-box", { textColor: "muted" }, "No conversations found."),
      ),
  );
}

export default {
  $meta: { preactVersion },
  $runtime: { h, render },
  screens: { "/": { component: MessagesScreen, path: "/" } },
};
