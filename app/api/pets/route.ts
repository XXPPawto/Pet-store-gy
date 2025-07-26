import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for pets data (will reset on server restart)
let petsData = [
  {
    id: 1,
    name: "TITAN TRICERATOPS",
    price: "Under Rp 100.000",
    description: "Pet legendary langka",
    stock: 2,
    status: "ready",
    category: "pet",
  },
  {
    id: 2,
    name: "T-REX",
    price: "Rp 45.000",
    description: "Murah aja",
    stock: 5,
    status: "ready",
    category: "pet",
  },
  {
    id: 3,
    name: "MIMIC",
    price: "Rp 45.000",
    description: "Gemuk",
    stock: 3,
    status: "ready",
    category: "pet",
  },
  {
    id: 4,
    name: "DRAGONFLY",
    price: "Rp 40.000-55.000",
    description: "Mutasi windy",
    stock: 4,
    status: "ready",
    category: "pet",
  },
  {
    id: 5,
    name: "QUEEN BEE",
    price: "Rp 35.000",
    description: "Gemuk + mutasi windy",
    stock: 2,
    status: "ready",
    category: "pet",
  },
  {
    id: 6,
    name: "DILOPHOSAURUS",
    price: "Rp 15.000-17.000",
    description: "Koleksi dinosaurus",
    stock: 3,
    status: "ready",
    category: "pet",
  },
  {
    id: 7,
    name: "RED FOX",
    price: "Rp 8.000-10.000",
    description: "Gemuk",
    stock: 4,
    status: "ready",
    category: "pet",
  },
  {
    id: 8,
    name: "MOON CAT",
    price: "Rp 6.000-8.000",
    description: "Gemuk",
    stock: 5,
    status: "ready",
    category: "pet",
  },
  {
    id: 9,
    name: "OWL BIASA",
    price: "Rp 5.000",
    description: "Pet standar",
    stock: 6,
    status: "ready",
    category: "pet",
  },
  {
    id: 10,
    name: "COOKED OWL",
    price: "Rp 5.000",
    description: "Varian spesial",
    stock: 3,
    status: "ready",
    category: "pet",
  },
  {
    id: 11,
    name: "OSTRIC",
    price: "Rp 5.000",
    description: "Pet burung",
    stock: 4,
    status: "ready",
    category: "pet",
  },
  {
    id: 12,
    name: "MANTIS",
    price: "Rp 5.000-7.000",
    description: "Gemuk",
    stock: 3,
    status: "ready",
    category: "pet",
  },
  {
    id: 13,
    name: "PETAL BEE",
    price: "Rp 7.000",
    description: "Lebah cantik",
    stock: 2,
    status: "ready",
    category: "pet",
  },
  {
    id: 14,
    name: "ALL MACAW",
    price: "Rp 6.000",
    description: "Gemuk",
    stock: 4,
    status: "ready",
    category: "pet",
  },
  {
    id: 15,
    name: "CAPYBARA",
    price: "Rp 6.000",
    description: "Gemuk",
    stock: 3,
    status: "ready",
    category: "pet",
  },
  {
    id: 16,
    name: "SEAL",
    price: "Rp 5.000",
    description: "Pet air",
    stock: 5,
    status: "ready",
    category: "pet",
  },
  {
    id: 17,
    name: "PEACOCK",
    price: "Rp 5.000",
    description: "Gemuk",
    stock: 2,
    status: "ready",
    category: "pet",
  },
  {
    id: 18,
    name: "BLOOD KIWI",
    price: "Rp 6.000",
    description: "Gemuk",
    stock: 3,
    status: "ready",
    category: "pet",
  },
  {
    id: 19,
    name: "Paket 30+",
    price: "Rp 3.000",
    description: "Paket tumbal 30+",
    stock: 10,
    status: "ready",
    category: "package",
  },
  {
    id: 20,
    name: "Paket 45+",
    price: "Rp 10.000",
    description: "Paket tumbal 45+",
    stock: 8,
    status: "ready",
    category: "package",
  },
  {
    id: 21,
    name: "Paket 60+",
    price: "Rp 17.000",
    description: "Paket tumbal 60+",
    stock: 6,
    status: "ready",
    category: "package",
  },
  {
    id: 22,
    name: "Paket 75+",
    price: "Rp 23.000",
    description: "Paket tumbal 75+",
    stock: 4,
    status: "ready",
    category: "package",
  },
  {
    id: 23,
    name: "SPRINKLE 1 SET",
    price: "Rp 15.000",
    description: "Perlengkapan lengkap",
    stock: 5,
    status: "ready",
    category: "equipment",
  },
]

// GET - Fetch all pets
export async function GET() {
  try {
    console.log("GET /api/pets - Returning pets data:", petsData.length, "items")
    return NextResponse.json(petsData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pets", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// POST - Add new pet
export async function POST(request: NextRequest) {
  try {
    const newPet = await request.json()
    console.log("POST /api/pets - Adding new pet:", newPet)

    // Validate required fields
    if (!newPet.name || !newPet.price || !newPet.category) {
      return NextResponse.json({ error: "Missing required fields: name, price, category" }, { status: 400 })
    }

    // Generate new ID
    const maxId = petsData.length > 0 ? Math.max(...petsData.map((p: any) => p.id)) : 0
    const petWithId = {
      ...newPet,
      id: maxId + 1,
      stock: Number.parseInt(newPet.stock) || 0,
      status: newPet.status || "ready",
    }

    petsData.push(petWithId)
    console.log("Pet added successfully:", petWithId)

    return NextResponse.json(petWithId, { status: 201 })
  } catch (error) {
    console.error("POST Error:", error)
    return NextResponse.json(
      { error: "Failed to add pet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// PUT - Update pet
export async function PUT(request: NextRequest) {
  try {
    const updatedPet = await request.json()
    console.log("PUT /api/pets - Updating pet:", updatedPet)

    if (!updatedPet.id) {
      return NextResponse.json({ error: "Pet ID is required" }, { status: 400 })
    }

    const index = petsData.findIndex((p: any) => p.id === updatedPet.id)
    if (index === -1) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // Ensure stock is a number
    updatedPet.stock = Number.parseInt(updatedPet.stock) || 0

    petsData[index] = updatedPet
    console.log("Pet updated successfully:", updatedPet)

    return NextResponse.json(updatedPet, { status: 200 })
  } catch (error) {
    console.error("PUT Error:", error)
    return NextResponse.json(
      { error: "Failed to update pet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE - Delete pet
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    console.log("DELETE /api/pets - Deleting pet with ID:", id)

    if (!id) {
      return NextResponse.json({ error: "Pet ID is required" }, { status: 400 })
    }

    const initialLength = petsData.length
    petsData = petsData.filter((p: any) => p.id !== id)

    if (petsData.length === initialLength) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    console.log("Pet deleted successfully")
    return NextResponse.json({ success: true, message: "Pet deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("DELETE Error:", error)
    return NextResponse.json(
      { error: "Failed to delete pet", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
