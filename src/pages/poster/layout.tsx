import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import 'markdown-to-poster/dist/style.css'
import '@/styles/card-poster.css'


export default function PosterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
       {children}
      </body>
    </html>
  );
}