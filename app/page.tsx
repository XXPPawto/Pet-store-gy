"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Phone } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { TestimonialForm } from "@/components/testimonial-form"
import { TestimonialsDisplay } from "@/components/testimonials-display"

interface Pet {
  id: number
  name: string
  price: string
  description: string
  stock: number
  status: "ready" | "sold"
  category: "pet" | "package" | "equipment"
}

interface CartItem extends Pet {
  quantity: number
}

const STORAGE_KEY = "xpawto_pets_data"
const CART_STORAGE_KEY = "xpawto_cart"

export default function HomePage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Save to localStorage whenever pets data changes
  const savePetsToStorage = (petsData: Pet[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(petsData))
      console.log("Saved to localStorage:", petsData.length, "items")
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  // Load from localStorage
  const loadPetsFromStorage = (): Pet[] | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log("Loaded from localStorage:", parsed.length, "items")
        return parsed
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
    return null
  }

  // Load cart from localStorage
  const loadCartFromStorage = (): CartItem[] => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        return JSON.parse(savedCart)
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    }
    return []
  }

  // Save cart to localStorage
  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData))
    } catch (error) {
      console.error("Failed to save cart:", error)
    }
  }

  useEffect(() => {
    fetchPets()
    setCart(loadCartFromStorage())
  }, [])

  // Save cart whenever it changes
  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])

  const fetchPets = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching pets from /api/pets...")

      // Try to load from localStorage first
      const storedPets = loadPetsFromStorage()
      let url = "/api/pets"

      // If we have stored data, send it to server to sync
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

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Received data:", data)

      if (Array.isArray(data)) {
        setPets(data)
        savePetsToStorage(data) // Save to localStorage
        console.log("Successfully set pets:", data.length, "items")
      } else {
        console.error("Invalid data format:", data)
        throw new Error("Invalid data format received")
      }
    } catch (error) {
      console.error("Error fetching pets:", error)

      // Fallback to localStorage if API fails
      const storedPets = loadPetsFromStorage()
      if (storedPets && storedPets.length > 0) {
        setPets(storedPets)
        setError(null)
        console.log("Using localStorage fallback")
      } else {
        setError(error instanceof Error ? error.message : "Failed to load pets")
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (pet: Pet) => {
    if (pet.stock > 0 && pet.status === "ready") {
      const existingItem = cart.find((item) => item.id === pet.id)

      if (existingItem) {
        // If item already in cart, increase quantity
        if (existingItem.quantity < pet.stock) {
          setCart(cart.map((item) => (item.id === pet.id ? { ...item, quantity: item.quantity + 1 } : item)))
        }
      } else {
        // Add new item to cart
        setCart([...cart, { ...pet, quantity: 1 }])
      }
    }
  }

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const petItems = pets.filter((pet) => pet.category === "pet")
  const packageItems = pets.filter((pet) => pet.category === "package")
  const equipmentItems = pets.filter((pet) => pet.category === "equipment")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <Button onClick={fetchPets} className="bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full bg-card shadow-sm border-b border-border z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-foreground">XPawto Store</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#pets" className="text-muted-foreground hover:text-foreground transition-colors">
                Koleksi Pet
              </a>
              <a href="#packages" className="text-muted-foreground hover:text-foreground transition-colors">
                Paket Tumbal
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Kontak
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="relative">
                <Link href="/cart">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({getTotalCartItems()})
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="py-20">
            <h1 className="text-6xl font-bold mb-6 text-foreground">XPawto Store</h1>
            <p className="text-xl mb-8 text-muted-foreground">Koleksi Pet Eksklusif Terbaik untuk Anda</p>
            <Button
              onClick={() => document.getElementById("pets")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3"
            >
              Lihat Koleksi
            </Button>
          </div>
        </div>
      </section>

      {/* Warning */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-yellow-800">⚠️ TANYA STOK SEBELUM PAYMENT ⚠️</p>
        </div>
      </div>

      {/* Pet Collection */}
      <section id="pets" className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Koleksi Pet Premium</h2>
          {petItems.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>Tidak ada pet yang tersedia saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {petItems.map((pet) => {
                const cartItem = cart.find((item) => item.id === pet.id)
                const inCartQuantity = cartItem ? cartItem.quantity : 0

                return (
                  <div
                    key={pet.id}
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-foreground">{pet.name}</h3>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={pet.status === "ready" ? "default" : "destructive"}>
                          {pet.status === "ready" ? "Ready" : "Sold Out"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Stok: {pet.stock}
                        </Badge>
                        {inCartQuantity > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Di cart: {inCartQuantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-2">{pet.price}</p>
                    <p className="text-muted-foreground text-sm mb-4">{pet.description}</p>
                    <Button
                      onClick={() => addToCart(pet)}
                      disabled={pet.stock === 0 || pet.status === "sold" || inCartQuantity >= pet.stock}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pet.stock === 0 || pet.status === "sold"
                        ? "Habis"
                        : inCartQuantity >= pet.stock
                          ? "Max di Cart"
                          : "Tambah ke Cart"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Pet Tumbal</h2>
          <p className="text-center text-muted-foreground mb-12">Ambil paket didiskon aman ae</p>
          {packageItems.length === 0 ? (
            <div className="text-center text-muted-foreground mb-12">
              <p>Tidak ada paket yang tersedia saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {packageItems.map((pkg) => {
                const cartItem = cart.find((item) => item.id === pkg.id)
                const inCartQuantity = cartItem ? cartItem.quantity : 0

                return (
                  <div
                    key={pkg.id}
                    className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-red-700">{pkg.name}</h3>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={pkg.status === "ready" ? "default" : "destructive"}>
                          {pkg.status === "ready" ? "Ready" : "Sold Out"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Stok: {pkg.stock}
                        </Badge>
                        {inCartQuantity > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Di cart: {inCartQuantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-4">{pkg.price}</p>
                    <Button
                      onClick={() => addToCart(pkg)}
                      disabled={pkg.stock === 0 || pkg.status === "sold" || inCartQuantity >= pkg.stock}
                      className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pkg.stock === 0 || pkg.status === "sold"
                        ? "Habis"
                        : inCartQuantity >= pkg.stock
                          ? "Max di Cart"
                          : "Tambah ke Cart"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Equipment */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-6">Perlengkapan Tambahan</h3>
            {equipmentItems.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>Tidak ada perlengkapan yang tersedia saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipmentItems.map((equipment) => {
                  const cartItem = cart.find((item) => item.id === equipment.id)
                  const inCartQuantity = cartItem ? cartItem.quantity : 0

                  return (
                    <div
                      key={equipment.id}
                      className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-foreground">{equipment.name}</h3>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={equipment.status === "ready" ? "default" : "destructive"}>
                            {equipment.status === "ready" ? "Ready" : "Sold Out"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Stok: {equipment.stock}
                          </Badge>
                          {inCartQuantity > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Di cart: {inCartQuantity}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-600 mb-2">{equipment.price}</p>
                      <p className="text-muted-foreground text-sm mb-4">{equipment.description}</p>
                      <Button
                        onClick={() => addToCart(equipment)}
                        disabled={
                          equipment.stock === 0 || equipment.status === "sold" || inCartQuantity >= equipment.stock
                        }
                        className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {equipment.stock === 0 || equipment.status === "sold"
                          ? "Habis"
                          : inCartQuantity >= equipment.stock
                            ? "Max di Cart"
                            : "Tambah ke Cart"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Testimoni Pelanggan</h2>
          <p className="text-center text-muted-foreground mb-12">Apa kata mereka tentang XPawto Store</p>

          <TestimonialsDisplay />

          <div className="mt-16 max-w-2xl mx-auto">
            <TestimonialForm />
          </div>
        </div>
      </section>

      {/* Cart Floating Button */}
      {getTotalCartItems() > 0 && (
        <Link href="/cart">
          <div className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg cursor-pointer transition-all duration-300 hover:scale-110">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">{getTotalCartItems()}</span>
            </div>
          </div>
        </Link>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 py-12 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Hubungi Kami</h3>
          <p className="text-gray-300 mb-6">📞 Kontak kami untuk informasi lebih lanjut dan pemesanan</p>
          <Button
            onClick={() => window.open("https://wa.me/6285128048534", "_blank")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            WhatsApp Store
          </Button>
          <p className="text-gray-400 text-sm mt-8">© 2025 XPawto Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
