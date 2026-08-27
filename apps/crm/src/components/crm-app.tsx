import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Check,
  CircleHelp,
  CreditCard,
  Ellipsis,
  Handshake,
  LayoutDashboard,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import type { TailorKitApp } from "tailorkit/react";
import { defaultData, loadCrmData, saveCrmData } from "#lib/crm-store";
import type { Contact, CrmData } from "#lib/crm-store";
import { marketplaceApps, tailor } from "#lib/tailorkit-client";

type Page = "overview" | "pipeline" | "customers" | "tasks" | "my-week";

const pageContent: Record<Page, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "Tuesday, 27 August",
    title: "Good morning, Alex.",
    description: "Here’s what’s moving in your pipeline today.",
  },
  pipeline: {
    eyebrow: "Revenue workspace",
    title: "Pipeline",
    description: "Move opportunities forward and keep your forecast sharp.",
  },
  customers: {
    eyebrow: "Your relationships",
    title: "People",
    description: "Every conversation, account, and next step in one place.",
  },
  tasks: {
    eyebrow: "Your workspace",
    title: "Follow-ups",
    description: "Focus on the actions that keep deals moving.",
  },
  "my-week": {
    eyebrow: "Your workspace",
    title: "My week",
    description: "A calmer view of the relationships that need your attention.",
  },
};

const navigation = [
  { icon: LayoutDashboard, label: "Overview", page: "overview" as const, to: "/" },
  { icon: Handshake, label: "Pipeline", page: "pipeline" as const, to: "/pipeline" },
  { icon: UsersRound, label: "People", page: "customers" as const, to: "/customers" },
];

const workspace = [
  { icon: Check, label: "Follow-ups", page: "tasks" as const, to: "/follow-ups" },
  { icon: Sparkles, label: "My week", page: "my-week" as const, to: "/my-week" },
];

