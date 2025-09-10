import { IconArrowsMinimize } from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center space-x-2">
      <IconArrowsMinimize />{" "}
      <h1 className="text-2xl font-medium font-mono">Devfit</h1>
    </div>
  );
}
