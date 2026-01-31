(function () {
  const STORAGE_ENTRIES = 'employeeWorkTimes_entries';
  const STORAGE_EMPLOYEES = 'employeeWorkTimes_employees';
  const STORAGE_CURRENT = 'employeeWorkTimes_current';
  const STORAGE_LANG = 'employeeWorkTimes_lang';

  const translations = {
    en: {
      title: 'Employee Work Times',
      h1: 'Work Times',
      subtitle: 'Track your hours',
      punchTitle: 'Time punch',
      employee: 'Employee',
      selectPlaceholder: 'Select or type name...',
      inputPlaceholder: 'Or enter your name',
      clockIn: 'Clock In',
      clockOut: 'Clock Out',
      notClockedIn: 'Not clocked in',
      clockedInSince: 'Clocked in since',
      clockedInOther: 'Clocked in (other employee)',
      today: 'Today',
      recentEntries: 'Recent entries',
      thEmployee: 'Employee',
      thDate: 'Date',
      thClockIn: 'Clock In',
      thClockOut: 'Clock Out',
      thHours: 'Hours',
      emptyHistory: 'No entries yet. Clock in to get started.',
      footer: 'Data is stored locally in your browser.',
      hour: 'h',
      min: 'm'
    },
    ar: {
      title: 'أوقات عمل الموظفين',
      h1: 'أوقات العمل',
      subtitle: 'تتبع ساعاتك',
      punchTitle: 'تسجيل الحضور',
      employee: 'الموظف',
      selectPlaceholder: 'اختر أو اكتب الاسم...',
      inputPlaceholder: 'أو أدخل اسمك',
      clockIn: 'بدء الدوام',
      clockOut: 'إنهاء الدوام',
      notClockedIn: 'غير مسجل',
      clockedInSince: 'مسجل منذ',
      clockedInOther: 'مسجل (موظف آخر)',
      today: 'اليوم',
      recentEntries: 'السجلات الأخيرة',
      thEmployee: 'الموظف',
      thDate: 'التاريخ',
      thClockIn: 'بدء الدوام',
      thClockOut: 'إنهاء الدوام',
      thHours: 'الساعات',
      emptyHistory: 'لا توجد سجلات بعد. سجّل بدء الدوام للبدء.',
      footer: 'البيانات مخزنة محلياً في متصفحك.',
      hour: 'س',
      min: 'د'
    }
  };

  function getLang() {
    const stored = localStorage.getItem(STORAGE_LANG);
    return stored === 'ar' ? 'ar' : 'en';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_LANG, lang);
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    applyTranslations();
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    updateLiveClock();
    renderEmployeeSelect();
    updateUI();
  }

  function applyTranslations() {
    const lang = getLang();
    const t = translations[lang] || translations.en;
    const titleEl = document.getElementById('titleEl');
    if (titleEl) titleEl.textContent = t.title;
    const h1 = document.getElementById('h1Title');
    if (h1) h1.textContent = t.h1;
    const sub = document.getElementById('subtitle');
    if (sub) sub.textContent = t.subtitle;
    const punchTitle = document.getElementById('punchTitle');
    if (punchTitle) punchTitle.textContent = t.punchTitle;
    const labelEmp = document.getElementById('labelEmployee');
    if (labelEmp) labelEmp.textContent = t.employee;
    const empInput = document.getElementById('employeeInput');
    if (empInput) empInput.placeholder = t.inputPlaceholder;
    const btnIn = document.getElementById('btnClockIn');
    if (btnIn) btnIn.textContent = t.clockIn;
    const btnOut = document.getElementById('btnClockOut');
    if (btnOut) btnOut.textContent = t.clockOut;
    const todayTitle = document.getElementById('todayTitle');
    if (todayTitle) todayTitle.textContent = t.today;
    const recentTitle = document.getElementById('recentTitle');
    if (recentTitle) recentTitle.textContent = t.recentEntries;
    const thEmp = document.getElementById('thEmployee');
    if (thEmp) thEmp.textContent = t.thEmployee;
    const thDate = document.getElementById('thDate');
    if (thDate) thDate.textContent = t.thDate;
    const thIn = document.getElementById('thClockIn');
    if (thIn) thIn.textContent = t.thClockIn;
    const thOut = document.getElementById('thClockOut');
    if (thOut) thOut.textContent = t.thClockOut;
    const thHours = document.getElementById('thHours');
    if (thHours) thHours.textContent = t.thHours;
    const footerEl = document.getElementById('footerText');
    if (footerEl) footerEl.textContent = t.footer;
  }

  const liveClockEl = document.getElementById('liveClock');
  const employeeSelect = document.getElementById('employeeSelect');
  const employeeInput = document.getElementById('employeeInput');
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const btnClockIn = document.getElementById('btnClockIn');
  const btnClockOut = document.getElementById('btnClockOut');
  const todayHoursEl = document.getElementById('todayHours');
  const todayDateEl = document.getElementById('todayDate');
  const historyBody = document.getElementById('historyBody');

  function t(key) {
    const lang = getLang();
    const tr = translations[lang] || translations.en;
    return tr[key] != null ? tr[key] : (translations.en[key] || key);
  }

  function getEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_ENTRIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setEntries(entries) {
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries));
  }

  const DEFAULT_EMPLOYEES = ['ali', 'khalid', 'mohammed'];

  function getEmployees() {
    try {
      const raw = localStorage.getItem(STORAGE_EMPLOYEES);
      const list = raw ? JSON.parse(raw) : [];
      if (list.length === 0) {
        localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify([...DEFAULT_EMPLOYEES]));
        return DEFAULT_EMPLOYEES;
      }
      return list;
    } catch {
      localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify([...DEFAULT_EMPLOYEES]));
      return DEFAULT_EMPLOYEES;
    }
  }

  function addEmployee(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const list = getEmployees();
    if (list.includes(trimmed)) return;
    list.push(trimmed);
    list.sort((a, b) => a.localeCompare(b));
    localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify(list));
    renderEmployeeSelect();
  }

  function getCurrentPunch() {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setCurrentPunch(data) {
    if (data) {
      localStorage.setItem(STORAGE_CURRENT, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_CURRENT);
    }
  }

  function getActiveEmployee() {
    const fromInput = (employeeInput.value || '').trim();
    if (fromInput) return fromInput;
    const sel = employeeSelect.value;
    return sel || null;
  }

  function getLocale() {
    return getLang() === 'ar' ? 'ar-AE' : 'en-US';
  }

  function formatTime(date) {
    return date.toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString(getLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function hoursBetween(start, end) {
    return (end - start) / (1000 * 60 * 60);
  }

  function formatHours(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const hourUnit = t('hour');
    const minUnit = t('min');
    if (h === 0) return `${m}${minUnit}`;
    if (m === 0) return `${h}${hourUnit}`;
    return `${h}${hourUnit} ${m}${minUnit}`;
  }

  function updateLiveClock() {
    const now = new Date();
    liveClockEl.textContent = now.toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  function renderEmployeeSelect() {
    const list = getEmployees();
    const currentVal = employeeSelect.value;
    employeeSelect.innerHTML = '<option value="">' + t('selectPlaceholder') + '</option>';
    list.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      employeeSelect.appendChild(opt);
    });
    if (currentVal && list.includes(currentVal)) {
      employeeSelect.value = currentVal;
    }
  }

  function updateUI() {
    const current = getCurrentPunch();
    const employee = getActiveEmployee();
    const hasEmployee = !!employee;

    btnClockIn.disabled = !hasEmployee || !!current;
    btnClockOut.disabled = !hasEmployee || !current;

    if (current && current.employee === employee) {
      statusBadge.classList.add('clocked-in');
      statusText.textContent = t('clockedInSince') + ' ' + formatTime(new Date(current.clockIn));
    } else {
      statusBadge.classList.remove('clocked-in');
      statusText.textContent = current ? t('clockedInOther') : t('notClockedIn');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entries = getEntries();
    let totalToday = 0;
    entries.forEach(entry => {
      const entryDate = new Date(entry.clockIn);
      entryDate.setHours(0, 0, 0, 0);
      if (entryDate.getTime() === today.getTime() && entry.employee === employee) {
        const end = entry.clockOut ? new Date(entry.clockOut) : new Date();
        totalToday += hoursBetween(new Date(entry.clockIn), end);
      }
    });
    if (current && current.employee === employee) {
      totalToday += hoursBetween(new Date(current.clockIn), new Date());
    }
    todayHoursEl.textContent = formatHours(totalToday);
    todayDateEl.textContent = formatDate(today);

    const recent = entries
      .concat(
        current && current.employee === employee
          ? [{ employee: current.employee, clockIn: current.clockIn, clockOut: null }]
          : []
      )
      .sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn))
      .slice(0, 20);

    historyBody.innerHTML = '';
    if (recent.length === 0) {
      const row = document.createElement('tr');
      row.className = 'empty-row';
      row.innerHTML = '<td colspan="5">' + t('emptyHistory') + '</td>';
      historyBody.appendChild(row);
    } else {
      recent.forEach(entry => {
        const start = new Date(entry.clockIn);
        const end = entry.clockOut ? new Date(entry.clockOut) : null;
        const hours = end ? hoursBetween(start, end) : hoursBetween(start, new Date());
        const row = document.createElement('tr');
        row.innerHTML =
          '<td>' + escapeHtml(entry.employee) + '</td>' +
          '<td>' + formatDate(start) + '</td>' +
          '<td>' + formatTime(start) + '</td>' +
          '<td>' + (end ? formatTime(end) : '—') + '</td>' +
          '<td>' + formatHours(hours) + '</td>';
        historyBody.appendChild(row);
      });
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function clockIn() {
    const employee = getActiveEmployee();
    if (!employee) return;
    addEmployee(employee);
    const now = Date.now();
    setCurrentPunch({ employee, clockIn: now });
    updateUI();
  }

  function clockOut() {
    const current = getCurrentPunch();
    const employee = getActiveEmployee();
    if (!current || current.employee !== employee) return;
    const entries = getEntries();
    entries.unshift({
      employee: current.employee,
      clockIn: current.clockIn,
      clockOut: Date.now()
    });
    setEntries(entries);
    setCurrentPunch(null);
    updateUI();
  }

  employeeInput.addEventListener('input', function () {
    if (this.value.trim()) employeeSelect.value = '';
    updateUI();
  });
  employeeInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmployee(this.value.trim());
      renderEmployeeSelect();
      updateUI();
    }
  });
  employeeSelect.addEventListener('change', updateUI);
  btnClockIn.addEventListener('click', clockIn);
  btnClockOut.addEventListener('click', clockOut);

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(this.getAttribute('data-lang'));
    });
  });

  setLang(getLang());
  setInterval(updateLiveClock, 1000);
  updateLiveClock();
  renderEmployeeSelect();
  updateUI();
})();
