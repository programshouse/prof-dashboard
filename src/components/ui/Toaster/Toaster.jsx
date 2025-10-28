// src/components/ui/Toaster/Toaster.jsx
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ========= Styles ========= */
const greenSuccessStyle = { background: "#16a34a", color: "#fff" };
const redErrorStyle = { background: "#ef4444", color: "#fff" };

/* ========= Low-level helpers ========= */
export const toastSuccess = (msg) =>
  toast.success(msg, { icon: "✅", style: greenSuccessStyle });

export const toastError = (msg) =>
  toast.error(msg, { icon: "⚠️", style: redErrorStyle });

/* ========= Action helpers (Save / Update / Delete / Approve / Reject) ========= */
// success
export const notifySaveSuccess = (msg = "Saved successfully") =>
  toastSuccess(msg);
export const notifyUpdateSuccess = (msg = "Updated successfully") =>
  toastSuccess(msg);
export const notifyDeleteSuccess = (msg = "Deleted successfully") =>
  toastSuccess(msg);
export const notifyApproveSuccess = (msg = "Approved successfully") =>
  toastSuccess(msg);
export const notifyRejectSuccess = (msg = "Rejected successfully") =>
  toastSuccess(msg);

// error
export const notifySaveError = (msg = "Failed to save") => toastError(msg);
export const notifyUpdateError = (msg = "Failed to update") => toastError(msg);
export const notifyDeleteError = (msg = "Failed to delete") => toastError(msg);
export const notifyApproveError = (msg = "Failed to approve") =>
  toastError(msg);
export const notifyRejectError = (msg = "Failed to reject") =>
  toastError(msg);

/* ========= Unified API =========
   استعمال: notify.action('approve').success();
   أو      notify.action('reject').error("Custom error")
*/
const actionMap = {
  save: { success: notifySaveSuccess, error: notifySaveError },
  update: { success: notifyUpdateSuccess, error: notifyUpdateError },
  delete: { success: notifyDeleteSuccess, error: notifyDeleteError },
  approve: { success: notifyApproveSuccess, error: notifyApproveError },
  reject: { success: notifyRejectSuccess, error: notifyRejectError },
};

export const notify = {
  action: (type = "save") => {
    const group = actionMap[type] || actionMap.save;
    return {
      success: (msg) => group.success(msg),
      error: (msg) => group.error(msg),
    };
  },
  success: (msg) => toastSuccess(msg),
  error: (msg) => toastError(msg),
};

/* ========= Toast container component ========= */
export default function Toaster({
  position = "bottom-right",
  autoClose = 2500,
  hideProgressBar = false,
  newestOnTop = true,
  theme = "colored",
  zIndex = 9999,
}) {
  return (
    <ToastContainer
      position={position}
      autoClose={autoClose}
      hideProgressBar={hideProgressBar}
      newestOnTop={newestOnTop}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      containerStyle={{ zIndex }}
    />
  );
}
