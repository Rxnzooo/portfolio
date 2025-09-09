document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const nameEl = document.getElementById('naam');
  const emailEl = document.getElementById('email');
  const msgEl = document.getElementById('aanvraag');
  const submitBtn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('form-status');

  if (!form) return; // Veiligheid

  function setStatus(text, ok = true) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = ok ? 'rgb(34,197,94)' : 'rgb(239,68,68)';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const message = msgEl.value.trim();

    // Inline basisvalidatie
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (name.length < 3) return setStatus('Naam is te kort.', false);
    if (!emailRegex.test(email)) return setStatus('Voer een geldig e-mailadres in.', false);
    if (message.length < 10) return setStatus('Bericht is te kort.', false);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Versturen...';
    setStatus('Versturen...', true);

    try {
      const base = (window.API_BASE && window.API_BASE.replace(/\/$/, '')) || (location.origin && location.origin !== 'null' ? location.origin : 'http://localhost:3000');
      const resp = await fetch(`${base}/submit-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error((data && (data.errors || data.error)) || 'Verzenden mislukt');
      }
      form.reset();
      if (data.mail && data.mail.sent === false) {
        const reason = data.mail.reason ? ` (${data.mail.reason})` : '';
        setStatus('Opgeslagen, maar e-mail niet verzonden' + reason, true);
      } else {
        setStatus('Bedankt! Je bericht is ontvangen.', true);
      }
    } catch (err) {
      console.error(err);
      setStatus('Er is iets misgegaan. Probeer het later opnieuw.', false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verzenden';
    }
  });
});
