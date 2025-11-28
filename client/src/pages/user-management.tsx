import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit2, Lock, User, Mail, Phone, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DBUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user" | "driver";
  phone?: string;
  bankName?: string;
  bankAccount?: string;
  password?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DBUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "" });
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "", role: "user" as const });

  // Fetch users dari database
  const refetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error("Gagal fetch users:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        }
      } catch (error) {
        console.error("Gagal fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users berdasarkan search
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleSelectUser = (user: DBUser) => {
    setSelectedUser(user);
    setEditData({ name: user.name, email: user.email, phone: user.phone || "" });
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
        setSelectedUser(updated);
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error("Gagal update user:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedUser || passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });
      if (res.ok) {
        alert("Password berhasil diubah!");
        setShowPasswordDialog(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Gagal ubah password:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedUser(null);
        setShowDeleteDialog(false);
        alert("Pengguna berhasil dihapus!");
        // Refresh data dari server setelah delete
        await refetchUsers();
      } else {
        alert("Gagal menghapus pengguna!");
      }
    } catch (error) {
      console.error("Gagal menghapus pengguna:", error);
      alert("Terjadi kesalahan saat menghapus pengguna!");
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      alert("Semua field harus diisi!");
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      if (res.ok) {
        alert("Pengguna berhasil ditambahkan!");
        setShowAddDialog(false);
        setNewUserData({ name: "", email: "", password: "", role: "user" });
        await refetchUsers();
      } else {
        alert("Gagal menambahkan pengguna!");
      }
    } catch (error) {
      console.error("Gagal menambahkan pengguna:", error);
      alert("Terjadi kesalahan saat menambahkan pengguna!");
    }
  };

  const getRoleColor = (role: string) => {
    if (role === "admin") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (role === "driver") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navbar dengan user yang dipilih */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-900 dark:to-green-950 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">
                {selectedUser ? `Kelola: ${selectedUser.name}` : "Kelola Pengguna & Driver"}
              </h2>
              {selectedUser && (
                <p className="text-sm text-green-100">
                  {selectedUser.role === "admin" && "Admin"}
                  {selectedUser.role === "driver" && "Driver - Earnings: 80%"}
                  {selectedUser.role === "user" && "User - Reward: Reward Points"}
                </p>
              )}
            </div>
          </div>
          {selectedUser && (
            <Button 
              variant="outline" 
              className="bg-white text-green-700 hover:bg-gray-100"
              onClick={() => setSelectedUser(null)}
              data-testid="button-back-users"
            >
              ← Kembali ke Daftar
            </Button>
          )}
        </div>
      </div>

      {!selectedUser ? (
        // Daftar Users
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna & Driver</h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola data pengguna, driver, dan akun mereka</p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
              data-testid="button-add-user"
            >
              <Plus className="h-4 w-4" /> Tambah Pengguna
            </Button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="hover-elevate cursor-pointer"
                onClick={() => handleSelectUser(user)}
                data-testid={`card-user-${user.id}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role === "admin" && "Admin"}
                      {user.role === "driver" && "Driver"}
                      {user.role === "user" && "User"}
                    </Badge>
                  </div>
                  {user.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Phone className="h-3 w-3" /> {user.phone}
                    </p>
                  )}
                  {user.role === "driver" && user.bankName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Bank: {user.bankName} - {user.bankAccount}
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    className="mt-4 w-full" 
                    variant="default"
                    data-testid={`button-manage-user-${user.id}`}
                  >
                    Kelola Akun
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // Detail & Edit User
        <div className="space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Data Diri</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Informasi Pengguna</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowEditDialog(true)}
                    data-testid="button-edit-user-info"
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Nama</Label>
                    <p className="text-lg font-semibold">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Email</Label>
                    <p className="text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Nomor Telepon</Label>
                    <p className="text-lg">{selectedUser.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Role / Status</Label>
                    <Badge className={`mt-2 ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role === "admin" && "Administrator"}
                      {selectedUser.role === "driver" && "Driver (80% Earnings)"}
                      {selectedUser.role === "user" && "User (Reward Points)"}
                    </Badge>
                  </div>
                  {selectedUser.role === "driver" && (
                    <>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Bank</Label>
                        <p className="text-lg">{selectedUser.bankName || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400">Nomor Rekening</Label>
                        <p className="text-lg">{selectedUser.bankAccount || "-"}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" /> Keamanan Akun
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Ubah password pengguna untuk menjaga keamanan akun mereka.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowPasswordDialog(true)}
                    className="w-full"
                    data-testid="button-change-password"
                  >
                    <Lock className="h-4 w-4 mr-2" /> Ubah Password
                  </Button>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Hapus akun pengguna secara permanen dari sistem.
                    </p>
                    <Button 
                      onClick={() => setShowDeleteDialog(true)}
                      variant="destructive"
                      className="w-full"
                      data-testid="button-delete-user"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Hapus Akun Pengguna
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Diri</DialogTitle>
            <DialogDescription>Perbarui informasi pengguna</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Nama lengkap"
                data-testid="input-edit-name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                placeholder="user@example.com"
                data-testid="input-edit-email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                placeholder="08xx xxxx xxxx"
                data-testid="input-edit-phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Batal</Button>
            <Button onClick={handleEditSave} data-testid="button-save-edit">Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>Masukkan password baru untuk {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Masukkan password baru"
                data-testid="input-new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Konfirmasi password"
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Batal</Button>
            <Button onClick={handlePasswordChange} data-testid="button-save-password">Ubah Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Akun Pengguna</DialogTitle>
            <DialogDescription>Anda yakin ingin menghapus akun {selectedUser?.name}? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-100">
              ⚠️ Akun akan dihapus secara permanen dan semua data yang terkait akan hilang.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteUser} data-testid="button-confirm-delete">Hapus Akun</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>Buat akun pengguna, driver, atau admin baru</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newName">Nama Lengkap</Label>
              <Input
                id="newName"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="Nama lengkap"
                data-testid="input-new-user-name"
              />
            </div>
            <div>
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="user@example.com"
                data-testid="input-new-user-email"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="Masukkan password"
                data-testid="input-new-user-password"
              />
            </div>
            <div>
              <Label htmlFor="newRole">Role / Status</Label>
              <Select value={newUserData.role} onValueChange={(value: any) => setNewUserData({ ...newUserData, role: value })}>
                <SelectTrigger id="newRole" data-testid="select-new-user-role">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User (Reward Points)</SelectItem>
                  <SelectItem value="driver">Driver (80% Earnings)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
            <Button onClick={handleAddUser} data-testid="button-save-new-user">Tambah Pengguna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
