export const LUMEN_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      enum: ["draft", "need_city", "need_name", "blocked"],
      description:
        "draft if required fields are present. need_city if city unknown. need_name if place/stop name missing. blocked if PG-13 / hotel / not a real place.",
    },
    question: {
      type: ["string", "null"],
      description:
        "One short question only when status is need_city or need_name. Null on draft.",
    },
    post_kind: {
      type: "string",
      enum: ["place", "playbook"],
      description:
        "place = one Eat/Do/Buy rec. playbook = a full day with stops.",
    },
    city_slug: { type: ["string", "null"] },
    city_name: {
      type: ["string", "null"],
      description: "City display name. Required when opening a city not already on the site.",
    },
    city_airport: {
      type: ["string", "null"],
      description: "IATA code, 3 letters, e.g. BCN. Required to open a new city.",
    },
    city_country: { type: ["string", "null"] },
    category: {
      anyOf: [
        { type: "string", enum: ["eat", "do", "shop"] },
        { type: "null" },
      ],
    },
    found: {
      type: "boolean",
      description:
        "For a single rec: true only if web_search confirmed a real venue or public activity in that city. False for hotels, invented names, 'the beach' with no place.",
    },
    name: {
      type: ["string", "null"],
      description: "Place name for a rec.",
    },
    title: {
      type: ["string", "null"],
      description: "Plan title for a full layover.",
    },
    blurb: { type: ["string", "null"] },
    narrative: { type: ["string", "null"] },
    hours_available: { type: ["integer", "null"] },
    zone_type: {
      anyOf: [
        {
          type: "string",
          enum: ["airport_strip", "downtown", "station", "other"],
        },
        { type: "null" },
      ],
    },
    dish_name: { type: ["string", "null"] },
    dish_note: { type: ["string", "null"] },
    stops: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          category: {
            anyOf: [
              { type: "string", enum: ["eat", "do", "shop"] },
              { type: "null" },
            ],
          },
          blurb: { type: ["string", "null"] },
          body: { type: ["string", "null"] },
          zone_type: {
            anyOf: [
              {
                type: "string",
                enum: ["airport_strip", "downtown", "station", "other"],
              },
              { type: "null" },
            ],
          },
          dish_name: { type: ["string", "null"] },
          found: {
            type: "boolean",
            description:
              "true only if web_search confirmed this stop is a real venue or public activity in that city. false = skip it.",
          },
        },
        required: [
          "name",
          "category",
          "blurb",
          "body",
          "zone_type",
          "dish_name",
          "found",
        ],
      },
    },
  },
  required: [
    "status",
    "question",
    "post_kind",
    "city_slug",
    "city_name",
    "city_airport",
    "city_country",
    "category",
    "name",
    "title",
    "blurb",
    "narrative",
    "hours_available",
    "zone_type",
    "dish_name",
    "dish_note",
    "found",
    "stops",
  ],
} as const;

export type LumenStop = {
  name: string;
  category: "eat" | "do" | "shop" | null;
  blurb: string | null;
  body: string | null;
  zone_type: "airport_strip" | "downtown" | "station" | "other" | null;
  dish_name: string | null;
  found: boolean;
};

export type LumenExtract = {
  status: "draft" | "need_city" | "need_name" | "blocked";
  question: string | null;
  post_kind: "place" | "playbook";
  city_slug: string | null;
  city_name: string | null;
  city_airport: string | null;
  city_country: string | null;
  category: "eat" | "do" | "shop" | null;
  name: string | null;
  title: string | null;
  blurb: string | null;
  narrative: string | null;
  hours_available: number | null;
  zone_type: "airport_strip" | "downtown" | "station" | "other" | null;
  dish_name: string | null;
  dish_note: string | null;
  found: boolean;
  stops: LumenStop[];
};

export const MAX_STORY_CHARS = 4000;
/** Parked (John 2026-08-25): was 3/user/day. Put back in a later phase. */
export const DAILY_EXTRACT_CAP: number | null = null;
