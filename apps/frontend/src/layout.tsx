import { Outlet, Link } from 'react-router';

export function Layout() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground">
      <header className="border-b flex w-full justify-center">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold">
              <Link to="/">AsyncWorkers</Link>
            </h1>
            <nav className="flex space-x-4">
              <Link to="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
              <Link to="/jobs" className="text-sm hover:underline">
                Jobs
              </Link>
              <Link to="/settings" className="text-sm hover:underline">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground flex w-full justify-center">
        <div className="container px-4">
          AsyncWorkers&copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default Layout;
