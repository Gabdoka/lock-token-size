import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk/+esm";

// Uma chave pra salvar o tamanho travado no token
const LOCK_KEY = "lock-token-size:lockedSize";

OBR.onReady(async () => {
  console.log("Lock Token Size: ready");

  // Cria o item no menu de contexto
  OBR.contextMenu.create({
    id: "lock-token-size",
    icons: [
      {
        // ícone do menu contexto (pode ser qualquer imagem pequena)
        icon: "public/icon.png", 
        label: "Lock Token Size",
        // mostra apenas se o item for um token (layer CHARACTER, etc.)
        filter: {
          every: [
            { key: "layer", operator: "==", value: "CHARACTER" }
          ]
        }
      }
    ],
    async onClick(context) {
      // context.items é um array de IDs dos tokens selecionados

      // Guardar a escala atual (tamanho)
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

  // Observa alterações nos tokens
  OBR.scene.items.onChange(async (items) => {
    // Filtra apenas tokens que estejam travados
    const needsReset = items.filter((item) => {
      return item.metadata?.[LOCK_KEY] &&
             (item.width !== item.metadata[LOCK_KEY].width ||
              item.height !== item.metadata[LOCK_KEY].height);
    });

    if (!needsReset.length) return;

    // Reverte o redimensionamento se alguém tentar mudar
    await OBR.scene.items.updateItems(
      needsReset.map(i => i.id),
      (items) => {
        for (let item of items) {
          const locked = item.metadata[LOCK_KEY];
          item.width = locked.width;
          item.height = locked.height;
        }
      }
    );
  });
});
