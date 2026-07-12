import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account settings</h1>
      <UserProfile routing="hash" />
    </div>
  );
}
