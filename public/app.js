// tooljar IP: small helpers that run in the browser. The page works without them;
// they add the copy buttons, the other IP version, the hostname and the VPN checks.
(() => {
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
  const IPV6 = /^[0-9a-f:]+$/i;

  async function getText(url, ms = 4000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      return res.ok ? (await res.text()).trim() : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  // Copy buttons: <button data-copy="text to copy">
  for (const button of $$("[data-copy]")) {
    button.addEventListener("click", async () => {
      const label = button.textContent;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copied!";
      } catch {
        button.textContent = "Copy failed";
      }
      setTimeout(() => {
        button.textContent = label;
      }, 1600);
    });
  }

  // The other IP version. The server only sees the one you connected with, so the browser
  // asks Cloudflare's icanhazip on an IPv4-only or IPv6-only address.
  const known = new Set($$("[data-known-ip]").map((el) => el.dataset.knownIp));
  const otherChecks = $$("[data-other-ip]").map(async (el) => {
    const family = el.dataset.otherIp;
    const ip = await getText(`https://ipv${family}.icanhazip.com/`);
    const valid = ip && (family === "4" ? IPV4.test(ip) : IPV6.test(ip) && ip.includes(":"));
    if (valid) {
      known.add(ip);
      el.textContent = ip;
    } else {
      el.textContent = el.dataset.none || "not available";
    }
    // The "Copy for support" summary has a line for this IP version too.
    for (const button of $$("[data-report]")) {
      button.dataset.copy = button.dataset.copy.replace(
        `IPv${family}: checking…`,
        `IPv${family}: ${valid ? ip : "not available"}`,
      );
    }
  });

  // Reverse DNS name, from our own API. (/json, not /hostname: /hostname answers 404 when
  // there is no name, and the browser would log that as an error.)
  for (const el of $$("[data-hostname]")) {
    getText("/json").then((body) => {
      let host = null;
      try {
        host = JSON.parse(body ?? "null")?.hostname;
      } catch {}
      el.textContent = host || "No hostname set";
    });
  }

  function setCheck(el, state, title, message) {
    el.dataset.state = state;
    el.querySelector(".dot").textContent = state === "ok" ? "✓" : state === "info" ? "?" : "!";
    el.querySelector("h3").textContent = title;
    el.querySelector("p").textContent = message;
  }

  function utcOffset(timeZone) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" });
      return parts.formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? null;
    } catch {
      return null;
    }
  }

  // VPN page: does the device's time zone match the IP's time zone?
  for (const el of $$("[data-tz-check]")) {
    const ipZone = el.dataset.ipTz;
    const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ipOffset = ipZone && utcOffset(ipZone);
    const deviceOffset = utcOffset(deviceZone);
    if (!ipOffset || !deviceOffset) {
      setCheck(el, "info", "Time zone: can't compare", "We don't know the time zone of your IP.");
    } else if (ipOffset === deviceOffset) {
      setCheck(
        el,
        "ok",
        "Time zone: matches",
        `Your device (${deviceZone}) and your IP (${ipZone}) are both on ${deviceOffset}.`,
      );
    } else {
      setCheck(
        el,
        "warn",
        "Time zone: doesn't match",
        `Your device is on ${deviceZone} (${deviceOffset}), but your IP is on ${ipZone} (${ipOffset}). That often means a VPN or proxy, or that you're traveling.`,
      );
    }
  }

  // VPN page: which public IPs would WebRTC (video calls) reveal?
  async function webrtcAddresses(ms = 3500) {
    if (!window.RTCPeerConnection) return null;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] });
    const found = new Set();
    pc.onicecandidate = (event) => {
      const parts = event.candidate?.candidate.split(" ") ?? [];
      const type = parts[parts.indexOf("typ") + 1];
      if (type === "srflx" && parts[4]) found.add(parts[4]);
    };
    pc.createDataChannel("check");
    try {
      await pc.setLocalDescription(await pc.createOffer());
      await new Promise((resolve) => {
        setTimeout(resolve, ms);
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === "complete") resolve();
        };
      });
    } catch {
      return null;
    } finally {
      pc.close();
    }
    return [...found];
  }

  for (const el of $$("[data-webrtc]")) {
    Promise.all([webrtcAddresses(), ...otherChecks]).then(([addresses]) => {
      if (addresses === null) {
        setCheck(
          el,
          "ok",
          "WebRTC: off",
          "WebRTC is turned off in your browser, so it can't leak an IP.",
        );
      } else if (addresses.length === 0) {
        setCheck(el, "ok", "WebRTC: no leak", "WebRTC didn't share any public IP address.");
      } else {
        const extra = addresses.filter((ip) => !known.has(ip));
        if (extra.length === 0) {
          setCheck(
            el,
            "ok",
            "WebRTC: no leak",
            `WebRTC shows the same IP as above (${addresses.join(", ")}).`,
          );
        } else {
          setCheck(
            el,
            "bad",
            "WebRTC: shows a different IP",
            `WebRTC reveals ${extra.join(", ")}, which websites don't otherwise see. If you use a VPN, this may be your real IP leaking.`,
          );
        }
      }
    });
  }
})();
