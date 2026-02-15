import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                patientProfile: true,
                doctorProfile: true,
            },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Exclude password
        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const role = session.user.role;

        if (role === "PATIENT") {
            await prisma.patientProfile.upsert({
                where: { userId: session.user.id },
                update: {
                    dob: data.dob ? new Date(data.dob) : undefined,
                    gender: data.gender,
                    bloodGroup: data.bloodGroup,
                    address: data.address,
                    medicalHistory: data.medicalHistory,
                },
                create: {
                    userId: session.user.id,
                    dob: data.dob ? new Date(data.dob) : undefined,
                    gender: data.gender,
                    bloodGroup: data.bloodGroup,
                    address: data.address,
                    medicalHistory: data.medicalHistory,
                }
            })
        } else if (role === "DOCTOR") {
            await prisma.doctorProfile.upsert({
                where: { userId: session.user.id },
                update: {
                    specialization: data.specialization,
                    licenseNumber: data.licenseNumber,
                    yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : undefined,
                    hospital: data.hospital,
                },
                create: {
                    userId: session.user.id,
                    specialization: data.specialization,
                    licenseNumber: data.licenseNumber,
                    yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : undefined,
                    hospital: data.hospital,
                }
            })
        }

        // Also update basic user info if provided
        if (data.name) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { name: data.name }
            })
        }

        return NextResponse.json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
