import logging

logger = logging.getLogger(__name__)

async def send_email(email_to: str, subject: str, body: str):
    """
    Mock email delivery system.
    In production, this would integrate with AWS SES, SendGrid, or Mailgun.
    """
    # Mask PII: user@example.com -> u***@example.com
    try:
        user_part, domain = email_to.split("@")
        masked_email = f"{user_part[0]}***@{domain}"
    except Exception:
        masked_email = "***@***"
        
    logger.info(f"[MOCK EMAIL] To: {masked_email} | Subject: {subject}")
    logger.debug(f"[MOCK EMAIL] Body: {body}")
    return True

async def notify_task_completion(email: str, task_id: str, status: str):
    subject = f"Ingestion Task {task_id} Completed"
    body = f"Your ingestion mandate {task_id} has concluded with status: {status}."
    await send_email(email, subject, body)
