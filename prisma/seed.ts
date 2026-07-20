import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/uni_events",
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const categories = [
  { name: "Academic", slug: "academic", icon: "GraduationCap", color: "#3B82F6", sortOrder: 1 },
  { name: "Social", slug: "social", icon: "Users", color: "#EC4899", sortOrder: 2 },
  { name: "Sports", slug: "sports", icon: "Trophy", color: "#10B981", sortOrder: 3 },
  { name: "Cultural", slug: "cultural", icon: "Music", color: "#F59E0B", sortOrder: 4 },
  { name: "Career", slug: "career", icon: "Briefcase", color: "#6366F1", sortOrder: 5 },
  { name: "Workshop", slug: "workshop", icon: "Wrench", color: "#8B5CF6", sortOrder: 6 },
  { name: "Seminar", slug: "seminar", icon: "Presentation", color: "#06B6D4", sortOrder: 7 },
  { name: "Networking", slug: "networking", icon: "Handshake", color: "#F97316", sortOrder: 8 },
  { name: "Volunteering", slug: "volunteering", icon: "Heart", color: "#EF4444", sortOrder: 9 },
  { name: "Club", slug: "club", icon: "Flag", color: "#14B8A6", sortOrder: 10 },
  { name: "Tech", slug: "tech", icon: "Laptop", color: "#0EA5E9", sortOrder: 11 },
  { name: "Health & Wellness", slug: "health-wellness", icon: "HeartPulse", color: "#22C55E", sortOrder: 12 },
]

