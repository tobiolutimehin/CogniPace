import { OverlayPanel } from "./OverlayPanel";
import {
  OverlayControllerEnvironment,
  useOverlayController,
} from "./useOverlayController";

export function OverlayRoot(environment: OverlayControllerEnvironment) {
  const { panelProps } = useOverlayController(environment);
  return panelProps ? <OverlayPanel {...panelProps} /> : null;
}
