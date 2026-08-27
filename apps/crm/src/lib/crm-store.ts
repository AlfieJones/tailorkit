export type Stage = "Discovery" | "Qualified" | "Proposal" | "Negotiation";

export interface Contact {
  id: string;
  name: string;
  company: string;
  initials: string;
  owner: string;
  value: number;
  stage: Stage;
  lastTouch: string;
  email: string;
  color: string;
}

export interface Task {
  id: string;
  contact: string;
  due: string;
  title: string;
  done: boolean;
}

export interface CrmData {
  contacts: Contact[];
  stripeConnected: boolean;
  tasks: Task[];
}

const storageKey = "tailorkit-crm-showcase";

export const defaultData: CrmData = {
  contacts: [
    {
      id: "maya",
      name: "Maya Chen",
      company: "Ribbon Labs",
      initials: "MC",
      owner: "You",
      value: 32_000,
      stage: "Proposal",
      lastTouch: "2h ago",
      email: "maya@ribbonlabs.com",
      color: "violet",
    },
    {
      id: "derek",
      name: "Derek Hunt",
      company: "Northstar",
      initials: "DH",
      owner: "You",
      value: 18_000,
      stage: "Qualified",
      lastTouch: "Yesterday",
      email: "derek@northstar.co",
      color: "amber",
    },
    {
      id: "lucia",
      name: "Lucia Alves",
      company: "Luma Health",
      initials: "LA",
      owner: "Elena",
      value: 45_000,
      stage: "Negotiation",
      lastTouch: "Yesterday",
      email: "lucia@lumahealth.com",
      color: "rose",
    },
    {
      id: "devon",
      name: "Devon Price",
      company: "Olio Studio",
      initials: "DP",
      owner: "You",
      value: 12_000,
      stage: "Discovery",
      lastTouch: "Mon",
      email: "devon@olio.studio",
      color: "sky",
    },
    {
      id: "james",
      name: "James Wong",
      company: "Fieldnote",
      initials: "JW",
      owner: "You",
      value: 26_000,
      stage: "Proposal",
      lastTouch: "Mon",
      email: "james@fieldnote.com",
      color: "emerald",
    },
  ],
  stripeConnected: false,
  tasks: [
    {
      id: "proposal",
      contact: "Maya Chen",
      due: "Today · 11:30",
      title: "Send revised proposal",
      done: false,
    },
    {
      id: "check-in",
      contact: "Derek Hunt",
      due: "Today · 15:00",
      title: "Product fit check-in",
      done: false,
    },
    {
      id: "renewal",
      contact: "Lucia Alves",
      due: "Tomorrow · 09:00",
      title: "Prep renewal brief",
      done: false,
    },
  ],
};

export function loadCrmData(): CrmData {
  if (typeof window === "undefined") {
    return defaultData;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as CrmData) : defaultData;
  } catch {
    return defaultData;
  }
}

export function saveCrmData(data: CrmData) {
  window.localStorage.setItem(storageKey, JSON.stringify(data));
}
