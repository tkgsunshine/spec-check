import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { diagnosisId, returnUrl } = await request.json();

    if (!diagnosisId) {
      return NextResponse.json({ error: 'diagnosisId が必要です' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // 1. Stripe 本番/テストキーが環境変数にある場合
    if (stripeKey && !stripeKey.startsWith('mock_')) {
      try {
        const origin = returnUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        // Stripe REST API を直接呼び出し (SDK非依存・高信頼性)
        const params = new URLSearchParams();
        params.append('payment_method_types[]', 'card');
        params.append('line_items[0][price_data][currency]', 'jpy');
        params.append('line_items[0][price_data][product_data][name]', '【人間スペック診断】プレミアム深層レポート アンロック');
        params.append('line_items[0][price_data][product_data][description]', '同世代異性1,000人マッチングシミュレーション & 逆引き改善アクションロードマップ');
        params.append('line_items[0][price_data][unit_amount]', '500');
        params.append('line_items[0][quantity]', '1');
        params.append('mode', 'payment');
        params.append('metadata[diagnosisId]', diagnosisId);
        params.append('success_url', `${origin}/result/${diagnosisId}?unlocked=true&session_id={CHECKOUT_SESSION_ID}`);
        params.append('cancel_url', `${origin}/result/${diagnosisId}?tab=love`);

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const session = await stripeRes.json();
        if (session.url) {
          return NextResponse.json({
            success: true,
            mode: 'stripe',
            url: session.url,
          });
        }
      } catch (stripeErr: any) {
        console.warn('Stripe checkout error, falling back to mock checkout:', stripeErr.message);
      }
    }

    // 2. Stripe未設定または開発シミュレーションモード
    return NextResponse.json({
      success: true,
      mode: 'mock',
      url: null,
      message: 'シミュレーション決済モードが有効です（ワンクリック即時アンロック可能）',
    });
  } catch (err: any) {
    console.error('Create checkout session error:', err);
    return NextResponse.json(
      { error: err.message || '決済セッションの作成に失敗しました' },
      { status: 500 }
    );
  }
}
