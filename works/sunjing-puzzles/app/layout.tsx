import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سُن جينغ · حكمة الشرق بين يديك | 榫境 · 指尖上的东方智慧',
  description:
    'دوّر الخشب وحُلّ الألغاز: قفل لوبان وطريق هوارونغ، لاستكشاف النجارة والاستدلال. 转动木作，解开巧思。在榫境体验孔明锁与华容道。',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
