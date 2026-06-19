(() => {
  const reloadClients = async () => {
    const clientsList = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    await Promise.all(
      clientsList.map(async (client) => {
        try {
          const url = new URL(client.url);
          if (url.origin !== self.location.origin) return;
          await client.navigate(client.url);
        } catch {
          // A stale app shell is worse than a missed best-effort reload.
        }
      })
    );
  };

  self.addEventListener("activate", (event) => {
    event.waitUntil(reloadClients());
  });
})();
