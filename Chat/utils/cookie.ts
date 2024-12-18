export function getCookie(name : string) {
    console.log(document.cookie);
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) return value;
    }
    return "";
  }