import nodemailer from 'nodemailer'

export async function getMailClient() {
  const account = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass
    }
  })

  return transporter
}

// import dotenv from 'dotenv'
// import nodemailer from 'nodemailer'

// dotenv.config()

// const googleAppUser = process.env.GOOGLE_APP_USER
// const googleAppPassword = process.env.GOOGLE_APP_PASSWORD

// export async function getMailClient() {
//   const transporter = nodemailer.createTransport({
//     service: 'plann.er',
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//       user: googleAppUser,
//       pass: googleAppPassword
//     }
//   })

//   return transporter
// }