
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string;
  action: 'send' | 'verify' | 'reset';
  otp?: string;
  newPassword?: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, action, otp, newPassword }: RequestBody = await req.json()
    console.log('Received request with action:', action, 'and email:', email)

    if (action === 'send') {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      console.log('Generated OTP:', otpCode)
      
      // Get user from auth system
      const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers({
        filter: `email.eq.${email}`
      })
      
      console.log('User lookup result:', { users, userError })

      if (userError || !users || users.length === 0) {
        console.error('User not found:', userError)
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const user = users[0]

      // Store OTP in database
      const { error: otpError } = await supabaseClient
        .from('password_reset_otps')
        .insert({
          user_id: user.id,
          email,
          otp_code: otpCode,
        })

      if (otpError) {
        console.error('Error storing OTP:', otpError)
        return new Response(
          JSON.stringify({ error: 'Failed to generate OTP' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        console.log('Attempting to send email with Resend...')
        const emailResponse = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'رمز التحقق لإعادة تعيين كلمة المرور',
          html: `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9fafb;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 30px;
                  }
                  .title {
                    color: #1f2937;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                  }
                  .subtitle {
                    color: #6b7280;
                    font-size: 16px;
                    margin-bottom: 30px;
                  }
                  .otp-container {
                    background-color: #f3f4f6;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: center;
                  }
                  .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #4f46e5;
                    letter-spacing: 4px;
                    font-family: monospace;
                    direction: ltr;
                    display: inline-block;
                  }
                  .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #6b7280;
                    font-size: 14px;
                  }
                  .warning {
                    color: #dc2626;
                    font-size: 14px;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 class="title">إعادة تعيين كلمة المرور</h1>
                    <p class="subtitle">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك</p>
                  </div>
                  
                  <div style="text-align: right;">
                    <p>مرحباً،</p>
                    <p>لإعادة تعيين كلمة المرور الخاصة بك، يرجى استخدام رمز التحقق التالي:</p>
                  </div>

                  <div class="otp-container">
                    <div class="otp-code">${otpCode}</div>
                    <p style="margin-top: 10px; color: #4b5563;">هذا الرمز صالح لمدة 10 دقائق فقط</p>
                  </div>

                  <div style="text-align: right;">
                    <p>إذا لم تقم بطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
                    <p class="warning">لا تشارك رمز التحقق هذا مع أي شخص.</p>
                  </div>

                  <div class="footer">
                    <p>مع أطيب التحيات،<br>فريق الدعم</p>
                  </div>
                </div>
              </body>
            </html>
          `
        });

        console.log('Email sent successfully with Resend:', emailResponse)
        return new Response(
          JSON.stringify({ message: 'OTP sent successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (emailError) {
        console.error('Error sending email with Resend:', emailError)
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: emailError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (action === 'verify') {
      if (!otp) {
        return new Response(
          JSON.stringify({ error: 'OTP is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Verifying OTP:', otp, 'for email:', email)

      // Verify OTP
      const { data: otpData, error: otpError } = await supabaseClient
        .from('password_reset_otps')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otp)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single()

      console.log('OTP verification result:', { otpData, otpError })

      if (otpError || !otpData) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired OTP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Mark OTP as used
      const { error: updateError } = await supabaseClient
        .from('password_reset_otps')
        .update({ is_used: true })
        .eq('id', otpData.id)

      if (updateError) {
        console.error('Error marking OTP as used:', updateError)
      }

      return new Response(
        JSON.stringify({ message: 'OTP verified successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'reset') {
      if (!newPassword) {
        return new Response(
          JSON.stringify({ error: 'New password is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Resetting password for email:', email)

      // Get user from auth system
      const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers({
        filter: `email.eq.${email}`
      })

      if (userError || !users || users.length === 0) {
        console.error('User not found:', userError)
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const user = users[0]

      // Update password
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      )

      if (updateError) {
        console.error('Error updating password:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update password', details: updateError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Password updated successfully')
      return new Response(
        JSON.stringify({ message: 'Password updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

