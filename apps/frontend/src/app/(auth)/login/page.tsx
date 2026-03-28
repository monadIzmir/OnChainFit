"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// Basit localStorage ile token saklama örneği

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);

  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Giriş başarısız");
      // Token ve kullanıcıyı localStorage'a kaydet
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center">
          {isRegister ? "Kaydol" : "Giriş Yap"}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifre</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded" />
          </div>
          {isRegister && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Şifre Tekrar</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            {isRegister ? "Kaydol" : "Giriş Yap"}
          </button>
        </form>
        <div className="text-center">
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setIsRegister((v) => !v)}
          >
            {isRegister ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kaydol"}
          </button>
        </div>
      </div>
    </div>
  );
}
