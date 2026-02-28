import { ActionIcon, Text, Group, Box } from "@mantine/core";
import { IconMinus, IconX } from "@tabler/icons-react";
import appLogo from "~/shared/assets/app_logo.png";

function TitleBar() {
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <Box
      style={
        {
          height: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid var(--mantine-color-default-border)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          WebkitAppRegion: "drag",
          backgroundColor: "var(--mantine-color-body)",
        } as React.CSSProperties
      }>
      <Group gap="xs" style={{ alignItems: "center" }}>
        <img
          src={appLogo}
          alt="Icon"
          style={{ width: "16px", height: "16px", objectFit: "contain" }}
        />
        <Text fw={700} size="xs">
          ElectroTransfer
        </Text>
      </Group>

      <Group
        gap="xs"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={handleMinimize}>
          <IconMinus size={14} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={handleClose}>
          <IconX size={14} />
        </ActionIcon>
      </Group>
    </Box>
  );
}

export default TitleBar;
