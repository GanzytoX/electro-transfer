import { Text, Box } from "@mantine/core";
import packageJson from "../../../../package.json";

function Footer() {
  return (
    <Box
      style={{
        textAlign: "center",
        backgroundColor: "var(--mantine-color-body)",
        borderTop: "1px solid var(--mantine-color-default-border)",
        padding: "16px 24px",
      }}>
      <Text c="dimmed" size="sm">
        Hecho por{" "}
        <Text span fw={700} c="myColor.6">
          {packageJson.author.name}
        </Text>
        {" • "}
        {new Date().getFullYear()}
        {" • "}
        <Text span fw={700}>
          v{packageJson.version}
        </Text>
      </Text>
    </Box>
  );
}

export default Footer;
