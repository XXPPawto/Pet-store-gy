import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const dataFilePath = path.join(process.cwd(), "data", "pets.json")

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(dataFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read pets data
const readPetsData = () => {
  ensureDataDir()
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, "utf8")
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error("Error reading pets data:", error)
    return []
  }
}

// Write pets data
const writePetsData = (data: any[]) => {
  ensureDataDir()
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error writing pets data:", error)
  }
}

// GET - Fetch all pets
export async function GET() {
  try {
    const pets = readPetsData()
    return NextResponse.json(pets)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
  }
}

// POST - Add new pet
export async function POST(request: NextRequest) {
  try {
    const newPet = await request.json()
    const pets = readPetsData()

    // Generate new ID
    const maxId = pets.length > 0 ? Math.max(...pets.map((p: any) => p.id)) : 0
    const petWithId = { ...newPet, id: maxId + 1 }

    pets.push(petWithId)
    writePetsData(pets)

    return NextResponse.json(petWithId)
  } catch (error) {
    return NextResponse.json({ error: "Failed to add pet" }, { status: 500 })
  }
}

// PUT - Update pet
export async function PUT(request: NextRequest) {
  try {
    const updatedPet = await request.json()
    const pets = readPetsData()

    const index = pets.findIndex((p: any) => p.id === updatedPet.id)
    if (index === -1) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    pets[index] = updatedPet
    writePetsData(pets)

    return NextResponse.json(updatedPet)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
  }
}

// DELETE - Delete pet
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    const pets = readPetsData()

    const filteredPets = pets.filter((p: any) => p.id !== id)
    writePetsData(filteredPets)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 })
  }
}
