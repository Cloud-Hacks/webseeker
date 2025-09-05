import { Vonage } from '@vonage/server-sdk';
import { Channels, type SMSWorkflow } from '@vonage/verify2';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// Initialize Vonage client with API key and secret from environment variables
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY_PATH,
});

export async function POST(request: Request) {
    const { userId } = auth()
  
    if (!userId) redirect('/sign-in')
  try {
    const { phoneNumber } = await request.json();

    // Basic validation for phone number
    if (!phoneNumber) {
      return NextResponse.json(
        { message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    console.log(`Sending verification to: ${phoneNumber}`);

    // Explicitly define the workflow with the correct type from the SDK
    const workflow: SMSWorkflow[] = [
        {
          channel: Channels.SMS, // Use the Channels enum from the SDK
          to: phoneNumber,
          from: "Saan",
        },
    ];

    // Create a new verification request with Vonage Verify v2
    const resp = await vonage.verify2.newRequest({
      brand: "WebSeeker", // Replace with your application's name
      workflow: workflow,
    });

    console.log('Vonage response:', resp);

    // Send the request_id back to the client to use for verification
    return NextResponse.json(resp);

  } catch (err) {
    // Log the error for debugging
    console.error("Error sending verification:", err);

    // Send a generic error message to the client
    // Provide a clear error response to the client
    const errorDetails = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to send verification code', details: errorDetails }, { status: 500 });
  }
}