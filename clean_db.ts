import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const questions = await prisma.surveyQuestion.findMany({
        include: { responses: { take: 3 } },
        orderBy: { order: 'asc' }
    })
    console.log('\n=== QUESTIONS IN DB ===')
    for (const q of questions) {
        console.log(`ID: ${q.id}`)
        console.log(`  Type: ${q.type}`)
        console.log(`  EN: ${q.questionEn}`)
        console.log(`  optionsEn: ${q.optionsEn}`)
        console.log(`  responses (${q.responses.length}):`, q.responses.map(r => r.answer))
        console.log('---')
    }
}
main().catch(console.error).finally(() => prisma.$disconnect())