export function CrmApp({ page }: { page: Page }) {
  const [data, setData] = useState<CrmData>(defaultData);
  const [ready, setReady] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);

  useEffect(() => {
    setData(loadCrmData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      saveCrmData(data);
    }
  }, [data, ready]);

  const activeTasks = data.tasks.filter((task) => !task.done);
  const openValue = data.contacts.reduce((total, contact) => total + contact.value, 0);
  function completeTask(id: string) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    }));
  }

  function addContact(contact: Contact) {
    setData((current) => ({ ...current, contacts: [contact, ...current.contacts] }));
    setShowAdd(false);
  }

  return (
    <div className="crm-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <span />
          </span>
          <span>Clover</span>
        </Link>
        <button className="command-button" type="button">
          <Search size={16} /> <span>Search</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="sidebar-scroll">
          <p className="sidebar-label">Workspace</p>
          <nav className="nav-list" aria-label="Workspace navigation">
            {navigation.map((item) => (
              <NavItem item={item} key={item.page} page={page} />
            ))}
          </nav>
          <div className="sidebar-divider" />
          <p className="sidebar-label">For you</p>
          <nav className="nav-list" aria-label="Personal navigation">
            {workspace.map((item) => (
              <NavItem item={item} key={item.page} page={page} />
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="help-button" type="button">
            <CircleHelp size={17} /> Help & resources
          </button>
          <button className="profile" type="button">
            <span className="avatar avatar-alex">AR</span>
            <span>
              <strong>Alex Rivera</strong>
              <small>TailorKit</small>
            </span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="crumb">
            <span>Sales</span>
            <span>/</span>
            <strong>{pageContent[page].title}</strong>
          </div>
          <div className="top-actions">
            <button aria-label="Notifications" className="icon-button" type="button">
              <Bell size={19} />
              <i />
            </button>
            <button className="avatar avatar-alex" type="button">
              AR
            </button>
          </div>
        </header>
        <div className="content-wrap">
          <section className="page-intro">
            <div>
              <p className="eyebrow">{pageContent[page].eyebrow}</p>
              <h1>{pageContent[page].title}</h1>
              <p>{pageContent[page].description}</p>
            </div>
            <button className="primary-button" onClick={() => setShowAdd(true)} type="button">
              <Plus size={17} /> Add person
            </button>
          </section>
          {page === "overview" && (
            <Overview
              data={data}
              openValue={openValue}
              activeTasks={activeTasks.length}
              onComplete={completeTask}
              onOpenStripe={() => setCurrentAppId("stripe-revenue")}
            />
          )}
          {page === "pipeline" && <Pipeline contacts={data.contacts} />}
          {page === "customers" && <People contacts={data.contacts} />}
          {(page === "tasks" || page === "my-week") && (
            <Tasks
              data={data}
              onComplete={completeTask}
              title={page === "my-week" ? "This week, in focus" : "Your follow-ups"}
            />
          )}
        </div>
      </main>

      <aside className="apps-rail" aria-label="Apps">
        {marketplaceApps.map((app) => (
          <button
            aria-label={`Open ${app.name}`}
            className={`rail-app ${app.id === "stripe-revenue" ? "stripe" : "coach"}`}
            key={app.id}
            onClick={() => setCurrentAppId(app.id)}
            type="button"
          >
            {app.id === "stripe-revenue" ? "S" : "R"}
          </button>
        ))}
      </aside>

      {showAdd && <AddPersonModal onClose={() => setShowAdd(false)} onSave={addContact} />}
      {currentAppId && (
        <MarketplaceApp appId={currentAppId} onClose={() => setCurrentAppId(null)} />
      )}
    </div>
  );
}

function NavItem({
  item,
  page,
}: {
  item: (typeof navigation)[number] | (typeof workspace)[number];
  page: Page;
}) {
  const Icon = item.icon;
  return (
    <Link className={`nav-item ${item.page === page ? "active" : ""}`} to={item.to}>
      <Icon size={18} />
      <span>{item.label}</span>
      {item.page === "tasks" && <b>3</b>}
    </Link>
  );
}

function Overview({
  activeTasks,
  data,
  onComplete,
  onOpenStripe,
  openValue,
}: {
  activeTasks: number;
  data: CrmData;
  onComplete: (id: string) => void;
  onOpenStripe: () => void;
  openValue: number;
}) {
  return (
    <>
      <section className="metric-grid">
        <Metric
          label="Open pipeline"
          value={formatCurrency(openValue)}
          trend="↑ 12.4%"
          detail="vs last month"
          tone="green"
        />
        <Metric
          label="Won this month"
          value="$48,200"
          trend="↑ 8.2%"
          detail="vs last month"
          tone="green"
        />
        <Metric
          label="Active opportunities"
          value={String(data.contacts.length)}
          trend="↑ 2"
          detail="since last week"
          tone="blue"
        />
        <Metric
          label="Follow-ups due"
          value={String(activeTasks)}
          trend="Today"
          detail="keep momentum"
          tone="orange"
        />
      </section>
      <section className="dashboard-grid">
        <div className="card pipeline-card">
          <div className="card-header">
            <div>
              <h2>Pipeline health</h2>
              <p>Open opportunities by stage</p>
            </div>
            <button className="subtle-button" type="button">
              View pipeline <ArrowUpRight size={15} />
            </button>
          </div>
          <PipelineChart contacts={data.contacts} />
        </div>
        <Tasks data={data} onComplete={onComplete} title="Up next" compact />
      </section>
      <section className="card contacts-card">
        <div className="card-header">
          <div>
            <h2>Recent activity</h2>
            <p>People you’ve engaged with recently</p>
          </div>
          <button className="subtle-button" type="button">
            View all <ArrowUpRight size={15} />
          </button>
        </div>
        <PeopleTable contacts={data.contacts.slice(0, 4)} />
      </section>
      <section className="integration-banner">
        <div className="integration-icon">
          <CreditCard size={20} />
        </div>
        <div>
          <span className="tiny-label">MARKETPLACE APP</span>
          <h3>See payment context beside every deal</h3>
          <p>Connect Stripe to bring subscriptions, invoices, and customer value into Clover.</p>
        </div>
        <button className="secondary-button" onClick={onOpenStripe} type="button">
          Explore Stripe <ArrowUpRight size={16} />
        </button>
      </section>
    </>
  );
}

function Metric({
  detail,
  label,
  tone,
  trend,
  value,
}: {
  detail: string;
  label: string;
  tone: string;
  trend: string;
  value: string;
}) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <h2>{value}</h2>
      <span className={`metric-trend ${tone}`}>{trend}</span>
      <small>{detail}</small>
    </article>
  );
}

function PipelineChart({ contacts }: { contacts: Contact[] }) {
  const stages = ["Discovery", "Qualified", "Proposal", "Negotiation"] as const;
  const max = Math.max(
    ...stages.map((stage) => contacts.filter((contact) => contact.stage === stage).length),
    1,
  );
  return (
    <div className="chart">
      <div className="chart-bars">
        {stages.map((stage) => {
          const count = contacts.filter((contact) => contact.stage === stage).length;
          return (
            <div className="bar-group" key={stage}>
              <div className="bar-value">{count || "–"}</div>
              <div
                className="bar"
                style={{ height: `${Math.max((count / max) * 128, count ? 34 : 6)}px` }}
              />
              <span>{stage}</span>
            </div>
          );
        })}
      </div>
      <div className="chart-foot">
        <span>
          <i className="legend-dot" /> Opportunity count
        </span>
        <strong>{contacts.length} open</strong>
      </div>
    </div>
  );
}

function Pipeline({ contacts }: { contacts: Contact[] }) {
  const stages = ["Discovery", "Qualified", "Proposal", "Negotiation"] as const;
  return (
    <div className="kanban">
      {stages.map((stage) => (
        <section className="kanban-column" key={stage}>
          <div className="kanban-heading">
            <span>{stage}</span>
            <b>{contacts.filter((contact) => contact.stage === stage).length}</b>
          </div>
          {contacts
            .filter((contact) => contact.stage === stage)
            .map((contact) => (
              <article className="deal-card" key={contact.id}>
                <div className="deal-card-top">
                  <span className={`avatar avatar-${contact.color}`}>{contact.initials}</span>
                  <button aria-label={`More actions for ${contact.name}`} type="button">
                    <Ellipsis size={17} />
                  </button>
                </div>
                <h3>{contact.company}</h3>
                <p>{contact.name}</p>
                <strong>{formatCurrency(contact.value)}</strong>
                <div className="deal-card-bottom">
                  <span>{contact.lastTouch}</span>
                  <span>{contact.owner}</span>
                </div>
              </article>
            ))}
          <button className="add-deal" type="button">
            <Plus size={15} /> Add opportunity
          </button>
        </section>
      ))}
    </div>
  );
}

