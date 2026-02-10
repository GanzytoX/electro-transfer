import { Input, Button, Space, Badge, Typography, theme } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import type {
  NotificationType,
  DatosTransferencia,
} from "~/entities/transfer/model/types";
import ImportData from "~/features/import-data/ui/ImportData";

const { TextArea } = Input;
const { Title } = Typography;
const { useToken } = theme;

const fs = window.require ? window.require("fs") : null;
const path = window.require ? window.require("path") : null;
const { dialog } = window.require
  ? window.require("electron").remote || window.require("@electron/remote")
  : {};

interface TransferListProps {
  transferencias: string[];
  onLimpiar: () => void;
  showNotification: (message: string, type: NotificationType) => void;
  onImportData: (data: DatosTransferencia[]) => void;
}

function TransferList({
  transferencias,
  onLimpiar,
  showNotification,
  onImportData,
}: TransferListProps) {
  const { token } = useToken();

  const descargarArchivo = async () => {
    if (transferencias.length === 0) {
      showNotification("No hay transferencias para descargar", "warning");
      return;
    }

    const contenido = transferencias.join("\n");

    try {
      const defaultPath = path
        ? path.join(require("os").homedir(), "layout_transferencias.txt")
        : "layout_transferencias.txt";

      const result = await dialog.showSaveDialog({
        title: "Guardar Layout",
        defaultPath: defaultPath,
        filters: [{ name: "Archivos de Texto", extensions: ["txt"] }],
      });

      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, contenido, "utf-8");
        showNotification(
          `Archivo descargado: ${transferencias.length} transferencias`,
          "success",
        );
      }
    } catch (err) {
      const error = err as Error;
      showNotification(`Error al guardar: ${error.message}`, "error");
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Title level={4} style={{ margin: 0, color: token.colorText }}>
          Transferencias Agregadas
        </Title>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Badge
            count={transferencias.length}
            showZero
            style={{ backgroundColor: token.colorPrimary }}
            overflowCount={9999}
          />
          <span style={{ color: token.colorTextDescription, fontSize: "14px" }}>
            Máximo: 5000
          </span>
        </div>
      </div>
      <TextArea
        value={transferencias.join("\n")}
        rows={10}
        readOnly
        placeholder="Las transferencias aparecerán aquí..."
        style={{
          fontFamily: "monospace",
          fontSize: "12px",
          marginBottom: "16px",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onLimpiar}
            disabled={transferencias.length === 0}
            size="large">
            Limpiar Transferencias
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={descargarArchivo}
            disabled={transferencias.length === 0}
            size="large">
            Descargar TXT
          </Button>
        </Space>
        <ImportData
          onImportData={onImportData}
          showNotification={showNotification}
        />
      </div>
    </div>
  );
}

export default TransferList;
