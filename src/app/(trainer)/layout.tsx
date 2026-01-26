// src/app/trainer/layout.tsx
import SidebarLayout from "../components/trainer/Sidebar";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
