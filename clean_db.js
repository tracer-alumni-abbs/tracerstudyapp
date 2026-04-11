const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "file:./dev.db"
        }
    }
})

async function main() {
    await prisma.surveyResponse.deleteMany()
    await prisma.jobHistory.deleteMany()
    await prisma.student.deleteMany()
    await prisma.surveyQuestion.deleteMany()
    console.log('Database cleared.')
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
