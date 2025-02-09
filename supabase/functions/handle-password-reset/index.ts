import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

      // Send email with OTP using raw email
      try {
        console.log('Attempting to send email...')
        const { error: emailError } = await supabaseClient.auth.admin.sendRawEmail({
          emails: [email],
          subject: 'رمز التحقق لإعادة تعيين كلمة المرور',
          html: `
            <html dir="rtl">
              <head>
                <meta charset="UTF-8">
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    text-align: right;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                  }
                  .otp-code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4F46E5;
                    margin: 20px 0;
                    text-align: center;
                    direction: ltr;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2>إعادة تعيين كلمة المرور</h2>
                  <p>مرحباً،</p>
                  <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
                  <p>رمز التحقق الخاص بك هو:</p>
                  <div class="otp-code">${otpCode}</div>
                  <p>هذا الرمز صالح لمدة 10 دقائق فقط.</p>
                  <p>إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
                  <p>مع أطيب التحيات،<br>فريق الدعم</p>
                </div>
              </body>
            </html>
          `
        })

        if (emailError) {
          console.error('Error sending email:', emailError)
          return new Response(
            JSON.stringify({ error: 'Failed to send OTP email', details: emailError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Email sent successfully')
        return new Response(
          JSON.stringify({ message: 'OTP sent successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (emailError) {
        console.error('Error in email sending:', emailError)
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
