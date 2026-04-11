const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding data...')

    const batches = [2020, 2021, 2022, 2023]
    const students = []

    for (const batch of batches) {
        for (let i = 1; i <= 5; i++) {
            students.push({
                name: `Alumni ${batch} - ${i}`,
                birthDate: new Date('2000-01-01'), // Default birth date for all mock students
                batch: batch,
                phone: `0812345678${i}`,
                email: `alumni${batch}_${i}@example.com`
            })
        }
    }

    for (const student of students) {
        await prisma.student.create({
            data: student,
        })
    }

    // Seed some questions
    const questions = [
        { question: "What is your current employment status?", type: "multiple_choice", options: "Employed,Self-employed,Unemployed,Continuing Study" },
        { question: "Where do you work/study?", type: "text" },
        { question: "How relevant was your education?", type: "rating" },
        { question: "Any suggestions for the curriculum?", type: "text" },
    ]

    await Promise.all(questions.map(q => prisma.surveyQuestion.create({ data: q })))

    console.log('Seeding finished.')
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
