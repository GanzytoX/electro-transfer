import { useState, useRef } from "react";
import { Button, FileButton, Modal, Loader, Stack, Text } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import type { NotificationType, DatosTransferencia } from "~/entities/transfer";
import { obtenerClaveBanco } from "~/shared/lib/bancos";

interface ImportDataProps {
  onImportData: (data: DatosTransferencia[]) => void;
  showNotification: (message: string, type: NotificationType) => void;
}

interface ImportedRow {
  [key: string]: any;
}

const COLUMN_VARIANTS: Record<string, string[]> = {
  cuentaOrigen: ["Cuenta Origen", "cuenta_origen", "CuentaOrigen", "origen"],
  cuentaDestino: [
    "Cuenta Destino",
    "cuenta_destino",
    "CuentaDestino",
    "destino",
  ],
  monto: ["Monto", "monto", "Importe", "importe"],
  concepto: ["Concepto", "concepto", "Descripcion", "descripcion"],
  clave: ["Clave", "clave", "Clave Transferencia", "clave_transferencia"],
  divisa: ["Divisa", "divisa"],

  titular: ["Titular", "titular", "Beneficiario", "beneficiario"],
  tipoCuenta: ["Tipo Cuenta", "tipo_cuenta", "TipoCuenta"],
  claveBanco: [
    "Clave Banco",
    "clave_banco",
    "ClaveBanco",
    "Nombre Banco",
    "nombre_banco",
    "NombreBanco",
    "banco",
  ],
  referencia: ["Referencia", "referencia"],
};

function hasColumn(headers: string[], variants: string[]): boolean {
  return variants.some((v) => headers.includes(v));
}

function getColumnValue(row: ImportedRow, variants: string[]): string {
  for (const variant of variants) {
    if (
      row[variant] !== undefined &&
      row[variant] !== null &&
      String(row[variant]).trim() !== ""
    ) {
      return String(row[variant]).trim();
    }
  }
  return "";
}

function getAllRecognizedColumns(): Set<string> {
  const recognized = new Set<string>();
  for (const variants of Object.values(COLUMN_VARIANTS)) {
    for (const v of variants) {
      recognized.add(v);
    }
  }
  return recognized;
}

const RECOGNIZED_COLUMNS = getAllRecognizedColumns();

interface DetectionResult {
  type: "mismo-banco" | "spei";
  missingColumns: string[];
  unrecognizedColumns: string[];
  isValid: boolean;
}

function detectTypeAndValidate(headers: string[]): DetectionResult {
  const unrecognizedColumns: string[] = [];
  for (const header of headers) {
    if (!RECOGNIZED_COLUMNS.has(header) && !header.startsWith("__EMPTY")) {
      unrecognizedColumns.push(header);
    }
  }

  const hasCuentaOrigen = hasColumn(headers, COLUMN_VARIANTS.cuentaOrigen);
  const hasCuentaDestino = hasColumn(headers, COLUMN_VARIANTS.cuentaDestino);
  const hasMonto = hasColumn(headers, COLUMN_VARIANTS.monto);
  const hasConcepto = hasColumn(headers, COLUMN_VARIANTS.concepto);

  const hasTitular = hasColumn(headers, COLUMN_VARIANTS.titular);
  const hasClaveBanco = hasColumn(headers, COLUMN_VARIANTS.claveBanco);
  const hasTipoCuenta = hasColumn(headers, COLUMN_VARIANTS.tipoCuenta);
  const hasReferencia = hasColumn(headers, COLUMN_VARIANTS.referencia);

  const isSPEI = hasTitular || hasClaveBanco || hasTipoCuenta || hasReferencia;
  const type = isSPEI ? ("spei" as const) : ("mismo-banco" as const);

  const missingColumns: string[] = [];
  if (!hasCuentaOrigen) missingColumns.push("Cuenta Origen");
  if (!hasCuentaDestino) missingColumns.push("Cuenta Destino");
  if (!hasMonto) missingColumns.push("Monto");
  if (!hasConcepto) missingColumns.push("Concepto");

  if (isSPEI) {
    if (!hasTitular) missingColumns.push("Titular / Beneficiario");
    if (!hasClaveBanco) missingColumns.push("Clave Banco");
    if (!hasTipoCuenta) missingColumns.push("Tipo Cuenta");
    if (!hasReferencia) missingColumns.push("Referencia");
  }

  return {
    type,
    missingColumns,
    unrecognizedColumns,
    isValid: missingColumns.length === 0 && unrecognizedColumns.length === 0,
  };
}

