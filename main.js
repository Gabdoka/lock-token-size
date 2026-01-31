import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@latest/dist/index.js";

const EXT_ID = "lock-token-size";
const LOCK_KEY = `${EXT_ID}/locked`;

OBR.onReady(() => {
  console.log("Lock Token Size ready");

  // Cria a tool (ícone na barra lateral)
  OBR.tool.create({
    id: EXT_ID,
    icons: [
      {
        icon: "public/icon.png",
        label: "Lock Token Size"
      }
    ],
    onClick: async () => {
      const role = await OBR.player.getRole();
      if (role !== "GM") return;

      const selection = await OBR.player.getSelection();
      if (!selection.length) return;

      await OBR.scene.items.updateItems(selection, (items) => {
        for (const item of items) {
          item.metadata ??= {};
          if (item.metadata[LOCK_KEY]) {
            delete item.metadata[LOCK_KEY];
          } else {
            item.metadata[LOCK_KEY] = {
              width: item.width,
              height: item.height
            };
          }
        }
      });
    }
  });

  // Observa mudanças e desfaz resize
  OBR.scene.items.onChange((items) => {
    for (const item of items) {
      const lock = item.metadata?.[LOCK_KEY];
      if (!lock) continue;

      if (item.width !== lock.width || item.height !== lock.height) {
        OBR.scene.items.updateItems([item.id], (draft) => {
          draft.width = lock.width;
          draft.height = lock.height;
        });
      }
    }
  });
});

