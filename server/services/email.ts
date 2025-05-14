import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will be disabled.");
}

// Initialize mail service
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string | undefined;
  html?: string | undefined;
}

export const DEFAULT_FROM_EMAIL = 'notifications@resqlink.org';

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Email sending disabled: SENDGRID_API_KEY not set");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from || DEFAULT_FROM_EMAIL,
      subject: params.subject,
      text: params.text || "",
      html: params.html || "",
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  volunteerApproval: (volunteerName: string) => ({
    subject: 'ResQLink: Your Volunteer Application Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Welcome to the ResQLink Volunteer Team!</h2>
          <p>Hello ${volunteerName},</p>
          <p>We are pleased to inform you that your application to join ResQLink as a volunteer has been <strong>approved</strong>!</p>
          <p>You are now part of a dedicated community of individuals committed to helping others during crisis situations.</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Log in to your ResQLink account</li>
              <li>Update your availability status when you're ready to help</li>
              <li>Review the resources in your dashboard to familiarize yourself with protocols</li>
            </ol>
          </div>
          <p>Thank you for your dedication to helping those in need. Together, we can make a difference!</p>
          <p>Best regards,<br />The ResQLink Team</p>
          <a href="https://resqlink.org/login" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 150px;">Log In Now</a>
        </div>
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #777;">
          <p>© 2025 ResQLink. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Welcome to the ResQLink Volunteer Team!
    
Hello ${volunteerName},

We are pleased to inform you that your application to join ResQLink as a volunteer has been approved!

You are now part of a dedicated community of individuals committed to helping others during crisis situations.

Next Steps:
1. Log in to your ResQLink account
2. Update your availability status when you're ready to help
3. Review the resources in your dashboard to familiarize yourself with protocols

Thank you for your dedication to helping those in need. Together, we can make a difference!

Best regards,
The ResQLink Team`
  }),
  
  volunteerRejection: (volunteerName: string) => ({
    subject: 'ResQLink: Status Update on Your Volunteer Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Volunteer Application Update</h2>
          <p>Hello ${volunteerName},</p>
          <p>Thank you for your interest in volunteering with ResQLink.</p>
          <p>After careful review of your application, we regret to inform you that we are unable to proceed with your volunteer registration at this time.</p>
          <p>If you would like to discuss this further or receive feedback on your application, please contact our support team at support@resqlink.org.</p>
          <p>We encourage you to consider applying again in the future.</p>
          <p>Best regards,<br />The ResQLink Team</p>
        </div>
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #777;">
          <p>© 2025 ResQLink. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Volunteer Application Update

Hello ${volunteerName},

Thank you for your interest in volunteering with ResQLink.

After careful review of your application, we regret to inform you that we are unable to proceed with your volunteer registration at this time.

If you would like to discuss this further or receive feedback on your application, please contact our support team at support@resqlink.org.

We encourage you to consider applying again in the future.

Best regards,
The ResQLink Team`
  }),
  
  sosAlertNotification: (volunteerName: string, alertDetails: { location: string, description: string }) => ({
    subject: 'URGENT: SOS Alert in Your Area',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0; background-color: #fff8f8;">
          <h2 style="color: #d9534f;">⚠️ URGENT: SOS Alert in Your Area</h2>
          <p>Hello ${volunteerName},</p>
          <p>A citizen in your area needs immediate assistance:</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #d9534f;">
            <p><strong>Location:</strong> ${alertDetails.location}</p>
            <p><strong>Description:</strong> ${alertDetails.description}</p>
          </div>
          <p>Please log in to the ResQLink platform immediately to view details and respond if you're available.</p>
          <a href="https://resqlink.org/volunteer/dashboard" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 4px; width: 200px;">Respond Now</a>
          <p>Your quick response could save lives.</p>
          <p>Thank you for your dedication,<br />The ResQLink Team</p>
        </div>
      </div>
    `,
    text: `⚠️ URGENT: SOS Alert in Your Area

Hello ${volunteerName},

A citizen in your area needs immediate assistance:

Location: ${alertDetails.location}
Description: ${alertDetails.description}

Please log in to the ResQLink platform immediately to view details and respond if you're available.

Your quick response could save lives.

Thank you for your dedication,
The ResQLink Team`
  }),
  
  certificateGenerated: (volunteerName: string, certificateLink: string) => ({
    subject: 'ResQLink: Your Achievement Certificate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Your Certificate of Achievement</h2>
          <p>Hello ${volunteerName},</p>
          <p>Congratulations on completing 10 successful rescue missions with ResQLink!</p>
          <p>Your dedication and commitment to helping others during crisis situations has been truly outstanding.</p>
          <p>We are pleased to award you with a Certificate of Achievement recognizing your valuable contributions to the community.</p>
          <a href="${certificateLink}" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 200px;">View Your Certificate</a>
          <p>Thank you for your exceptional service!</p>
          <p>Best regards,<br />The ResQLink Team</p>
        </div>
      </div>
    `,
    text: `Your Certificate of Achievement

Hello ${volunteerName},

Congratulations on completing 10 successful rescue missions with ResQLink!

Your dedication and commitment to helping others during crisis situations has been truly outstanding.

We are pleased to award you with a Certificate of Achievement recognizing your valuable contributions to the community.

You can view and download your certificate here: ${certificateLink}

Thank you for your exceptional service!

Best regards,
The ResQLink Team`
  }),
  
  broadcastMessage: (userName: string, title: string, message: string) => ({
    subject: `ResQLink Broadcast: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>${title}</h2>
          <p>Hello ${userName},</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p>${message}</p>
          </div>
          <p>Stay safe and thank you for being part of ResQLink.</p>
          <p>Best regards,<br />The ResQLink Team</p>
          <a href="https://resqlink.org/dashboard" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 200px;">Go to Dashboard</a>
        </div>
      </div>
    `,
    text: `${title}

Hello ${userName},

${message}

Stay safe and thank you for being part of ResQLink.

Best regards,
The ResQLink Team`
  }),
  
  pointsAwarded: (volunteerName: string, pointsAwarded: number, totalPoints: number, badge: string) => ({
    subject: 'ResQLink: Points Awarded for Your Service',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="https://resqlink.org/logo.png" alt="ResQLink Logo" style="width: 150px;" />
        </div>
        <div style="padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
          <h2>Points Awarded for Your Service!</h2>
          <p>Hello ${volunteerName},</p>
          <p>Congratulations! You've been awarded <strong>${pointsAwarded} points</strong> for your recent assistance during an emergency.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <h3 style="margin-top: 0; color: #4CAF50;">Your Volunteer Status</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${totalPoints} Total Points</p>
            <div style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px; display: inline-block; margin-top: 10px;">
              <p style="margin: 0; font-weight: bold;">Current Badge: ${badge}</p>
            </div>
          </div>
          
          <p>Your dedication to helping those in need is invaluable. These points reflect the impact you're making in your community.</p>
          <p>Continue responding to alerts and completing missions to earn more points and unlock higher badges!</p>
          <p>Thank you for your service,<br />The ResQLink Team</p>
          <a href="https://resqlink.org/volunteer/dashboard" style="display: block; text-align: center; margin: 30px auto; padding: 10px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; width: 200px;">View Your Dashboard</a>
        </div>
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #777;">
          <p>© 2025 ResQLink. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Points Awarded for Your Service!

Hello ${volunteerName},

Congratulations! You've been awarded ${pointsAwarded} points for your recent assistance during an emergency.

Your Volunteer Status
Total Points: ${totalPoints}
Current Badge: ${badge}

Your dedication to helping those in need is invaluable. These points reflect the impact you're making in your community.

Continue responding to alerts and completing missions to earn more points and unlock higher badges!

Thank you for your service,
The ResQLink Team`
  })
};