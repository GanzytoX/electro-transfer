import { Button, Typography, theme } from "antd";
import { MinusOutlined, CloseOutlined } from "@ant-design/icons";
import appLogo from "~/shared/assets/app_logo.png";

const { Text } = Typography;
const { useToken } = theme;

function TitleBar() {
  const { token } = useToken();
  const handleMinimize = () => {
    try {
      const remote = window.require("@electron/remote");
      remote.getCurrentWindow().minimize();
    } catch (e) {
      console.error("Error minimizing", e);
    }
  };

  const handleClose = () => {
    try {
      const remote = window.require("@electron/remote");
      remote.getCurrentWindow().close();
    } catch (e) {
      console.error("Error closing", e);
    }
  };

  return (
    <div
      style={
        {
          height: "32px",
          background: token.colorBgContainer,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: `1px solid ${token.colorSplit}`,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          WebkitAppRegion: "drag", // Hace que la ventana se pueda mover
        } as React.CSSProperties
      }>
      {/* Logo y Título */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <img
          src={appLogo}
          alt="Icon"
          style={{ width: "16px", height: "16px", objectFit: "contain" }}
        />
        <Text strong style={{ fontSize: "12px", color: token.colorText }}>
          ElectroTransfer
        </Text>
      </div>

      {/* Botones de Control */}
      <div
        style={
          {
            display: "flex",
            gap: "8px",
            WebkitAppRegion: "no-drag", // Importante: permite hacer clic en los botones
          } as React.CSSProperties
        }>
        <Button
          type="text"
          size="small"
          icon={<MinusOutlined style={{ fontSize: "10px" }} />}
          onClick={handleMinimize}
          style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: token.colorText,
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined style={{ fontSize: "10px" }} />}
          onClick={handleClose}
          danger
          style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div>
    </div>
  );
}

export default TitleBar;
