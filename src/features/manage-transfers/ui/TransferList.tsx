import {
  Textarea,
  Button,
  Group,
  Badge,
  Text,
  Title,
  Box,
} from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import type { NotificationType, DatosTransferencia } from "~/entities/transfer";
import { ImportData } from "~/features/import-data";

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
  const descargarArchivo = async () => {
    if (transferencias.length === 0) {
      showNotification("No hay transferencias para descargar", "warning");
      return;
    }

    const contenido = transferencias.join("\n");

    try {
      const result = await window.electronAPI.saveFile(contenido);

      if (result.success) {
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
    <Box>
      <Group justify="space-between" align="center" mb="xl">
        <Title order={4} m={0}>
          Transferencias Agregadas
        </Title>
        <Group align="center" gap="md">
          <Badge size="lg" variant="filled">
            {transferencias.length}
          </Badge>
          <Text c="dimmed" size="sm">
            Máximo: 5000
          </Text>
        </Group>
      </Group>
      <Textarea
        value={transferencias.join("\n")}
        minRows={10}
        maxRows={15}
        autosize
        readOnly
        placeholder="Las transferencias aparecerán aquí..."
        styles={{
          input: {
            fontFamily: "monospace",
            fontSize: "12px",
          },
        }}
        mb="md"
      />
      <Group justify="space-between">
        <Group>
          <Button
            color="red"
            variant="outline"
            leftSection={<IconTrash size={16} />}
            onClick={onLimpiar}
            disabled={transferencias.length === 0}
            size="md">
            Limpiar Transferencias
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={descargarArchivo}
            disabled={transferencias.length === 0}
            size="md">
            Descargar TXT
          </Button>
        </Group>
        <ImportData
          onImportData={onImportData}
          showNotification={showNotification}
        />
      </Group>
    </Box>
  );
}

export default TransferList;
