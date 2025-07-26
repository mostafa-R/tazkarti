import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

function MainComponent() {
  return (
    <>
      <Navbar />
      <div>
        <Outlet />
      </div>
    </>
  );
}

export default MainComponent;
