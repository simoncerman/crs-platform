import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: process.env.SMTP_SECURE === "true",
  ...(process.env.SMTP_USER && {
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }),
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  const from = process.env.MAIL_FROM || "noreply@crs.local";

  try {
    await transporter.sendMail({ from, to, subject, html });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

// -- E-mail šablony --

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Czech Rocket Society</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0e27;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e27;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Header -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:28px;padding-right:10px;vertical-align:middle;">&#128640;</td>
                  <td style="font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#f8f9fc;letter-spacing:1px;vertical-align:middle;">
                    Czech Rocket Society
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Card -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#1a1f3a;border-radius:12px;border:1px solid #2a3158;">
          <tr>
            <td style="padding:36px 32px;">
              ${content}
            </td>
          </tr>
        </table>
        <!-- Footer -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding-top:24px;border-top:1px solid #1a1f3a;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:#a8b2d1;line-height:20px;">
                    Czech Rocket Society
                    <br>
                    Tento e-mail byl odesl&aacute;n automaticky, neodpov&iacute;dejte na n&#283;j.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
  <tr>
    <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#64f4d2 0%,#4d9fff 100%);">
      <a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;font-weight:700;color:#0a0e27;text-decoration:none;letter-spacing:0.5px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

export function draftContinueEmail(continueLink: string): string {
  return emailLayout(`
    <h1 style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#f8f9fc;">
      Tvoje p&#345;ihl&aacute;&scaron;ka &#269;ek&aacute;
    </h1>
    <p style="margin:0 0 20px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#64f4d2;">
      Czech Rocket Society &ndash; n&aacute;bor nov&yacute;ch &#269;len&#367;
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#f8f9fc;line-height:24px;">
      Ahoj,
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      d&iacute;ky za tv&#367;j z&aacute;jem o Czech Rocket Society! Tvou p&#345;ihl&aacute;&scaron;ku jsme si ulo&#382;ili a m&#367;&#382;e&scaron; v n&iacute; kdykoliv pokra&#269;ovat.
    </p>
    ${emailButton(continueLink, "Pokra&#269;ovat v p&#345;ihl&aacute;&scaron;ce &#8594;")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
      <tr>
        <td style="padding:16px;background-color:#0f1328;border-radius:8px;border:1px solid #2a3158;">
          <p style="margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#a8b2d1;line-height:20px;">
            &#128161; Odkaz m&#367;&#382;e&scaron; pou&#382;&iacute;t kdykoliv &ndash; tv&#367;j postup z&#367;stane ulo&#382;en&yacute;. Sta&#269;&iacute; kliknout a pokra&#269;ovat tam, kde jsi p&#345;estal/a.
          </p>
        </td>
      </tr>
    </table>
  `);
}

export function interviewConfirmEmail(name: string, interviewDate: string): string {
  const safeName = escapeHtml(name);
  const safeDate = escapeHtml(interviewDate);
  return emailLayout(`
    <h1 style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#f8f9fc;">
      Pohovor potvrzen &#128197;
    </h1>
    <p style="margin:0 0 24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#64f4d2;">
      Czech Rocket Society &ndash; n&aacute;bor
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#f8f9fc;line-height:24px;">
      Ahoj ${safeName},
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      d&#283;kujeme za tvou p&#345;ihl&aacute;&scaron;ku do Czech Rocket Society! Potvrzujeme term&iacute;n tv&eacute;ho pohovoru:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="padding:20px;background-color:#0f1328;border-radius:8px;border:1px solid #2a3158;text-align:center;">
          <p style="margin:0 0 4px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#a8b2d1;text-transform:uppercase;letter-spacing:1px;">
            Term&iacute;n pohovoru
          </p>
          <p style="margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:20px;font-weight:700;color:#64f4d2;">
            ${safeDate}
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      Pohovor prob&iacute;h&aacute; online a trv&aacute; p&#345;ibli&#382;n&#283; 15&ndash;20 minut. P&#345;edstav&iacute;me ti spolek a jeho projekty, probereme tvou p&#345;ihl&aacute;&scaron;ku a bude&scaron; m&iacute;t prostor na dotazy.
    </p>
    <p style="margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      T&#283;&scaron;&iacute;me se na tebe!<br>
      <span style="color:#f8f9fc;">T&yacute;m Czech Rocket Society</span>
    </p>
  `);
}

export function submissionConfirmEmail(name: string): string {
  const safeName = escapeHtml(name);
  return emailLayout(`
    <h1 style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#f8f9fc;">
      P&#345;ihl&aacute;&scaron;ka &#250;sp&#283;&scaron;n&#283; odesl&aacute;na!
    </h1>
    <p style="margin:0 0 24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#64f4d2;">
      D&#283;kujeme za tv&#367;j z&aacute;jem
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#f8f9fc;line-height:24px;">
      Ahoj ${safeName},
    </p>
    <p style="margin:0 0 20px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      d&#283;kujeme za tvou p&#345;ihl&aacute;&scaron;ku do Czech Rocket Society. P&#345;ijali jsme ji a brzy se ti ozveme.
    </p>
    <!-- Steps -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr>
        <td style="padding:14px 16px;background-color:#0f1328;border-radius:8px 8px 0 0;border:1px solid #2a3158;border-bottom:none;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#64f4d2;border-radius:50%;text-align:center;vertical-align:middle;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;font-weight:700;color:#0a0e27;">1</td>
              <td style="padding-left:12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#f8f9fc;">P&#345;ihl&aacute;&scaron;ka p&#345;ijata &#10003;</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 16px;background-color:#0f1328;border-left:1px solid #2a3158;border-right:1px solid #2a3158;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#2a3158;border-radius:50%;text-align:center;vertical-align:middle;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;font-weight:700;color:#a8b2d1;">2</td>
              <td style="padding-left:12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#a8b2d1;">Kontrola p&#345;ihl&aacute;&scaron;ky</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 16px;background-color:#0f1328;border-radius:0 0 8px 8px;border:1px solid #2a3158;border-top:none;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#2a3158;border-radius:50%;text-align:center;vertical-align:middle;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;font-weight:700;color:#a8b2d1;">3</td>
              <td style="padding-left:12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#a8b2d1;">Ozv&#283;me se ti e-mailem</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!-- Interview booking -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td style="padding:16px;background-color:#0f1328;border-radius:8px;border:1px solid #2a3158;">
          <p style="margin:0 0 4px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;font-weight:700;color:#f8f9fc;">
            &#128197; Dal&scaron;&iacute; krok: Kr&aacute;tk&yacute; pohovor
          </p>
          <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#a8b2d1;line-height:20px;">
            R&aacute;di bychom s tebou probrali tvou p&#345;ihl&aacute;&scaron;ku na kr&aacute;tk&eacute;m online pohovoru. Rezervuj si term&iacute;n, kter&yacute; ti vyhovuje.
          </p>
          ${emailButton("https://calendar.app.google/8ar3USrCPxR7h1xd6", "Rezervovat term&iacute;n pohovoru &#8594;")}
        </td>
      </tr>
    </table>
  `);
}

export function adminNotifyEmail(name: string, email: string, adminUrl: string): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  return emailLayout(`
    <h1 style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#f8f9fc;">
      Nov&aacute; p&#345;ihl&aacute;&scaron;ka
    </h1>
    <p style="margin:0 0 24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#F3B600;">
      N&aacute;bor &ndash; nov&yacute; uchaze&#269;
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#0f1328;border-radius:8px;border:1px solid #2a3158;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#a8b2d1;">Jm&eacute;no</td>
              <td style="padding:4px 0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#f8f9fc;text-align:right;font-weight:600;">${safeName}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #2a3158;margin:0;"></td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#a8b2d1;">E-mail</td>
              <td style="padding:4px 0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#64f4d2;text-align:right;">
                <a href="mailto:${safeEmail}" style="color:#64f4d2;text-decoration:none;">${safeEmail}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${emailButton(adminUrl, "Zobrazit v administraci &#8594;")}
  `);
}

