import { Router, type Request, type Response } from 'express';

const deeplinkRoutes = Router();

const IOS_STORE = 'https://apps.apple.com/us/app/distrax/id6753587746';
const ANDROID_STORE =
  'https://play.google.com/store/apps/details?id=com.toyosi_obayemi_distraction';

// Change if your iOS custom scheme is different
const IOS_SCHEME_PREFIX = 'distrax://party/';
const IOS_APP_ID = '6753587746';

deeplinkRoutes.get('/party/:code', (req: Request, res: Response) => {
  const { code } = req.params;

  const encodedCode = encodeURIComponent(code);
  const iosDeepLink = `${IOS_SCHEME_PREFIX}${encodedCode}`;

  const playFallback = encodeURIComponent(ANDROID_STORE);
  const androidIntent = `intent://party/${encodedCode}#Intent;scheme=https;package=com.toyosi_obayemi_distraction;S.browser_fallback_url=${playFallback};end`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="apple-itunes-app" content="app-id=${IOS_APP_ID}" />
  <title>Open Distrax</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:24px;text-align:center}
    .box{max-width:420px}
    .btn{display:inline-block;margin-top:14px;padding:12px 16px;border-radius:10px;border:1px solid #ddd;text-decoration:none}
    .muted{opacity:.7;font-size:14px;margin-top:8px}
  </style>
</head>
<body>
  <div class="box">
    <h2>Opening Distrax…</h2>
    <div class="muted">If nothing happens, you’ll be sent to the store.</div>
    <a class="btn" id="fallbackBtn" href="${IOS_STORE}">Get the app</a>
  </div>

<script>
(function () {
  var ua = navigator.userAgent || "";
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);

  var iosStore = ${JSON.stringify(IOS_STORE)};
  var androidStore = ${JSON.stringify(ANDROID_STORE)};
  var iosDeepLink = ${JSON.stringify(iosDeepLink)};
  var androidIntent = ${JSON.stringify(androidIntent)};

  var fallbackUrl = isAndroid ? androidStore : iosStore;

  var btn = document.getElementById("fallbackBtn");
  if (btn) btn.href = fallbackUrl;

  var redirected = false;
  var timer = null;

  function cancelRedirect() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) cancelRedirect();
  });
  window.addEventListener("pagehide", cancelRedirect);
  window.addEventListener("blur", cancelRedirect);

  function goToStore() {
    if (redirected) return;
    redirected = true;
    window.location.href = fallbackUrl;
  }

  function openApp() {
    timer = setTimeout(goToStore, 1200);

    if (isAndroid) {
      window.location.href = androidIntent;
      return;
    }

    if (isIOS) {
      window.location.href = iosDeepLink;
      return;
    }

    goToStore();
  }

  openApp();
})();
</script>
</body>
</html>`);
});

export default deeplinkRoutes;
