import { Modal as MantineModal, Text, Button, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function Modal({ title, message, onConfirm, onCancel }: ModalProps) {
  return (
    <MantineModal
      opened={true}
      onClose={onCancel}
      title={
        <Group gap="xs">
          <IconAlertCircle size={20} color="var(--mantine-color-yellow-6)" />
          <Text fw={500}>{title}</Text>
        </Group>
      }
      centered>
      <Text size="sm" mb="lg">
        {message}
      </Text>
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onCancel}>
          Cancelar
        </Button>
        <Button color="red" onClick={onConfirm}>
          Confirmar
        </Button>
      </Group>
    </MantineModal>
  );
}

export default Modal;
