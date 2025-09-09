import React from "react";

const CricketMatchesWidget = () => {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="referrer" content="no-referrer" />
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #000000; }
      .container { width: 100%; display: block; }
      /* attempt neutralize vendor defaults */
      a { color: #000000; }
      .tab, .header, .footer { background: #ffffff !important; color: #000000 !important; }
      .active { background: #000000 !important; color: #ffffff !important; }
      .border, .box { border-color: #000000 !important; }
    </style>
  </head>
  <body>
    <div class="container">
      <div id="cdorg-matchlist-widget"></div>
    </div>
    <script src="https://cdorgapi.b-cdn.net/widgets/matchlist.js" async></script>
  </body>
</html>`;

  return (
    <div style={{ width: "100%", margin: 0 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          /* Responsive height: taller on large screens, extra spacing on very small screens */
          height: "clamp(420px, 80vh, 720px)",
        }}
      >
        <iframe
          title="Cricket Matches"
          srcDoc={html}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
          // Tightened sandbox: remove allow-same-origin to isolate iframe context from parent
          sandbox="allow-scripts allow-popups allow-top-navigation-by-user-activation"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default CricketMatchesWidget;


