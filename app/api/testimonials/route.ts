import { type NextRequest, NextResponse } from "next/server"

interface Testimonial {
  id: number
  username: string
  petName: string
  message: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

// In-memory storage for testimonials
let testimonialsData: Testimonial[] = [
  // Sample data untuk testing
  {
    id: 1,
    username: "testuser123",
    petName: "TITAN TRICERATOPS",
    message: "Pet nya bagus banget! Recommended seller!",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
]

const TESTIMONIALS_STORAGE_KEY = "xpawto_testimonials_data"

// Load testimonials from localStorage (client-side sync)
const loadTestimonialsFromStorage = (storedData?: string): Testimonial[] => {
  if (storedData) {
    try {
      const parsed = JSON.parse(decodeURIComponent(storedData))
      if (Array.isArray(parsed)) {
        console.log("Server: Loaded testimonials from client:", parsed.length, "items")
        return parsed
      }
    } catch (e) {
      console.log("Server: Failed to parse stored testimonials data")
    }
  }
  return testimonialsData
}

// GET - Fetch testimonials
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const storedData = url.searchParams.get("stored")
    const statusFilter = url.searchParams.get("status")

    console.log("GET /api/testimonials - storedData:", !!storedData, "statusFilter:", statusFilter)

    // Sync with client localStorage if provided
    if (storedData) {
      const clientData = loadTestimonialsFromStorage(storedData)
      if (clientData.length > 0) {
        testimonialsData = clientData
      }
    }

    let filteredTestimonials = testimonialsData

    // Filter by status if provided
    if (statusFilter) {
      filteredTestimonials = testimonialsData.filter((t) => t.status === statusFilter)
    }

    console.log("GET /api/testimonials - Returning:", filteredTestimonials.length, "testimonials")
    return NextResponse.json(filteredTestimonials, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    console.error("GET Testimonials Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST - Add new testimonial
export async function POST(request: NextRequest) {
  try {
    const newTestimonial = await request.json()
    console.log("POST /api/testimonials - Adding testimonial:", newTestimonial)

    // Validate required fields
    if (!newTestimonial.username || !newTestimonial.petName || !newTestimonial.message) {
      return NextResponse.json({ error: "Missing required fields: username, petName, message" }, { status: 400 })
    }

    // Generate new ID
    const maxId = testimonialsData.length > 0 ? Math.max(...testimonialsData.map((t) => t.id)) : 0
    const testimonialWithId: Testimonial = {
      ...newTestimonial,
      id: maxId + 1,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }

    testimonialsData.push(testimonialWithId)
    console.log("Testimonial added successfully:", testimonialWithId)
    console.log("Total testimonials now:", testimonialsData.length)

    return NextResponse.json(
      {
        testimonial: testimonialWithId,
        allTestimonials: testimonialsData,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("POST Testimonials Error:", error)
    return NextResponse.json(
      { error: "Failed to add testimonial", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// PUT - Update testimonial (for admin approval/rejection)
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    console.log("PUT /api/testimonials - Updating testimonial:", id, status)

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 })
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const index = testimonialsData.findIndex((t) => t.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    testimonialsData[index].status = status
    console.log("Testimonial updated successfully:", testimonialsData[index])

    return NextResponse.json(
      { testimonial: testimonialsData[index], allTestimonials: testimonialsData },
      { status: 200 },
    )
  } catch (error) {
    console.error("PUT Testimonials Error:", error)
    return NextResponse.json(
      { error: "Failed to update testimonial", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    console.log("DELETE /api/testimonials - Deleting testimonial:", id)

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 })
    }

    const initialLength = testimonialsData.length
    testimonialsData = testimonialsData.filter((t) => t.id !== id)

    if (testimonialsData.length === initialLength) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    console.log("Testimonial deleted successfully")
    return NextResponse.json(
      { success: true, message: "Testimonial deleted successfully", allTestimonials: testimonialsData },
      { status: 200 },
    )
  } catch (error) {
    console.error("DELETE Testimonials Error:", error)
    return NextResponse.json(
      { error: "Failed to delete testimonial", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
