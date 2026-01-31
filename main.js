import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk/+esm";

const LOCK_KEY = "lock-token-size:lockedSize";

OBR.onReady(async () => {
  console.log("Lock Token Size extension loaded");

  // ===== TESTE: Item simples no menu de contexto =====
  OBR.contextMenu.create({
    id: "lock-token-size-test",
    icons: [
      {
        icon: "/public/icon.png",
        label: "🔒 Lock Token Size (test)"
      }
    ],
    onClick(context) {
      console.log("🔒 Context Test clicked", context.items);
    }
  });

  // ===== ITEM REAL DE BLOQUEIO =====
  OBR.contextMenu.create({
    id: "lock-token-size-lock",
    icons: [
      {
        icon: "/public/icon.png",
        label: "Lock Token Size",
        filter: {
          // O item aparece para qualquer token selecionado
          any: [
            { key: "layer", operator: "==", value: "CHARACTER" },
            { key: "layer", operator: "==", value: "OBJECT" }
          ]
        }
      }
    ],
    async onClick(context) {
      // Checa se o usuário é GM
      const role = await OBR.player.getRole();
      if (role !== "GM") {
        console.warn("Only GM can lock token size");
        return;
      }

      // Lock do tamanho atual
      await OBR.scene.items.updateItems(context.items, (items) => {
        for (let item of items) {
          item.metadata ??= {};
          item.metadata[LOCK_KEY] = {
            width: item.width,
            height: item.height
          };
        }
      });

      console.log("Token size locked for", context.items);
    }
  });

  // ===== CORREÇÃO AUTOMÁTICA (listen para mudanças) =====
  OBR.scene.items.onChange(async (items) => {
    const altered = items.filter((item) => {
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
