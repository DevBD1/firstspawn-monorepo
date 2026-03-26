"""Email service using fastapi-mail."""

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

async def send_verification_email(email_to: str, raw_token: str, locale: str = "en") -> None:
    """Send a verification email with a magic link."""
    
    # Construct verification link (assumes frontend handles /activation/verify?token=...)
    link = f"{settings.FRONTEND_URL}/{locale}/activation?token={raw_token}"
    
    html_content = f"""
    <html>
        <body style="font-family: monospace; color: #333; line-height: 1.6;">
            <h2>Welcome to FirstSpawn!</h2>
            <p>Please confirm your email address by clicking the link below:</p>
            <p>
                <a href="{link}" style="background-color: #22d3ee; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border: 2px solid #000;">
                    Verify Email
                </a>
            </p>
            <p>Or paste this link into your browser: <br/> {link}</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject="FirstSpawn - Please verify your email",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html,
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)
