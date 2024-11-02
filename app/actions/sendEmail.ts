import nodemailer from 'nodemailer';
import type { Question } from '@/app/types/quiz';

export const sendQuestionsToEmail = async (userEmail: string, questions: Question[]) => {
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
            text: formatToEmailBody(questions),
            html: `
                <h2>Quiz Questions and Answers</h2>
                <div style="white-space: pre-wrap;">${formatToEmailBody(questions)}</div>
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

const formatToEmailBody = (data: Question[]) => {
    // Return early if data is empty or invalid
    if (!Array.isArray(data) || data.length === 0) {
        return 'No data available';
    }

    // Map through each item and format it
    const formattedSections = data.map(item => {
        return `Topic: ${item.topic}
Question: ${item.question}
Answer: ${item.correctAnswer}`;
    });

    // Join all sections with separator
    return formattedSections.join('\n\n-------------------\n\n');
};