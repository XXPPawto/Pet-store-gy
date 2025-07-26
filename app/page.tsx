"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Phone } from "lucide-react"

interface Pet {
  id: number
  name: string
  price: string
  description: string
  stock: number
  status: "ready" | "sold"
  category: "pet" | "package" | "equipment"
}

export default function HomePage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [cart, setCart] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const response = await fetch("/api/pets")
      const data = await response.json()
      setPets(data)
    } catch (error) {
      console.error("Error fetching pets:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (pet: Pet) => {
    if (pet.stock > 0 && pet.status === "ready") {
      setCart([...cart, pet])
    }
  }

  const removeFromCart = (petId: number) => {
    setCart(cart.filter((pet) => pet.id !== petId))
  }

  const handleCheckout = () => {
    if (cart.length === 0) return

    const message = cart.map((pet) => `• ${pet.name} - ${pet.price}`).join("\n")
    const whatsappMessage = `Halo! Saya ingin memesan:\n\n${message}\n\nMohon konfirmasi ketersediaan stok. Terima kasih!`
    const whatsappUrl = `https://wa.me/6285128048534?text=${encodeURIComponent(whatsappMessage)}`

    window.open(whatsappUrl, "_blank")
  }

  const petItems = pets.filter((pet) => pet.category === "pet")
  const packageItems = pets.filter((pet) => pet.category === "package")
  const equipmentItems = pets.filter((pet) => pet.category === "equipment")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/80 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ELITE PETS
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#pets" className="hover:text-cyan-400 transition-colors">
                Koleksi Pet
              </a>
              <a href="#packages" className="hover:text-cyan-400 transition-colors">
                Paket Tumbal
              </a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">
                Kontak
              </a>
              <a href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                Admin
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({cart.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="py-20">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Elite Pet Collection
            </h1>
            <p className="text-xl mb-8 text-gray-300">Koleksi Pet Eksklusif Terbaik untuk Anda</p>
            <Button
              onClick={() => document.getElementById("pets")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-lg px-8 py-3"
            >
              Lihat Koleksi
            </Button>
          </div>
        </div>
      </section>

      {/* Warning */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
          <p className="text-lg font-bold">⚠️ TANYA STOK SEBELUM PAYMENT ⚠️</p>
        </div>
      </div>

      {/* Pet Collection */}
      <section id="pets" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Koleksi Pet Premium
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {petItems.map((pet) => (
              <div
                key={pet.id}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-cyan-400">{pet.name}</h3>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={pet.status === "ready" ? "default" : "destructive"}>
                      {pet.status === "ready" ? "Ready" : "Sold Out"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Stok: {pet.stock}
                    </Badge>
                  </div>
                </div>
                <p className="text-2xl font-bold text-pink-500 mb-2">{pet.price}</p>
                <p className="text-gray-300 text-sm mb-4">{pet.description}</p>
                <Button
                  onClick={() => addToCart(pet)}
                  disabled={pet.stock === 0 || pet.status === "sold"}
                  className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pet.stock === 0 || pet.status === "sold" ? "Habis" : "Tambah ke Cart"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Pet Tumbal
          </h2>
          <p className="text-center text-gray-300 mb-12">Ambil paket didiskon aman ae</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {packageItems.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-pink-500/10 border-2 border-pink-500/30 rounded-xl p-6 text-center hover:bg-pink-500/20 transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-pink-500">{pkg.name}</h3>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={pkg.status === "ready" ? "default" : "destructive"}>
                      {pkg.status === "ready" ? "Ready" : "Sold Out"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Stok: {pkg.stock}
                    </Badge>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-4">{pkg.price}</p>
                <Button
                  onClick={() => addToCart(pkg)}
                  disabled={pkg.stock === 0 || pkg.status === "sold"}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pkg.stock === 0 || pkg.status === "sold" ? "Habis" : "Tambah ke Cart"}
                </Button>
              </div>
            ))}
          </div>

          {/* Equipment */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">Perlengkapan Tambahan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipmentItems.map((equipment) => (
                <div
                  key={equipment.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-cyan-400">{equipment.name}</h3>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={equipment.status === "ready" ? "default" : "destructive"}>
                        {equipment.status === "ready" ? "Ready" : "Sold Out"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Stok: {equipment.stock}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-pink-500 mb-2">{equipment.price}</p>
                  <p className="text-gray-300 text-sm mb-4">{equipment.description}</p>
                  <Button
                    onClick={() => addToCart(equipment)}
                    disabled={equipment.stock === 0 || equipment.status === "sold"}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {equipment.stock === 0 || equipment.status === "sold" ? "Habis" : "Tambah ke Cart"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl p-4 max-w-sm">
          <h4 className="font-bold mb-2">Cart Summary:</h4>
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm mb-1">
              <span>{item.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFromCart(item.id)}
                className="text-red-400 hover:text-red-300 p-1 h-auto"
              >
                ×
              </Button>
            </div>
          ))}
          <Button onClick={handleCheckout} className="w-full mt-3 bg-green-600 hover:bg-green-700">
            <Phone className="w-4 h-4 mr-2" />
            Checkout via WhatsApp
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-black/80 py-12 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold text-cyan-400 mb-4">Hubungi Kami</h3>
          <p className="text-gray-300 mb-6">📞 Kontak kami untuk informasi lebih lanjut dan pemesanan</p>
          <Button
            onClick={() => window.open("https://wa.me/6285128048534", "_blank")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Phone className="w-4 h-4 mr-2" />
            WhatsApp Store
          </Button>
          <p className="text-gray-500 text-sm mt-8">© 2025 Elite Pet Collection. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
