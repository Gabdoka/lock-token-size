import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk/+esm";

const LOCK_KEY = "lock-token-size:lockedSize";

OBR.onReady(async () => {
  console.log("Lock Token Size loaded");

  // Cria item no menu de contexto
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
      await OBR.scene.items.updateItems(context.items, (items) => {
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

  // Escuta mudanças e corrige redimensionamento
  OBR.scene.items.onChange(async (items) => {
    const altered = items.filter(item => {
      const lock = item.metadata?.[LOCK_KEY];
      if (!lock) return false;
      return item.width !== lock.width || item.height !== lock.height;
    });
    if (!altered.length) return;

    await OBR.scene.items.updateItems(
      altered.map(i => i.id),
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
