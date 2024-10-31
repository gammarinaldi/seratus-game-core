import nodemailer from 'nodemailer';

export const sendQuestionsToEmail = async (userEmail: string, questions: string) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_APP_PASSWORD // Use App Password from Gmail
            }
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: userEmail,
            subject: 'Seratus Quiz Questions Answers',
            text: questions,
            html: `
                <h2>Quiz Questions and Answers</h2>
                <div style="white-space: pre-wrap;">${questions}</div>
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: unknown) {
        console.error('Error sending email:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred' };
    }
};