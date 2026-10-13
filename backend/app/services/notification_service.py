"""
Notification service: email alerts via aiosmtplib.

All sends are no-ops when SMTP is not configured (smtp_enabled = False),
so the app runs silently in dev without credentials.
"""

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.config import settings
from app.models.incident import Incident
from app.models.monitor import Monitor

log = logging.getLogger(__name__)


async def _send_email(to: str, subject: str, body_html: str) -> None:
    """Low-level SMTP send. No-op when SMTP is not configured."""
    if not settings.smtp_enabled:
        log.debug("SMTP not configured — skipping email to %s: %s", to, subject)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.email_from
    msg["To"] = to
    msg.attach(MIMEText(body_html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            start_tls=True,
        )
        log.info("Email sent to %s: %s", to, subject)
    except Exception as exc:  # noqa: BLE001
        # Never crash the check job because of a notification failure
        log.error("Failed to send email to %s: %s", to, exc)


async def send_downtime_alert(
    monitor: Monitor,
    incident: Incident,
    user_email: str,
) -> None:
    """Send an alert email when a monitor goes down."""
    subject = f"🔴 [{monitor.name}] is DOWN"
    body = f"""
    <h2 style="color:#dc2626">Monitor Down: {monitor.name}</h2>
    <p><strong>URL:</strong> {monitor.url}</p>
    <p><strong>Incident:</strong> {incident.title}</p>
    <p><strong>Started at:</strong> {incident.started_at.strftime("%Y-%m-%d %H:%M UTC")}</p>
    <p>We are investigating the issue. You will receive another email when the monitor recovers.</p>
    <hr>
    <p style="color:#6b7280;font-size:12px">StatusPing — uptime monitoring</p>
    """
    await _send_email(user_email, subject, body)


async def send_recovery_alert(
    monitor: Monitor,
    incident: Incident,
    user_email: str,
) -> None:
    """Send a recovery email when a monitor comes back up."""
    subject = f"🟢 [{monitor.name}] has RECOVERED"
    duration = ""
    if incident.resolved_at and incident.started_at:
        delta = incident.resolved_at - incident.started_at
        minutes = int(delta.total_seconds() // 60)
        duration = f"<p><strong>Downtime duration:</strong> {minutes} minutes</p>"

    body = f"""
    <h2 style="color:#16a34a">Monitor Recovered: {monitor.name}</h2>
    <p><strong>URL:</strong> {monitor.url}</p>
    <p><strong>Incident:</strong> {incident.title}</p>
    {duration}
    <p>The monitor is back to normal.</p>
    <hr>
    <p style="color:#6b7280;font-size:12px">StatusPing — uptime monitoring</p>
    """
    await _send_email(user_email, subject, body)
