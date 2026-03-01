import { Resend } from 'resend';

let resend: Resend | null = null;

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Resend:', error);
}

const ADMIN_EMAILS = ['anugawarrier@gmail.com', 'kariyapayal19@gmail.com', 'manalisuryavanshi666@gmail.com'];

export async function sendAuthorityVerificationEmail(authority: {
  fullName: string;
  email: string;
  department: string;
  designation: string;
  employeeId?: string;
  organizationRegion: string;
  organizationName: string;
  authorityLevel: number;
}) {
  if (!resend) {
    console.log('Resend not initialized, skipping email notification');
    return { success: false, error: 'Email service not initialized' };
  }

  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?tab=pending-authorities`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'SpeakUp <onboarding@resend.dev>',
      to: ADMIN_EMAILS,
      subject: `🔔 New Authority Registration - ${authority.fullName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Authority Registration</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Verification Required</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              A new user has registered as an <strong>Authority</strong> and requires your verification.
            </p>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">Applicant Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Full Name:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${authority.fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${authority.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Department:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px; text-transform: capitalize;">${authority.department}</td>
                </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Organization Region:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${authority.organizationRegion}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Organization Name:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${authority.organizationName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Designation:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${authority.designation}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Employee ID:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${authority.employeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Authority Level:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">Level ${authority.authorityLevel}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Review & Verify
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 20px;">
              Please verify this account to allow them to manage complaints in their department.
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from SpeakUp - College Grievance System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log('Authority verification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendAuthorityApprovalEmail(authority: {
  email: string;
  fullName: string;
  approved: boolean;
  reason?: string;
}) {
  if (!resend) {
    console.log('Resend not initialized, skipping email notification');
    return { success: false, error: 'Email service not initialized' };
  }

  const status = authority.approved ? 'Approved' : 'Rejected';
  const statusColor = authority.approved ? '#10b981' : '#ef4444';
  const statusIcon = authority.approved ? '✅' : '❌';

  try {
    const { data, error } = await resend.emails.send({
      from: 'SpeakUp <onboarding@resend.dev>',
      to: authority.email,
      subject: `${statusIcon} Your Authority Account Has Been ${status}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: ${statusColor}; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Account ${status}</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Dear <strong>${authority.fullName}</strong>,
            </p>
            
            ${authority.approved ? `
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Congratulations! Your authority account has been <strong style="color: #10b981;">approved</strong>. 
                You can now log in and start managing complaints assigned to your department.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Login Now
                </a>
              </div>
            ` : `
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Unfortunately, your authority account request has been <strong style="color: #ef4444;">rejected</strong>.
              </p>
              
              ${authority.reason ? `
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <p style="color: #991b1b; margin: 0; font-size: 14px;"><strong>Reason:</strong> ${authority.reason}</p>
                </div>
              ` : ''}
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                If you believe this was a mistake, please contact the administration.
              </p>
            `}
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            This is an automated message from SpeakUp - College Grievance System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
