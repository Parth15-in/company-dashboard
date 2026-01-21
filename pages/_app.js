//_app.js
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState({ value: null });
  const router = useRouter();

  useEffect(() => {
    // Check token on page refresh
    const token = localStorage.getItem("token");

    if (token) {
      setUser({ value: token });
    } else {
      setUser({ value: null });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser({ value: null });
    router.push("/login"); // redirect after logout
  };

  return (
    <>
      <Component {...pageProps} user={user} logout={logout} />
    </>
  );
}
