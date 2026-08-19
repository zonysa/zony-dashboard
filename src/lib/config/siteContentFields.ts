// Config-driven form specs for the portfolio site's editable content
// sections. One spec per section_key, covering the shapes that actually
// occur in the data: plain text, long text, a list of strings, a list of
// objects ("repeater"), a fixed nested object, and an icon picker
// constrained to the vocabulary components/icons.tsx (zony-portfolio)
// actually resolves.

export type FieldType =
  | "text"
  | "textarea"
  | "string-array"
  | "repeater"
  | "icon-select"
  | "object";

export interface FieldSpec {
  name: string;
  label: string;
  type: FieldType;
  fields?: FieldSpec[]; // item shape for "repeater", nested shape for "object"
}

export interface SectionSpec {
  key: string;
  label: string;
  isArrayRoot?: boolean; // the JSON value itself is an array (e.g. nav), not a keyed object
  itemFields?: FieldSpec[]; // item shape when isArrayRoot
  fields?: FieldSpec[]; // keyed object fields otherwise
}

// The fixed vocabulary of icon keys used across content.ts / icons.tsx.
export const ICON_OPTIONS = [
  "hub",
  "clock",
  "pin",
  "cpu",
  "cash",
  "star",
  "users",
  "shop",
  "road",
  "leaf",
] as const;

const cardFields: FieldSpec[] = [
  { name: "icon", label: "Icon", type: "icon-select" },
  { name: "title", label: "Title", type: "text" },
  { name: "body", label: "Body", type: "textarea" },
];

export const SITE_CONTENT_SECTIONS: SectionSpec[] = [
  {
    key: "meta",
    label: "SEO Meta",
    fields: [
      { name: "title", label: "Page title", type: "text" },
      { name: "description", label: "Meta description", type: "textarea" },
    ],
  },
  {
    key: "nav",
    label: "Navigation",
    isArrayRoot: true,
    itemFields: [
      { name: "href", label: "Anchor (href)", type: "text" },
      { name: "label", label: "Label", type: "text" },
    ],
  },
  {
    key: "hero",
    label: "Hero",
    fields: [
      { name: "badge", label: "Badge", type: "textarea" },
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "result", label: "Result statement", type: "textarea" },
      { name: "ctaPrimary", label: "Primary CTA", type: "text" },
      { name: "ctaSecondary", label: "Secondary CTA", type: "text" },
      { name: "headerCta", label: "Header CTA", type: "text" },
    ],
  },
  {
    key: "about",
    label: "About",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Paragraphs", type: "string-array" },
    ],
  },
  {
    key: "solutions",
    label: "Solutions",
    fields: [
      { name: "kicker", label: "Kicker", type: "text" },
      { name: "cards", label: "Cards", type: "repeater", fields: cardFields },
      {
        name: "comingSoon",
        label: "Coming soon",
        type: "object",
        fields: [
          { name: "title", label: "Title", type: "text" },
          { name: "body", label: "Body", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "technology",
    label: "Technology",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Paragraphs", type: "string-array" },
      { name: "points", label: "Points", type: "string-array" },
    ],
  },
  {
    key: "partners",
    label: "For Shipping Companies & Stores",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "lead", label: "Lead", type: "textarea" },
      {
        name: "groups",
        label: "Groups",
        type: "repeater",
        fields: [
          { name: "title", label: "Group title", type: "text" },
          { name: "items", label: "Items", type: "string-array" },
        ],
      },
      {
        name: "cta",
        label: "Call to action",
        type: "object",
        fields: [
          { name: "label", label: "Label", type: "text" },
          { name: "note", label: "Note", type: "text" },
        ],
      },
    ],
  },
  {
    key: "financialImpact",
    label: "Financial Impact",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "cards", label: "Cards", type: "repeater", fields: cardFields },
    ],
  },
  {
    key: "stores",
    label: "For Shop Owners",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "lead", label: "Lead", type: "textarea" },
      { name: "cards", label: "Cards", type: "repeater", fields: cardFields },
    ],
  },
  {
    key: "founder",
    label: "Founder's Note",
    fields: [
      { name: "kicker", label: "Kicker", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Paragraphs", type: "string-array" },
      { name: "quote", label: "Quote", type: "textarea" },
    ],
  },
  {
    key: "vision",
    label: "Vision",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Paragraphs", type: "string-array" },
    ],
  },
  {
    key: "nationalImpact",
    label: "National Impact & Vision 2030",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Paragraphs", type: "string-array" },
      { name: "cards", label: "Cards", type: "repeater", fields: cardFields },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      {
        name: "tabs",
        label: "Tab labels",
        type: "object",
        fields: [
          { name: "store", label: "Store tab", type: "text" },
          { name: "partner", label: "Partner tab", type: "text" },
        ],
      },
      { name: "storeIntro", label: "Store intro", type: "textarea" },
      { name: "partnerIntro", label: "Partner intro", type: "textarea" },
      {
        name: "fields",
        label: "Form field labels",
        type: "object",
        fields: [
          { name: "name", label: "Name label", type: "text" },
          { name: "namePh", label: "Name placeholder", type: "text" },
          { name: "email", label: "Email label", type: "text" },
          { name: "emailPh", label: "Email placeholder", type: "text" },
          { name: "phone", label: "Phone label", type: "text" },
          { name: "phonePh", label: "Phone placeholder", type: "text" },
          { name: "store", label: "Store name label", type: "text" },
          { name: "storePh", label: "Store name placeholder", type: "text" },
          { name: "city", label: "City label", type: "text" },
          { name: "cityPh", label: "City placeholder", type: "text" },
          { name: "company", label: "Company label", type: "text" },
          { name: "companyPh", label: "Company placeholder", type: "text" },
          { name: "parcels", label: "Parcel volume label", type: "text" },
          { name: "parcelsPh", label: "Parcel volume placeholder", type: "text" },
          { name: "message", label: "Message label", type: "text" },
          { name: "messagePh", label: "Message placeholder", type: "text" },
        ],
      },
      { name: "submit", label: "Submit button", type: "text" },
      { name: "sending", label: "Sending state", type: "text" },
      { name: "success", label: "Success message", type: "textarea" },
      { name: "error", label: "Error message", type: "textarea" },
      { name: "required", label: "Required-fields message", type: "text" },
    ],
  },
  {
    key: "faq",
    label: "FAQ",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      {
        name: "items",
        label: "Questions",
        type: "repeater",
        fields: [
          { name: "q", label: "Question", type: "text" },
          { name: "a", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    fields: [
      { name: "tagline", label: "Tagline", type: "textarea" },
      { name: "rights", label: "Rights notice", type: "text" },
      { name: "quickLinks", label: "\"Quick links\" heading", type: "text" },
      { name: "contactUs", label: "\"Contact us\" heading", type: "text" },
    ],
  },
];

export function getSectionSpec(sectionKey: string): SectionSpec | undefined {
  return SITE_CONTENT_SECTIONS.find((s) => s.key === sectionKey);
}
