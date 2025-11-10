import React, { createContext, useContext, useReducer, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: { id: string } }
  | { type: "CLEAR_TOASTS" };

const ToastStateContext = createContext<ToastState | undefined>(undefined);
const ToastDispatchContext = createContext<
  React.Dispatch<ToastAction> | undefined
>(undefined);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload.id),
      };
    case "CLEAR_TOASTS":
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
};

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  return (
    <ToastStateContext.Provider value={state}>
      <ToastDispatchContext.Provider value={dispatch}>
        {children}
        <ToastContainer />
      </ToastDispatchContext.Provider>
    </ToastStateContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const state = useContext(ToastStateContext);
  if (!state) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex max-w-xs flex-col space-y-2">
      {state.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const dispatch = useContext(ToastDispatchContext);
  if (!dispatch) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }[toast.type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", payload: { id: toast.id } });
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, dispatch, toast.duration]);

  return (
    <div
      className={`${bgColor} flex max-w-md min-w-[300px] items-start justify-between rounded-lg px-4 py-3 text-white shadow-lg`}
    >
      <span>{toast.message}</span>
      <button
        onClick={() =>
          dispatch({ type: "REMOVE_TOAST", payload: { id: toast.id } })
        }
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const useToast = () => {
  const context = useContext(ToastDispatchContext);
  const stateContext = useContext(ToastStateContext);

  if (!context || !stateContext) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const addToast = (message: string, type: ToastType, duration?: number) => {
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

export { ToastProvider, useToast };
