import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-white">
      <Header />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
