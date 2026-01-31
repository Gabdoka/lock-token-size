import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk/+esm";

// Chave usada para armazenar tamanho travado no metadata
const LOCK_KEY = "lock-token-size:lockedSize";

OBR.onReady(() => {
  console.log("Lock Token Size ready");

  // Cria item no menu de contexto (botão direito)
  OBR.contextMenu.create({
    id: "lock-token-size",
    icons: [
      {
        icon: "public/icon.png",
        label: "Lock Token Size",
        filter: {
          every: [
            { key: "layer", operator: "==", value: "CHARACTER" }
          ]
        }
      }
    ],
    async onClick(context) {
      // Salva o tamanho atual
      await OBR.scene.items.updateItems(context.items, items => {
        for (let item of items) {
          item.metadata ??= {};
          item.metadata[LOCK_KEY] = {
            width: item.width,
            height: item.height
          };
        }
      });
    }
  });

  // Observa mudanças e reseta caso alguém mude o tamanho
  OBR.scene.items.onChange(async items => {
    const changed = items.filter(item => {
      const lock = item.metadata?.[LOCK_KEY];
      if (!lock) return false;
      return item.width !== lock.width || item.height !== lock.height;
    });

    if (!changed.length) return;

    await OBR.scene.items.updateItems(
      changed.map(i => i.id),
      items => {
        for (const item of items) {
          const lock = item.metadata[LOCK_KEY];
          item.width = lock.width;
          item.height = lock.height;
        }
      }
    );
  });
});
