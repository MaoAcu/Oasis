import smtplib
import os
import threading
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = None
        self.smtp_port = None
        self.sender_email = None 
        self.password = None
        self.sender_name = None

    def init_app(self, app):
        """Inicializa el servicio con variables de entorno"""
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587)) 
        self.sender_email = os.getenv("SMTP_USER")
        self.password = os.getenv("SMTP_PASSWORD")
        self.sender_name = os.getenv("SMTP_NAME", "Notificaciones OASIS")
        
        if not all([self.smtp_server, self.sender_email, self.password]):
            logger.error("  Faltan credenciales SMTP en variables de entorno")
        else:
            logger.info(f"  EmailService iniciado - Enviando como {self.sender_name}")

    def _send_smtp(self, to_email, subject, html_content, text_content=None):
        try:
            msg = MIMEMultipart('alternative')
            msg["From"] = f"{self.sender_name} <no-reply@logiclookcr.com>"
            msg["To"] = to_email
            msg["Subject"] = subject
            msg["Reply-To"] = "no-reply@logiclookcr.com"

            if text_content:
                msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10)
            server.starttls()
            server.login(self.sender_email, self.password)
            server.sendmail(
               "no-reply@logiclookcr.com",
                to_email,
                msg.as_string()
            )
            server.quit()

            logger.info(f"Correo enviado correctamente a {to_email}")
            return True

        except Exception as e:
            logger.error(f"Error SMTP Brevo: {e}")
            return False
    def SendVerificationCode(self, email, code, username=None):
     
        try:
          if not username:
            username = email.split('@')[0]
        
            subject = f"Código de Seguridad - {self.sender_name}"
        
       
            html = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;600&family=Dancing+Script:wght@400..700&display=swap');
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Montserrat', Helvetica, Arial, sans-serif; background-color: #0d0b0a; color: #eae0d0;">
            <table role="presentation" style="width: 100%; background: #0d0b0a; background-image: radial-gradient(circle at 30% 40%, rgba(212, 175, 55, 0.08) 0%, transparent 40%); padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table role="presentation" style="max-width: 600px; width: 100%; background: rgba(20, 18, 15, 0.95); backdrop-filter: blur(5px); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 2.5rem 1rem 2.5rem 1rem; overflow: hidden; box-shadow: 0 30px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(212, 175, 55, 0.2) inset;">
                            
                            <!-- Cabecera con logo tipográfico -->
                            <tr>
                                <td style="padding: 45px 30px 25px; text-align: center;">
                                    <div style="font-family: 'Dancing Script', cursive; font-size: 58px; color: #d4af37; text-shadow: 0 0 12px rgba(212, 175, 55, 0.6); letter-spacing: 2px; background: linear-gradient(145deg, #d4af37, #f9e076); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px black); line-height: 1;">Oasis</div>
                                    <div style="font-family: 'Cinzel', serif; font-size: 14px; letter-spacing: 8px; text-transform: uppercase; color: #d4af37; border-top: 1px dashed rgba(212,175,55,0.5); border-bottom: 1px dashed rgba(212,175,55,0.5); display: inline-block; padding: 8px 20px; margin-top: 5px;">RESTAURANTE & BAR</div>
                                </td>
                            </tr>
                            
                            <!-- Contenido principal -->
                            <tr>
                                <td style="padding: 0 40px 30px;">
                                    <h2 style="font-family: 'Cinzel', serif; font-size: 26px; color: #ffffff; text-align: center; margin-bottom: 25px; text-shadow: 0 2px 0 #00000055, 0 0 10px #d4af3740;">Verificación de Acceso</h2>
                                    
                                    <p style="font-size: 16px; color: #c0b49a; margin-bottom: 20px; border-left: 2px solid #d4af37; padding-left: 15px;">
                                        Estimado/a <strong style="color: #f5d48e;">{username}</strong>,
                                    </p>
                                    
                                    <p style="font-size: 15px; line-height: 1.7; color: #b7a87b;">
                                        Has solicitado un código de verificación para gestionar tu cuenta. Por motivos de seguridad, utiliza la siguiente clave única de acceso:
                                    </p>
                                    
                                    <!-- Bloque del código con estilo oasis -->
                                    <div style="margin: 40px 0; text-align: center; padding: 30px 20px; background: #1f1d18; border: 2px solid #3d382c; border-radius: 30px; box-shadow: 0 10px 0 #0a0907, 0 0 20px rgba(212,175,55,0.2);">
                                        <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #d4af37; margin-bottom: 15px; font-weight: bold;">✧ Tu clave de seguridad ✧</span>
                                        <div style="font-family: 'Courier New', monospace; font-size: 52px; font-weight: bold; color: #d4af37; letter-spacing: 15px; border: 1px dashed #d4af37; display: inline-block; padding: 15px 35px; border-radius: 20px; background: #0f0e0c; text-shadow: 0 0 10px #d4af3760;">
                                            {code}
                                        </div>
                                        <p style="font-size: 12px; color: #8b7f62; margin-top: 25px; border-top: 1px dashed #4d4333; padding-top: 15px;">⏳ Válido únicamente por los próximos 10 minutos</p>
                                    </div>

                                    <p style="font-size: 13px; color: #7b715a; text-align: center; padding: 0 10px; font-style: italic;">
                                        Si no has iniciado este proceso, te recomendamos ignorar este mensaje o contactar con nuestra administración.
                                    </p>
                                </td>
                            </tr>
                            
                            
                            <tr>
                                <td style="padding: 30px; background: #0a0907; text-align: center; border-top: 1px solid #4d4333;">
                                    <p style="margin: 0; color: #d4af37; font-family: 'Dancing Script', cursive; font-size: 24px; letter-spacing: 2px;">Bar Oasis</p>
                                    <p style="margin: 8px 0 0; color: #6b624e; font-size: 11px; line-height: 1.6; text-transform: uppercase; letter-spacing: 2px;">
                                        
                                        <span style="color: #d4af37;">✦</span> © 2026 Todos los derechos reservados <span style="color: #d4af37;">✦</span>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
            text = f"""
        BAR OASIS - Verificación de Acceso
        
        Hola {username},
        
        Tu código de seguridad es: {code}
        
        Este código expirará en 10 minutos.
        
        Si no solicitaste este código, por favor ignora este correo.
        
        ✦ Bar Oasis · Restaurante & Bar ✦
        """
        
            logger.info(f" Iniciando proceso de envío para {email} (estilo Oasis)")
            return self._send_smtp(email, subject, html, text)
        
        except Exception as e:
            logger.error(f"  Error preparando el paquete de envío para {email}: {e}")
            return False