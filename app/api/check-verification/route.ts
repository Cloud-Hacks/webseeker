import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Vonage } from '@vonage/server-sdk';

// Initialize Vonage client from environment variables
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY!,
  apiSecret: process.env.VONAGE_API_SECRET!,
  applicationId: process.env.VONAGE_APPLICATION_ID!,
  privateKey: process.env.VONAGE_PRIVATE_KEY_PATH!,
});

export async function POST(request: Request) {
  const { userId } = auth();

  // If no user, return a proper redirect Response for route handlers
  if (!userId) {
    // Use request.url to build an absolute URL for redirect
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    const { requestId, code } = await request.json();

    if (!requestId || !code) {
      return NextResponse.json(
        { message: 'Request ID and code are required.' },
        { status: 400 }
      );
    }

    console.log(`Checking code for request ID: ${requestId}`);

    // Vonage check — await the promise. If it throws, we'll catch below.
    await vonage.verify2.checkCode(requestId, code);

    console.log('Vonage check successful for request:', requestId);
    return NextResponse.json({ message: 'Verification successful!' });
  } catch (err: any) {
    console.error('Error checking verification:', err);

    let errorMessage = 'An error occurred during verification.';
    let statusCode = 500;

    if (
      err?.body?.title === 'The code you provided does not match the expected value.'
    ) {
      errorMessage = 'The code you provided is incorrect.';
      statusCode = 400;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
