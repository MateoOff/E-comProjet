// src/pages/Login.jsx
import AuthForm from "../components/AuthForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthForm type="login" />
    </div>
  );
}
