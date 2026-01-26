import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Navigate, Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useAuthStore } from "../stores/useAuthStore";
import { ToastContainer } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const { access_token } = useAuthStore();
  return access_token ? children : <Navigate to="/signin" replace />;
};

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        toastStyle={{ zIndex: 999999 }}
      />

      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:pl-[290px]" : "lg:pl-[90px]"
        } ${isMobileOpen ? "pl-0" : "pl-0"}
        pt-16`}
      >
        <AppHeader />
        <div className="mx-auto">
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
