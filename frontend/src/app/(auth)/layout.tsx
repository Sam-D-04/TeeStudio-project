export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* Có thể thêm header/footer riêng cho Auth ở đây nếu cần */}
      {children}
    </div>
  );
}