export function acceptedEmail(name: string): string {
  const safeName = escapeHtml(name);
  return emailLayout(`
    <h1 style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#f8f9fc;">
      Gratulujeme, ${safeName}! &#127881;
    </h1>
    <p style="margin:0 0 24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#64f4d2;">
      Tv&aacute; p&#345;ihl&aacute;&scaron;ka byla p&#345;ijata
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#f8f9fc;line-height:24px;">
      Ahoj ${safeName},
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      s radost&iacute; ti oznamujeme, &#382;e jsi byl/a p&#345;ijat/a do Czech Rocket Society! T&#283;&scaron;&iacute;me se na spolupr&aacute;ci.
    </p>
    <p style="margin:0 0 20px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      Abychom mohli dokon&#269;it tv&eacute; p&#345;ijet&iacute;, pot&#345;ebujeme od tebe je&scaron;t&#283; dv&#283; v&#283;ci:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:16px;background-color:#0f1328;border-radius:8px;border:1px solid #2a3158;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#f8f9fc;line-height:22px;">
                <strong style="color:#64f4d2;">1.</strong> Vyplnit a podepsat <strong>p&#345;ihl&aacute;&scaron;ku do spolku</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#f8f9fc;line-height:22px;">
                <strong style="color:#64f4d2;">2.</strong> Vyplnit a podepsat <strong>souhlas se zpracov&aacute;n&iacute;m osobn&iacute;ch &uacute;daj&#367; (GDPR)</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      Oba dokumenty najde&scaron; v p&#345;&iacute;loze tohoto e-mailu. Vypl&#328; je, podepi&scaron; a po&scaron;li zp&#283;t odpov&#283;d&iacute; na tento e-mail.
    </p>
    ${emailButton("https://czechrockets.com", "Nav&scaron;t&iacute;vit web CRS &#8594;")}
  `);
}

