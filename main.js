import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk/+esm";

const LOCK_KEY = "lock-token-size:lockedSize";

OBR.onReady(async () => {
  console.log("Lock Token Size loaded");

  // ---- Teste: item sem filtro, aparece sempre no contexto ----
  OBR.contextMenu.create({
    id: "lock-token-size-test",
    icons: [
      {
        icon: "/public/icon.png",
        label: "🔒 Lock Token Size (Test — Sempre aparece)"
        // **sem filter** → aparece para qualquer item
      }
    ],
    onClick(context) {
      console.log("Test context menu clicked", context.items);
      alert("Test menu item clicked!");
    }
  });

  // ---- Item real de bloqueio ----
  OBR.contextMenu.create({
    id: "lock-token-size-lock",
    icons: [
      {
        icon: "/public/icon.png",
        label: "Lock Token Size",
        // sem filtro aqui também → para fins de teste inicial
      }
    ],
    async onClick(context) {
      // verifica se GM
      const role = await OBR.player.getRole();
      if (role !== "GM") {
        alert("Somente GM pode travar o tamanho.");
        return;
      }

      await OBR.scene.items.updateItems(context.items, (items) => {
        for (let item of items) {
          item.metadata ??= {};
          item.metadata[LOCK_KEY] = {
            width: item.width,
            height: item.height
          };
        }
      });
      console.log("Size locked for", context.items);
    }
  });

  // ---- Observa mudanças e corrige resize ----
  OBR.scene.items.onChange(async (items) => {
    const toFix = items.filter(item => {
      const lock = item.metadata?.[LOCK_KEY];
      return lock && (item.width !== lock.width || item.height !== lock.height);
    });

    if (!toFix.length) return;

    await OBR.scene.items.updateItems(
      toFix.map(i => i.id),
      (items) => {
        for (let item of items) {
          const lock = item.metadata[LOCK_KEY];
          item.width = lock.width;
          item.height = lock.height;
        }
      }
    );
  });
});
