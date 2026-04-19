import apiConst from "../apiConst";

export const getAllNotification = () =>
    apiConst.get("users/notifications").then((res) => res.data);

export const putNotificationReaded = (notificationId) =>
    apiConst.put(`users/notifications/${notificationId}/read`)
        .then((res) => res.data);

export const markAllNotificationsAsRead = () =>
    apiConst.put("users/notifications/mark-all-read")
        .then((res) => res.data);

export const deleteNotification = (notificationId) =>
    apiConst.delete(`users/notifications/${notificationId}`)
        .then((res) => res.data);

export const deleteAllNotifications = () =>
    apiConst.delete("users/notifications")
        .then((res) => res.data);