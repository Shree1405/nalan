"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
            return
        }
        if (status === "authenticated") {
            fetchProfile()
        }
    }, [status, router])

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile")
            if (res.ok) {
                const data = await res.json()
                const roleData = data.role === "PATIENT" ? data.patientProfile : data.doctorProfile

                // Format date for input
                let dob = ""
                if (roleData?.dob) {
                    dob = new Date(roleData.dob).toISOString().split('T')[0]
                }

                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    role: data.role,
                    ...roleData,
                    dob: dob || roleData?.dob // Use formatted dob or original if not date
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setMessage("Profile updated successfully")
                router.refresh()
            } else {
                setMessage("Failed to update profile")
            }
        } catch (e) {
            setMessage("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1">
                                <input type="text" disabled value={formData.email} className="block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm sm:text-sm p-2" />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1">
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {formData.role === "PATIENT" ? "Patient Details" : "Doctor Details"}
                        </h3>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            {formData.role === "PATIENT" && (
                                <>
                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <div className="mt-1">
                                            <input type="date" name="dob" value={formData.dob || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <div className="mt-1">
                                            <select name="gender" value={formData.gender || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                        <div className="mt-1">
                                            <input type="text" name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <div className="mt-1">
                                            <textarea name="address" rows={3} value={formData.address || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">Medical History</label>
                                        <div className="mt-1">
                                            <textarea name="medicalHistory" rows={4} value={formData.medicalHistory || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="Any existing conditions, allergies, etc." />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.role === "DOCTOR" && (
                                <>
                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Specialization</label>
                                        <div className="mt-1">
                                            <input type="text" name="specialization" value={formData.specialization || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">License Number</label>
                                        <div className="mt-1">
                                            <input type="text" name="licenseNumber" value={formData.licenseNumber || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                        <div className="mt-1">
                                            <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">Hospital / Clinic</label>
                                        <div className="mt-1">
                                            <input type="text" name="hospital" value={formData.hospital || ""} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                    {message && (
                        <div className={`mt-4 text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