export function rejectedEmail(name: string, reason?: string): string {
  const safeName = escapeHtml(name);
  const reasonBlock = reason
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td style="padding:16px;background-color:#0f1328;border-radius:8px;border:1px solid #2a3158;">
            <p style="margin:0 0 4px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:#a8b2d1;text-transform:uppercase;letter-spacing:1px;">
              Zp&#283;tn&aacute; vazba
            </p>
            <p style="margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#f8f9fc;line-height:22px;">
              ${escapeHtml(reason)}
            </p>
          </td>
        </tr>
      </table>`
    : "";

  return emailLayout(`
    <h1 style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#f8f9fc;">
      D&#283;kujeme za tv&#367;j z&aacute;jem
    </h1>
    <p style="margin:0 0 24px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#F3B600;">
      V&yacute;sledek p&#345;ihl&aacute;&scaron;ky
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#f8f9fc;line-height:24px;">
      Ahoj ${safeName},
    </p>
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      d&#283;kujeme za tvou p&#345;ihl&aacute;&scaron;ku do Czech Rocket Society. Po pe&#269;liv&eacute;m zv&aacute;&#382;en&iacute; jsme se bohu&#382;el rozhodli tv&eacute; p&#345;ihl&aacute;&scaron;ce nevyhov&#283;t.
    </p>
    ${reasonBlock}
    <p style="margin:0 0 12px;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      Nev&#283;&scaron; hlavu! M&#367;&#382;e&scaron; n&aacute;s i nad&aacute;le sledovat na na&scaron;ich soci&aacute;ln&iacute;ch s&iacute;t&iacute;ch a podporovat n&aacute;s alespo&#328; nep&#345;&iacute;mo. Budeme r&aacute;di za ka&#382;d&eacute;ho fanou&scaron;ka.
    </p>
    <p style="margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#a8b2d1;line-height:24px;">
      P&#345;ejeme ti hodn&#283; &uacute;sp&#283;ch&#367;!<br>
      <span style="color:#f8f9fc;">T&yacute;m Czech Rocket Society</span>
    </p>
  `);
}
