import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const customers = await prisma.customer.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { anydeskId: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          category ? { category: { equals: category } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, anydeskId, category, notes } = body;

    if (!name || !anydeskId) {
      return NextResponse.json(
        { error: "Name and AnyDesk ID are required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        anydeskId,
        category: category || "Uncategorized",
        notes,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating customer:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "AnyDesk ID already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, anydeskId, category, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(anydeskId && { anydeskId }),
        ...(category && { category }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
