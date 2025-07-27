"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Trash2, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

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

const CART_STORAGE_KEY = "xpawto_cart"
const PAYMENT_METHODS = [
  { value: "dana", label: "💳 Dana" },
  { value: "gopay", label: "🟢 Gopay" },
  { value: "shopeepay", label: "🧡 Shopee Pay" },
  { value: "seabank", label: "🔵 Seabank" },
  { value: "qris", label: "📱 QRIS" },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      } catch (error) {
        console.error("Failed to save cart:", error)
      }
    }
  }, [cartItems, loading])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }

    setCartItems(
      cartItems.map((item) => (item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stock) } : item)),
    )
  }

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    if (!paymentMethod) {
      alert("Silakan pilih metode pembayaran terlebih dahulu!")
      return
    }

    const selectedPayment = PAYMENT_METHODS.find((method) => method.value === paymentMethod)
    const orderDetails = cartItems.map((item) => `• ${item.name} - ${item.price} (Qty: ${item.quantity})`).join("\n")

    const whatsappMessage = `Halo! Saya ingin memesan:

${orderDetails}

Total Item: ${getTotalItems()} pcs
Metode Pembayaran: ${selectedPayment?.label}

Mohon konfirmasi ketersediaan stok dan total harga. Terima kasih!`

    const whatsappUrl = `https://wa.me/6285128048534?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-xl">Loading cart...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Keranjang Belanja</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/" className="text-xl font-bold text-foreground">
                XPawto Store
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Keranjang Kosong</h2>
            <p className="text-muted-foreground mb-8">Belum ada item di keranjang Anda</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-foreground">Item Keranjang ({getTotalItems()})</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Kosongkan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <Badge
                            variant={
                              item.category === "pet"
                                ? "default"
                                : item.category === "package"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-blue-600 font-bold text-lg">{item.price}</p>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                        <p className="text-green-600 text-sm">Stok tersedia: {item.stock}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-foreground">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Item:</span>
                      <span className="font-semibold">{getTotalItems()} pcs</span>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-sm text-muted-foreground">*Harga final akan dikonfirmasi via WhatsApp</p>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-muted-foreground font-semibold">Metode Pembayaran</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || !paymentMethod}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Checkout via WhatsApp
                  </Button>

                  {/* Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Stok akan dikonfirmasi via WhatsApp</p>
                    <p>• Pembayaran dilakukan setelah konfirmasi</p>
                    <p>• Harga dapat berubah sesuai ketersediaan</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
