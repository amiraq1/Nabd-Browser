import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedLogin {
  id: string;
  url: string; // النطاق الرئيسي (مثلاً google.com)
  username: string;
  password: string; // في التطبيق الحقيقي، استخدم تشفيراً هنا
  createdAt: number;
}

const STORAGE_KEY = "@nabd_passwords_v1";

class PasswordStorage {
  async saveLogin(
    login: Omit<SavedLogin, "id" | "createdAt">,
  ): Promise<SavedLogin> {
    const currentState = await this.getAllLogins();

    // التحقق مما إذا كان موجوداً بالفعل وتحديثه
    const existingIndex = currentState.findIndex(
      (l) => l.url === login.url && l.username === login.username,
    );

    const newLogin: SavedLogin = {
      ...login,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };

    if (existingIndex >= 0) {
      currentState[existingIndex] = {
        ...currentState[existingIndex],
        ...login,
      };
    } else {
      currentState.push(newLogin);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    return newLogin;
  }

  async getAllLogins(): Promise<SavedLogin[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      return [];
    }
  }

  async getLoginForUrl(currentUrl: string): Promise<SavedLogin | undefined> {
    const logins = await this.getAllLogins();
    // بحث بسيط عن تطابق النطاق
    // يجب تحسين استخراج النطاق الحقيقي
    return logins.find((l) => currentUrl.includes(l.url));
  }

  async deleteLogin(id: string) {
    const logins = await this.getAllLogins();
    const newLogins = logins.filter((l) => l.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLogins));
  }
}

export const passwordStorage = new PasswordStorage();
