document.addEventListener('DOMContentLoaded', function () {
  const languageToggle = document.getElementById('language-toggle');
  let currentLang = localStorage.getItem('lang') || 'nl';

  function applyTranslations(lang) {
    fetch('translations.json')
      .then((response) => response.json())
      .then((translations) => {
        document.querySelectorAll('[data-key]').forEach((element) => {
          const key = element.getAttribute('data-key');
          if (translations[key]) {
            element.innerText = translations[key];
          }
        });
        currentLang = lang;
        localStorage.setItem('lang', lang);
        if (languageToggle) languageToggle.innerText = lang === 'en' ? 'NE/EN' : 'EN/NE';
      })
      .catch((error) => console.error('Fout bij laden van vertalingen:', error));
  }

  function switchLanguage() {
    if (currentLang === 'nl') {
      applyTranslations('en');
    } else {
      localStorage.setItem('lang', 'nl');
      document.location.reload();
    }
  }

  if (languageToggle) languageToggle.addEventListener('click', switchLanguage);

  if (currentLang === 'en') {
    applyTranslations('en');
  }
});

// Dynamisch jaar instellen voor copyright (veilig als footer ontbreekt)
(function () {
  const currentYear = new Date().getFullYear();
  const el = document.querySelector('.footer-copyright p');
  if (el) el.textContent = `© ${currentYear} Renzo Siebeling. All rights reserved.`;
})();

