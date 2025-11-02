import React, { useEffect } from "react";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "./stores/useAuthStore";
import SignIn from "./pages/AuthPages/Signin";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Card from "./components/ui/card.jsx";
// import Videos from "./pages/VideoPage/Videos";
// import Images from "./pages/ImagePage/Images";
// import Review from "./pages/ReviewPage/Review";
// import Workshop from "./pages/WorkShopPage/Workshop";
// import CreateWorkshop from "./pages/WorkShopPage/CreateWorkShop";
// import Book from "./pages/BookPage/Book";
// import AllBooks from "./pages/BookPage/AllBooks";
// import FAQ from "./pages/FAQPage/FAQ";
// import AllFAQs from "./pages/FAQPage/AllFAQs";
// import FAQDetails from "./pages/FAQPage/FAQDetails";
// import ProgramLevel from "./pages/ProgramLevelPage/ProgramLevel";
// import Slider from "./pages/SliderPage/Slider";
// import LoveLagacy from "./pages/LoveLegacy/LoveLagacy";
// import SessionPlan from "./pages/SessionPlanPage/SessionPlan";
// import AllSessionsPlan from "./pages/SessionPlanPage/AllSessionsPlan";
// import SessionPlanDetails from "./pages/SessionPlanPage/SessionPlanDetails";
// import AllSliders from "./pages/SliderPage/AllSliders";
// import Session from "./pages/SessionPage/Session";
// import BlogCards from "./pages/BlogPage/BlogDetails";
// import ReviewList from "./pages/ReviewPage/ReviewList";
// import ImagesDetails from "./pages/ImagePage/ImagesDetails";
// import ImageTable from "./pages/ImagePage/ImageTable";
// import VideoTablePage from "./pages/VideoPage/VideoTable";
// import Blog from "./pages/BlogPage/Blog";
// import Editor from "./pages/Editor";
// import Topic from "./pages/TopicPage/topic";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import Profile from "./pages/Profile";
import Workshop from "./pages/Workshop";
import Services from "./pages/Services";
import Blogs from "./pages/Blogs";
import Subscribers from "./pages/Subscribers";
import Form from "./pages/Form";
import SettingsIndex from "./pages/Settings";


// GuestOnlyRoute: only guests (not logged-in)
const GuestOnlyRoute = ({ children }) => {
  const { access_token } = useAuthStore();
  return !access_token ? children : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "/who-am-i", element: <Profile /> },
          { path: "/who-am-i/form", element: <Profile /> },
          { path: "/workshop", element: <Workshop /> },
          { path: "/workshop/form", element: <Workshop /> },
          { path: "/services", element: <Services /> },
          { path: "/services/form", element: <Services /> },
          { path: "/blogs", element: <Blogs /> },
          { path: "/blogs/form", element: <Blogs /> },
          { path: "/subscribers", element: <Subscribers /> },
          { path: "/subscribers/form", element: <Subscribers /> },
          { path: "/settings", element: <SettingsIndex /> },
          { path: "/settings/form", element: <SettingsIndex /> },
          { path: "/form", element: <Form /> },
          { path: "/card", element: <Card /> },
        ],
  },
  {
    path: "signin",
    element: (
      <GuestOnlyRoute>
        <SignIn />
      </GuestOnlyRoute>
    ),
  },
  {
    path: "signup",
    element: (
      <GuestOnlyRoute>
        <SignUp />
      </GuestOnlyRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  const { checkSession, loadUserFromStorage, isInitialized } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
    checkSession();
    const interval = setInterval(() => {
      checkSession();
    },24* 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSession, loadUserFromStorage]);

  if (!isInitialized) {
    return <div>Loading...</div>; 
  }
  return <RouterProvider router={router} />;
}