function People({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="card people-page">
      <div className="list-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input aria-label="Search people" placeholder="Search people" />
        </div>
        <button className="filter-button" type="button">
          <ListFilter size={16} /> Filter
        </button>
      </div>
      <PeopleTable contacts={contacts} />
    </section>
  );
}

function PeopleTable({ contacts }: { contacts: Contact[] }) {
  return (
    <div className="people-table">
      <div className="table-head">
        <span>Person</span>
        <span>Company</span>
        <span>Stage</span>
        <span>Value</span>
        <span>Last touch</span>
        <span />
      </div>
      {contacts.map((contact) => (
        <div className="table-row" key={contact.id}>
          <div className="person-cell">
            <span className={`avatar avatar-${contact.color}`}>{contact.initials}</span>
            <span>
              <strong>{contact.name}</strong>
              <small>{contact.email}</small>
            </span>
          </div>
          <span>{contact.company}</span>
          <span>
            <i className={`stage-dot ${contact.stage.toLowerCase()}`} />
            {contact.stage}
          </span>
          <strong>{formatCurrency(contact.value)}</strong>
          <span>{contact.lastTouch}</span>
          <button aria-label={`More actions for ${contact.name}`} type="button">
            <Ellipsis size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Tasks({
  compact = false,
  data,
  onComplete,
  title,
}: {
  compact?: boolean;
  data: CrmData;
  onComplete: (id: string) => void;
  title: string;
}) {
  const tasks = useMemo(
    () => (compact ? data.tasks.slice(0, 3) : data.tasks),
    [compact, data.tasks],
  );
  return (
    <section className={`card tasks-card ${compact ? "compact" : ""}`}>
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p>{compact ? "The next best actions" : "Keep deals moving with one focused list"}</p>
        </div>
        {compact && (
          <button className="subtle-button" type="button">
            View all <ArrowUpRight size={15} />
          </button>
        )}
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <button
            className={`task-row ${task.done ? "done" : ""}`}
            key={task.id}
            onClick={() => onComplete(task.id)}
            type="button"
          >
            <span className="task-check">{task.done && <Check size={14} />}</span>
            <span className="task-copy">
              <strong>{task.title}</strong>
              <small>{task.contact}</small>
            </span>
            <span className="task-due">{task.due}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function AddPersonModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (contact: Contact) => void;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [value, setValue] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !company.trim()) {
      return;
    }
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    onSave({
      id: crypto.randomUUID(),
      name,
      company,
      initials,
      owner: "You",
      value: Number(value) || 0,
      stage: "Discovery",
      lastTouch: "Just now",
      email: `${name.toLowerCase().replaceAll(" ", ".")}@${company.toLowerCase().replaceAll(" ", "")}.com`,
      color: "sky",
    });
  }
  return (
    <div className="modal-backdrop" role="presentation">
      <form aria-label="Add a person" className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">NEW RELATIONSHIP</p>
            <h2>Add a person</h2>
          </div>
          <button aria-label="Close" className="icon-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <label>
          Full name
          <input
            autoFocus
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Jordan Bell"
            required
            value={name}
          />
        </label>
        <label>
          Company
          <input
            onChange={(event) => setCompany(event.target.value)}
            placeholder="e.g. Skyward"
            required
            value={company}
          />
        </label>
        <label>
          Opportunity value
          <input
            inputMode="numeric"
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 24000"
            value={value}
          />
        </label>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="primary-button" type="submit">
            Add person
          </button>
        </div>
      </form>
    </div>
  );
}

function MarketplaceApp({ appId, onClose }: { appId: string; onClose: () => void }) {
  const app = marketplaceApps.find((candidate) => candidate.id === appId);
  if (!app) {
    return null;
  }
  const AppView = tailor.AppView as unknown as ComponentType<{ app: TailorKitApp; screen: string }>;

  return (
    <aside className="app-panel" data-app-id={app.id}>
      <div className="panel-top">
        <div>
          <span className={`stripe-logo ${app.id === "renewal-coach" ? "coach-logo" : ""}`}>
            {app.id === "stripe-revenue" ? "S" : "R"}
          </span>
          <strong>{app.name}</strong>
        </div>
        <button
          aria-label={`Close ${app.name}`}
          className="icon-button"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>
      </div>
      <p className="app-description">{app.description}</p>
      <tailor.Root apps={marketplaceApps}>
        <div className="tailorkit-app-view">
          <AppView app={app} screen="/" />
        </div>
      </tailor.Root>
      <p className="panel-note">Built and rendered by TailorKit’s app runtime.</p>
    </aside>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
