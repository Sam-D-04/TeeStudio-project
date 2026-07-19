import type Konva from "konva";

import { useDesignStore, type ShirtType } from "@/store/useDesignStore";
import { getPrintAreaBoundary } from "@/components/design-studio/ShirtMockupImage";

const CONTAINER_W = 500;
const CONTAINER_H = 600;
const TARGET_LONG_EDGE = 2400;

export async function captureAdminPrintImages({
  stage,
  shirtType,
  zoom,
}: {
  stage: Konva.Stage | null;
  shirtType: ShirtType;
  zoom: number;
}): Promise<{ printImageFront?: string; printImageBack?: string }> {
  if (!stage) return {};

  const originalView = useDesignStore.getState().shirtView;
  const elementsNow = useDesignStore.getState().elements;
  const sidesToCapture = (["front", "back"] as const).filter((side) =>
    elementsNow.some((element) => (element.side ?? "front") === side)
  );
  if (!sidesToCapture.length) return {};

  const result: { printImageFront?: string; printImageBack?: string } = {};

  try {
    for (const side of sidesToCapture) {
      if (useDesignStore.getState().shirtView !== side) {
        useDesignStore.setState({ shirtView: side, selectedId: null });
        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }

      const printArea = getPrintAreaBoundary(shirtType, side, CONTAINER_W, CONTAINER_H);
      const transformers = stage.find("Transformer");
      transformers.forEach((transformer) => transformer.hide());

      try {
        const longEdgeScreen = Math.max(printArea.width, printArea.height) * zoom;
        const pixelRatio = longEdgeScreen > 0 ? TARGET_LONG_EDGE / longEdgeScreen : 3;
        const dataUrl = stage.toDataURL({
          mimeType: "image/png",
          x: printArea.left * zoom,
          y: printArea.top * zoom,
          width: printArea.width * zoom,
          height: printArea.height * zoom,
          pixelRatio,
        });

        if (side === "front") result.printImageFront = dataUrl;
        else result.printImageBack = dataUrl;
      } finally {
        transformers.forEach((transformer) => transformer.show());
        stage.batchDraw();
      }
    }
  } finally {
    if (useDesignStore.getState().shirtView !== originalView) {
      useDesignStore.setState({ shirtView: originalView, selectedId: null });
      await new Promise((resolve) => window.setTimeout(resolve, 60));
    }
  }

  return result;
}
