import nodemailer from 'nodemailer'

import { env } from '../env'

// export async function getMailClient() {
//   const account = await nodemailer.createTestAccount()

//   const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     auth: {
//       user: account.user,
//       pass: account.pass,
//     },
//   })

//   return transporter
// }

const googleAppUser = env.GOOGLE_APP_USER
const googleAppPassword = env.GOOGLE_APP_PASSWORD

export async function getMailClient() {
  const transporter = nodemailer.createTransport({
    service: 'plann.er',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: googleAppUser,
      pass: googleAppPassword,
    },
  })

  return transporter
}
