
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, action, otp, newPassword }: RequestBody = await req.json()

    if (action === 'send') {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Get user from auth system
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email)

      console.log('User lookup result:', { userData, userError })

      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Store OTP in database
      const { error: otpError } = await supabaseClient
        .from('password_reset_otps')
        .insert({
          user_id: userData.user.id,
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

      // Send email with OTP
      const { error: emailError } = await supabaseClient.auth.admin.sendEmail(
        email,
        {
          subject: 'Reset Your Password',
          template: 'RESET_PASSWORD',
          data: {
            otp: otpCode,
          },
        }
      )

      if (emailError) {
        console.error('Error sending email:', emailError)
        return new Response(
          JSON.stringify({ error: 'Failed to send OTP email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'OTP sent successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify') {
      if (!otp) {
        return new Response(
          JSON.stringify({ error: 'OTP is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify OTP
      const { data: otpData, error: otpError } = await supabaseClient
        .from('password_reset_otps')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otp)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (otpError || !otpData) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired OTP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Mark OTP as used
      await supabaseClient
        .from('password_reset_otps')
        .update({ is_used: true })
        .eq('id', otpData.id)

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

      // Get user from auth system
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email)

      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update password
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userData.user.id,
        { password: newPassword }
      )

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
