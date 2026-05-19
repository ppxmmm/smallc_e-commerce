export function createSessionStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

export function installBrowserMock() {
  const listeners = new Map();

  const browser = {
    sessionStorage: createSessionStorage(),
    localStorage: createSessionStorage(),
    dispatchEvent(event) {
      const handlers = listeners.get(event.type) ?? [];
      for (const handler of handlers) {
        handler(event);
      }
      return true;
    },
    addEventListener(type, handler) {
      if (!listeners.has(type)) {
        listeners.set(type, []);
      }
      listeners.get(type).push(handler);
    },
    removeEventListener(type, handler) {
      const handlers = listeners.get(type) ?? [];
      listeners.set(
        type,
        handlers.filter((entry) => entry !== handler),
      );
    },
  };

  const previous = {
    window: globalThis.window,
    atob: globalThis.atob,
    btoa: globalThis.btoa,
  };

  globalThis.window = browser;

  if (typeof globalThis.atob !== "function") {
    globalThis.atob = (value) => Buffer.from(value, "base64").toString("utf8");
  }

  if (typeof globalThis.btoa !== "function") {
    globalThis.btoa = (value) => Buffer.from(value, "utf8").toString("base64");
  }

  return {
    browser,
    restore() {
      globalThis.window = previous.window;
      globalThis.atob = previous.atob;
      globalThis.btoa = previous.btoa;
    },
  };
}

export function makeJwtPayload(payload) {
  return `test.${globalThis.btoa(JSON.stringify(payload))}.signature`;
}
