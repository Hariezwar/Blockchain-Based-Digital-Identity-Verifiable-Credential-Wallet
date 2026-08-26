const translations = {
    en: {
        'nav.home': 'Home',
        'nav.dashboard': 'Dashboard',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'app.title': 'CredTrust',
        'home.tagline': 'Own Your Identity. Share Only What Matters. Verify Instantly.'
    },
    hi: {
        'nav.home': 'मुख्य पृष्ठ',
        'nav.dashboard': 'डैशबोर्ड',
        'nav.login': 'लॉग इन करें',
        'nav.logout': 'लॉग आउट',
        'app.title': 'क्रेडट्रस्ट (CredTrust)',
        'home.tagline': 'अपनी पहचान के मालिक बनें। केवल वही साझा करें जो मायने रखता है। तुरंत सत्यापित करें।'
    },
    ta: {
        'nav.home': 'முகப்பு',
        'nav.dashboard': 'கட்டுப்பாட்டுப் பலகம்',
        'nav.login': 'உள்நுழைக',
        'nav.logout': 'வெளியேறு',
        'app.title': 'க்ரெட்டிரஸ்ட் (CredTrust)',
        'home.tagline': 'உங்கள் அடையாளத்தை சொந்தமாக்குங்கள். தேவையானதை மட்டும் பகிருங்கள். உடனடியாக சரிபார்க்கவும்.'
    }
};

class I18nService {
    constructor() {
        this.currentLang = localStorage.getItem('credtrust_lang') || 'en';
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('credtrust_lang', lang);
            this.translatePage();
            return true;
        }
        return false;
    }

    translate(key) {
        return translations[this.currentLang][key] || translations['en'][key] || key;
    }

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if(el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', this.translate(key));
            } else {
                el.innerText = this.translate(key);
            }
        });
    }
}

window.i18n = new I18nService();
