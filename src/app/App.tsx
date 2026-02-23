import { useState, useEffect } from "react";
import { Layout, ConfigProvider, theme } from "antd";
import { TitleBar } from "~/widgets/titlebar";
import { Footer } from "~/widgets/footer";
import { TransferForm } from "~/features/add-transfer";
import { TransferList } from "~/features/manage-transfers";
import { openNotification, Modal } from "~/shared/ui";
import {
  TransferenciaGenerator,
  type DatosTransferencia,
  type ModalState,
  type NotificationType,
} from "~/entities/transfer";

const { Content } = Layout;
function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const [transferencias, setTransferencias] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [tipoLote, setTipoLote] = useState<"mismo-banco" | "spei" | null>(null);

  const showNotification = (
    message: string,
    type: NotificationType = "info",
  ) => {
    openNotification(message, type);
  };

  const showModal = (title: string, message: string, onConfirm: () => void) => {
    setModal({ title, message, onConfirm });
  };

  const closeModal = () => {
    setModal(null);
  };

  const agregarTransferencia = (datos: DatosTransferencia): boolean => {
    if (transferencias.length >= 5000) {
      showNotification("Máximo 5000 transferencias por archivo", "warning");
      return false;
    }

    if (transferencias.length === 0) {
      setTipoLote(datos.tipoTransferencia);
    } else if (tipoLote && tipoLote !== datos.tipoTransferencia) {
      showNotification(
        "No se pueden mezclar tipos de transferencia en el mismo archivo",
        "error",
      );
      return false;
    }

    let linea: string;
    if (datos.tipoTransferencia === "spei") {
      linea = TransferenciaGenerator.generarSPEI(datos);
    } else {
      linea = TransferenciaGenerator.generarMismoBanco(datos);
    }

    setTransferencias([...transferencias, linea]);
    showNotification("Transferencia agregada", "success");
    return true;
  };

  const limpiarTransferencias = () => {
    showModal(
      "¿Estás seguro?",
      "¿Deseas eliminar todas las transferencias?",
      () => {
        setTransferencias([]);
        setTipoLote(null);
        showNotification("Transferencias eliminadas", "warning");
        closeModal();
      },
    );
  };

  const importarDatos = (datos: DatosTransferencia[]) => {
    if (datos.length > 0) {
      const primerDato = datos[0];
      if (tipoLote && primerDato.tipoTransferencia !== tipoLote) {
        showNotification(
          `El archivo contiene transferencias tipo ${primerDato.tipoTransferencia.toUpperCase()} pero el lote actual es ${tipoLote.toUpperCase()}.`,
          "error",
        );
        return;
      }
    }

    let transferenciasGeneradas: string[] = [];
    let errores = 0;

    datos.forEach((item) => {
      try {
        let linea: string;
        if (item.tipoTransferencia === "spei") {
          linea = TransferenciaGenerator.generarSPEI(item);
        } else {
          linea = TransferenciaGenerator.generarMismoBanco(item);
        }
        transferenciasGeneradas.push(linea);
      } catch (error) {
        console.error("Error al generar transferencia:", error);
        errores++;
      }
    });

    if (transferencias.length + transferenciasGeneradas.length > 5000) {
      const disponibles = 5000 - transferencias.length;
      showNotification(
        `Solo se pueden agregar ${disponibles} transferencias más (máximo: 5000)`,
        "warning",
      );
      transferenciasGeneradas = transferenciasGeneradas.slice(0, disponibles);
    }

    if (transferenciasGeneradas.length > 0) {
      if (transferencias.length === 0 && datos.length > 0) {
        setTipoLote(datos[0].tipoTransferencia);
      }
      setTransferencias([...transferencias, ...transferenciasGeneradas]);
      const mensaje =
        errores > 0
          ? `${transferenciasGeneradas.length} transferencias importadas, ${errores} errores`
          : `${transferenciasGeneradas.length} transferencias importadas exitosamente`;
      showNotification(mensaje, errores > 0 ? "warning" : "success");
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
      <AppContent
        transferencias={transferencias}
        agregarTransferencia={agregarTransferencia}
        limpiarTransferencias={limpiarTransferencias}
        importarDatos={importarDatos}
        showNotification={showNotification}
        modal={modal}
        closeModal={closeModal}
        tipoLote={tipoLote}
      />
    </ConfigProvider>
  );
}

interface AppContentProps {
  transferencias: string[];
  agregarTransferencia: (datos: DatosTransferencia) => boolean;
  limpiarTransferencias: () => void;
  importarDatos: (datos: DatosTransferencia[]) => void;
  showNotification: (message: string, type: NotificationType) => void;
  modal: ModalState | null;
  closeModal: () => void;
  tipoLote: "mismo-banco" | "spei" | null;
}

function AppContent({
  transferencias,
  agregarTransferencia,
  limpiarTransferencias,
  importarDatos,
  showNotification,
  modal,
  closeModal,
  tipoLote,
}: AppContentProps) {
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh", background: token.colorBgContainer }}>
      <TitleBar />
      <Content style={{ padding: "16px", background: token.colorBgLayout }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <TransferForm
              onAgregar={agregarTransferencia}
              showNotification={showNotification}
              currentType={tipoLote}
            />
          </div>
          <TransferList
            transferencias={transferencias}
            onLimpiar={limpiarTransferencias}
            showNotification={showNotification}
            onImportData={importarDatos}
          />
        </div>
      </Content>
      <Footer />
      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
        />
      )}
    </Layout>
  );
}

export default App;
