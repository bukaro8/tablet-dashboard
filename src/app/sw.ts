import { defaultCache } from "@serwist/next/worker";
import type {
  PrecacheEntry,
  RouteMatchCallbackOptions,
  RuntimeCaching,
  SerwistGlobalConfig,
} from "serwist";
import { NetworkOnly, Serwist } from "serwist";
import { isRadioProviderHostname } from "@/lib/radio-hosts";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: Array<PrecacheEntry | string> | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

function matchesRuntimeRule(
  matcher: RuntimeCaching["matcher"],
  options: RouteMatchCallbackOptions,
) {
  if (typeof matcher === "function") return matcher(options);
  if (typeof matcher === "string") {
    return options.url.href === new URL(matcher, self.location.href).href;
  }

  matcher.lastIndex = 0;
  const result = matcher.exec(options.url.href);
  matcher.lastIndex = 0;
  if (!result || (!options.sameOrigin && result.index !== 0)) return false;
  return result.slice(1);
}

const dashboardRuntimeCache = defaultCache.map<RuntimeCaching>((entry) => ({
  ...entry,
  // An unmatched request is left to the browser, so live radio never enters
  // a Serwist strategy or Cache Storage.
  matcher: (options) =>
    !isRadioProviderHostname(options.url.hostname) &&
    matchesRuntimeRule(entry.matcher, options),
}));

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  precacheOptions: { cleanupOutdatedCaches: true },
  runtimeCaching: [
    {
      matcher: ({ url }) => url.hostname === "api.open-meteo.com",
      handler: new NetworkOnly(),
    },
    ...dashboardRuntimeCache,
  ],
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const cachedRequests = await cache.keys();

          await Promise.all(
            cachedRequests
              .filter((request) =>
                isRadioProviderHostname(new URL(request.url).hostname),
              )
              .map((request) => cache.delete(request)),
          );
        }),
      );
    })(),
  );
});

serwist.addEventListeners();
