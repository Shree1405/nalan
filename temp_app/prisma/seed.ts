
import { PrismaClient, Role } from '@prisma/client' // Import Role enum
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const departments = [
        { name: 'Cardiology', doctorCount: 5, patientCount: 12 },
        { name: 'Neurology', doctorCount: 3, patientCount: 8 },
        { name: 'General Medicine', doctorCount: 10, patientCount: 25 },
        { name: 'Orthopedics', doctorCount: 4, patientCount: 15 },
        { name: 'Pulmonology', doctorCount: 4, patientCount: 10 },
    ]

    for (const dept of departments) {
        await prisma.department.upsert({
            where: { name: dept.name },
            update: {},
            create: dept,
        })
    }

    const password = await hash('password123', 10)

    const users = [
        { email: 'doctor@demo.com', name: 'Dr. House', role: Role.DOCTOR, password },
        { email: 'admin@demo.com', name: 'Admin User', role: Role.ADMIN, password },
        { email: 'patient@demo.com', name: 'John Doe', role: Role.PATIENT, password },
    ]

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                ...user,
                // Create minimal profiles for testing
                patientProfile: user.role === Role.PATIENT ? {
                    create: {
                        dob: new Date('1990-01-01'),
                        gender: 'Male',
                        bloodGroup: 'O+',
                        address: '123 Main St',
                    }
                } : undefined,
                doctorProfile: user.role === Role.DOCTOR ? {
                    create: {
                        specialization: 'General Medicine',
                        hospital: 'General Hospital',
                        yearsOfExperience: 10,
                        licenseNumber: 'DOC12345'
                    }
                } : undefined
            },
        })
    }

    console.log('Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
