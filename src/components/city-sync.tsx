import { useRouteContext } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { saveCity } from "@/lib/account";
import { useCity } from "@/lib/location";

/**
 * Keeps the catalog's city (useCity, stored in the browser) in step with the signed-in
 * member's profile: the profile city wins when they arrive, and a city they pick later in
 * the catalog is saved back to the profile. Mounted once, in the root route.
 */
export function CitySync() {
  const { user } = useRouteContext({ from: "__root__" });
  const { city, setCity } = useCity();
  // Profile city we last matched for this user; undefined = not synced yet.
  const synced = useRef<{ userId: string; city: string | null } | undefined>(undefined);

  useEffect(() => {
    if (!user?.handle) {
      synced.current = undefined;
      return;
    }
    if (synced.current?.userId !== user.id) {
      synced.current = { userId: user.id, city: user.city };
      if (user.city) {
        if (city?.id !== user.city) setCity(user.city);
        return;
      }
    }
    if (city && city.id !== synced.current.city) {
      synced.current.city = city.id;
      void saveCity({ data: { city: city.id } });
    }
  }, [user?.id, user?.handle, user?.city, city?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
