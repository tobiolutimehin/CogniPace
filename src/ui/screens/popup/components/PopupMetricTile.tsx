import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {popupMetricValueSx, popupPanelSx, popupSectionLabelSx} from "./popupStyles";

export interface PopupMetricTileProps {
  accent?: string;
  label: string;
  suffix?: string;
  value: number;
}

export function PopupMetricTile(props: PopupMetricTileProps) {
  return (
    <Box sx={{...popupPanelSx, p: 1.1}}>
      <Stack spacing={0.55}>
        <Typography sx={popupSectionLabelSx}>
          {props.label}
        </Typography>
        <Stack alignItems="baseline" direction="row" spacing={0.55}>
          <Typography sx={{...popupMetricValueSx, color: props.accent}}>
            {props.value}
          </Typography>
          {props.suffix ? (
            <Typography
              color="text.secondary"
              sx={{
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {props.suffix}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
