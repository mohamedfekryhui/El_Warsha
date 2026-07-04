import { Tajawal } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper"; // <-- استدعاء ملف الحماية
import logoImg from "@/Logo.png";
import { AuthProvider } from "@/AuthContext";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "900"],
});

export const metadata = {
  title: "الورشة | نظام الإدارة",
  description: "نظام إدارة الورشة الاحترافي",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href={logoImg.src} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${tajawal.className} antialiased`}>
        {/* لف الموقع كله هنا بالـ AuthProvider وحماية الصفحات */}
        <AuthProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
