import { useAuth } from "../../auth/useAuth";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Login OK ✅</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}