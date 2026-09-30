export const LUMEN_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      enum: ["draft", "need_city", "need_name", "blocked"],
      description:
        "draft if required fields are present. need_city if city unknown. need_name if place/stop name missing. blocked only for PG-13 / hate. Do not block because they named a hotel.",
    },
    question: {
      type: ["string", "null"],
      description:
        "One short question only when status is need_city or need_name. Null on draft.",
    },
    post_kind: {
      type: "string",
      enum: ["place", "places", "playbook"],
      description:
        "place = one Eat/Do/Buy rec. places = two or more independent recs, no itinerary. playbook = they pitched a sequenced day (hours, order as the point). Do not invent a day.",
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
    narrative: {
      type: ["string", "null"],
      description:
        "For playbook only: a 3–5 sentence pitch for the day, rewritten (never their raw dump): stops in order, one vivid specific each, the payoff. Hotel-stripped. Never empty on a playbook.",
    },
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
    took_out_hotel: {
      type: "boolean",
      description:
        "true if the dump named a hotel / crew lodging and you stripped it. Still draft the real places. Never block for this.",
    },
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
          minutes: {
            type: ["integer", "null"],
            description:
              "Playbook only: realistic minutes spent AT this stop. Their number if they gave one; else a typical visit (meal ~60–90, climbing session ~120, spa/bath ~150, museum ~90–120, quick shop ~20–30). Null for places.",
          },
          travel_minutes: {
            type: ["integer", "null"],
            description:
              "Playbook only: minutes to get here from the previous stop by the way they moved (walk/tram/train/cable car). 0 if next door. Null on the first stop and for places. Never invent precision: round to 5.",
          },
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
          "minutes",
          "travel_minutes",
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
    "took_out_hotel",
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
  /** Minutes at the stop (playbook). */
  minutes: number | null;
  /** Minutes from the previous stop (playbook). */
  travel_minutes: number | null;
  found: boolean;
};

export type LumenExtract = {
  status: "draft" | "need_city" | "need_name" | "blocked";
  question: string | null;
  post_kind: "place" | "places" | "playbook";
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
  took_out_hotel: boolean;
  stops: LumenStop[];
};

export const MAX_STORY_CHARS = 4000;
/** Eat/Buy plates on a rec page. City card stays one still. */
export const MAX_PLATES = 3;
/** Parked (John 2026-08-25): was 3/user/day. Put back in a later phase. */
export const DAILY_EXTRACT_CAP: number | null = null;
