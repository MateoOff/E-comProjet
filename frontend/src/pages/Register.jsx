// src/pages/Register.jsx
import AuthForm from "../components/AuthForm";

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthForm type="register" />
    </div>
  );
}
