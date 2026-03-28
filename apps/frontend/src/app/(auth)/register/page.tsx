"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "CUSTOMER",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kayıt başarısız");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Kayıt Ol</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder="İsim" value={form.firstName} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="lastName" placeholder="Soyisim" value={form.lastName} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="email" type="email" placeholder="E-posta" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="password" type="password" placeholder="Şifre (min 8 karakter)" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" required minLength={8} />
        <select name="role" value={form.role} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="CUSTOMER">Müşteri</option>
          <option value="DESIGNER">Tasarımcı</option>
          <option value="BRAND">Marka</option>
        </select>
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Kayıt Ol</button>
      </form>
    </div>
  );
}
