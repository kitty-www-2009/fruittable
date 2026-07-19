class CookieManager {
    static set(name, value, days = 7, path = '/') {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${path}`;
    }

    static get(name, def) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (key === name) {
                return decodeURIComponent(value);
            }
        }
        return "";
    }
}