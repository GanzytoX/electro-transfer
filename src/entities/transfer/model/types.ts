export interface DatosTransferencia {
  tipoTransferencia: "mismo-banco" | "spei";
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number | string;
  concepto: string;
  divisa?: string;
  clave?: string;
  titular?: string;
  tipoCuenta?: string;
  claveBanco?: string;
  referencia?: string;
  disponibilidad?: string;
}

export type NotificationType = "success" | "error" | "warning" | "info";

export interface ModalState {
  title: string;
  message: string;
  onConfirm: () => void;
}
