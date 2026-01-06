import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import MyTopics from './pages/MyTopics';
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Categories from "./pages/Categories/Categories";
import CategoryDetail from "./pages/Categories/CategoryDetail";
import TopicCreate from "./pages/Topics/TopicCreate";
import TopicDetail from "./pages/Topics/TopicDetail";
import TopicEdit from "./pages/Topics/TopicEdit";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ModerationTopics from "./pages/Admin/ModerationTopics";
import ModerationReplies from "./pages/Admin/ModerationReplies";
import TopicsList from './pages/Topics/TopicsList';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:id" element={<CategoryDetail />} />
              <Route path="/topics/:id" element={<TopicDetail />} />
              <Route path="/topics" element={<TopicsList />} />
              {/* Protected Routes */}
              <Route
                path="/topics/create"
                element={
                  <ProtectedRoute>
                    <TopicCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/topics/:id/edit"
                element={
                  <ProtectedRoute>
                    <TopicEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-topics"
                element={
                  <ProtectedRoute>
                    <MyTopics />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/topics"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ModerationTopics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/replies"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ModerationReplies />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// 404 Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-8">Trang bạn tìm kiếm không tồn tại</p>
        <a href="/" className="btn-primary">
          Về trang chủ
        </a>
      </div>
    </div>
  );
};

export default App;
