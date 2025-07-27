"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Send } from "lucide-react"

const TESTIMONIALS_STORAGE_KEY = "xpawto_testimonials_data"

export function TestimonialForm() {
  const [formData, setFormData] = useState({
    username: "",
    petName: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Save testimonials to localStorage
  const saveTestimonialsToStorage = (testimonialsData: any[]) => {
    try {
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonialsData))
      console.log("Form: Saved testimonials to localStorage:", testimonialsData.length, "items")
    } catch (error) {
      console.error("Form: Failed to save testimonials to localStorage:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim() || !formData.petName.trim() || !formData.message.trim()) {
      setMessage("Semua field harus diisi!")
      return
    }

    try {
      setLoading(true)
      setMessage("")

      console.log("Form: Submitting testimonial:", formData)

      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Form: Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit testimonial")
      }

      const result = await response.json()
      console.log("Form: Testimonial submitted successfully:", result)

      // Save to localStorage if we get allTestimonials back
      if (result.allTestimonials) {
        saveTestimonialsToStorage(result.allTestimonials)
      }

      setFormData({ username: "", petName: "", message: "" })
      setMessage("Testimoni berhasil dikirim! Menunggu persetujuan admin.")

      // Clear success message after 5 seconds
      setTimeout(() => setMessage(""), 5000)
    } catch (error) {
      console.error("Form: Error submitting testimonial:", error)
      setMessage("Gagal mengirim testimoni. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <MessageSquare className="w-5 h-5 mr-2" />
          Berikan Testimoni
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-foreground">
              Username Roblox
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Masukkan username Roblox Anda"
              className="bg-background border-border text-foreground"
              required
            />
          </div>
          <div>
            <Label htmlFor="petName" className="text-foreground">
              Hewan yang Dibeli
            </Label>
            <Input
              id="petName"
              value={formData.petName}
              onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
              placeholder="Contoh: TITAN TRICERATOPS"
              className="bg-background border-border text-foreground"
              required
            />
          </div>
          <div>
            <Label htmlFor="message" className="text-foreground">
              Testimoni
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Bagikan pengalaman Anda berbelanja di XPawto Store..."
              className="bg-background border-border text-foreground min-h-[100px]"
              required
            />
          </div>
          {message && (
            <div
              className={`text-sm p-3 rounded-lg ${
                message.includes("berhasil")
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {message}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Mengirim..." : "Kirim Testimoni"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
