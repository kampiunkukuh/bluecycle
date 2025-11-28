import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, LogOut, User, Lock, Bell, FileText, Info, MapPin, HelpCircle, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SettingsTab = "menu" | "profile" | "account" | "password" | "notifications" | "recurring" | "contact" | "terms" | "privacy" | "about" | "location";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("menu");
  const [fullName, setFullName] = useState("Budi Santoso");
  const [email, setEmail] = useState("budi@example.com");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("1990-01-15");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const { toast } = useToast();

  const menuItems = [
    { id: "profile", label: "User Profile", icon: User },
    { id: "account", label: "Account", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "recurring", label: "Recurring Details", icon: FileText },
    { id: "contact", label: "Contact Us", icon: Phone },
    { id: "terms", label: "Terms & Conditions", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: Lock },
    { id: "about", label: "About", icon: Info },
    { id: "location", label: "Location", icon: MapPin },
    { id: "logout", label: "Logout", icon: LogOut, danger: true },
  ];

  const handleSaveProfile = () => {
    toast({ title: "Profil berhasil disimpan!", });
    setActiveTab("menu");
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Password tidak cocok!", variant: "destructive" });
      return;
    }
    toast({ title: "Password berhasil diubah!" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setActiveTab("menu");
  };

  // Main Menu View
  if (activeTab === "menu") {
    return (
      <div className="min-h-screen bg-white dark:bg-black md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-black p-4 border-b">
            <h1 className="text-xl font-bold">Pengaturan</h1>
          </div>
          
          <div className="hidden md:block mb-6">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Kelola akun dan preferensi Anda</p>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "logout") {
                    toast({ title: "Anda telah logout" });
                    // Handle logout
                  } else {
                    setActiveTab(item.id as SettingsTab);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  item.danger 
                    ? "hover:bg-red-50 dark:hover:bg-red-950" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-950"
                }`}
                data-testid={`menu-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.danger ? "text-red-600" : "text-primary"}`} />
                  <span className={`font-medium ${item.danger ? "text-red-600" : ""}`}>{item.label}</span>
                </div>
                <ChevronRight className={`w-5 h-5 ${item.danger ? "text-red-600" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Profile/Account View
  if (activeTab === "profile" || activeTab === "account") {
    return (
      <div className="min-h-screen bg-white dark:bg-black md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-black p-4 border-b flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-primary font-medium"
              data-testid="button-back-settings"
            >
              &lt;
            </button>
            <h1 className="text-lg font-bold flex-1">{activeTab === "profile" ? "Edit Profile" : "Account"}</h1>
          </div>

          <div className="hidden md:block mb-6">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-primary mb-4"
              data-testid="button-back-settings"
            >
              ← Kembali
            </button>
            <h1 className="text-3xl font-bold">{activeTab === "profile" ? "Edit Profile" : "Account"}</h1>
          </div>

          {/* Profile Card */}
          <Card className="mb-6 md:mb-0">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <Avatar className="w-16 h-16 flex-shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>BS</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{fullName}</h2>
                  <p className="text-sm text-muted-foreground">User • Batam</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    data-testid="input-full-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-profile-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      data-testid="select-gender"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      data-testid="input-dob"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  className="w-full h-12"
                  data-testid="button-save-profile"
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Password View
  if (activeTab === "password") {
    return (
      <div className="min-h-screen bg-white dark:bg-black md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-black p-4 border-b flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-primary font-medium"
              data-testid="button-back-password"
            >
              &lt;
            </button>
            <h1 className="text-lg font-bold flex-1">Password</h1>
          </div>

          <div className="hidden md:block mb-6">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-primary mb-4"
              data-testid="button-back-password"
            >
              ← Kembali
            </button>
            <h1 className="text-3xl font-bold">Change Password</h1>
          </div>

          <Card className="md:mb-0">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  data-testid="input-current-password"
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  data-testid="input-new-password"
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  data-testid="input-confirm-password"
                />
              </div>

              <Button 
                onClick={handlePasswordChange}
                className="w-full h-12"
                data-testid="button-change-password"
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Notifications View
  if (activeTab === "notifications") {
    return (
      <div className="min-h-screen bg-white dark:bg-black md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-black p-4 border-b flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-primary font-medium"
              data-testid="button-back-notifications"
            >
              &lt;
            </button>
            <h1 className="text-lg font-bold flex-1">Notifications</h1>
          </div>

          <div className="hidden md:block mb-6">
            <button 
              onClick={() => setActiveTab("menu")}
              className="text-primary mb-4"
            >
              ← Kembali
            </button>
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>

          <Card className="md:mb-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Terima notifikasi via email</p>
                </div>
                <input 
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  data-testid="checkbox-email-notifications"
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Notifikasi push di browser</p>
                </div>
                <input 
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  data-testid="checkbox-push-notifications"
                  className="w-5 h-5"
                />
              </div>

              <Button 
                onClick={() => {
                  toast({ title: "Notifikasi tersimpan!" });
                  setActiveTab("menu");
                }}
                className="w-full h-12"
                data-testid="button-save-notifications"
              >
                Save
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default info pages (Contact, Terms, Privacy, About, Location, Recurring)
  const infoPages: Record<SettingsTab, { title: string; content: string }> = {
    contact: { 
      title: "Contact Us", 
      content: "Email: support@bluecycle.com\nPhone: +62 812 3456 7890\n\nTim kami siap membantu Anda 24/7" 
    },
    terms: { 
      title: "Terms & Conditions", 
      content: "Dengan menggunakan BlueCycle, Anda menyetujui semua syarat dan ketentuan kami..." 
    },
    privacy: { 
      title: "Privacy Policy", 
      content: "Kami menjaga privasi data Anda dengan standar keamanan internasional..." 
    },
    about: { 
      title: "About BlueCycle", 
      content: "BlueCycle adalah platform manajemen sampah terpadu untuk kota berkelanjutan..." 
    },
    location: { 
      title: "Location", 
      content: "BlueCycle beroperasi di seluruh Batam dengan jaringan driver dan titik drop-off terluas..." 
    },
    recurring: { 
      title: "Recurring Details", 
      content: "Kelola jadwal pickup sampah Anda secara berkala..." 
    },
    menu: { title: "", content: "" },
    profile: { title: "", content: "" },
    account: { title: "", content: "" },
    password: { title: "", content: "" },
    notifications: { title: "", content: "" },
  };

  const page = infoPages[activeTab];

  return (
    <div className="min-h-screen bg-white dark:bg-black md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-black p-4 border-b flex items-center gap-3">
          <button 
            onClick={() => setActiveTab("menu")}
            className="text-primary font-medium"
            data-testid="button-back-info"
          >
            &lt;
          </button>
          <h1 className="text-lg font-bold flex-1">{page.title}</h1>
        </div>

        <div className="hidden md:block mb-6">
          <button 
            onClick={() => setActiveTab("menu")}
            className="text-primary mb-4"
          >
            ← Kembali
          </button>
          <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
        </div>

        <Card className="md:mb-0">
          <CardContent className="p-6">
            <p className="whitespace-pre-line text-muted-foreground">{page.content}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
