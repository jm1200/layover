/** Static editorial stills. Not a media pipeline. IDs match seed 003 / 005 / 006. */

export const CITY_HERO: Record<string, { src: string; alt: string }> = {
  zurich: {
    src: "/landing/hero-zurich.jpg",
    alt: "Zurich river and old town at blue hour",
  },
};

/** Delhi is the sparse first-screen demo: no hero photo, no recs on the city page. Data still in the DB. */
export const CITY_PAGE_FORCE_EMPTY = new Set(["delhi"]);

export const PLACE_STILL: Record<string, { src: string; alt: string }> = {
  "c1000000-0000-4000-8000-000000000001": {
    src: "/landing/do-zurich.jpg",
    alt: "People floating the Limmat",
  },
  "c1000000-0000-4000-8000-000000000002": {
    src: "/landing/do-zurich-climb.jpg",
    alt: "Indoor bouldering wall",
  },
  "c1000000-0000-4000-8000-000000000003": {
    src: "/landing/eat-zurich-raclette.jpg",
    alt: "Truffle raclette",
  },
  "c1000000-0000-4000-8000-000000000004": {
    src: "/landing/buy-zurich-grocery.jpg",
    alt: "Grocery still life",
  },
  "c1000000-0000-4000-8000-000000000005": {
    src: "/landing/eat-zurich-bakery.jpg",
    alt: "Bun, jam, and coffee",
  },
  "c1000000-0000-4000-8000-000000000006": {
    src: "/landing/eat-zurich-cafe.jpg",
    alt: "Coffee by a tram window",
  },
  "c1000000-0000-4000-8000-000000000007": {
    src: "/landing/do-zurich-wander.jpg",
    alt: "Old town alley",
  },
  "c1000000-0000-4000-8000-000000000008": {
    src: "/landing/buy-zurich-chocolate.jpg",
    alt: "Chocolate bars",
  },
  "c1000000-0000-4000-8000-000000000009": {
    src: "/landing/buy-zurich-cheese.jpg",
    alt: "Cheese and a roll",
  },
  "c1000000-0000-4000-8000-000000000021": {
    src: "/landing/eat-santiago.jpg",
    alt: "Baseball steak",
  },
  "c1000000-0000-4000-8000-000000000031": {
    src: "/landing/buy-munich.jpg",
    alt: "Mustard jars",
  },
};

export const PREVIEW_COUNT = 3;

/** Stops with no place_id (e.g. Zurich streetcar). */
export const STOP_STILL: Record<string, { src: string; alt: string }> = {
  "f1000000-0000-4000-8000-000000000003": {
    src: "/landing/do-zurich-tram.jpg",
    alt: "Zurich streetcar",
  },
};

export function stillForStop(stop: {
  id: string;
  place_id: string | null;
}): { src: string; alt: string } | undefined {
  if (stop.place_id && PLACE_STILL[stop.place_id]) {
    return PLACE_STILL[stop.place_id];
  }
  return STOP_STILL[stop.id];
}

export const CITY_FEEL: Record<string, string> = {
  zurich:
    "River in summer, raclette when it isn’t, trams instead of taxis.",
  delhi:
    "Late nights, a bar everyone names, a city that still needs your recs.",
  santiago: "Grill smoke, a long lunch, mountains if the air is clear.",
  munich: "Market bags, sweet mustard, something for the jumpseat.",
};
