/**
 * سكريبت التعبئة التلقائية للنماذج
 * يقوم بملء حقول النماذج تلقائياً بناءً على بيانات الملف الشخصي
 */

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export function getAutoFillScript(profile: UserProfile, loginCredentials?: { username?: string, password?: string }): string {
  // نقوم بترميز البيانات لتجنب مشاكل علامات التنصيص
  const data = JSON.stringify(profile);
  const credentials = JSON.stringify(loginCredentials || {});

  return `
    (function() {
      const profile = ${data};
      const creds = ${credentials};
      let filledCount = 0;

      function triggerEvents(element) {
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
      }

      function fill(selector, value, isPassword = false) {
        if (!value) return;
        const inputs = document.querySelectorAll(selector);
        inputs.forEach(input => {
          // نتأكد أن الحقل مرئي وليس مخفياً
          if (input.offsetParent !== null && !input.value) { 
            input.value = value;
            triggerEvents(input);
            input.style.backgroundColor = isPassword ? "#fff0f0" : "#e8f0fe"; 
            input.style.border = isPassword ? "2px solid #ffcccc" : "1px solid #cce5ff";
            filledCount++;
          }
        });
      }

      // --- تعبئة بيانات الملف الشخصي ---

      // 1. محاولة تعبئة البريد الإلكتروني
      fill('input[type="email"]', profile.email);
      fill('input[name*="email"]', profile.email);
      fill('input[id*="email"]', profile.email);
      fill('input[autocomplete="email"]', profile.email);

      // 2. محاولة تعبئة الاسم
      fill('input[name*="name"]', profile.fullName);
      fill('input[id*="name"]', profile.fullName);
      fill('input[autocomplete="name"]', profile.fullName);
      fill('input[placeholder*="اسم"]', profile.fullName);
      fill('input[placeholder*="Name"]', profile.fullName);

      // 3. محاولة تعبئة الهاتف
      fill('input[type="tel"]', profile.phone);
      fill('input[name*="phone"]', profile.phone);
      fill('input[name*="mobile"]', profile.phone);
      fill('input[id*="phone"]', profile.phone);
      fill('input[autocomplete="tel"]', profile.phone);
      fill('input[placeholder*="هاتف"]', profile.phone);
      fill('input[placeholder*="جوال"]', profile.phone);

      // 4. محاولة تعبئة العنوان
      fill('input[name*="address"]', profile.address);
      fill('input[id*="address"]', profile.address);
      fill('input[autocomplete="street-address"]', profile.address);
      fill('textarea[name*="address"]', profile.address);
      fill('input[placeholder*="عنوان"]', profile.address);

      // 5. محاولة تعبئة الاسم الأول والأخير منفصلين
      const nameParts = profile.fullName.split(' ');
      if (nameParts.length >= 2) {
        fill('input[name*="first"]', nameParts[0]);
        fill('input[id*="first"]', nameParts[0]);
        fill('input[autocomplete="given-name"]', nameParts[0]);
        
        fill('input[name*="last"]', nameParts[nameParts.length - 1]);
        fill('input[id*="last"]', nameParts[nameParts.length - 1]);
        fill('input[autocomplete="family-name"]', nameParts[nameParts.length - 1]);
      }

      // --- تعبئة بيانات الدخول (إذا توفرت) ---
      if (creds.username) {
          fill('input[type="text"][name*="user"]', creds.username);
          fill('input[type="email"][name*="user"]', creds.username); 
          fill('input[name="login"]', creds.username);
          fill('input[id*="user"]', creds.username);
      }

      if (creds.password) {
          fill('input[type="password"]', creds.password, true);
      }

      if (filledCount > 0) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
           type: 'toast', 
           message: 'تم تعبئة ' + filledCount + ' حقول بنجاح ⚡'
        }));
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({
           type: 'toast', 
           message: 'لم يتم العثور على حقول متطابقة 🤷‍♂️'
        }));
      }
    })();
    true;
  `;
}

/**
 * سكريبت اكتشاف النماذج في الصفحة
 * يُعيد عدد الحقول القابلة للتعبئة
 */
export function getFormDetectionScript(): string {
  return `
    (function() {
      const formInputs = document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="tel"], ' +
        'input[name*="name"], input[name*="email"], input[name*="phone"], ' +
        'input[name*="address"], textarea[name*="address"]'
      );
      
      let visibleCount = 0;
      formInputs.forEach(input => {
        if (input.offsetParent !== null) {
          visibleCount++;
        }
      });
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'formDetected',
        count: visibleCount
      }));
    })();
    true;
  `;
}
