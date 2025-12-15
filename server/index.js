import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient, PaymentStatus } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()
const app = express()
const port = process.env.PORT || 4000
const jwtSecret = process.env.JWT_SECRET || 'loan-app-secret'

app.use(cors())
app.use(express.json())

const DEFAULT_LOAN = {
  principal: 20000,
  monthlyPayment: 330,
  totalMonths: 60,
}

async function ensureLoan() {
  let loan = await prisma.loan.findFirst({ include: { payments: true } })
  if (!loan) {
    loan = await prisma.loan.create({
      data: {
        principal: DEFAULT_LOAN.principal,
        monthlyPayment: DEFAULT_LOAN.monthlyPayment,
        totalMonths: DEFAULT_LOAN.totalMonths,
        startDate: new Date(),
        payments: {
          create: Array.from({ length: DEFAULT_LOAN.totalMonths }).map((_, index) => ({
            month: index + 1,
            amount: DEFAULT_LOAN.monthlyPayment,
            status: PaymentStatus.UNPAID,
          })),
        },
      },
      include: { payments: true },
    })
  } else if (loan.payments.length < DEFAULT_LOAN.totalMonths) {
    const existingMonths = new Set(loan.payments.map((p) => p.month))
    const missingMonths = Array.from({ length: DEFAULT_LOAN.totalMonths })
      .map((_, idx) => idx + 1)
      .filter((month) => !existingMonths.has(month))

    if (missingMonths.length) {
      await prisma.payment.createMany({
        data: missingMonths.map((month) => ({
          month,
          amount: DEFAULT_LOAN.monthlyPayment,
          loanId: loan.id,
          status: PaymentStatus.UNPAID,
        })),
      })
    }
    loan = await prisma.loan.findUnique({ where: { id: loan.id }, include: { payments: true } })
  }
  return loan
}

async function ensureUsers() {
  const users = [
    { username: 'Gilbert', password: 'BMW123' },
    { username: 'Christian', password: 'BMW123' },
    { username: 'Frank', password: 'BMW123' },
    { username: 'Jasper', password: 'BMW123' },
    { username: 'Guest', password: 'BMW123' },
  ]

  await Promise.all(
    users.map(async (user) => {
      const existing = await prisma.user.findUnique({ where: { username: user.username } })
      if (!existing) {
        const passwordHash = await bcrypt.hash(user.password, 10)
        await prisma.user.create({ data: { username: user.username, passwordHash } })
      }
    })
  )
}

async function bootstrap() {
  await ensureUsers()
  await ensureLoan()
}

function mapLoanResponse(loan) {
  const paidPayments = loan.payments.filter((p) => p.status === PaymentStatus.PAID)
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const outstanding = Math.max(loan.principal - totalPaid, 0)
  const percentPaid = (totalPaid / loan.principal) * 100
  return {
    id: loan.id,
    principal: loan.principal,
    monthlyPayment: loan.monthlyPayment,
    totalMonths: loan.totalMonths,
    startDate: loan.startDate,
    totalPaid,
    outstanding,
    percentPaid,
    paidMonths: paidPayments.length,
    remainingMonths: loan.totalMonths - paidPayments.length,
  }
}

function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header) {
    return res.status(401).json({ message: 'Authenticatie vereist' })
  }

  const token = header.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, jwtSecret)
    req.userId = payload.id
    req.username = payload.username
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Ongeldig of verlopen token' })
  }
}

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Gebruikersnaam en wachtwoord vereist' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return res.status(401).json({ message: 'Ongeldige login' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Ongeldige login' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '12h' })
    return res.json({ token, username: user.username })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Kon niet inloggen' })
  }
})

app.get('/loan', authenticate, async (_req, res) => {
  try {
    const loan = await ensureLoan()
    return res.json(mapLoanResponse(loan))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Kon lening niet ophalen' })
  }
})

app.get('/payments', authenticate, async (_req, res) => {
  try {
    const loan = await ensureLoan()
    const payments = await prisma.payment.findMany({ where: { loanId: loan.id }, orderBy: { month: 'asc' } })
    return res.json(payments)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Kon betalingen niet ophalen' })
  }
})

app.post('/payments/:month', authenticate, async (req, res) => {
  const month = Number(req.params.month)
  const { status, paidAt, note } = req.body

  if (req.username !== 'Jasper') {
    return res.status(403).json({ message: 'Alleen Jasper mag betalingen aanpassen' })
  }

  if (!['PAID', 'UNPAID'].includes(status)) {
    return res.status(400).json({ message: 'Status moet PAID of UNPAID zijn' })
  }

  try {
    const loan = await ensureLoan()
    if (month < 1 || month > loan.totalMonths) {
      return res.status(400).json({ message: 'Maand valt buiten de looptijd van de lening' })
    }

    const payment = await prisma.payment.upsert({
      where: { loanId_month: { loanId: loan.id, month } },
      create: {
        month,
        amount: loan.monthlyPayment,
        status,
        paidAt: status === 'PAID' ? new Date(paidAt || new Date()) : null,
        note,
        loanId: loan.id,
      },
      update: {
        status,
        paidAt: status === 'PAID' ? new Date(paidAt || new Date()) : null,
        note,
      },
    })

    return res.json(payment)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Kon betaling niet bijwerken' })
  }
})

app.get('/', (_req, res) => {
  res.send('Loan API draait. Gebruik /loan en /payments')
})

bootstrap()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Kon initiële data niet klaarzetten', error)
    process.exit(1)
  })