async function main() {
  console.log("Seeding database...")

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }
  console.log(`Created ${categories.length} categories`)

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@university.edu" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@university.edu",
      hashedPassword: adminPassword,
      role: "ADMIN",
      bio: "Platform administrator",
      department: "IT",
      onboardingCompletedAt: new Date(),
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // Create organizer user
  const organizerPassword = await bcrypt.hash("Organizer123!", 12)
  const organizer = await prisma.user.upsert({
    where: { email: "organizer@university.edu" },
    update: {},
    create: {
      name: "Event Organizer",
      email: "organizer@university.edu",
      hashedPassword: organizerPassword,
      role: "ORGANIZER",
      bio: "Student activities coordinator",
      department: "Student Affairs",
      onboardingCompletedAt: new Date(),
    },
  })
  console.log(`Created organizer user: ${organizer.email}`)

  // Create student user
  const studentPassword = await bcrypt.hash("Student123!", 12)
  const student = await prisma.user.upsert({
    where: { email: "student@university.edu" },
    update: {},
    create: {
      name: "John Student",
      email: "student@university.edu",
      hashedPassword: studentPassword,
      role: "STUDENT",
      bio: "Computer Science major",
      department: "Computer Science",
      year: 3,
      onboardingCompletedAt: new Date(),
    },
  })
  console.log(`Created student user: ${student.email}`)

  // Get category IDs
  const allCategories = await prisma.category.findMany()
  const getCategoryId = (slug: string) =>
    allCategories.find((c) => c.slug === slug)?.id || allCategories[0].id

  // Create sample events
  const events = [
    {
      title: "AI & Machine Learning Workshop",
      slug: "ai-ml-workshop",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
      description:
        "<p>Join us for a hands-on workshop on Artificial Intelligence and Machine Learning. This event is perfect for beginners and intermediate learners who want to explore the fundamentals of AI/ML.</p><h3>What you'll learn:</h3><ul><li>Introduction to Neural Networks</li><li>Hands-on with Python and TensorFlow</li><li>Building your first ML model</li><li>Best practices and career paths</li></ul><p>Bring your laptop with Python installed!</p>",
      summary: "Hands-on workshop on AI/ML fundamentals with Python and TensorFlow",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      venue: "Computer Science Building, Room 301",
      address: "123 University Ave",
      capacity: 50,
      isFree: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      categories: ["tech", "workshop", "academic"],
    },
    {
      title: "Annual Spring Cultural Festival",
      slug: "spring-cultural-festival",
      coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
      description:
        "<p>Experience the vibrant diversity of our campus at the Annual Spring Cultural Festival! Enjoy performances, food, music, and art from cultures around the world.</p><h3>Highlights:</h3><ul><li>Live performances from 15+ cultural groups</li><li>International food fair</li><li>Art exhibition</li><li>Interactive cultural workshops</li></ul>",
      summary: "A celebration of campus diversity with performances, food, and art",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      venue: "University Main Quad",
      address: "University Campus Center",
      capacity: 500,
      isFree: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      categories: ["cultural", "social"],
    },
    {
      title: "Career Fair 2026",
      slug: "career-fair-2026",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      description:
        "<p>Connect with top employers at our annual Career Fair. Over 100 companies will be on campus looking to hire talented students for internships and full-time positions.</p><h3>Participating Companies:</h3><ul><li>Tech giants and startups</li><li>Financial institutions</li><li>Healthcare organizations</li><li>Government agencies</li></ul><p>Bring your resume and dress professionally!</p>",
      summary: "Connect with 100+ employers for internships and full-time positions",
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      venue: "Student Center Ballroom",
      address: "456 Campus Drive",
      capacity: 1000,
      isFree: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      categories: ["career", "networking"],
    },
    {
      title: "Intramural Basketball Tournament",
      slug: "basketball-tournament",
      coverImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
      description:
        "<p>Sign up your team for the Intramural Basketball Tournament! Compete against other teams for the championship trophy and bragging rights.</p><h3>Details:</h3><ul><li>5v5 format</li><li>Double elimination bracket</li><li>Awards ceremony after finals</li></ul>",
      summary: "5v5 basketball tournament with double elimination bracket",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      venue: "University Gymnasium",
      address: "789 Sports Complex Rd",
      capacity: 200,
      isFree: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      categories: ["sports"],
    },
    {
      title: "Introduction to Web Development",
      slug: "intro-web-dev",
      coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
      description:
        "<p>Learn the basics of web development in this beginner-friendly seminar. Perfect for students from any major who want to build their first website.</p><h3>Topics covered:</h3><ul><li>HTML & CSS basics</li><li>JavaScript fundamentals</li><li>Building responsive layouts</li><li>Deploying your first site</li></ul>",
      summary: "Beginner-friendly seminar on HTML, CSS, and JavaScript",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      venue: "Library Multimedia Room",
      address: "101 Library Lane",
      capacity: 30,
      isFree: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      categories: ["tech", "seminar", "academic"],
    },
    {
      title: "Mental Health Awareness Week Kickoff",
      slug: "mental-health-awareness",
      coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
      description:
        "<p>Join us for the kickoff event of Mental Health Awareness Week. Learn about resources available on campus, hear from guest speakers, and participate in mindfulness activities.</p>",
      summary: "Resources, speakers, and mindfulness activities for mental health awareness",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      venue: "Wellness Center",
      address: "321 Health Blvd",
      isFree: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      categories: ["health-wellness", "social"],
    },
  ]

  for (const eventData of events) {
    const { categories: categorySlugs, ...data } = eventData
    const event = await prisma.event.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        organizerId: organizer.id,
        categories: {
          create: categorySlugs.map((slug) => ({
            categoryId: getCategoryId(slug),
          })),
        },
      },
    })
    console.log(`Created event: ${event.title}`)
  }

  // Create some registrations
  const allEvents = await prisma.event.findMany()
  for (const event of allEvents.slice(0, 3)) {
    await prisma.registration.upsert({
      where: {
        eventId_userId: { eventId: event.id, userId: student.id },
      },
      update: {},
      create: {
        eventId: event.id,
        userId: student.id,
        status: "CONFIRMED",
        qrCode: `qr-${event.id}-${student.id}`,
      },
    })
  }
  console.log("Created sample registrations")

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
