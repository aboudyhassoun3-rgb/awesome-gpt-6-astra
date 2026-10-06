import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'الممالك الثلاث · سحابة الأبطال | 三分天下 · 百将风云',
  description:
    '108 أبطال بصور أصلية، بداية متوازنة لثلاث قوى. طوّر المدن وقُد الأبطال ووحّد البلاد. 108位原创头像武将，三方均衡开局。',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body>{children}</body>
    </html>
  );
}
