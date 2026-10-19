import type { Metadata } from "next";
import { Hello } from "@/components/Hello";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = { title: "Cài đặt" };

export default function CaiDatPage() {
  return (
    <section>
      <Hello lead="Cài đặt" highlight="của hai đứa" />
      <SettingsView />
    </section>
  );
}
