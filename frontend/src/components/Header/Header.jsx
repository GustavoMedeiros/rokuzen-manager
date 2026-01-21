import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";
import useAuth from "../../auth/useAuth";

// ✅ Seus SVGs como componentes (Vite + vite-plugin-svgr)
import GridIcon from "../../assets/icons/dashboard.svg?react";
import CalendarIcon from "../../assets/icons/calendar.svg?react";
import UsersIcon from "../../assets/icons/user.svg?react";
import UserIcon from "../../assets/icons/massage.svg?react";
import BoxIcon from "../../assets/icons/box.svg?react";
import ClockIcon from "../../assets/icons/time.svg?react";
import ChartIcon from "../../assets/icons/bar-chart.svg?react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "grid" },
  { to: "/agendamentos", label: "Agendamentos", icon: "calendar" },
  { to: "/clientes", label: "Clientes", icon: "users" },
  { to: "/massagistas", label: "Massagistas", icon: "user" },
  { to: "/equipamentos", label: "Equipamentos", icon: "box" },
  { to: "/historico", label: "Histórico", icon: "clock" },
  { to: "/relatorios", label: "Relatórios", icon: "chart" },
];

const ICONS = {
  grid: GridIcon,
  calendar: CalendarIcon,
  users: UsersIcon,
  user: UserIcon,
  box: BoxIcon,
  clock: ClockIcon,
  chart: ChartIcon,
};

function Icon({ name }) {
  const Svg = ICONS[name];
  if (!Svg) return null;
  return <Svg className={styles.icon} aria-hidden="true" focusable="false" />;
}

export default function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const displayName = user?.nome || user?.usuario || "Administrador";
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.logo} onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
              Velora
            </div>

            {/* Desktop nav */}
            <nav className={styles.nav} aria-label="Navegação principal">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                  }
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className={styles.right}>
            <span className={styles.user}>{displayName}</span>

            <button className={styles.logout} onClick={handleLogout} type="button">
              <span className={styles.logoutIcon}>⟶</span>
              <span>Sair</span>
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              className={styles.hamburger}
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay + drawer */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.show : ""}`}
        onClick={closeMobile}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={`${styles.drawer} ${mobileOpen ? styles.open : ""}`}
        role="dialog"
        aria-label="Menu"
        aria-modal="true"
      >
        <div className={styles.drawerTop}>
          <div className={styles.drawerLogo}>Velora</div>

          <button
            type="button"
            className={styles.drawerClose}
            onClick={closeMobile}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        <div className={styles.drawerUser}>{displayName}</div>

        <nav className={styles.drawerNav} aria-label="Navegação mobile">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                isActive ? `${styles.drawerLink} ${styles.drawerActive}` : styles.drawerLink
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className={styles.drawerLogout} onClick={handleLogout}>
          <span className={styles.logoutIcon}>⟶</span>
          <span>Sair</span>
        </button>
      </aside>
    </>
  );
}