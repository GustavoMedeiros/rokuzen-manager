import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import useAuth from "../../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await login(usuario, senha);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErro("Não foi possível conectar ao servidor (backend offline ou CORS).");
      } else {
        const msg =
          err.response.data?.message ||
          err.response.data ||
          "Usuário ou senha inválidos";
        setErro(String(msg));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.left} />
      <div className={styles.right}>
        <div className={styles.card}>
          <h1 className={styles.title}>Velora</h1>
          <p className={styles.subtitle}>Sistema de Agendamento de Massagens</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label>Usuário</label>
            <input
              type="text"
              placeholder="Digite seu usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />

            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {erro && <p className={styles.error}>{erro}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}