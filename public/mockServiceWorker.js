/* tslint:disable */

/**
 * Mock Service Worker (2.3.5).
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = "19f0248EDIT_THIS_TOKEN";
const IS_MOCKED_RESPONSE = Symbol("isMockedResponse");
const activeClientIds = new Set();

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", async function (event) {
  const clientId = event.source.id;

  if (!clientId || !self.clients) {
    return;
  }

  const client = await self.clients.get(clientId);

  if (!client) {
    return;
  }

  const allClients = await self.clients.matchAll({
    type: "window",
  });

  switch (event.data?.type) {
    case "KEEPALIVE_REQUEST": {
      sendToClient(client, {
        type: "KEEPALIVE_RESPONSE",
      });
      break;
    }

    case "INTEGRITY_CHECK_REQUEST": {
      sendToClient(client, {
        type: "INTEGRITY_CHECK_RESPONSE",
        payload: INTEGRITY_CHECKSUM,
      });
      break;
    }

    case "MOCK_ACTIVATE": {
      activeClientIds.add(clientId);

      sendToClient(client, {
        type: "MOCKING_ENABLED",
        payload: true,
      });
      break;
    }

    case "MOCK_DEACTIVATE": {
      activeClientIds.delete(clientId);
      break;
    }

    case "CLIENT_CLOSED": {
      activeClientIds.delete(clientId);
      break;
    }

    case "REQUEST_PASSTHROUGH": {
      return passthrough(event, client, allClients);
    }

    case "RESPONSE": {
      return resolveResponse(event, client, allClients);
    }
  }
});

async function passthrough(event, client, allClients) {
  const { request } = event.data.payload;

  return fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}

async function resolveResponse(event, client, allClients) {
  const { payload } = event.data;
  const { requestId } = payload;

  const pooledRequest = requestsPool.get(requestId);

  if (!pooledRequest) {
    console.warn(
      'MSW: cannot resolve a response for the request with ID "%s": the request is not present in the pool. This is likely an issue with the library.',
      requestId,
    );

    return;
  }

  const { request, serializedResponse } = pooledRequest;

  const mockedResponse = await deserializeResponse(serializedResponse);
  const clonedResponse = mockedResponse.clone();

  sendToClient(client, {
    type: "RESPONSE",
    payload: {
      requestId,
      isMockedResponse: true,
      response: await serializeResponse(clonedResponse),
    },
  });

  requestsPool.delete(requestId);

  return mockedResponse;
}

function sendToClient(client, message) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error);
      }

      resolve(event.data);
    };

    client.postMessage(message, [channel.port2]);
  });
}

async function serializeRequest(request) {
  const body = await request.arrayBuffer();

  return {
    id: request.id,
    url: request.url,
    method: request.method,
    headers: request.headers,
    body,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer,
    integrity: request.integrity,
  };
}

async function serializeResponse(response) {
  const headers = Object.fromEntries(response.headers.entries());
  const body = await response.arrayBuffer();

  return {
    status: response.status,
    statusText: response.statusText,
    headers,
    body,
  };
}

async function deserializeResponse(serializedResponse) {
  const { status, statusText, headers, body } = serializedResponse;

  return new Response(body, {
    status,
    statusText,
    headers,
  });
}

const requestsPool = new Map();
let requestIdCounter = 0;

self.addEventListener("fetch", async function (event) {
  const { clientId, request } = event;

  const requestId = ++requestIdCounter;
  const requestClone = request.clone();

  function passthrough() {
    const headers = Object.fromEntries(requestClone.headers.entries());

    const transformedHeaders = new Headers(headers);
    transformedHeaders.set("msw-intention", "passthrough");

    return fetch(requestClone.url, {
      method: requestClone.method,
      headers: transformedHeaders,
      body: requestClone.body,
    });
  }

  if (!activeClientIds.has(clientId)) {
    return event.respondWith(passthrough());
  }

  const client = await self.clients.get(clientId);

  if (!client) {
    return event.respondWith(passthrough());
  }

  const serializedRequest = await serializeRequest(requestClone);
  requestsPool.set(requestId, { request, serializedResponse: null });

  return event.respondWith(
    new Promise((resolve) => {
      client.postMessage({
        type: "REQUEST",
        payload: {
          id: requestId,
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          cache: request.cache,
          mode: request.mode,
          credentials: request.credentials,
          destination: request.destination,
          integrity: request.integrity,
          redirect: request.redirect,
          referrer: request.referrer,
          referrerPolicy: request.referrerPolicy,
          body: serializedRequest.body,
          bodyUsed: request.bodyUsed,
          keepalive: request.keepalive,
        },
      });

      setTimeout(() => {
        resolve(passthrough());
      }, 5000);
    }).catch(passthrough),
  );
});
