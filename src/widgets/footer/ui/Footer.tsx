import { Layout, Typography, theme } from "antd";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;
const { useToken } = theme;

function Footer() {
  const { token } = useToken();
  return (
    <AntFooter
      style={{
        textAlign: "center",
        background: token.colorBgLayout,
        borderTop: `1px solid ${token.colorSplit}`,
        padding: "16px 24px",
      }}>
      <Text type="secondary" style={{ fontSize: "13px" }}>
        Hecho por{" "}
        <Text strong style={{ color: token.colorPrimary }}>
          GanzytoX
        </Text>
        {" • "}2026{" • "}
        <Text strong>v2.0</Text>
      </Text>
    </AntFooter>
  );
}

export default Footer;
