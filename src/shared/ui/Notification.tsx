import { notifications } from "@mantine/notifications";
import type { NotificationType } from "~/entities/transfer";

export const openNotification = (
  message: string,
  type: NotificationType = "info",
) => {
  const colorMap = {
    success: "green",
    error: "red",
    warning: "yellow",
    info: "blue",
  };

  notifications.show({
    message: message,
    color: colorMap[type] || "blue",
    autoClose: 3000,
  });
};

export default openNotification;
