export default function WebLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return <main>{children}</main>;
}
