import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { host, port, user, pass, fromEmail, toEmail } = body;

        if (!host || !port || !user || !pass || !fromEmail || !toEmail) {
            return NextResponse.json(
                { error: 'Missing required SMTP configuration fields.' },
                { status: 400 }
            );
        }

        console.log('--- SMTP TEST ATTEMPT ---');
        console.log('Host:', host);
        console.log('Port:', port);
        console.log('User:', user);
        console.log('Pass Length:', pass ? pass.length : 0);
        console.log('Secure:', Number(port) === 465);
        console.log('-------------------------');

        const transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
            },
            debug: true, // show debug output
            logger: true // log information in console
        });

        // Verify connection configuration
        await transporter.verify();

        // Send test email
        await transporter.sendMail({
            from: fromEmail,
            to: toEmail,
            subject: 'Test Email from Marom Admin',
            text: 'This is a test email to verify your SMTP configuration.',
            html: '<p>This is a test email to verify your <strong>SMTP configuration</strong>.</p>',
        });

        return NextResponse.json({ success: true, message: 'Test email sent successfully!' });

    } catch (error: any) {
        console.error('SMTP Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send test email.' },
            { status: 500 }
        );
    }
}
