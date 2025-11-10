import { useContext } from "react";
import { ToastDispatchContext, ToastStateContext } from "./ToastContext";

const useToast = () => {
  const context = useContext(ToastDispatchContext);
  const stateContext = useContext(ToastStateContext);

  if (!context || !stateContext) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const addToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
    duration?: number,
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    context({ type: "ADD_TOAST", payload: { id, message, type, duration } });
  };

  const removeToast = (id: string) => {
    context({ type: "REMOVE_TOAST", payload: { id } });
  };

  const clearToasts = () => {
    context({ type: "CLEAR_TOASTS" });
  };

  return {
    toasts: stateContext.toasts,
    addToast,
    removeToast,
    clearToasts,
  };
};

export { useToast };
