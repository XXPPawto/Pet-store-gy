"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Plus, Edit, Trash2, Save, X } from "lucide-react"

interface Pet {
  id: number
  name: string
  price: string
  description: string
  stock: number
  status: "ready" | "sold"
  category: "pet" | "package" | "equipment"
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [pets, setPets] = useState<Pet[]>([])
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPet, setNewPet] = useState<Omit<Pet, "id">>({
    name: "",
    price: "",
    description: "",
    stock: 0,
    status: "ready",
    category: "pet",
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchPets()
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple admin credentials
    if (loginForm.username === "admin" && loginForm.password === "elitepets2025") {
      setIsAuthenticated(true)
    } else {
      alert("Username atau password salah!")
    }
  }

  const fetchPets = async () => {
    try {
      const response = await fetch("/api/pets")
      const data = await response.json()
      setPets(data)
    } catch (error) {
      console.error("Error fetching pets:", error)
    }
  }

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPet),
      })

      if (response.ok) {
        setNewPet({
          name: "",
          price: "",
          description: "",
          stock: 0,
          status: "ready",
          category: "pet",
        })
        setShowAddForm(false)
        fetchPets()
      } else {
        alert("Gagal menambah pet!")
      }
    } catch (error) {
      console.error("Error adding pet:", error)
      alert("Gagal menambah pet!")
    }
  }

  const handleUpdatePet = async (pet: Pet) => {
    try {
      const response = await fetch("/api/pets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pet),
      })

      if (response.ok) {
        setEditingPet(null)
        fetchPets()
      } else {
        alert("Gagal update pet!")
      }
    } catch (error) {
      console.error("Error updating pet:", error)
      alert("Gagal update pet!")
    }
  }

  const handleDeletePet = async (id: number) => {
    if (!confirm("Yakin ingin hapus pet ini?")) return

    try {
      const response = await fetch("/api/pets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        fetchPets()
      } else {
        alert("Gagal hapus pet!")
      }
    } catch (error) {
      console.error("Error deleting pet:", error)
      alert("Gagal hapus pet!")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-white">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-cyan-500">
                Login
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>Demo credentials:</p>
              <p>Username: admin</p>
              <p>Password: elitepets2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="space-x-4">
            <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pet
            </Button>
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Add Pet Form */}
        {showAddForm && (
          <Card className="mb-8 bg-black/50 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Tambah Pet Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nama Pet"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <Input
                  placeholder="Harga (contoh: Rp 50.000)"
                  value={newPet.price}
                  onChange={(e) => setNewPet({ ...newPet, price: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <Input
                  type="number"
                  placeholder="Stok"
                  value={newPet.stock}
                  onChange={(e) => setNewPet({ ...newPet, stock: Number.parseInt(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <Select
                  value={newPet.category}
                  onValueChange={(value: "pet" | "package" | "equipment") => setNewPet({ ...newPet, category: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet">Pet</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newPet.status}
                  onValueChange={(value: "ready" | "sold") => setNewPet({ ...newPet, status: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Deskripsi"
                    value={newPet.description}
                    onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex space-x-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pets List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="bg-black/50 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{pet.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant={pet.status === "ready" ? "default" : "destructive"}>{pet.status}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {pet.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingPet?.id === pet.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingPet.name}
                      onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      value={editingPet.price}
                      onChange={(e) => setEditingPet({ ...editingPet, price: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      type="number"
                      value={editingPet.stock}
                      onChange={(e) => setEditingPet({ ...editingPet, stock: Number.parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Select
                      value={editingPet.status}
                      onValueChange={(value: "ready" | "sold") => setEditingPet({ ...editingPet, status: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={editingPet.category}
                      onValueChange={(value: "pet" | "package" | "equipment") =>
                        setEditingPet({ ...editingPet, category: value })
                      }
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pet">Pet</SelectItem>
                        <SelectItem value="package">Package</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={editingPet.description}
                      onChange={(e) => setEditingPet({ ...editingPet, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleUpdatePet(editingPet)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setEditingPet(null)}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-pink-500 font-bold text-lg">{pet.price}</p>
                    <p className="text-gray-300 text-sm">{pet.description}</p>
                    <p className="text-white">
                      Stok: <span className="font-bold">{pet.stock}</span>
                    </p>
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={() => setEditingPet(pet)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDeletePet(pet.id)} size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
