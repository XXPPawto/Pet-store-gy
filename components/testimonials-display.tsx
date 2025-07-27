"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, User, Heart } from "lucide-react"

interface Testimonial {
  id: number
  username: string
  petName: string
  message: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export function TestimonialsDisplay() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials?status=approved", {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading testimonials...</div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Belum ada testimoni yang disetujui.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="bg-background border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-foreground">{testimonial.username}</span>
              </div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>

            <Badge variant="outline" className="mb-3 border-border text-foreground">
              {testimonial.petName}
            </Badge>

            <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{testimonial.message}"</p>

            <div className="text-xs text-muted-foreground">
              {new Date(testimonial.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
