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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Trash2, Edit, Plus, Save, X, Eye, EyeOff, Check, MessageSquare, User } from "lucide-react"

interface Pet {
  id: number
  name: string
  price: string
  description: string
  stock: number
  status: "ready" | "sold"
  category: "pet" | "package" | "equipment"
}

interface Testimonial {
  id: number
  username: string
  petName: string
  message: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

const STORAGE_KEY = "xpawto_pets_data"
const TESTIMONIALS_STORAGE_KEY = "xpawto_testimonials_data"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [pets, setPets] = useState<Pet[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
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

  // Save to localStorage whenever pets data changes
  const savePetsToStorage = (petsData: Pet[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(petsData))
      console.log("Admin: Saved pets to localStorage:", petsData.length, "items")
    } catch (error) {
      console.error("Admin: Failed to save pets to localStorage:", error)
    }
  }

  // Save testimonials to localStorage
  const saveTestimonialsToStorage = (testimonialsData: Testimonial[]) => {
    try {
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonialsData))
      console.log("Admin: Saved testimonials to localStorage:", testimonialsData.length, "items")
    } catch (error) {
      console.error("Admin: Failed to save testimonials to localStorage:", error)
    }
  }

  // Load from localStorage
  const loadPetsFromStorage = (): Pet[] | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log("Admin: Loaded pets from localStorage:", parsed.length, "items")
        return parsed
      }
    } catch (error) {
      console.error("Admin: Failed to load pets from localStorage:", error)
    }
    return null
  }

  const loadTestimonialsFromStorage = (): Testimonial[] | null => {
    try {
      const stored = localStorage.getItem(TESTIMONIALS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log("Admin: Loaded testimonials from localStorage:", parsed.length, "items")
        return parsed
      }
    } catch (error) {
      console.error("Admin: Failed to load testimonials from localStorage:", error)
    }
    return null
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPets()
      fetchTestimonials()
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

      const storedPets = loadPetsFromStorage()
      let url = "/api/pets"

      if (storedPets && storedPets.length > 0) {
        url += `?stored=${encodeURIComponent(JSON.stringify(storedPets))}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPets(data)
      savePetsToStorage(data)
      setMessage("")
    } catch (error) {
      console.error("Admin: Error fetching pets:", error)
      const storedPets = loadPetsFromStorage()
      if (storedPets && storedPets.length > 0) {
        setPets(storedPets)
        setMessage("Using offline data")
      } else {
        setMessage("Error fetching pets: " + (error instanceof Error ? error.message : "Unknown error"))
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTestimonials = async () => {
    try {
      console.log("Admin: Fetching testimonials...")

      const storedTestimonials = loadTestimonialsFromStorage()
      let url = "/api/testimonials"

      if (storedTestimonials && storedTestimonials.length > 0) {
        url += `?stored=${encodeURIComponent(JSON.stringify(storedTestimonials))}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("Admin: Testimonials response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Admin: Received testimonials data:", data)
      setTestimonials(data)
      saveTestimonialsToStorage(data)
    } catch (error) {
      console.error("Admin: Error fetching testimonials:", error)
      const storedTestimonials = loadTestimonialsFromStorage()
      if (storedTestimonials && storedTestimonials.length > 0) {
        setTestimonials(storedTestimonials)
        console.log("Admin: Using localStorage fallback for testimonials")
      }
    }
  }

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add pet")
      }

      const result = await response.json()
      if (result.allPets) {
        setPets(result.allPets)
        savePetsToStorage(result.allPets)
      } else {
        setPets([...pets, result.pet])
        savePetsToStorage([...pets, result.pet])
      }

      setFormData({ name: "", price: "", description: "", stock: 0, status: "ready", category: "pet" })
      setShowAddForm(false)
      setMessage("Pet added successfully!")
    } catch (error) {
      setMessage("Error adding pet: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePet = async (pet: Pet) => {
    try {
      setLoading(true)
      const response = await fetch("/api/pets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pet),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update pet")
      }

      const result = await response.json()
      if (result.allPets) {
        setPets(result.allPets)
        savePetsToStorage(result.allPets)
      } else {
        const updatedPets = pets.map((p) => (p.id === result.pet.id ? result.pet : p))
        setPets(updatedPets)
        savePetsToStorage(updatedPets)
      }

      setEditingId(null)
      setMessage("Pet updated successfully!")
    } catch (error) {
      setMessage("Error updating pet: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePet = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pet?")) return

    try {
      setLoading(true)
      const response = await fetch("/api/pets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete pet")
      }

      const result = await response.json()
      if (result.allPets) {
        setPets(result.allPets)
        savePetsToStorage(result.allPets)
      } else {
        const filteredPets = pets.filter((p) => p.id !== id)
        setPets(filteredPets)
        savePetsToStorage(filteredPets)
      }

      setMessage("Pet deleted successfully!")
    } catch (error) {
      setMessage("Error deleting pet: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleTestimonialAction = async (id: number, status: "approved" | "rejected") => {
    try {
      setLoading(true)
      const response = await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update testimonial")
      }

      const result = await response.json()
      if (result.allTestimonials) {
        setTestimonials(result.allTestimonials)
        saveTestimonialsToStorage(result.allTestimonials)
      }

      setMessage(`Testimonial ${status} successfully!`)
    } catch (error) {
      setMessage("Error updating testimonial: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      setLoading(true)
      const response = await fetch("/api/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete testimonial")
      }

      const result = await response.json()
      if (result.allTestimonials) {
        setTestimonials(result.allTestimonials)
        saveTestimonialsToStorage(result.allTestimonials)
      }

      setMessage("Testimonial deleted successfully!")
    } catch (error) {
      setMessage("Error deleting testimonial: " + (error instanceof Error ? error.message : "Unknown error"))
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
    setFormData({ name: "", price: "", description: "", stock: 0, status: "ready", category: "pet" })
  }

  const saveEdit = () => {
    if (editingId) {
      handleUpdatePet({ ...formData, id: editingId })
    }
  }

  const pendingTestimonials = testimonials.filter((t) => t.status === "pending")
  const approvedTestimonials = testimonials.filter((t) => t.status === "approved")
  const rejectedTestimonials = testimonials.filter((t) => t.status === "rejected")

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-center text-foreground">Admin Login - XPawto Store</CardTitle>
              <ThemeToggle />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-border bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-border bg-background text-foreground pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {message && <p className="text-destructive text-sm">{message}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard - XPawto Store</h1>
          <div className="flex gap-4">
            <ThemeToggle />
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pet
            </Button>
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
            >
              Logout
            </Button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes("Error") || message.includes("error")
                ? "bg-destructive/10 border border-destructive/20 text-destructive"
                : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
            }`}
          >
            {message}
          </div>
        )}

        <Tabs defaultValue="pets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="pets" className="data-[state=active]:bg-background">
              Pets Management
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-background">
              <MessageSquare className="w-4 h-4 mr-2" />
              Testimonials ({pendingTestimonials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pets" className="space-y-6">
            {loading && (
              <div className="text-center text-muted-foreground mb-4">
                <p>Loading...</p>
              </div>
            )}

            {/* Add Pet Form */}
            {showAddForm && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Add New Pet</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-border bg-background text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-foreground">
                        Price
                      </Label>
                      <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="border-border bg-background text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-foreground">
                        Stock
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                        className="border-border bg-background text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-foreground">
                        Category
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: "pet" | "package" | "equipment") =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="border-border bg-background text-foreground">
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
                      <Label htmlFor="status" className="text-foreground">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "ready" | "sold") => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="border-border bg-background text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description" className="text-foreground">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="border-border bg-background text-foreground"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Adding..." : "Add Pet"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="border-border text-foreground hover:bg-accent"
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
                <Card key={pet.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    {editingId === pet.id ? (
                      <div className="space-y-4">
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Name"
                          className="border-border bg-background text-foreground"
                        />
                        <Input
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="Price"
                          className="border-border bg-background text-foreground"
                        />
                        <Input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                          placeholder="Stock"
                          className="border-border bg-background text-foreground"
                        />
                        <Select
                          value={formData.status}
                          onValueChange={(value: "ready" | "sold") => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="border-border bg-background text-foreground">
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
                          <SelectTrigger className="border-border bg-background text-foreground">
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
                          className="border-border bg-background text-foreground"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={saveEdit}
                            disabled={loading}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-accent bg-transparent"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-foreground">{pet.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant={pet.status === "ready" ? "default" : "destructive"}>{pet.status}</Badge>
                            <Badge variant="outline" className="text-xs border-border text-foreground">
                              {pet.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-blue-600 mb-2">{pet.price}</p>
                        <p className="text-muted-foreground text-sm mb-2">{pet.description}</p>
                        <p className="text-green-600 text-sm mb-4">Stock: {pet.stock}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEdit(pet)}
                            size="sm"
                            variant="outline"
                            disabled={loading}
                            className="border-border text-foreground hover:bg-accent"
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
              <div className="text-center text-muted-foreground mt-8">
                <p>No pets found. Add some pets to get started!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Testimonials Management</h2>
              <Button
                onClick={fetchTestimonials}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent bg-transparent"
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Pending Testimonials */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Pending ({pendingTestimonials.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {pendingTestimonials.map((testimonial) => (
                    <div key={testimonial.id} className="p-4 border border-border rounded-lg bg-background">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{testimonial.username}</span>
                        </div>
                        <Badge variant="outline" className="border-border text-foreground">
                          {testimonial.petName}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">"{testimonial.message}"</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleTestimonialAction(testimonial.id, "approved")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={loading}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleTestimonialAction(testimonial.id, "rejected")}
                          size="sm"
                          variant="destructive"
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground hover:bg-accent"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingTestimonials.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No pending testimonials</p>
                  )}
                </CardContent>
              </Card>

              {/* Approved Testimonials */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-600" />
                    Approved ({approvedTestimonials.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {approvedTestimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{testimonial.username}</span>
                        </div>
                        <Badge variant="outline" className="border-border text-foreground">
                          {testimonial.petName}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">"{testimonial.message}"</p>
                      <Button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ))}
                  {approvedTestimonials.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No approved testimonials</p>
                  )}
                </CardContent>
              </Card>

              {/* Rejected Testimonials */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <X className="w-5 h-5 mr-2 text-red-600" />
                    Rejected ({rejectedTestimonials.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {rejectedTestimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{testimonial.username}</span>
                        </div>
                        <Badge variant="outline" className="border-border text-foreground">
                          {testimonial.petName}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">"{testimonial.message}"</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleTestimonialAction(testimonial.id, "approved")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={loading}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground hover:bg-accent"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {rejectedTestimonials.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No rejected testimonials</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
