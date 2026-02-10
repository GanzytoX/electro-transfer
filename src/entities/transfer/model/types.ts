export interface DatosTransferencia {
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number | string;
  concepto: string;
  divisa?: string;
  clave?: string;
  tipoTransferencia?: "mismo-banco" | "spei";
  titular?: string;
  tipoCuenta?: string;
  claveBanco?: string;
  referencia?: string;
  disponibilidad?: string;
}

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationState {
  message: string;
  type: NotificationType;
}

export interface ModalState {
  title: string;
  message: string;
  onConfirm: () => void;
}
