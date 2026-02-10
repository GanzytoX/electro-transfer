import { useState } from "react";
import { Button, Modal, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import * as XLSX from "xlsx";
import type {
  NotificationType,
  DatosTransferencia,
} from "~/entities/transfer/model/types";
import { obtenerClaveBanco } from "~/shared/lib/bancos";

const { Option } = Select;

interface ImportDataProps {
  onImportData: (data: DatosTransferencia[]) => void;
  showNotification: (message: string, type: NotificationType) => void;
}

interface ImportedRow {
  [key: string]: any;
}

function ImportData({ onImportData, showNotification }: ImportDataProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<
    "mismo-banco" | "spei"
  >("mismo-banco");
  const [archivoData, setArchivoData] = useState<ImportedRow[]>([]);

  const procesarArchivo = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;

        // Detectar si es CSV o Excel
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

        setArchivoData(jsonData);
        setModalVisible(true);
      } catch (error) {
        console.error("Error al procesar archivo:", error);
        showNotification(
          "Error al procesar el archivo. Verifique el formato.",
          "error",
        );
      }
    };

    reader.readAsBinaryString(file);
    return false; // Prevenir upload automático
  };

  const mapearDatos = (
    datos: ImportedRow[],
    tipo: "mismo-banco" | "spei",
  ): DatosTransferencia[] => {
    return datos
      .map((row) => {
        // Mapear campos comunes (usando diferentes posibles nombres de columnas)
        const cuentaOrigen = String(
          row["Cuenta Origen"] ||
            row["cuenta_origen"] ||
            row["CuentaOrigen"] ||
            row["origen"] ||
            "",
        ).trim();
        const cuentaDestino = String(
          row["Cuenta Destino"] ||
            row["cuenta_destino"] ||
            row["CuentaDestino"] ||
            row["destino"] ||
            "",
        ).trim();
        const monto = parseFloat(
          String(
            row["Monto"] ||
              row["monto"] ||
              row["Importe"] ||
              row["importe"] ||
              "0",
          ),
        );
        const concepto = String(
          row["Concepto"] ||
            row["concepto"] ||
            row["Descripcion"] ||
            row["descripcion"] ||
            "",
        ).trim();
        const clave = String(
          row["Clave"] ||
            row["clave"] ||
            row["Clave Transferencia"] ||
            row["clave_transferencia"] ||
            "",
        )
          .trim()
          .toUpperCase();

        const datosBase: DatosTransferencia = {
          tipoTransferencia: tipo,
          cuentaOrigen,
          cuentaDestino,
          monto,
          concepto: concepto.substring(0, 30), // Límite de 30 caracteres
        };

        if (clave) {
          datosBase.clave = clave;
        }

        if (tipo === "mismo-banco") {
          datosBase.divisa = String(
            row["Divisa"] || row["divisa"] || "MXN",
          ).toUpperCase();
        } else {
          // Campos específicos para SPEI
          datosBase.titular = String(
            row["Titular"] ||
              row["titular"] ||
              row["Beneficiario"] ||
              row["beneficiario"] ||
              "",
          )
            .trim()
            .substring(0, 30);
          datosBase.tipoCuenta = String(
            row["Tipo Cuenta"] ||
              row["tipo_cuenta"] ||
              row["TipoCuenta"] ||
              "40",
          );

          // Lógica mejorada para detectar banco por Clave o por Nombre
          let rawBanco = String(
            row["Clave Banco"] ||
              row["clave_banco"] ||
              row["ClaveBanco"] ||
              row["Nombre Banco"] ||
              row["nombre_banco"] ||
              row["NombreBanco"] ||
              row["banco"] ||
              "",
          ).trim();

          // Asegurar formato de 3 dígitos con ceros iniciales si es numérico
          if (/^\d{1,2}$/.test(rawBanco)) {
            rawBanco = rawBanco.padStart(3, "0");
          }

          // Intenta obtener la clave a partir del número o nombre
          datosBase.claveBanco = obtenerClaveBanco(rawBanco) || "044";

          datosBase.referencia = String(
            row["Referencia"] || row["referencia"] || "0000000",
          );
          datosBase.disponibilidad = "H";
          datosBase.divisa = "MXN";
        }

        return datosBase;
      })
      .filter(
        (item) =>
          item.cuentaOrigen && item.cuentaDestino && Number(item.monto) > 0,
      ); // Filtrar registros válidos
  };

  const handleImport = () => {
    try {
      const datosImportados = mapearDatos(archivoData, tipoSeleccionado);

      if (datosImportados.length === 0) {
        showNotification(
          "No se encontraron datos válidos para importar",
          "warning",
        );
        return;
      }

      onImportData(datosImportados);
      // La notificación de éxito se maneja en el componente padre (App.tsx)
      setModalVisible(false);
      setArchivoData([]);
    } catch (error) {
      console.error("Error al importar datos:", error);
      showNotification("Error al importar los datos", "error");
    }
  };

  const cancelarImport = () => {
    setModalVisible(false);
    setArchivoData([]);
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xlsx,.xls,.csv",
    beforeUpload: procesarArchivo,
    showUploadList: false,
  };

  return (
    <>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} size="large">
          Importar Excel/CSV
        </Button>
      </Upload>

      <Modal
        title="Tipo de Transferencia"
        open={modalVisible}
        onOk={handleImport}
        onCancel={cancelarImport}
        okText="Importar"
        cancelText="Cancelar"
        width={500}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ marginBottom: "16px", color: "#666" }}>
            Se encontraron <strong>{archivoData.length}</strong> registros en el
            archivo.
          </p>
          <p style={{ marginBottom: "16px" }}>
            Selecciona el tipo de transferencia para importar correctamente los
            datos:
          </p>

          <Select
            value={tipoSeleccionado}
            onChange={(value) => setTipoSeleccionado(value)}
            style={{ width: "100%" }}
            size="large">
            <Option value="mismo-banco">Mismo Banco</Option>
            <Option value="spei">SPEI</Option>
          </Select>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: "12px",
            borderRadius: "6px",
          }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
            <strong>Columnas reconocidas:</strong> Cuenta Origen, Cuenta
            Destino, Monto, Concepto
            {tipoSeleccionado === "spei" &&
              ", Titular, Tipo Cuenta, Clave Banco, Referencia"}
          </p>
        </div>
      </Modal>
    </>
  );
}

export default ImportData;
