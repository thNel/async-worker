import { Outlet } from 'react-router';

export function Layout() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground">
      <header className="border-b flex w-full justify-center">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">AsyncWorkers Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Добро пожаловать!
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground flex w-full justify-center">
        <div className="container px-4">
          AsyncWorkers Dashboard &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default Layout;
