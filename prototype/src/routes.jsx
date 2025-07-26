import { createBrowserRouter } from "react-router-dom";
import EventDetails from "./Components/EventDetails/EventDetails";
import Home from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import MainComponent from "./Components/MainComponent/MainComponent";

const router = createBrowserRouter([
  {
    path: "",
    element: <MainComponent />,
    children: [
      {
        path: "/",
        element: <Home />,
      },

      {
        path: "/events/:id",
        element: <EventDetails />,
      },

      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

export default router;
