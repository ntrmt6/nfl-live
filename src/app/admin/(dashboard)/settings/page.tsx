import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { SettingsForm } from "./SettingsForm";

async function getSettings() {
  try {
    await connectDB();
    let settings = await Settings.findOne().lean() as { adsenseClientId?: string } | null;
    if (!settings) settings = { adsenseClientId: "" };
    return settings;
  } catch {
    return { adsenseClientId: "" };
  }
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Site Settings</h1>
      <SettingsForm adsenseClientId={settings.adsenseClientId ?? ""} />
    </div>
  );
}
