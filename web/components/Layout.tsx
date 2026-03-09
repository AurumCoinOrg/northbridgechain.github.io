import type { ReactNode } from "react";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={pageStyle}>
      <Header />
      <main style={mainStyle}>{children}</main>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 10% 20%, rgba(47,67,164,0.35) 0%, rgba(5,11,30,0) 30%), radial-gradient(circle at 90% 30%, rgba(15,89,77,0.28) 0%, rgba(5,11,30,0) 28%), linear-gradient(180deg, #050b1e 0%, #07112a 100%)",
  color: "white"
};

const mainStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "0 20px 56px"
};
