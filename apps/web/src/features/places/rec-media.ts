/** Static editorial stills. Not a media pipeline. IDs match seed 003 / 005 / 006. */

export function heroForCity(city: {
  slug: string;
  name: string;
  image_url?: string | null;
  image_source?: string | null;
}): { src: string; alt: string; badge?: "ai" | null } | null {
  if (city.image_url) {
    return {
      src: city.image_url,
      alt: city.name,
      badge: city.image_source === "ai" ? "ai" : null,
    };
  }
  return CITY_HERO[city.slug] ?? null;
}

export const CITY_HERO: Record<string, { src: string; alt: string }> = {
  zurich: {
    src: "/landing/hero-zurich.jpg",
    alt: "Zurich river and old town at blue hour",
  },
  delhi: {
    src: "/landing/hero-delhi.jpg",
    alt: "Delhi colonnades at blue hour",
  },
  santiago: {
    src: "/landing/hero-santiago.jpg",
    alt: "Santiago grill and Andes at dusk",
  },
  munich: {
    src: "/landing/hero-munich.jpg",
    alt: "Munich market at blue hour",
  },
  barcelona: {
    src: "/landing/hero-barcelona.jpg",
    alt: "Barcelona Gothic street and Sagrada Família at blue hour",
  },
};

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
  "c1000000-0000-4000-8000-000000000011": {
    src: "/landing/eat-delhi-bar.jpg",
    alt: "Bar interior",
  },
  "c1000000-0000-4000-8000-000000000012": {
    src: "/landing/do-delhi-connaught.jpg",
    alt: "Colonnade wander",
  },
  "c1000000-0000-4000-8000-000000000013": {
    src: "/landing/eat-delhi-late.jpg",
    alt: "Late-night plate",
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

export const DISH_STILL: Record<string, { src: string; alt: string }> = {
  "d1000000-0000-4000-8000-000000000001": {
    src: "/landing/plate-zurich-raclette.jpg",
    alt: "Truffle raclette over potatoes",
  },
  "d1000000-0000-4000-8000-000000000002": {
    src: "/landing/plate-zurich-lava.jpg",
    alt: "Lava cake",
  },
  "d1000000-0000-4000-8000-000000000003": {
    src: "/landing/plate-zurich-pickles.jpg",
    alt: "Cornichons and potatoes",
  },
};

export function stillForDish(dish: {
  id: string;
  name: string;
  image_url?: string | null;
}): { src: string; alt: string } | undefined {
  if (dish.image_url) return { src: dish.image_url, alt: dish.name };
  const seed = DISH_STILL[dish.id];
  return seed ? { ...seed } : undefined;
}

export function stillForPlace(place: {
  id: string;
  name: string;
  image_url?: string | null;
  image_source?: string | null;
}): { src: string; alt: string; badge?: "ai" | null } | undefined {
  if (place.image_url) {
    return {
      src: place.image_url,
      alt: place.name,
      badge: place.image_source === "ai" ? "ai" : null,
    };
  }
  const seed = PLACE_STILL[place.id];
  return seed ? { ...seed, badge: "ai" as const } : undefined;
}

export function stillForStop(
  stop: {
    id: string;
    place_id: string | null;
  },
  place?: {
    id: string;
    name: string;
    image_url?: string | null;
    image_source?: string | null;
  } | null,
): { src: string; alt: string; badge?: "ai" | null } | undefined {
  if (place) {
    const fromPlace = stillForPlace(place);
    if (fromPlace) return fromPlace;
  }
  if (stop.place_id && PLACE_STILL[stop.place_id]) {
    return { ...PLACE_STILL[stop.place_id], badge: "ai" };
  }
  const seed = STOP_STILL[stop.id];
  return seed ? { ...seed, badge: "ai" } : undefined;
}

export const CITY_FEEL: Record<string, string> = {
  zurich:
    "River in summer, raclette when it isn’t, trams instead of taxis.",
  delhi: "Heat after dark, a bar everyone still names, a walk if you have the hours.",
  santiago: "Grill smoke, a long lunch, mountains if the air is clear.",
  munich: "Market bags, sweet mustard, something for the jumpseat.",
  barcelona:
    "Stone streets, a long table, the sea if you still have hours.",
};
