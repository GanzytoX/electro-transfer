import { Modal as AntModal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function Modal({ title, message, onConfirm, onCancel }: ModalProps) {
  return (
    <AntModal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: "#faad14", marginRight: 8 }}
          />
          {title}
        </span>
      }
      open={true}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Confirmar"
      cancelText="Cancelar"
      okButtonProps={{ danger: true }}>
      <p>{message}</p>
    </AntModal>
  );
}

export default Modal;