function ImportData({ onImportData, showNotification }: ImportDataProps) {
  const [isLoading, setIsLoading] = useState(false);
  const resetRef = useRef<() => void>(null);

  const mapearDatos = (
    datos: ImportedRow[],
    tipo: "mismo-banco" | "spei",
  ): DatosTransferencia[] => {
    return datos
      .map((row) => {
        const cuentaOrigen = getColumnValue(row, COLUMN_VARIANTS.cuentaOrigen);
        const cuentaDestino = getColumnValue(
          row,
          COLUMN_VARIANTS.cuentaDestino,
        );
        const monto = parseFloat(
          getColumnValue(row, COLUMN_VARIANTS.monto) || "0",
        );
        const concepto = getColumnValue(
          row,
          COLUMN_VARIANTS.concepto,
        ).substring(0, 30);
        const clave = getColumnValue(row, COLUMN_VARIANTS.clave).toUpperCase();

        const datosBase: DatosTransferencia = {
          tipoTransferencia: tipo,
          cuentaOrigen,
          cuentaDestino,
          monto,
          concepto,
        };

        if (clave) {
          datosBase.clave = clave;
        }

        if (tipo === "mismo-banco") {
          datosBase.divisa =
            getColumnValue(row, COLUMN_VARIANTS.divisa).toUpperCase() || "MXN";
        } else {
          datosBase.titular = getColumnValue(
            row,
            COLUMN_VARIANTS.titular,
          ).substring(0, 30);
          datosBase.tipoCuenta =
            getColumnValue(row, COLUMN_VARIANTS.tipoCuenta) || "40";

          let rawBanco = getColumnValue(row, COLUMN_VARIANTS.claveBanco);
          if (/^\d{1,2}$/.test(rawBanco)) {
            rawBanco = rawBanco.padStart(3, "0");
          }
          datosBase.claveBanco = obtenerClaveBanco(rawBanco) || "044";

          datosBase.referencia =
            getColumnValue(row, COLUMN_VARIANTS.referencia) || "0000000";
          datosBase.disponibilidad = "H";
          datosBase.divisa = "MXN";
        }

        return datosBase;
      })
      .filter(
        (item) =>
          item.cuentaOrigen && item.cuentaDestino && Number(item.monto) > 0,
      );
  };

  const procesarArchivo = (file: File | null) => {
    if (!file) return;
    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      setTimeout(() => {
        try {
          const data = e.target?.result;
          let workbook: XLSX.WorkBook;

          if (file.name.toLowerCase().endsWith(".csv")) {
            workbook = XLSX.read(data, { type: "binary", codepage: 65001 });
          } else {
            workbook = XLSX.read(data, { type: "binary" });
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: ImportedRow[] = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            showNotification(
              "El archivo está vacío o no tiene datos válidos",
              "error",
            );
            return;
          }

          const headers = Object.keys(jsonData[0]);

          const detection = detectTypeAndValidate(headers);

          if (!detection.isValid) {
            const tipoLabel =
              detection.type === "spei" ? "SPEI" : "Mismo Banco";
            const errores: string[] = [];

            if (detection.unrecognizedColumns.length > 0) {
              errores.push(
                `Columnas no reconocidas: ${detection.unrecognizedColumns.join(", ")}`,
              );
            }
            if (detection.missingColumns.length > 0) {
              errores.push(
                `Columnas obligatorias faltantes: ${detection.missingColumns.join(", ")}`,
              );
            }

            showNotification(
              `No se puede importar (${tipoLabel}). ${errores.join(". ")}`,
              "error",
            );
            return;
          }

          const datosImportados = mapearDatos(jsonData, detection.type);

          if (datosImportados.length === 0) {
            showNotification(
              "No se encontraron datos válidos para importar",
              "warning",
            );
            return;
          }

          const tipoLabel = detection.type === "spei" ? "SPEI" : "Mismo Banco";
          showNotification(
            `Tipo detectado: ${tipoLabel} — ${datosImportados.length} registros encontrados`,
            "info",
          );

          onImportData(datosImportados);
        } catch (error) {
          console.error("Error al procesar archivo:", error);
          showNotification(
            "Error al procesar el archivo. Verifique el formato.",
            "error",
          );
        } finally {
          setIsLoading(false);
          resetRef.current?.();
        }
      }, 50); // Pequeño delay para permitir que el modal se renderice primero
    };

    reader.onerror = () => {
      setIsLoading(false);
      resetRef.current?.();
      showNotification("Error de lectura del archivo.", "error");
    };

    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Modal
        opened={isLoading}
        onClose={() => {}}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        size="auto">
        <Stack align="center" justify="center" p="xl" gap="md">
          <Loader size="xl" type="bars" />
          <Text fw={500} ta="center" mt="sm">
            Procesando archivo, por favor espera...
          </Text>
        </Stack>
      </Modal>

      <FileButton
        onChange={procesarArchivo}
        accept=".xlsx,.xls,.csv"
        resetRef={resetRef}>
        {(props) => (
          <Button {...props} leftSection={<IconUpload size={16} />} size="md">
            Importar Excel/CSV
          </Button>
        )}
      </FileButton>
    </>
  );
}

export default ImportData;
