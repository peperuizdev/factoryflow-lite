import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "../layout/Layout"
import Home from "../pages/Home"
import Login from "../pages/Login"
import WorkOrders from "../pages/WorkOrders"
import WorkOrderDetail from "../pages/WorkOrderDetail"
import RequireAuth from "../context/RequireAuth"

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route element={<RequireAuth />}>
            <Route path="workorders" element={<WorkOrders />} />
            <Route path="workorders/:id" element={<WorkOrderDetail />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}
