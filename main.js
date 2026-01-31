import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk/+esm";

const LOCK_KEY = "lock-token-size:lockedSize";

OBR.onReady(async () => {
  console.log("Lock Token Size Loaded");

  // Cria o item de menu de contexto
  OBR.contextMenu.create({
    id: "lock-token-size",
    icons: [
      {
        icon: "/public/icon.png",
        label: "Lock Token Size",
        filter: {
          // Este filtro é mais amplo para cobrir tokens.
          any: [
            { key: "layer", operator: "==", value: "CHARACTER" },
            { key: "layer", operator: "==", value: "OBJECT" }
          ]
        }
      }
    ],
    async onClick(context) {
      // Só GM pode travar
      const role = await OBR.player.getRole();
      if (role !== "GM") {
        console.warn("Only GM can lock token size");
        return;
      }

      // Atualiza os tokens selecionados
      await OBR.scene.items.updateItems(context.items, (items) => {
        for (let item of items) {
          item.metadata ??= {};
          // Guarda tamanho atual
          item.metadata[LOCK_KEY] = {
            width: item.width,
            height: item.height
          };
        }
      });
    }
  });

  // Observa mudanças e corrige qualquer resize
  OBR.scene.items.onChange(async (items) => {
    const changed = items.filter(item => {
      const lock = item.metadata?.[LOCK_KEY];
      if (!lock) return false;
      return item.width !== lock.width || item.height !== lock.height;
    });

    if (!changed.length) return;

    await OBR.scene.items.updateItems(
      changed.map(i => i.id),
      (items) => {
        for (const item of items) {
          const lock = item.metadata[LOCK_KEY];
          item.width = lock.width;
          item.height = lock.height;
        }
      }
    );
  });
});
