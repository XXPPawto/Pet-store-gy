"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, Plus, Save, X, Eye, EyeOff } from "lucide-react"

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
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: 0,
    status: "ready" as "ready" | "sold",
    category: "pet" as "pet" | "package" | "equipment",
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchPets()
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "admin" && password === "elitepets2025") {
      setIsAuthenticated(true)
      setMessage("")
    } else {
      setMessage("Invalid credentials")
    }
  }

  const fetchPets = async () => {
    try {
      setLoading(true)
      console.log("Admin: Fetching pets...")

      const response = await fetch("/api/pets", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("Admin: Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Admin: Error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Admin: Received data:", data)
      setPets(data)
      setMessage("")
    } catch (error) {
      console.error("Admin: Error fetching pets:", error)
      setMessage("Error fetching pets: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log("Admin: Adding pet:", formData)

      const response = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add pet")
      }

      const newPet = await response.json()
      console.log("Admin: Pet added:", newPet)
      setPets([...pets, newPet])
      setFormData({
        name: "",
        price: "",
        description: "",
        stock: 0,
        status: "ready",
        category: "pet",
      })
      setShowAddForm(false)
      setMessage("Pet added successfully!")
    } catch (error) {
      console.error("Admin: Error adding pet:", error)
      setMessage("Error adding pet: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePet = async (pet: Pet) => {
    try {
      setLoading(true)
      console.log("Admin: Updating pet:", pet)

      const response = await fetch("/api/pets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pet),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update pet")
      }

      const updatedPet = await response.json()
      console.log("Admin: Pet updated:", updatedPet)
      setPets(pets.map((p) => (p.id === updatedPet.id ? updatedPet : p)))
      setEditingId(null)
      setMessage("Pet updated successfully!")
    } catch (error) {
      console.error("Admin: Error updating pet:", error)
      setMessage("Error updating pet: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePet = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pet?")) return

    try {
      setLoading(true)
      console.log("Admin: Deleting pet:", id)

      const response = await fetch("/api/pets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete pet")
      }

      console.log("Admin: Pet deleted")
      setPets(pets.filter((p) => p.id !== id))
      setMessage("Pet deleted successfully!")
    } catch (error) {
      console.error("Admin: Error deleting pet:", error)
      setMessage("Error deleting pet: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (pet: Pet) => {
    setEditingId(pet.id)
    setFormData({
      name: pet.name,
      price: pet.price,
      description: pet.description,
      stock: pet.stock,
      status: pet.status,
      category: pet.category,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      name: "",
      price: "",
      description: "",
      stock: 0,
      status: "ready",
      category: "pet",
    })
  }

  const saveEdit = () => {
    if (editingId) {
      handleUpdatePet({ ...formData, id: editingId })
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
              <div>
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
              {message && <p className="text-red-400 text-sm">{message}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-cyan-500">
                Login
              </Button>
            </form>
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
          <div className="flex gap-4">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pet
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

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg text-white ${message.includes("Error") ? "bg-red-500/20 border border-red-500/50" : "bg-green-500/20 border border-green-500/50"}`}
          >
            {message}
          </div>
        )}

        {loading && (
          <div className="text-center text-white mb-4">
            <p>Loading...</p>
          </div>
        )}

        {/* Add Pet Form */}
        {showAddForm && (
          <Card className="mb-8 bg-black/50 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Add New Pet</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-white">
                    Price
                  </Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock" className="text-white">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-white">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: "pet" | "package" | "equipment") =>
                      setFormData({ ...formData, category: value })
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
                </div>
                <div>
                  <Label htmlFor="status" className="text-white">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "ready" | "sold") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Adding..." : "Add Pet"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
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
              <CardContent className="p-6">
                {editingId === pet.id ? (
                  <div className="space-y-4">
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Input
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Price"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                      placeholder="Stock"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ready" | "sold") => setFormData({ ...formData, status: value })}
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
                      value={formData.category}
                      onValueChange={(value: "pet" | "package" | "equipment") =>
                        setFormData({ ...formData, category: value })
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
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={saveEdit}
                        disabled={loading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white">{pet.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant={pet.status === "ready" ? "default" : "destructive"}>{pet.status}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {pet.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-pink-500 mb-2">{pet.price}</p>
                    <p className="text-gray-300 text-sm mb-2">{pet.description}</p>
                    <p className="text-cyan-400 text-sm mb-4">Stock: {pet.stock}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEdit(pet)}
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeletePet(pet.id)}
                        size="sm"
                        variant="destructive"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {pets.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-8">
            <p>No pets found. Add some pets to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
