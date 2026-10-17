from django.http import HttpRequest, HttpResponse
from django.urls import reverse
from django.views.decorators.http import require_http_methods

HOME_PAGE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SuxonaShop API</title>
  <style>
    :root {
      color-scheme: dark;
      --ink: #f4f7f2;
      --muted: #aeb9b0;
      --line: rgba(255, 255, 255, .14);
      --panel: rgba(18, 31, 25, .78);
      --accent: #8ee36a;
      --accent-ink: #10210f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      background:
        radial-gradient(circle at 15% 15%, rgba(142, 227, 106, .18), transparent 28rem),
        radial-gradient(circle at 85% 85%, rgba(62, 126, 97, .20), transparent 30rem),
        #0b1510;
      font-family: Georgia, "Times New Roman", serif;
    }
    main {
      width: min(1120px, calc(100% - 40px));
      min-height: 100vh;
      margin: 0 auto;
      display: grid;
      align-items: center;
      padding: 56px 0;
    }
    .shell {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(23, 40, 31, .9), var(--panel));
      box-shadow: 0 28px 100px rgba(0, 0, 0, .32);
    }
    .hero { padding: clamp(32px, 7vw, 84px); }
    .eyebrow {
      margin: 0 0 22px;
      color: var(--accent);
      font: 700 12px/1.2 Arial, sans-serif;
      letter-spacing: .16em;
      text-transform: uppercase;
    }
    h1 {
      max-width: 700px;
      margin: 0;
      font-size: clamp(48px, 9vw, 108px);
      line-height: .9;
      letter-spacing: -.045em;
      font-weight: 500;
    }
    .intro {
      max-width: 570px;
      margin: 28px 0 42px;
      color: var(--muted);
      font: 17px/1.65 Arial, sans-serif;
    }
    .links { display: flex; flex-wrap: wrap; gap: 12px; }
    a {
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      padding: 0 20px;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--ink);
      font: 700 14px/1 Arial, sans-serif;
      text-decoration: none;
      transition: transform .2s ease, background .2s ease, color .2s ease;
    }
    a.primary { border-color: var(--accent); background: var(--accent); color: var(--accent-ink); }
    a:hover { transform: translateY(-2px); background: rgba(255, 255, 255, .10); }
    a.primary:hover { background: #b0f68f; }
    footer {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding: 20px clamp(32px, 7vw, 84px);
      border-top: 1px solid var(--line);
      color: var(--muted);
      font: 12px/1.4 Arial, sans-serif;
    }
    @media (max-width: 600px) {
      main { width: min(100% - 24px, 1120px); padding: 12px 0; }
      .shell { border-radius: 20px; }
      .intro { font-size: 15px; }
      footer { display: block; }
      footer span { display: block; margin-top: 6px; }
    }
  </style>
</head>
<body>
  <main>
    <section class="shell" aria-label="SuxonaShop API home">
      <div class="hero">
        <p class="eyebrow">Local marketplace platform</p>
        <h1>SuxonaShop<br>API</h1>
        <p class="intro">A clean backend gateway for local commerce, stores, products, carts, orders, and delivery.</p>
        <nav class="links" aria-label="Developer links">
          <a class="primary" href="{swagger_url}">Open Swagger UI</a>
          <a href="{admin_url}">Open Admin Panel</a>
        </nav>
      </div>
      <footer>
        <span>REST API v1</span>
        <span>JWT authentication enabled</span>
      </footer>
    </section>
  </main>
</body>
</html>"""


@require_http_methods(["GET", "HEAD"])
def home(request: HttpRequest) -> HttpResponse:
    content = HOME_PAGE.replace(
        "{swagger_url}", reverse("swagger-ui")
    ).replace("{admin_url}", reverse("admin:index"))
    if request.method == "HEAD":
        return HttpResponse(
            status=200,
            content_type="text/html; charset=utf-8",
        )
    return HttpResponse(content, content_type="text/html; charset=utf-8")
