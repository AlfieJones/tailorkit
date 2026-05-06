export type CustomerStatus = "Active" | "At risk" | "New";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  owner: string;
  status: CustomerStatus;
  value: string;
  lastContact: string;
  nextStep: string;
  notes: string;
}

export interface Deal {
  id: string;
  account: string;
  stage: string;
  amount: string;
  closeDate: string;
  owner: string;
  probability: string;
  nextStep: string;
}

export const customers: Customer[] = [
  {
    id: "olivia-martin",
    name: "Olivia Martin",
    company: "Acme Logistics",
    email: "olivia@acmelogistics.com",
    phone: "+1 (555) 014-3271",
    owner: "Avery Stone",
    status: "Active",
    value: "$82,400",
    lastContact: "May 1, 2026",
    nextStep: "Renewal pricing review",
    notes: "Expanding the operations team and evaluating two additional seats.",
  },
  {
    id: "ethan-clark",
    name: "Ethan Clark",
    company: "Brightwave Studio",
    email: "ethan@brightwave.studio",
    phone: "+1 (555) 011-9284",
    owner: "Mina Patel",
    status: "New",
    value: "$24,000",
    lastContact: "May 3, 2026",
    nextStep: "Product fit call",
    notes: "Inbound lead from the spring campaign. Interested in project reporting.",
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    company: "Summit Retail Group",
    email: "maya@summitretail.example",
    phone: "+1 (555) 019-8462",
    owner: "Jordan Lee",
    status: "At risk",
    value: "$136,900",
    lastContact: "April 28, 2026",
    nextStep: "Executive check-in",
    notes: "Needs clearer rollout plan before approving the next annual term.",
  },
  {
    id: "noah-reed",
    name: "Noah Reed",
    company: "Pioneer Health",
    email: "noah@pioneerhealth.example",
    phone: "+1 (555) 017-5510",
    owner: "Avery Stone",
    status: "Active",
    value: "$58,250",
    lastContact: "May 5, 2026",
    nextStep: "Security questionnaire",
    notes: "Procurement is ready once the security review is complete.",
  },
];

export const deals = [
  {
    id: "summit-retail-renewal",
    account: "Summit Retail Group",
    stage: "Negotiation",
    amount: "$136,900",
    closeDate: "May 22",
    owner: "Jordan Lee",
    probability: "70%",
    nextStep: "Executive check-in",
  },
  {
    id: "acme-logistics-expansion",
    account: "Acme Logistics",
    stage: "Proposal",
    amount: "$82,400",
    closeDate: "May 29",
    owner: "Avery Stone",
    probability: "60%",
    nextStep: "Renewal pricing review",
  },
  {
    id: "pioneer-health-security",
    account: "Pioneer Health",
    stage: "Security",
    amount: "$58,250",
    closeDate: "June 4",
    owner: "Avery Stone",
    probability: "45%",
    nextStep: "Security questionnaire",
  },
] satisfies Deal[];

export function getCustomer(customerId: string): Customer | undefined {
  return customers.find((customer) => customer.id === customerId);
}

export function getDeal(dealId: string): Deal | undefined {
  return deals.find((deal) => deal.id === dealId);
}
