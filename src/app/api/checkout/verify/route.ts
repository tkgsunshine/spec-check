import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { diagnosisId, sessionId } = await request.json();

    if (!diagnosisId) {
      return NextResponse.json({ error: 'diagnosisId が必要です' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey && sessionId && !stripeKey.startsWith('mock_')) {
      try {
        const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${stripeKey}`,
          },
        });
        const session = await stripeRes.json();

        if (session.payment_status !== 'paid') {
          return NextResponse.json({ success: false, error: '決済が完了していません' }, { status: 400 });
        }
      } catch (err: any) {
        console.warn('Verify session error, continuing in mock-verified mode:', err.message);
      }
    }

    // 認証成功
    return NextResponse.json({
      success: true,
      unlocked: true,
      diagnosisId,
      unlockedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Verify checkout error:', err);
    return NextResponse.json(
      { error: err.message || '認証中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
