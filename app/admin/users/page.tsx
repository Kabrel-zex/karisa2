"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Ban } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
  vendor?: {
    id: string;
    businessName: string;
    isVerified: boolean;
    isActive: boolean;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      if (roleFilter) url.searchParams.set("role", roleFilter);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir suspendre cet utilisateur ?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Suspension administrative",
          duration: 30, // jours
        }),
      });

      if (!response.ok) throw new Error("Failed to suspend user");

      toast.success("Utilisateur suspendu");
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de la suspension");
    }
  };

  const filteredUsers = users.filter((user) =>
    searchTerm
      ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (loading) {
    return <div className="container mx-auto px-4 py-16">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">Tous les rôles</option>
            <option value="buyer">Acheteur</option>
            <option value="seller">Vendeur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {user.name || user.email}
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                    {user.isVerified && (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  {user.vendor && (
                    <div className="mt-2">
                      <p className="text-sm">
                        Boutique: {user.vendor.businessName}
                        {!user.vendor.isActive && (
                          <Badge variant="destructive" className="ml-2">Suspendu</Badge>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleSuspend(user.id)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspendre
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

