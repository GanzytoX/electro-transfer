import { notification } from "antd";
import type { NotificationType } from "~/entities/transfer/model/types";

export const openNotification = (
  message: string,
  type: NotificationType = "info",
) => {
  const notificationMap = {
    success: notification.success,
    error: notification.error,
    warning: notification.warning,
    info: notification.info,
  };

  const showNotification = notificationMap[type] || notification.info;

  showNotification({
    message: message,
    placement: "topRight",
    duration: 3,
  });
};

export default openNotification;
