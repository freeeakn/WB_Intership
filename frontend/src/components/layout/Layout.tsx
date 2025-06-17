import { Link } from "@tanstack/react-router";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <Link to="/" className="text-2xl font-bold italic cursor-pointer">
            Города России
          </Link>
        </div>
        <div className="navbar-end">
          <Link to="/" className="btn btn-ghost">
            Главная
          </Link>
          <Link to="/cities" className="btn btn-ghost">
            Города
          </Link> 
          <Link to="/cities/add" className="btn btn-ghost">
            Добавить город
          </Link>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p>© 2025 Города России. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
